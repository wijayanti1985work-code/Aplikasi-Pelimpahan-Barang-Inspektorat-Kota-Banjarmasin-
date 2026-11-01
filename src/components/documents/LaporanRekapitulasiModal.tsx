import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  FileSpreadsheet,
  FileDown,
  Building2,
  Calendar,
  Layers,
  Filter,
  CheckCircle,
  AlertTriangle,
  Package,
  MapPin,
  Banknote,
  Loader2,
  FileText,
} from 'lucide-react';
import type { BarangBMD, InstansiConfig, Pegawai, Pejabat } from '../../types/index.ts';
import { formatRupiah, formatTanggalIndonesia, terbilangRupiah, labelKondisi } from '../../utils/logic.ts';
import { exportRekapitulasiBMDToExcel } from '../../utils/excelService.ts';
import { downloadElementAsPdf } from '../../utils/pdfExport.ts';
import { LOGO_PEMKOT_BANJARMASIN_BASE64 } from '../../assets/logoPemko.ts';

interface LaporanRekapitulasiModalProps {
  barangList: BarangBMD[];
  pegawaiList: Pegawai[];
  pejabatList: Pejabat[];
  instansi: InstansiConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const LaporanRekapitulasiModal: React.FC<LaporanRekapitulasiModalProps> = ({
  barangList,
  pegawaiList,
  pejabatList,
  instansi,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const printableRef = useRef<HTMLDivElement | null>(null);

  // Filters inside report preview
  const [filterRuang, setFilterRuang] = useState('Semua');
  const [filterKondisi, setFilterKondisi] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Rooms list
  const ruanganList = Array.from(new Set(barangList.map(b => b.kodeLokasiRuang).filter(Boolean)));

  // Resolve pejabat
  const pengurusBarang: Pejabat = pejabatList.find(p => p.peran === 'Pengurus Barang') || {
    id: 'pejabat-pengurus-default',
    peran: 'Pengurus Barang',
    nama: 'Dian Dahniar',
    nip: '197311232007012008',
    pangkatGol: 'Penata Tingkat I / III/d',
    jabatan: 'Pengurus Barang Pengguna',
    instansi: 'Inspektorat Kota Banjarmasin',
  };

  const penggunaBarang: Pejabat = pejabatList.find(p => p.peran === 'Pengguna Barang') || {
    id: 'pejabat-pengguna-default',
    peran: 'Pengguna Barang',
    nama: 'RABIATUL ADAWIYAH, S.H., M.H.',
    nip: '19790128 200212 2 003',
    pangkatGol: 'Pembina Tingkat I / IV b',
    jabatan: 'Inspektur Kota Banjarmasin',
    instansi: 'Inspektorat Kota Banjarmasin',
  };

  const pegawaiMap = new Map(pegawaiList.map(p => [p.id, p]));

  // Filter items
  const filteredItems = barangList.filter(item => {
    const matchRuang = filterRuang === 'Semua' || item.kodeLokasiRuang === filterRuang;
    const matchKondisi = filterKondisi === 'Semua' || item.kondisi === filterKondisi;
    const matchStatus = filterStatus === 'Semua' || item.statusPemakaian === filterStatus;
    return matchRuang && matchKondisi && matchStatus;
  });

  const totalNilaiFiltered = filteredItems.reduce((acc, curr) => acc + (curr.nilaiPerolehan || 0), 0);
  const totalUnitFiltered = filteredItems.reduce((acc, curr) => acc + (curr.jumlah || 1), 0);
  const totalDipakai = filteredItems.filter(b => b.statusPemakaian === 'Dipakai').length;
  const totalTersedia = filteredItems.filter(b => b.statusPemakaian === 'Tersedia').length;
  const totalBaik = filteredItems.filter(b => b.kondisi === 'B').length;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');

  // Handle direct browser print in Landscape mode
  const handlePrint = () => {
    document.body.classList.add('print-landscape-doc');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-landscape-doc');
    }, 1000);
  };

  // Handle direct PDF download (Landscape A4)
  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    setIsGeneratingPdf(true);
    setPdfProgress('Menyiapkan dokumen rekapitulasi...');
    try {
      await downloadElementAsPdf(printableRef.current, {
        fileName: `Laporan_Rekapitulasi_BMD_Inspektorat_${new Date().toISOString().slice(0, 10)}`,
        orientation: 'landscape',
        onProgress: (msg) => setPdfProgress(msg),
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      handlePrint();
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const handleExportExcel = () => {
    exportRekapitulasiBMDToExcel(filteredItems, pegawaiList);
  };

  // Handle Word (.doc) download with Landscape page format
  const handleExportWord = () => {
    if (!printableRef.current) return;
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Rekapitulasi_BMD_Inspektorat</title>
        <style>
          @page SectionLandscape {
            size: 297mm 210mm;
            margin: 1cm 1.2cm 1cm 1.2cm;
            mso-page-orientation: landscape;
          }
          div.SectionLandscape {
            page: SectionLandscape;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 8.5pt;
            line-height: 1.2;
            color: #000;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 10px;
          }
          th, td {
            border: 1px solid #000;
            padding: 4px;
            font-size: 8pt;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: bold; }
          .header-line {
            border-bottom: 3px double #000;
            margin-bottom: 12px;
            padding-bottom: 4px;
          }
        </style>
      </head>
      <body>
        <div class="SectionLandscape">
          ${printableRef.current.innerHTML}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Rekapitulasi_BMD_${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Official logo source (base64 fallback guaranteed)
  const officialLogoSrc = instansi.logoUtamaUrl || LOGO_PEMKOT_BANJARMASIN_BASE64;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="document-modal-content bg-white w-full max-w-7xl rounded-2xl shadow-2xl border border-[#E5E7EB] flex flex-col max-h-[96vh] overflow-hidden">
        
        {/* Modal Header Controls (Hidden during print) */}
        <div className="no-print px-5 py-3.5 bg-[#0F766E] text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#0d6861] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] uppercase tracking-wider">
                Laporan Resmi BMD · Orientasi Landscape A4
              </span>
              <span className="text-xs text-teal-100">Inspektorat Kota Banjarmasin</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              Buku Inventaris / Laporan Rekapitulasi BMD
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Real PDF Download Button */}
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0F766E] bg-white hover:bg-teal-50 rounded-xl transition-colors cursor-pointer shadow-2xs disabled:opacity-75"
              title="Unduh dokumen langsung dalam format PDF Landscape"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0F766E]" />
                  <span>{pdfProgress || 'Membuat PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-[#0F766E]" />
                  <span>Unduh PDF (Landscape)</span>
                </>
              )}
            </button>

            {/* Browser Print Button (Landscape) */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 border border-teal-600 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Cetak langsung menggunakan dialog printer browser (Orientasi Landscape)"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak (Landscape)</span>
            </button>

            {/* Word Export Button */}
            <button
              type="button"
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-teal-700/80 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Ekspor ke dokumen Microsoft Word (.doc) format Landscape"
            >
              <FileText className="w-4 h-4" />
              <span>Word (.doc)</span>
            </button>

            {/* Excel Export Button */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Ekspor tabel ke spreadsheet Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-teal-800 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Toolbar (Hidden during print) */}
        <div className="no-print px-5 py-2.5 bg-slate-50 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#4B5563] font-medium">
              <Filter className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Filter Data:</span>
            </div>

            <div className="w-40">
              <select
                value={filterRuang}
                onChange={e => setFilterRuang(e.target.value)}
                className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none"
              >
                <option value="Semua">Semua Ruangan</option>
                {ruanganList.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-36">
              <select
                value={filterKondisi}
                onChange={e => setFilterKondisi(e.target.value)}
                className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none"
              >
                <option value="Semua">Semua Kondisi</option>
                <option value="B">Baik (B)</option>
                <option value="RR">Rusak Ringan (RR)</option>
                <option value="RB">Rusak Berat (RB)</option>
              </select>
            </div>

            <div className="w-36">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-2.5 py-1 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none"
              >
                <option value="Semua">Semua Status</option>
                <option value="Dipakai">Dipakai</option>
                <option value="Tersedia">Tersedia (Gudang)</option>
              </select>
            </div>
          </div>

          <div className="font-mono text-xs text-[#6B7280]">
            Ditampilkan: <strong className="text-[#111827]">{filteredItems.length}</strong> Barang ({formatRupiah(totalNilaiFiltered)})
          </div>
        </div>

        {/* Printable Document Canvas - A4 Landscape Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/70 print:bg-white print:p-0">
          <div
            ref={printableRef}
            className="document-page-sheet-landscape bg-white mx-auto text-black"
            data-orientation="landscape"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            {/* Kop Surat Resmi Sesuai Format Pemerintah Kota Banjarmasin */}
            <div className="text-center relative pb-2 mb-4" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              <div className="flex items-center justify-between gap-4">
                {/* Logo Resmi Kota Banjarmasin */}
                <div className="w-20 h-24 shrink-0 flex items-center justify-center">
                  <img
                    src={officialLogoSrc}
                    alt="Logo Pemerintah Kota Banjarmasin"
                    className="max-h-24 max-w-20 object-contain"
                  />
                </div>

                {/* Teks Kop Surat */}
                <div className="flex-1 text-center">
                  <div className="text-[13pt] font-bold tracking-wide text-black uppercase leading-tight">
                    {instansi.namaPemda || 'PEMERINTAH KOTA BANJARMASIN'}
                  </div>
                  <div className="text-[18pt] font-extrabold tracking-[6px] text-black uppercase leading-tight my-0.5">
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

                {/* Secondary Logo or Right Spacer */}
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
              <div className="border-b-[3px] border-black mt-2 mb-3" />
            </div>

            {/* Document Title */}
            <div className="text-center mb-3">
              <h2 className="text-[12pt] font-bold uppercase tracking-wider underline text-black">
                BUKU INVENTARIS / LAPORAN REKAPITULASI BARANG MILIK DAERAH (BMD)
              </h2>
              <p className="text-[9.5pt] font-medium text-black mt-0.5">
                Keadaan Per Tanggal: <span className="font-semibold">{formatTanggalIndonesia(new Date().toISOString().slice(0, 10))}</span>
              </p>
            </div>

            {/* Executive KPI Summary Table for Printed Document */}
            <div className="mb-3">
              <table className="w-full border-collapse border border-black text-[8.5pt]">
                <tbody>
                  <tr className="bg-slate-50">
                    <td className="border border-black p-1 font-bold">Total Unit Barang</td>
                    <td className="border border-black p-1 text-center font-bold">{totalUnitFiltered} Unit</td>
                    <td className="border border-black p-1 font-bold">Sedang Dipakai</td>
                    <td className="border border-black p-1 text-center font-semibold">{totalDipakai} Aset</td>
                    <td className="border border-black p-1 font-bold">Tersedia di Gudang</td>
                    <td className="border border-black p-1 text-center font-semibold">{totalTersedia} Aset</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 font-bold">Kondisi Baik (B)</td>
                    <td className="border border-black p-1 text-center">{totalBaik} Aset</td>
                    <td className="border border-black p-1 font-bold">Total Nilai Perolehan</td>
                    <td colSpan={3} className="border border-black p-1 font-mono font-bold text-right">
                      {formatRupiah(totalNilaiFiltered)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/70">
                    <td className="border border-black p-1 font-bold">Terbilang</td>
                    <td colSpan={5} className="border border-black p-1 italic">
                      {terbilangRupiah(totalNilaiFiltered)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Detailed Table Memuat SEMUA Data Inputan Aset (14 Kolom Lengkap) */}
            <div className="mb-4 overflow-x-auto">
              <table className="w-full border-collapse border border-black text-[8pt] text-black">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-black p-1 w-6">No</th>
                    <th className="border border-black p-1 w-24">Kode Barang / NIB</th>
                    <th className="border border-black p-1">Nama / Jenis Barang</th>
                    <th className="border border-black p-1">Merk / Tipe / Spesifikasi</th>
                    <th className="border border-black p-1 w-24">No. Seri / Rangka / Plat</th>
                    <th className="border border-black p-1 w-10">Tahun</th>
                    <th className="border border-black p-1 w-14">Jumlah</th>
                    <th className="border border-black p-1 w-24">Nilai Perolehan (Rp)</th>
                    <th className="border border-black p-1 w-16">Kondisi</th>
                    <th className="border border-black p-1 w-16">Sumber Dana</th>
                    <th className="border border-black p-1 w-20">Kode Lokasi/ Ruang</th>
                    <th className="border border-black p-1 w-28">Status & Pemakai</th>
                    <th className="border border-black p-1 w-24">Keterangan / Kelengkapan</th>
                    <th className="border border-black p-1 w-16">Foto Barang</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((b, idx) => {
                    const pemakai = b.idPegawaiPemakai ? pegawaiMap.get(b.idPegawaiPemakai) : null;
                    return (
                      <tr key={b.id || idx} className="text-center align-middle">
                        <td className="border border-black p-1 font-mono text-[8pt]">{idx + 1}</td>
                        <td className="border border-black p-1 text-left font-mono text-[7.5pt]">{b.kodeBarang}</td>
                        <td className="border border-black p-1 text-left font-bold">{b.namaBarang}</td>
                        <td className="border border-black p-1 text-left text-[7.5pt]">{b.merkTipe || '-'}</td>
                        <td className="border border-black p-1 font-mono text-[7.5pt]">{b.noSeri || '-'}</td>
                        <td className="border border-black p-1">{b.tahunPerolehan}</td>
                        <td className="border border-black p-1 font-semibold">{b.jumlah} {b.satuan}</td>
                        <td className="border border-black p-1 text-right font-mono text-[7.5pt]">
                          {formatRupiah(b.nilaiPerolehan)}
                        </td>
                        <td className="border border-black p-1 font-bold text-[7.5pt]">
                          {b.kondisi === 'B' ? 'B (Baik)' : b.kondisi === 'RR' ? 'RR (Rusak Ringan)' : 'RB (Rusak Berat)'}
                        </td>
                        <td className="border border-black p-1 text-[7.5pt]">{b.sumberDana || 'APBD'}</td>
                        <td className="border border-black p-1 font-semibold text-left text-[7.5pt]">{b.kodeLokasiRuang || '-'}</td>
                        <td className="border border-black p-1 text-left text-[7.5pt]">
                          {b.statusPemakaian === 'Dipakai' ? (
                            <div>
                              <p className="font-bold">{pemakai ? pemakai.nama : 'Pegawai Terdaftar'}</p>
                              {pemakai && <p className="font-mono text-[7pt] text-slate-700">NIP. {pemakai.nip}</p>}
                            </div>
                          ) : (
                            <span className="italic text-slate-600">Tersedia di Gudang</span>
                          )}
                        </td>
                        <td className="border border-black p-1 text-left text-[7.5pt]">{b.keterangan || '-'}</td>
                        <td className="border border-black p-1">
                          {b.fotoBarang ? (
                            <img
                              src={b.fotoBarang}
                              alt={b.namaBarang}
                              className="w-12 h-12 object-cover mx-auto rounded border border-black/30 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[#2563EB] text-white text-[6.5pt] font-bold flex items-center justify-center text-center p-0.5 rounded mx-auto leading-tight shadow-2xs">
                              Foto barang
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={6} className="border border-black p-1.5 text-right uppercase">
                      Total Akumulasi ({filteredItems.length} Barang):
                    </td>
                    <td className="border border-black p-1.5 text-center">
                      {totalUnitFiltered} Unit
                    </td>
                    <td className="border border-black p-1.5 text-right font-mono text-[8pt]">
                      {formatRupiah(totalNilaiFiltered)}
                    </td>
                    <td colSpan={6} className="border border-black p-1.5"></td>
                  </tr>
                  <tr>
                    <td colSpan={14} className="border border-black p-1.5 italic text-[8pt]">
                      Terbilang: <b>{terbilangRupiah(totalNilaiFiltered)}</b>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-8 text-center text-[9.5pt] mt-4 pt-1">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold uppercase tracking-wide">PENGGUNA BARANG / INSPEKTUR KOTA BANJARMASIN,</p>
                <div className="h-16 flex items-center justify-center my-1">
                  {penggunaBarang.tandaTanganUrl ? (
                    <img src={penggunaBarang.tandaTanganUrl} alt="TTD Inspektur" className="max-h-14 max-w-[150px] object-contain" />
                  ) : (
                    <span className="text-[8.5pt] text-slate-400 italic">( Cap Dinas & Tanda Tangan )</span>
                  )}
                </div>
                <p className="font-bold underline uppercase">{penggunaBarang.nama}</p>
                <p className="font-mono text-[8.5pt]">NIP. {penggunaBarang.nip}</p>
                <p className="text-[8.5pt]">{penggunaBarang.pangkatGol}</p>
              </div>

              <div>
                <p>Banjarmasin, {formatTanggalIndonesia(new Date().toISOString().slice(0, 10))}</p>
                <p className="font-bold uppercase tracking-wide">PENGURUS BARANG PENGGUNA,</p>
                <div className="h-16 flex items-center justify-center my-1">
                  {pengurusBarang.tandaTanganUrl ? (
                    <img src={pengurusBarang.tandaTanganUrl} alt="TTD Pengurus Barang" className="max-h-14 max-w-[150px] object-contain" />
                  ) : (
                    <span className="text-[8.5pt] text-slate-400 italic">( Tanda Tangan )</span>
                  )}
                </div>
                <p className="font-bold underline uppercase">{pengurusBarang.nama}</p>
                <p className="font-mono text-[8.5pt]">NIP. {pengurusBarang.nip}</p>
                <p className="text-[8.5pt]">{pengurusBarang.pangkatGol}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
