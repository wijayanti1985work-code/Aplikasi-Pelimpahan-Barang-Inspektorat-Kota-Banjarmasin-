import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  FileDown,
  FileText,
  Award,
  ShieldAlert,
  Loader2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import type { BarangBMD, InstansiConfig, Pegawai, Pejabat, PelimpahanBMD, Ruangan } from '../../types/index.ts';
import { formatRupiah, formatTanggalIndonesia, terbilangRupiah, getTanggalDinasDetail, formatLokasiRuang } from '../../utils/logic.ts';
import { StorageService } from '../../services/storage.ts';
import { SignaturePad } from '../common/SignaturePad.tsx';
import { downloadElementAsPdf } from '../../utils/pdfExport.ts';
import { LOGO_PEMKOT_BANJARMASIN_BASE64 } from '../../assets/logoPemko.ts';

interface OfficialDocumentModalProps {
  pelimpahan: PelimpahanBMD;
  pegawai: Pegawai;
  barangList: BarangBMD[];
  pejabatList: Pejabat[];
  instansi: InstansiConfig;
  ruanganList?: Ruangan[];
  onClose: () => void;
  onUpdatePelimpahan: (updated: PelimpahanBMD) => void;
  initialDocType?: 'BAST' | 'SK' | 'SPTJM';
}

export const OfficialDocumentModal: React.FC<OfficialDocumentModalProps> = ({
  pelimpahan,
  pegawai,
  barangList,
  pejabatList,
  instansi,
  ruanganList,
  onClose,
  onUpdatePelimpahan,
  initialDocType = 'BAST',
}) => {
  const resolvedRuanganList = ruanganList && ruanganList.length > 0 ? ruanganList : StorageService.getRuangan();
  const [activeTab, setActiveTab] = useState<'BAST' | 'SK' | 'SPTJM'>(initialDocType);
  const [signingRole, setSigningRole] = useState<'pihakPertama' | 'pihakKedua' | 'penggunaBarang' | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  
  // Tanggal dokumen serentak untuk BAST, SK, dan SPTJM (hari otomatis mengikuti)
  const [docTanggal, setDocTanggal] = useState<string>(
    pelimpahan.tanggal || new Date().toISOString().slice(0, 10)
  );

  const tglDinas = getTanggalDinasDetail(docTanggal);

  const handleTanggalChange = (newDateStr: string) => {
    if (!newDateStr) return;
    setDocTanggal(newDateStr);
    const updated: PelimpahanBMD = {
      ...pelimpahan,
      tanggal: newDateStr,
    };
    onUpdatePelimpahan(updated);
  };

  const printableRef = useRef<HTMLDivElement | null>(null);

  // Total Nilai Perolehan Seluruh Barang
  const totalNilai = barangList.reduce((sum, b) => sum + (b.nilaiPerolehan || 0), 0);

  // Resolve Pejabat sesuai data resmi Inspektorat Kota Banjarmasin
  const pengurusBarang = pejabatList.find(p => p.peran === 'Pengurus Barang') || {
    nama: 'Dian Dahniar',
    nip: '197311232007012008',
    pangkatGol: 'Penata Tingkat I / III/d',
    jabatan: 'Pengurus Barang Pengguna',
    instansi: 'Inspektorat Kota Banjarmasin',
  };

  const penggunaBarang = pejabatList.find(p => p.peran === 'Pengguna Barang') || {
    nama: 'RABIATUL ADAWIYAH, S.H., M.H.',
    nip: '19790128 200212 2 003',
    pangkatGol: 'Pembina Tingkat I / IV b',
    jabatan: 'Inspektur Kota Banjarmasin',
    instansi: 'Inspektorat Kota Banjarmasin',
  };

  // Handle Save Digital Signature
  const handleSaveSignature = (dataUrl: string) => {
    if (!signingRole) return;
    const updated: PelimpahanBMD = {
      ...pelimpahan,
      tandaTanganPihakPertama: signingRole === 'pihakPertama' ? dataUrl : pelimpahan.tandaTanganPihakPertama,
      tandaTanganPihakKedua: signingRole === 'pihakKedua' ? dataUrl : pelimpahan.tandaTanganPihakKedua,
      tandaTanganPenggunaBarang: signingRole === 'penggunaBarang' ? dataUrl : pelimpahan.tandaTanganPenggunaBarang,
      statusDokumen: 'Disahkan',
    };
    onUpdatePelimpahan(updated);
    setSigningRole(null);
  };

  // 1. Direct Browser Print (Semua Halaman)
  const handlePrint = () => {
    window.print();
  };

  // 1b. Direct Browser Print - Khusus Lampiran Daftar Barang (Landscape A4)
  const handlePrintLampiranOnly = () => {
    document.body.classList.add('print-only-lampiran', 'print-landscape-doc');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-only-lampiran', 'print-landscape-doc');
    }, 1000);
  };

  // 2. Client-side Real PDF Generation with Mixed Orientation (Portrait text, Landscape lampiran)
  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    setIsGeneratingPdf(true);
    setPdfProgress('Menyiapkan dokumen...');

    try {
      const safeName = pegawai.nama.replace(/[^a-zA-Z0-9]/g, '_');
      await downloadElementAsPdf(printableRef.current, {
        fileName: `${activeTab}_BMD_${safeName}`,
        orientation: 'portrait',
        onProgress: (msg) => setPdfProgress(msg),
      });
    } catch (err) {
      console.error('Gagal membuat PDF via downloadElementAsPdf:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  // 3. Export to Microsoft Word (.doc) with Section Breaks for Landscape Lampiran
  const handleExportWord = () => {
    if (!printableRef.current) return;
    
    const contentHtml = printableRef.current.innerHTML;

    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${activeTab} - ${pegawai.nama}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 21.0cm 29.7cm;
            margin: 1.5cm 1.5cm 1.5cm 1.5cm;
            mso-page-orientation: portrait;
          }
          @page SectionLandscape {
            size: 29.7cm 21.0cm;
            margin: 1.2cm 1.2cm 1.2cm 1.2cm;
            mso-page-orientation: landscape;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.35;
            color: #000000;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-family: 'Times New Roman', serif;
          }
          th, td {
            border: 1px solid #000000;
            padding: 4px 6px;
            font-size: 8.5pt;
            vertical-align: middle;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
          }
          .borderless td, .borderless th {
            border: none !important;
            padding: 2px 4px;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-justify { text-align: justify; }
          .font-bold { font-weight: bold; }
          .document-page-sheet {
            page-break-after: always;
            margin-bottom: 20px;
          }
          .document-page-sheet-landscape {
            page: SectionLandscape;
            page-break-before: always;
            page-break-after: always;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${contentHtml}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], {
      type: 'application/msword',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}_BMD_${pegawai.nama.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reusable Authentic Kop Surat Component with Official Logo
  const renderKopSurat = () => (
    <div className="text-center relative pb-2 mb-4" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <div className="flex items-center justify-between gap-4">
        {/* Authentic Banjarmasin Seal Image */}
        <div className="w-20 h-24 shrink-0 flex items-center justify-center">
          <img
            src={instansi.logoUtamaUrl || LOGO_PEMKOT_BANJARMASIN_BASE64}
            alt="Logo Pemerintah Kota Banjarmasin"
            className="max-h-24 max-w-20 object-contain"
          />
        </div>

        {/* Teks Kop Surat */}
        <div className="flex-1 text-center">
          <div className="text-[14pt] font-bold tracking-wide text-black uppercase leading-tight">
            {instansi.namaPemda || 'PEMERINTAH KOTA BANJARMASIN'}
          </div>
          <div className="text-[19pt] font-extrabold tracking-[6px] text-black uppercase leading-tight my-0.5">
            {instansi.namaInstansi || 'I N S P E K T O R A T'}
          </div>
          <div className="text-[8.5pt] text-black leading-tight">
            {instansi.alamat || 'JALAN TIRTA DHARMA (KOMP. PDAM) RT. 34 NO. 70 BANJARMASIN 70249'}
          </div>
          <div className="text-[8.5pt] text-black leading-tight">
            surel: {instansi.email || 'inspektorat@mail.banjarmasinkota.id inspbjm@gmail.com'}
          </div>
          <div className="text-[8.5pt] text-black leading-tight">
            laman: {instansi.website || 'inspektorat.banjarmasinkota.go.id'} WA {instansi.telepon || '0812-5111-1020'}
          </div>
        </div>

        {/* Right Balance Spacer / Secondary Logo */}
        <div className="w-20 shrink-0 flex items-center justify-center">
          {instansi.logoSekunderUrl ? (
            <img
              src={instansi.logoSekunderUrl}
              alt="Logo Sekunder"
              className="max-h-24 max-w-20 object-contain mx-auto"
            />
          ) : null}
        </div>
      </div>
      {/* Garis Tebal Pemisah Kop Surat */}
      <div className="border-b-[3px] border-black mt-2 mb-4" />
    </div>
  );

  // Reusable 13-Column Table for Lampiran (Spacious Landscape Orientation, Memuat SEMUA Data Inputan)
  const renderLampiranTable = () => (
    <table className="w-full border-collapse border border-black text-[8pt] my-2 text-black" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <thead>
        <tr className="bg-slate-100 text-center font-bold">
          <th className="border border-black p-1 w-6">No</th>
          <th className="border border-black p-1 w-24">Kode Barang / NIB</th>
          <th className="border border-black p-1">Nama / Jenis Barang</th>
          <th className="border border-black p-1">Merk / Tipe / Spesifikasi</th>
          <th className="border border-black p-1 w-28">No. Seri / Rangka / Plat</th>
          <th className="border border-black p-1 w-12">Tahun</th>
          <th className="border border-black p-1 w-14">Jumlah</th>
          <th className="border border-black p-1 w-24">Nilai Perolehan (Rp)</th>
          <th className="border border-black p-1 w-16">Kondisi</th>
          <th className="border border-black p-1 w-16">Sumber Dana</th>
          <th className="border border-black p-1 w-24">Kode Lokasi/ Ruang</th>
          <th className="border border-black p-1 w-24">Keterangan</th>
          <th className="border border-black p-1 w-16">Foto Barang</th>
        </tr>
      </thead>
      <tbody>
        {barangList.map((item, idx) => (
          <tr key={item.id} className="text-center align-middle">
            <td className="border border-black p-1 font-mono text-[8pt]">{idx + 1}</td>
            <td className="border border-black p-1 text-left font-mono text-[7.5pt]">{item.kodeBarang}</td>
            <td className="border border-black p-1 text-left font-bold">{item.namaBarang}</td>
            <td className="border border-black p-1 text-left text-[7.5pt]">{item.merkTipe || '-'}</td>
            <td className="border border-black p-1 font-mono text-[7.5pt]">{item.noSeri || '-'}</td>
            <td className="border border-black p-1">{item.tahunPerolehan}</td>
            <td className="border border-black p-1 font-semibold">{item.jumlah} {item.satuan}</td>
            <td className="border border-black p-1 text-right font-mono text-[7.5pt]">{formatRupiah(item.nilaiPerolehan)}</td>
            <td className="border border-black p-1 font-bold text-[7.5pt]">
              {item.kondisi === 'B' ? 'B (Baik)' : item.kondisi === 'RR' ? 'RR (Rusak Ringan)' : 'RB (Rusak Berat)'}
            </td>
            <td className="border border-black p-1 text-[7.5pt]">{item.sumberDana || 'APBD'}</td>
            <td className="border border-black p-1 font-bold text-left text-[7.5pt]">{formatLokasiRuang(item, resolvedRuanganList)}</td>
            <td className="border border-black p-1 text-left text-[7.5pt]">{item.keterangan || '-'}</td>
            <td className="border border-black p-1">
              {item.fotoBarang ? (
                <img
                  src={item.fotoBarang}
                  alt={item.namaBarang}
                  className="w-14 h-14 object-cover mx-auto rounded border border-black/30 shadow-2xs"
                />
              ) : (
                <div className="w-14 h-14 bg-[#2563EB] text-white text-[7pt] font-bold flex items-center justify-center text-center p-1 rounded mx-auto leading-tight shadow-2xs">
                  Foto barang
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="bg-slate-100 font-bold">
          <td colSpan={7} className="border border-black p-1.5 text-right uppercase">
            Total Nilai Perolehan:
          </td>
          <td className="border border-black p-1.5 text-right font-mono text-[8pt]">
            {formatRupiah(totalNilai)}
          </td>
          <td colSpan={5} className="border border-black p-1.5"></td>
        </tr>
        <tr>
          <td colSpan={13} className="border border-black p-1.5 italic text-[8pt]">
            Terbilang: <b>{terbilangRupiah(totalNilai)}</b>
          </td>
        </tr>
      </tfoot>
    </table>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="document-modal-content bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-7xl flex flex-col max-h-[96vh] overflow-hidden">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print px-5 py-3.5 bg-[#0F766E] text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#0d6861] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] uppercase tracking-wider">
                Generator Dokumen Resmi BMD
              </span>
              <span className="text-xs text-teal-100">Inspektorat Kota Banjarmasin</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {activeTab === 'BAST' && 'Berita Acara Serah Terima (BAST) Penggunaan BMD'}
              {activeTab === 'SK' && 'Surat Keputusan (SK) Penetapan Pemakai BMD'}
              {activeTab === 'SPTJM' && 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) BMD'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Real PDF Download Button */}
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#0F766E] bg-white hover:bg-teal-50 active:bg-teal-100 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-75"
              title="Unduh langsung file PDF (.pdf) dengan orientasi kertas proporsional"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
                  <span>{pdfProgress || 'Membuat PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-[#0F766E]" />
                  <span>Unduh PDF</span>
                </>
              )}
            </button>

            {/* Word (.doc) Download Button */}
            <button
              type="button"
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#0F766E] bg-[#CCFBF1] hover:bg-white rounded-lg shadow-sm transition-all cursor-pointer"
              title="Unduh file Microsoft Word (.doc) sesuai format layar"
            >
              <FileText className="w-4 h-4 text-[#0F766E]" />
              <span>Unduh Word</span>
            </button>

            {/* Print All Pages Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0d6861] hover:bg-[#115e59] border border-teal-300/40 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Cetak seluruh dokumen (Surat & Lampiran)"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Cetak Semua</span>
            </button>

            {/* Dedicated Print Lampiran Only (Landscape) Button */}
            <button
              type="button"
              onClick={handlePrintLampiranOnly}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-300 hover:bg-amber-200 border border-amber-400 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Cetak khusus halaman Lampiran Daftar Rincian Barang dalam orientasi Landscape A4"
            >
              <Printer className="w-4 h-4 text-amber-950" />
              <span>Cetak Lampiran (Landscape)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-teal-100 hover:text-white hover:bg-teal-800 rounded-lg transition-colors cursor-pointer ml-1"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Signature Bar (Hidden during print) */}
        <div className="no-print px-5 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('BAST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'BAST'
                  ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              <FileText className="w-4 h-4" />
              1. BAST Penggunaan BMD
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SK')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'SK'
                  ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              <Award className="w-4 h-4" />
              2. SK Pemakai BMD
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SPTJM')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'SPTJM'
                  ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              3. SPTJM Tanggung Jawab Mutlak
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#64748B] font-medium hidden sm:inline">Bubuhi TTD Digital:</span>
            <button
              type="button"
              onClick={() => setSigningRole('pihakPertama')}
              className="px-2.5 py-1 bg-white hover:bg-[#CCFBF1]/40 text-[#0F766E] border border-teal-200 rounded-lg font-medium transition-colors cursor-pointer text-xs"
            >
              Pengurus Barang
            </button>
            <button
              type="button"
              onClick={() => setSigningRole('pihakKedua')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium transition-colors cursor-pointer text-xs"
            >
              Pemakai
            </button>
            <button
              type="button"
              onClick={() => setSigningRole('penggunaBarang')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium transition-colors cursor-pointer text-xs"
            >
              Inspektur
            </button>
          </div>
        </div>

        {/* Modal Inner Signature Pad Prompt */}
        {signingRole && (
          <div className="no-print fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
            <SignaturePad
              title={
                signingRole === 'pihakPertama'
                  ? 'Tanda Tangan Pihak Pertama (Pengurus Barang)'
                  : signingRole === 'pihakKedua'
                  ? 'Tanda Tangan Pihak Kedua (Pegawai Pemakai)'
                  : 'Tanda Tangan Pengguna Barang (Inspektur Kota Banjarmasin)'
              }
              penandaTanganNama={
                signingRole === 'pihakPertama'
                  ? pengurusBarang.nama
                  : signingRole === 'pihakKedua'
                  ? pegawai.nama
                  : penggunaBarang.nama
              }
              penandaTanganJabatan={
                signingRole === 'pihakPertama'
                  ? pengurusBarang.jabatan
                  : signingRole === 'pihakKedua'
                  ? pegawai.jabatan
                  : penggunaBarang.jabatan
              }
              initialValue={
                signingRole === 'pihakPertama'
                  ? pelimpahan.tandaTanganPihakPertama
                  : signingRole === 'pihakKedua'
                  ? pelimpahan.tandaTanganPihakKedua
                  : pelimpahan.tandaTanganPenggunaBarang
              }
              onSave={handleSaveSignature}
              onCancel={() => setSigningRole(null)}
            />
          </div>
        )}

        {/* Date Configuration Bar: Hari Otomatis Mengikuti, Berlaku Serentak untuk BAST, SK, & SPTJM */}
        <div className="no-print px-5 py-2.5 bg-linear-to-r from-teal-50 via-emerald-50 to-teal-50 border-b border-teal-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  Pengaturan Tanggal Dokumen
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#CCFBF1] text-[#0F766E] border border-teal-200">
                  Hari Otomatis Mengikuti Tanggal
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Hari: <span className="font-bold text-[#0F766E]">{tglDinas.hari}</span> • Tanggal: <span className="font-bold text-slate-800">{tglDinas.tanggalFormatted}</span> ({tglDinas.tanggalTerbilang} {tglDinas.bulan} {tglDinas.tahunTerbilang})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Format Penulisan BAST Sesuai Kaidah Baku Resmi */}
            {activeTab === 'BAST' && (
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-teal-300 shadow-2xs text-[11px] text-teal-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span>Aturan BAST: <b>Pada hari ini {tglDinas.hari} tanggal {tglDinas.tanggalTerbilang} bulan {tglDinas.bulan} tahun {tglDinas.tahunTerbilang}, bertempat di...</b></span>
              </div>
            )}

            <span className="text-[11px] text-slate-500 font-medium hidden lg:inline">
              Berlaku serentak BAST, SK & SPTJM:
            </span>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-teal-300 shadow-2xs">
              <label htmlFor="input-tanggal-dinas" className="text-[11px] font-semibold text-slate-700">
                Pilih Tanggal:
              </label>
              <input
                id="input-tanggal-dinas"
                type="date"
                value={docTanggal}
                onChange={e => handleTanggalChange(e.target.value)}
                className="px-2 py-0.5 text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Document Pages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80 flex flex-col items-center">
          <div ref={printableRef} className="w-full flex flex-col items-center">

            {/* ========================================================================= */}
            {/* DOKUMEN 1: BERITA ACARA SERAH TERIMA (BAST) PENGGUNAAN BMD                */}
            {/* ========================================================================= */}
            {activeTab === 'BAST' && (
              <>
                {/* Halaman 1 BAST: Portrait A4 */}
                <div className="document-page-sheet">
                  {renderKopSurat()}

                  <div className="text-center mb-5" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    <h3 className="text-[12pt] font-bold uppercase text-black leading-snug">
                      BERITA ACARA SERAH TERIMA (BAST) PENGGUNAAN
                      <br />
                      BARANG MILIK DAERAH (BMD)
                    </h3>
                    <p className="text-[11pt] font-bold text-black mt-1">
                      NOMOR: {pelimpahan.nomorBAST || '...'} / SET / ITKO
                    </p>
                  </div>

                  <p className="text-justify text-[10.5pt] leading-relaxed mb-3">
                    Pada hari ini <b>{tglDinas.hari}</b> tanggal <b>{tglDinas.tanggalTerbilang}</b> bulan <b>{tglDinas.bulan}</b> tahun <b>{tglDinas.tahunTerbilang}</b>, bertempat di Kantor Inspektorat Kota Banjarmasin, kami yang bertanda tangan di bawah ini:
                  </p>

                  {/* PIHAK PERTAMA */}
                  <div className="text-[10.5pt] ml-4 space-y-0.5 mb-2">
                    <table className="w-full borderless text-[10.5pt]">
                      <tbody>
                        <tr>
                          <td className="w-6 font-bold align-top">I.</td>
                          <td className="w-28 font-medium">Nama</td>
                          <td className="w-4">:</td>
                          <td className="font-bold">{pengurusBarang.nama}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>NIP</td>
                          <td>:</td>
                          <td>{pengurusBarang.nip}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Pangkat/Gol</td>
                          <td>:</td>
                          <td>{pengurusBarang.pangkatGol}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Jabatan</td>
                          <td>:</td>
                          <td>{pengurusBarang.jabatan}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-justify italic text-black text-[10pt] mt-1 pl-6">
                      Dalam hal ini bertindak untuk dan atas nama Pengguna Barang Inspektorat Kota Banjarmasin, selanjutnya disebut sebagai <b>PIHAK PERTAMA</b>
                    </p>
                  </div>

                  {/* PIHAK KEDUA */}
                  <div className="text-[10.5pt] ml-4 space-y-0.5 mt-3 mb-3">
                    <table className="w-full borderless text-[10.5pt]">
                      <tbody>
                        <tr>
                          <td className="w-6 font-bold align-top">II.</td>
                          <td className="w-28 font-medium">Nama</td>
                          <td className="w-4">:</td>
                          <td className="font-bold">{pegawai.nama}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>NIP</td>
                          <td>:</td>
                          <td>{pegawai.nip}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Pangkat/Gol</td>
                          <td>:</td>
                          <td>{pegawai.pangkatGol}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Jabatan</td>
                          <td>:</td>
                          <td>{pegawai.jabatan}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Unit Kerja</td>
                          <td>:</td>
                          <td>{pegawai.unitKerja}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-justify italic text-black text-[10pt] mt-1 pl-6">
                      Dalam hal ini bertindak selaku Pemakai Barang Milik Daerah, selanjutnya disebut sebagai <b>PIHAK KEDUA</b>.
                    </p>
                  </div>

                  <p className="text-justify text-[10.5pt] leading-relaxed mb-4">
                    Berdasarkan Keputusan Inspektur Kota Banjarmasin Nomor: {pelimpahan.nomorSK || '...'} Tahun {tglDinas.tahunAngka} tentang Penetapan Pegawai sebagai Pemakai Barang Milik Daerah pada Inspektorat Kota Banjarmasin, PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA, dan PIHAK KEDUA menerima dari PIHAK PERTAMA Barang Milik Daerah (BMD) dengan ketentuan sebagai berikut:
                  </p>

                  <div className="space-y-3 text-[10pt] text-justify leading-relaxed">
                    <div>
                      <p className="font-bold text-center">Pasal 1<br />RINCIAN BARANG MILIK DAERAH</p>
                      <p className="mt-1">
                        PIHAK PERTAMA menyerahkan Barang Milik Daerah kepada PIHAK KEDUA dengan rincian sebagai berikut:
                        <br />
                        (Tabel Rincian Aset tercantum pada Lampiran yang merupakan bagian tidak terpisahkan dari Berita Acara ini).
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-center">Pasal 2<br />MAKSUD DAN TUJUAN PENGGUNAAN</p>
                      <p className="mt-1">
                        PIHAK KEDUA menjamin secara hukum bahwa seluruh Barang Milik Daerah (BMD) yang diterima berada dalam penguasaan fisik secara nyata dan digunakan secara sah semata-mata untuk menunjang pelaksanaan tugas dan fungsi kedinasan pada Inspektorat Kota Banjarmasin.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Halaman 2 BAST: Portrait A4 */}
                <div className="document-page-sheet">
                  <div className="space-y-3.5 text-[10pt] text-justify leading-relaxed pt-2">
                    <div>
                      <p className="font-bold text-center">Pasal 3<br />PENCATATAN DAN PENATAUSAHAAN</p>
                      <p className="mt-1">
                        Seluruh pemanfaatan Barang Milik Daerah (BMD) oleh perseorangan/pegawai wajib terdata dalam Kartu Inventaris Barang (KIB) / DHK Ruangan dan didukung dengan Berita Acara Serah Terima (BAST) Penggunaan Barang ini.
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-center">Pasal 4<br />PEMBARUAN DATA BERITA ACARA SERAH TERIMA (BAST)</p>
                      <p className="mt-1">
                        Apabila terdapat perubahan data pegawai, mutasi internal ruangan, atau perbaikan kondisi aset, PIHAK KEDUA wajib melaporkan kepada Pengurus Barang agar dilakukan pembaruan Berita Acara Serah Terima selambat-lambatnya 7 (tujuh) hari kerja sejak terjadinya perubahan.
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-center">Pasal 5<br />LARANGAN</p>
                      <p className="mt-1">PIHAK KEDUA DILARANG KERAS:</p>
                      <ol className="list-decimal ml-6 space-y-1 mt-1">
                        <li>Memindahtangankan, meminjamkan kepada pihak luar, menyewakan, atau menjaminkan barang milik daerah kepada pihak lain;</li>
                        <li>Menggunakan barang milik daerah untuk kepentingan pribadi atau di luar kepentingan kedinasan;</li>
                        <li>Mengubah bentuk, spesifikasi, atau merusak segel/identitas barang tanpa izin tertulis dari Pengguna Barang.</li>
                      </ol>
                    </div>

                    <div>
                      <p className="font-bold text-center">Pasal 6<br />KEWAJIBAN PENGEMBALIAN & SURAT BEBAS ASET</p>
                      <ol className="list-decimal ml-6 space-y-1 mt-1">
                        <li>Apabila PIHAK KEDUA mengalami Mutasi, Promosi, Pensiun, Tugas Belajar, Berhenti dari Jabatan, atau Berakhir Masa Kerja, maka PIHAK KEDUA WAJIB mengembalikan seluruh aset dalam keadaan baik dan lengkap kepada Pengurus Barang paling lambat 3 (tiga) hari kerja sebelum penandatanganan BAST Jabatan / Pelantikan.</li>
                        <li>Pengembalian aset sebagaimana dimaksud pada ayat (1) menjadi syarat mutlak penerbitan Surat Keterangan Bebas Tanggungan Aset untuk kelancaran administrasi kepegawaian dan pembayaran hak-hak keuangan.</li>
                      </ol>
                    </div>

                    <div>
                      <p className="font-bold text-center">Pasal 7<br />TANGGUNG JAWAB KERUSAKAN, KEHILANGAN, DAN TGR</p>
                      <ol className="list-decimal ml-6 space-y-1 mt-1">
                        <li>PIHAK KEDUA bertanggung jawab penuh atas pemeliharaan dan pengamanan fisik barang selama berada dalam penguasaannya.</li>
                        <li>Apabila terjadi kehilangan atau kerusakan akibat kelalaian maupun kesengajaan PIHAK KEDUA, maka PIHAK KEDUA wajib melaporkan secara tertulis dalam waktu 1 x 24 jam dan bersedia bertanggung jawab mengganti kerugian daerah melalui mekanisme Tuntutan Ganti Rugi (TGR) serta sanksi disiplin sesuai ketentuan peraturan perundang-undangan.</li>
                      </ol>
                    </div>

                    <div>
                      <p className="font-bold text-center">Pasal 8<br />PENUTUP</p>
                      <p className="mt-1">
                        Berita Acara ini dibuat dan ditandatangani dalam 3 (tiga) rangkap bernilai hukum sama, 1 (satu) rangkap untuk PIHAK PERTAMA, 1 (satu) rangkap untuk PIHAK KEDUA, dan 1 (satu) rangkap untuk Arsip Pengurus Barang Pengguna.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Halaman 3 BAST: Tanda Tangan Para Pihak (Portrait A4) */}
                <div className="document-page-sheet flex flex-col justify-between">
                  <div>
                    <p className="text-justify text-[10.5pt] leading-relaxed mb-4 pt-4">
                      Demikian Berita Acara Serah Terima (BAST) ini dibuat dengan sebenarnya tanpa paksaan dari pihak manapun untuk dipergunakan sebagaimana mestinya dan sebagai bahan pertanggungjawaban penatausahaan BMD.
                    </p>

                    <div className="text-right text-[10.5pt] mb-4 pr-2">
                      <p>Banjarmasin, {tglDinas.tanggalFormatted}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-center text-[10.5pt] mt-4">
                      <div>
                        <p className="font-bold">PIHAK KEDUA</p>
                        <p className="font-medium">PEMAKAI BARANG,</p>
                        <div className="h-20 flex items-center justify-center my-2">
                          {pelimpahan.tandaTanganPihakKedua ? (
                            <img src={pelimpahan.tandaTanganPihakKedua} alt="TTD Pihak Kedua" className="max-h-16 max-w-[160px] object-contain" />
                          ) : (
                            <div className="border-b border-dashed border-slate-400 w-36 pb-1 text-xs text-slate-400">
                              ( Tanda Tangan )
                            </div>
                          )}
                        </div>
                        <p className="font-bold">{pegawai.nama}</p>
                        <p className="text-xs">NIP. {pegawai.nip}</p>
                      </div>

                      <div>
                        <p className="font-bold">PIHAK PERTAMA</p>
                        <p className="font-medium">PENGURUS BARANG,</p>
                        <div className="h-20 flex items-center justify-center my-2">
                          {pelimpahan.tandaTanganPihakPertama ? (
                            <img src={pelimpahan.tandaTanganPihakPertama} alt="TTD Pihak Pertama" className="max-h-16 max-w-[160px] object-contain" />
                          ) : (
                            <div className="border-b border-dashed border-slate-400 w-36 pb-1 text-xs text-slate-400">
                              ( Tanda Tangan )
                            </div>
                          )}
                        </div>
                        <p className="font-bold">{pengurusBarang.nama}</p>
                        <p className="text-xs">NIP. {pengurusBarang.nip}</p>
                      </div>
                    </div>

                    <div className="text-center text-[10.5pt] mt-12">
                      <p className="font-medium">Mengetahui/Menyetujui :</p>
                      <p className="font-bold uppercase tracking-wide">PENGGUNA BARANG / INSPEKTUR KOTA BANJARMASIN,</p>
                      <div className="h-24 flex items-center justify-center my-2">
                        {pelimpahan.tandaTanganPenggunaBarang ? (
                          <img src={pelimpahan.tandaTanganPenggunaBarang} alt="TTD Pengguna Barang" className="max-h-20 max-w-[180px] object-contain" />
                        ) : (
                          <div className="border-b border-dashed border-slate-400 w-48 pb-1 text-xs text-slate-400">
                            ( Cap Dinas & Tanda Tangan )
                          </div>
                        )}
                      </div>
                      <p className="font-bold">{penggunaBarang.nama}</p>
                      <p className="text-xs">{penggunaBarang.pangkatGol}</p>
                      <p className="text-xs">NIP. {penggunaBarang.nip}</p>
                    </div>
                  </div>
                </div>

                {/* Halaman 4 BAST: Lampiran I Tabel Rincian BMD (LANDSCAPE A4) */}
                <div className="document-page-sheet-landscape" data-orientation="landscape">
                  <div className="text-left text-[9.5pt] leading-tight mb-3">
                    <p className="font-bold">LAMPIRAN I :</p>
                    <p className="font-bold">BERITA ACARA SERAH TERIMA PENGGUNAAN</p>
                    <p className="font-bold">BARANG MILIK DAERAH (BMD)</p>
                    <p>NOMOR : {pelimpahan.nomorBAST || '...'} / -SET/ITKO</p>
                    <p>Tanggal : {tglDinas.tanggalFormatted}</p>
                    <p className="font-bold uppercase mt-1">DAFTAR RINCIAN BARANG MILIK DAERAH YANG DISERAHKAN</p>
                  </div>

                  {renderLampiranTable()}

                  <p className="text-[8.5pt] italic mt-2">
                    Keterangan Kondisi: B (Baik), RR (Rusak Ringan), RB (Rusak Berat)
                  </p>

                  <div className="flex justify-end text-[10pt] mt-4">
                    <div className="w-72 text-left">
                      <p>Ditetapkan di Banjarmasin</p>
                      <p>Pada Tanggal: {tglDinas.tanggalFormatted}</p>
                      <p className="font-bold mt-1">Inspektur,</p>
                      <div className="h-14 flex items-center justify-start my-1">
                        {pelimpahan.tandaTanganPenggunaBarang ? (
                          <img src={pelimpahan.tandaTanganPenggunaBarang} alt="TTD Inspektur" className="max-h-12 max-w-[150px] object-contain" />
                        ) : (
                          <div className="border-b border-dashed border-slate-400 w-36 pb-1 text-xs text-slate-400">
                            ( Cap & Tanda Tangan )
                          </div>
                        )}
                      </div>
                      <p className="font-bold">{penggunaBarang.nama}</p>
                      <p className="text-xs">{penggunaBarang.pangkatGol}</p>
                      <p className="text-xs">NIP. {penggunaBarang.nip}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* DOKUMEN 2: SURAT KEPUTUSAN (SK) PENETAPAN PEMAKAI BMD                     */}
            {/* ========================================================================= */}
            {activeTab === 'SK' && (
              <>
                {/* Halaman 1 SK: Portrait A4 */}
                <div className="document-page-sheet">
                  {renderKopSurat()}

                  <div className="text-center mb-4" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    <h3 className="text-[12pt] font-bold uppercase text-black">
                      KEPUTUSAN INSPEKTUR KOTA BANJARMASIN
                    </h3>
                    <p className="text-[11pt] font-bold text-black">
                      NOMOR: {pelimpahan.nomorSK || '...'} -SET/ITKO
                    </p>
                    <p className="text-[10pt] font-bold uppercase tracking-wider mt-1">
                      TENTANG
                    </p>
                    <p className="text-[11pt] font-bold uppercase max-w-lg mx-auto leading-snug">
                      PENETAPAN PEGAWAI SEBAGAI PEMAKAI BARANG MILIK DAERAH
                      <br />
                      PADA INSPEKTORAT KOTA BANJARMASIN
                    </p>
                  </div>

                  <div className="text-[10pt] space-y-2 text-justify leading-relaxed">
                    <div className="flex gap-2">
                      <span className="w-24 font-bold shrink-0">Menimbang</span>
                      <span className="w-3 shrink-0">:</span>
                      <div className="flex-1 space-y-1">
                        <div className="flex gap-2">
                          <span className="font-bold shrink-0">a.</span>
                          <p>bahwa untuk menunjang kelancaran pelaksanaan tugas dan fungsi kedinasan pada Inspektorat Kota Banjarmasin, diperlukan sarana dan prasarana berupa Barang Milik Daerah yang digunakan secara tertib, efektif, efisien, dan bertanggung jawab;</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold shrink-0">b.</span>
                          <p>bahwa dalam rangka pengamanan, pemeliharaan, pengawasan, dan tertib administrasi pengelolaan Barang Milik Daerah, perlu menetapkan pegawai sebagai pemakai langsung barang inventaris yang digunakan dalam pelaksanaan tugas kedinasan;</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold shrink-0">c.</span>
                          <p>bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a dan huruf b, perlu menetapkan Keputusan Inspektur Kota Banjarmasin tentang Penetapan Pegawai sebagai Pemakai Barang Milik Daerah pada Inspektorat Kota Banjarmasin.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <span className="w-24 font-bold shrink-0">Mengingat</span>
                      <span className="w-3 shrink-0">:</span>
                      <div className="flex-1 space-y-1 text-[9.5pt]">
                        <p>1. Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah (Lembaran Negara Republik Indonesia Tahun 2014 Nomor 244, Tambahan Lembaran Negara Republik Indonesia Nomor 5587) sebagaimana telah beberapa kali diubah terakhir dengan Undang-Undang Nomor 6 Tahun 2023;</p>
                        <p>2. Peraturan Pemerintah Nomor 27 Tahun 2014 tentang Pengelolaan Barang Milik Negara/Daerah (Lembaran Negara Republik Indonesia Tahun 2014 Nomor 92, Tambahan Lembaran Negara Republik Indonesia Nomor 5533) sebagaimana telah diubah dengan Peraturan Pemerintah Nomor 28 Tahun 2020;</p>
                        <p>3. Peraturan Menteri Dalam Negeri Nomor 19 Tahun 2016 tentang Pedoman Pengelolaan Barang Milik Daerah sebagaimana telah diubah dengan Peraturan Menteri Dalam Negeri Nomor 7 Tahun 2024;</p>
                        <p>4. Peraturah Daerah Kota Banjarmasin No. 15 Tahun 2018 tentang Pengelolaan Barang Milik Daerah;</p>
                        <p>5. Peraturan Wali Kota Banjarmasin No. 53 Tahun 2023 tentang Petunjuk Teknis Pelaksanaan Inventarisasi Barang Milik Daerah;</p>
                        <p>6. Peraturan Wali Kota Banjarmasin No. 61 Tahun 2023 tentang Pedoman Teknis Pejabat Pengelolaan Barang Milik Daerah;</p>
                        <p>7. Peraturan Wali Kota Banjarmasin No. 63 Tahun 2023 tentang Pedoman Teknis Pemanfaatan Barang Milik Daerah;</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Halaman 2 SK: Diktum KESATU dgn Pasfoto di kiri (Portrait A4) */}
                <div className="document-page-sheet">
                  <div className="text-[9.5pt] space-y-1 text-justify leading-relaxed mb-3">
                    <p className="ml-28 pl-2">8. Peraturan Wali Kota Banjarmasin No. 74 Tahun 2023 tentang Pedoman Teknis Penatausahaan Barang Milik Daerah;</p>
                    <p className="ml-28 pl-2">9. Peraturan Daerah Kota Banjarmasin Nomor 1 Tahun 2026 tentang Pembentukan dan Susunan Perangkat Daerah (Lembaran Daerah Kota Banjarmasin Tahun 2026 Nomor 1, Tambahan Lembaran Daerah Kota Banjarmasin Nomor 95);</p>
                    <p className="ml-28 pl-2">10. Peraturan Wali Kota Banjarmasin Nomor 103 Tahun 2021 tentang Kedudukan, Susunan Organisasi, Tugas dan Fungsi serta Tata Kerja Perangkat Daerah Kota Banjarmasin (Berita Daerah Kota Banjarmasin Tahun 2021 Nomor 103);</p>
                    <p className="ml-28 pl-2">11. Peraturan Wali Kota Banjarmasin Nomor 65 Tahun 2022 Tentang Tugas, Fungsi dan Uraian Inspektorat Kota Banjarmasin (Berita Daerah Kota Banjarmasin Tahun 2022 Nomor 65).</p>
                  </div>

                  <div className="text-center font-bold uppercase tracking-widest my-3 text-[11pt]">
                    MEMUTUSKAN:
                  </div>

                  <div className="text-[10pt] space-y-3 text-justify leading-relaxed">
                    <div className="flex gap-2">
                      <span className="w-24 font-bold shrink-0">Menetapkan :</span>
                    </div>

                    <div className="flex gap-2">
                      <span className="w-24 font-bold shrink-0">KESATU</span>
                      <span className="w-3 shrink-0">:</span>
                      <div className="flex-1">
                        <p>Menetapkan pegawai yang namanya tercantum di bawah ini sebagai Pemakai Barang Milik Daerah pada Inspektorat Kota Banjarmasin:</p>

                        {/* FOTO PEGAWAI DI SEBELAH KIRI SESUAI FORMAT RESMI PDF 2 */}
                        <div className="flex items-center gap-6 my-3 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                          <div className="w-24 h-32 bg-[#2563EB] text-white flex flex-col items-center justify-center rounded border border-blue-700 shrink-0 overflow-hidden shadow-2xs">
                            {pegawai.foto ? (
                              <img src={pegawai.foto} alt={pegawai.nama} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-center px-1">Foto pegawai</span>
                            )}
                          </div>

                          <table className="borderless text-[10pt] w-full">
                            <tbody>
                              <tr>
                                <td className="w-24 font-medium">Nama</td>
                                <td className="w-3">:</td>
                                <td className="font-bold">{pegawai.nama}</td>
                              </tr>
                              <tr>
                                <td className="font-medium">NIP</td>
                                <td>:</td>
                                <td>{pegawai.nip}</td>
                              </tr>
                              <tr>
                                <td className="font-medium">Pangkat/Gol</td>
                                <td>:</td>
                                <td>{pegawai.pangkatGol}</td>
                              </tr>
                              <tr>
                                <td className="font-medium">Jabatan</td>
                                <td>:</td>
                                <td>{pegawai.jabatan}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <span className="w-24 font-bold shrink-0">KEDUA</span>
                      <span className="w-3 shrink-0">:</span>
                      <p className="flex-1">
                        Menetapkan Barang Milik Daerah sebagaimana tercantum dalam Lampiran yang merupakan bagian tidak terpisahkan dari Keputusan ini untuk digunakan oleh pegawai sebagaimana dimaksud dalam Diktum KESATU dalam rangka menunjang pelaksanaan tugas kedinasan
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span className="w-24 font-bold shrink-0">KETIGA</span>
                      <span className="w-3 shrink-0">:</span>
                      <div className="flex-1 space-y-1">
                        <p>Pegawai sebagaimana dimaksud dalam Diktum KESATU berkewajiban:</p>
                        <p>a. menggunakan barang sesuai dengan peruntukan dan kebutuhan pelaksanaan tugas kedinasan;</p>
                        <p>b. menjaga keamanan, kebersihan, dan kondisi barang agar tetap berfungsi dengan baik;</p>
                        <p>c. bertanggung jawab atas pemakaian dan pemeliharaan barang selama berada dalam penguasaannya sesuai dengan ketentuan yang berlaku;</p>
                        <p>d. tidak memindahtangankan, meminjamkan, mengalihkan, menjaminkan, atau menggunakan barang untuk kepentingan pribadi/di luar kepentingan kedinasan tanpa persetujuan tertulis dari Pengguna Barang/Atasan Berwenang;</p>
                        <p>e. segera melaporkan secara tertulis kepada Pengurus Barang / Atasan Langsung apabila barang mengalami kerusakan, kehilangan, atau gangguan fungsi paling lambat 1x24 jam sejak kejadian;</p>
                        <p>f. tidak melakukan perubahan, modifikasi, penggantian komponen utama, atau tindakan yang mengubah spesifikasi barang tanpa izin tertulis;</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Halaman 3 SK: Diktum lanjutan & Tanda Tangan Inspektur (Portrait A4) */}
                <div className="document-page-sheet flex flex-col justify-between">
                  <div className="text-[10pt] space-y-3 text-justify leading-relaxed pt-2">
                    <div className="ml-28 pl-1 space-y-1">
                      <p>g. tidak melakukan perubahan, penggantian komponen, atau tindakan lain terhadap barang tanpa persetujuan pejabat yang berwenang, kecuali untuk pemeliharaan rutin yang diperbolehkan; mengembalikan barang dalam kondisi baik dan lengkap apabila terjadi mutasi, promosi, pensiun, perbaikan penugasan, berakhirnya kebutuhan penggunaan, atau sewaktu-waktu diminta oleh Pengguna Barang/Atasan Berwenang;</p>
                      <p>h. mengembalikan barang apabila terjadi mutasi, perubahan penugasan, berakhirnya kebutuhan penggunaan, atau atas permintaan pejabat yang berwenang; dan</p>
                      <p>i. bersedia menunjukkan dan menyerahkan barang untuk keperluan pemeriksaan, verifikasi fisik, inventarisasi (cek fisik), dan rekonsiliasi data Barang Milik Daerah oleh Tim Pembina/Pemeriksa Internal maupun Eksternal (BPK/BPKP/APH).</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="w-24 font-bold shrink-0">KEEMPAT</span>
                      <span className="w-3 shrink-0">:</span>
                      <p className="flex-1">
                        Penyerahan fisik barang kepada pegawai sebagai pemakai wajib disertai dengan Berita Acara Serah Terima (BAST) Barang yang ditandatangani oleh Pengurus Barang/Pejabat Berwenang dan Pemakai Barang.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span className="w-24 font-bold shrink-0">KELIMA</span>
                      <span className="w-3 shrink-0">:</span>
                      <p className="flex-1">
                        Apabila terjadi kehilangan atau kerusakan Barang Milik Daerah yang disebabkan oleh kelalaian, penyalahgunaan, atau pelanggaran terhadap ketentuan dalam Keputusan ini, maka Pegawai yang bersangkutan bersedia dikenakan sanksi sesuai ketentuan peraturan perundang-undangan dan diproses Tuntutan Ganti Rugi (TGR) sesuai dengan mekanisme penyelesaian kerugian daerah.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span className="w-24 font-bold shrink-0">KEENAM</span>
                      <span className="w-3 shrink-0">:</span>
                      <p className="flex-1">
                        Penetapan sebagai pemakai barang sebagaimana dimaksud dalam Keputusan ini tidak mengubah status kepemilikan barang dan tidak memberikan hak kepemilikan pribadi atas Barang Milik Daerah dimaksud.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span className="w-24 font-bold shrink-0">KETUJUH</span>
                      <span className="w-3 shrink-0">:</span>
                      <p className="flex-1">
                        Segala hal yang berkaitan dengan pencatatan, pengamanan, pemeliharaan, dan pengembalian barang dilaksanakan sesuai dengan ketentuan peraturan perundang-undangan mengenai pengelolaan Barang Milik Daerah.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span className="w-24 font-bold shrink-0">KEDELAPAN</span>
                      <span className="w-3 shrink-0">:</span>
                      <p className="flex-1">
                        Surat Keputusan ini berlaku sejak tanggal ditetapkan dan bila ditemukan kekeliruan pada keputusan ini akan dilakukan perbaikan sebagaimana mestinya.
                      </p>
                    </div>

                    {/* Tanda Tangan Inspektur */}
                    <div className="flex justify-end text-[10pt] mt-8 pt-4">
                      <div className="w-72 text-left">
                        <p>Ditetapkan di Banjarmasin</p>
                        <p>Pada Tanggal: {tglDinas.tanggalFormatted}</p>
                        <p className="font-bold mt-2">Inspektur,</p>
                        <div className="h-20 flex items-center justify-start my-1">
                          {pelimpahan.tandaTanganPenggunaBarang ? (
                            <img src={pelimpahan.tandaTanganPenggunaBarang} alt="TTD Inspektur" className="max-h-16 max-w-[160px] object-contain" />
                          ) : (
                            <div className="border-b border-dashed border-slate-400 w-36 pb-1 text-xs text-slate-400">
                              ( Cap & Tanda Tangan )
                            </div>
                          )}
                        </div>
                        <p className="font-bold">{penggunaBarang.nama}</p>
                        <p className="text-xs">{penggunaBarang.pangkatGol}</p>
                        <p className="text-xs">NIP. {penggunaBarang.nip}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Halaman 4 SK: Lampiran I Tabel Rincian BMD (LANDSCAPE A4) */}
                <div className="document-page-sheet-landscape" data-orientation="landscape">
                  <div className="text-left text-[9.5pt] leading-tight mb-3">
                    <p className="font-bold">LAMPIRAN I :</p>
                    <p className="font-bold">KEPUTUSAN INSPEKTUR KOTA BANJARMASIN</p>
                    <p>NOMOR : {pelimpahan.nomorSK || '...'} -SET/ITKO</p>
                    <p>Tanggal : {tglDinas.tanggalFormatted}</p>
                    <p className="font-bold uppercase mt-1">
                      TENTANG : PENETAPAN PEGAWAI SEBAGAI PEMAKAI BARANG MILIK DAERAH PADA INSPEKTORAT KOTA BANJARMASIN
                    </p>
                    <p className="font-bold uppercase mt-1">DAFTAR BARANG MILIK DAERAH YANG DIGUNAKAN PEGAWAI</p>
                  </div>

                  {renderLampiranTable()}

                  <p className="text-[8.5pt] italic mt-2">
                    Keterangan Kondisi: B (Baik), RR (Rusak Ringan), RB (Rusak Berat)
                  </p>

                  <div className="flex justify-end text-[10pt] mt-4">
                    <div className="w-72 text-left">
                      <p>Ditetapkan di Banjarmasin</p>
                      <p>Pada Tanggal: {tglDinas.tanggalFormatted}</p>
                      <p className="font-bold mt-1">Inspektur,</p>
                      <div className="h-14 flex items-center justify-start my-1">
                        {pelimpahan.tandaTanganPenggunaBarang ? (
                          <img src={pelimpahan.tandaTanganPenggunaBarang} alt="TTD Inspektur" className="max-h-12 max-w-[150px] object-contain" />
                        ) : (
                          <div className="border-b border-dashed border-slate-400 w-36 pb-1 text-xs text-slate-400">
                            ( Cap & Tanda Tangan )
                          </div>
                        )}
                      </div>
                      <p className="font-bold">{penggunaBarang.nama}</p>
                      <p className="text-xs">{penggunaBarang.pangkatGol}</p>
                      <p className="text-xs">NIP. {penggunaBarang.nip}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* DOKUMEN 3: SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM)                 */}
            {/* ========================================================================= */}
            {activeTab === 'SPTJM' && (
              <>
                {/* Halaman 1 SPTJM: Portrait A4 */}
                <div className="document-page-sheet">
                  {renderKopSurat()}

                  <div className="text-center mb-4" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    <h3 className="text-[12pt] font-bold uppercase text-black">
                      SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK
                    </h3>
                    <p className="text-[11pt] font-bold text-black">
                      NOMOR: {pelimpahan.nomorSPTJM || '...'} / -SET / ITKO
                    </p>
                  </div>

                  <p className="text-[10.5pt] mb-2">
                    Saya yang bertanda tangan di bawah ini:
                  </p>

                  <div className="ml-4 mb-3">
                    <table className="borderless text-[10.5pt]">
                      <tbody>
                        <tr>
                          <td className="w-28 font-medium">Nama</td>
                          <td className="w-4">:</td>
                          <td className="font-bold">{pegawai.nama}</td>
                        </tr>
                        <tr>
                          <td className="font-medium">NIP</td>
                          <td>:</td>
                          <td>{pegawai.nip}</td>
                        </tr>
                        <tr>
                          <td className="font-medium">Pangkat/Gol</td>
                          <td>:</td>
                          <td>{pegawai.pangkatGol}</td>
                        </tr>
                        <tr>
                          <td className="font-medium">Jabatan</td>
                          <td>:</td>
                          <td>{pegawai.jabatan}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-justify text-[10pt] leading-relaxed mb-3">
                    Dengan ini menyatakan dengan sesungguhnya dan penuh kesadaran bahwa saya telah menerima dan menggunakan Barang Milik Daerah (BMD) pada Inspektorat Kota Banjarmasin berdasarkan Keputusan Inspektur Kota Banjarmasin Nomor: {pelimpahan.nomorSK || '[Nomor SK]'} dan Berita Acara Serah Terima (BAST) Nomor: {pelimpahan.nomorBAST || '[Nomor BAST]'}, dengan rincian sebagaimana tercantum dalam lampiran yang tidak terpisahkan dari Surat Pernyataan ini.
                  </p>

                  <p className="text-justify text-[10pt] leading-relaxed mb-2">
                    Sehubungan dengan penerimaan dan penggunaan Barang Milik Daerah tersebut, saya menyatakan setuju dan mengikatkan diri atas hal-hal sebagai berikut:
                  </p>

                  <ol className="list-decimal ml-6 space-y-2 text-[9.5pt] text-justify leading-relaxed">
                    <li>
                      Bertanggung jawab penuh secara mutlak atas penggunaan, pengamanan, pemeliharaan fisik, dan administrasi Barang Milik Daerah yang diserahkan kepada saya semata-mata untuk menunjang pelaksanaan tugas kedinasan.
                    </li>
                    <li>
                      Menjaga, memelihara, dan mengamankan barang tersebut agar tetap dalam kondisi baik, berfungsi optimal, serta terhindar dari kerusakan, kehilangan, atau penurunan fungsi di luar keharusan.
                    </li>
                    <li>
                      Dilarang keras memindahtangankan, meminjamkan kepada pihak lain, mengalihkan, menggadaikan, menyewakan, menjual, atau mengubah bentuk/spesifikasi barang tanpa izin tertulis dari Pengguna Barang / Pejabat yang berwenang.
                    </li>
                    <li>
                      Segera melaporkan secara tertulis kepada Pengurus Barang / Atasan Langsung dalam jangka waktu paling lambat 1 x 24 (satu kali dua puluh empat) jam apabila terjadi kerusakan, kehilangan, atau gangguan fungsi atas barang tersebut.
                    </li>
                    <li>
                      Bersedia menunjukkan dan menyerahkan fisik barang secara utuh apabila sewaktu-waktu diperlukan untuk keperluan pemeriksaan, inventarisasi (cek fisik), rekonsiliasi data, dan pengawasan oleh Tim Internal Inspektorat, BPK, BPKP, maupun Aparat Penegak Hukum (APH).
                    </li>
                    <li>
                      Bersedia mengembalikan seluruh barang dalam keadaan lengkap dan baik paling lambat 3 (tiga) hari kerja sebelum dilaksanakannya serah terima jabatan apabila terjadi mutasi, promosi, pensiun, tugas belajar, atau berhenti dari jabatan, sebagai syarat penerbitan Surat Keterangan Bebas Tanggungan Aset.
                    </li>
                    <li>
                      APABILA TERJADI KEHILANGAN, KERUSAKAN TOTAL, ATAU PENYALAHGUNAAN atas Barang Milik Daerah yang berada dalam penguasaan saya akibat kelalaian maupun kesengajaan, maka SAYA BERSEDIA BERTANGGUNG JAWAB SEPENUHNYA UNTUK GANTI RUGI (mengganti barang yang setara/sejenis atau menyetorkan uang senilai harga perolehan/nilai ganti rugi ke Kas Daerah) melalui mekanisme Tuntutan Ganti Rugi (TGR) serta bersedia dikenakan sanksi disiplin PNS sesuai dengan ketentuan peraturan perundang-undangan.
                    </li>
                  </ol>
                </div>

                {/* Halaman 2 SPTJM: Portrait A4 */}
                <div className="document-page-sheet flex flex-col justify-between">
                  <div>
                    <ol start={8} className="list-decimal ml-6 space-y-3 text-[10pt] text-justify leading-relaxed pt-2">
                      <li>
                        Menyatakan bahwa seluruh barang yang diterima digunakan secara sah hanya untuk kepentingan kedinasan dan tidak digunakan untuk kepentingan pribadi atau kegiatan yang melanggar hukum.
                      </li>
                    </ol>

                    <p className="text-justify text-[10pt] leading-relaxed my-5">
                      Demikian Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) ini saya buat dengan sebenarnya, penuh rasa tanggung jawab, tanpa ada unsur paksaan atau tekanan dari pihak manapun, untuk dipergunakan sebagaimana mestinya.
                    </p>

                    <div className="flex justify-end text-[10pt] mt-10">
                      <div className="w-72 text-left">
                        <p>Banjarmasin, {tglDinas.tanggalFormatted}</p>
                        <p className="font-bold mt-1">Yang Membuat Pernyataan</p>
                        
                        {/* Materai Box */}
                        <div className="h-28 flex flex-col justify-center items-start my-2 relative">
                          <div className="border border-slate-400 bg-slate-50 text-slate-500 text-[8pt] px-3 py-1 rounded text-center w-28 uppercase font-medium">
                            materai
                          </div>
                          {pelimpahan.tandaTanganPihakKedua && (
                            <img
                              src={pelimpahan.tandaTanganPihakKedua}
                              alt="Tanda Tangan di atas Materai"
                              className="max-h-20 max-w-[160px] object-contain absolute left-6 top-3 z-10"
                            />
                          )}
                        </div>

                        <p className="font-bold">{pegawai.nama}</p>
                        <p className="text-xs">NIP. {pegawai.nip}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Halaman 3 SPTJM: Lampiran I Tabel Rincian BMD (LANDSCAPE A4) */}
                <div className="document-page-sheet-landscape" data-orientation="landscape">
                  <div className="text-left text-[9.5pt] leading-tight mb-3">
                    <p className="font-bold">LAMPIRAN I :</p>
                    <p className="font-bold">SURAT PERNYATAAN TANGGUNG JAWAB</p>
                    <p className="font-bold">MUTLAK (SPTJM)</p>
                    <p>NOMOR : {pelimpahan.nomorSPTJM || '...'} -SET/ITKO</p>
                    <p>Tanggal : {tglDinas.tanggalFormatted}</p>
                    <p className="font-bold uppercase mt-1">RINCIAN BARANG MILIK DAERAH YANG DIKUASAI / DIGUNAKAN</p>
                  </div>

                  {renderLampiranTable()}

                  <p className="text-[8.5pt] italic mt-2">
                    Keterangan Kondisi: B (Baik), RR (Rusak Ringan), RB (Rusak Berat)
                  </p>

                  <div className="flex justify-end text-[10pt] mt-4">
                    <div className="w-72 text-left">
                      <p className="font-bold">Yang Membuat Pernyataan</p>
                      <p className="text-[10pt] mb-1">Banjarmasin, {tglDinas.tanggalFormatted}</p>
                      <div className="h-20 flex flex-col justify-center items-start my-1 relative">
                        <div className="border border-slate-400 bg-slate-50 text-slate-500 text-[8pt] px-3 py-1 rounded text-center w-28 uppercase font-medium">
                          materai
                        </div>
                        {pelimpahan.tandaTanganPihakKedua && (
                          <img
                            src={pelimpahan.tandaTanganPihakKedua}
                            alt="TTD Pembuat Pernyataan"
                            className="max-h-14 max-w-[150px] object-contain absolute left-6 top-1 z-10"
                          />
                        )}
                      </div>
                      <p className="font-bold">{pegawai.nama}</p>
                      <p className="text-xs">NIP. {pegawai.nip}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
