import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  FileDown,
  Building2,
  Calendar,
  FileCheck2,
  AlertCircle,
  PackageCheck,
  ShieldCheck,
  ArrowRightLeft,
  Loader2,
} from 'lucide-react';
import type { InstansiConfig, Pejabat, PelepasanAsetRecord } from '../../types/index.ts';
import { formatTanggalIndonesia } from '../../utils/logic.ts';
import { downloadElementAsPdf } from '../../utils/pdfExport.ts';
import { LOGO_PEMKOT_BANJARMASIN_BASE64 } from '../../assets/logoPemko.ts';

interface BeritaAcaraPelepasanModalProps {
  record: PelepasanAsetRecord;
  instansi: InstansiConfig;
  pejabatList: Pejabat[];
  onClose: () => void;
}

export const BeritaAcaraPelepasanModal: React.FC<BeritaAcaraPelepasanModalProps> = ({
  record,
  instansi,
  pejabatList,
  onClose,
}) => {
  const printableRef = useRef<HTMLDivElement | null>(null);

  const pengurusBarang = pejabatList.find(p => p.peran === 'Pengurus Barang') || {
    nama: record.namaPejabatPengurus || 'Dian Dahniar',
    nip: record.nipPejabatPengurus || '197311232007012008',
    pangkatGol: 'Penata Tingkat I / III/d',
    jabatan: 'Pengurus Barang Pengguna',
    instansi: 'Inspektorat Daerah Kota Banjarmasin',
  };

  const penggunaBarang = pejabatList.find(p => p.peran === 'Pengguna Barang') || {
    nama: record.namaInspektur || 'Drs. H. Dolly Syahbana, M.M.',
    nip: record.nipInspektur || '196805121994031006',
    pangkatGol: 'Pembina Utama Muda / IV/c',
    jabatan: 'Inspektur Daerah Kota Banjarmasin',
    instansi: 'Inspektorat Daerah Kota Banjarmasin',
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    setIsGeneratingPdf(true);
    setPdfProgress('Menyiapkan dokumen...');
    try {
      const safeName = record.namaPegawaiAsal.replace(/[^a-zA-Z0-9]/g, '_');
      await downloadElementAsPdf(printableRef.current, {
        fileName: `BAP_BMD_${safeName}`,
        orientation: 'portrait',
        onProgress: (msg) => setPdfProgress(msg),
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const handleExportWord = () => {
    if (!printableRef.current) return;
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>BAP-BMD - ${record.namaPegawaiAsal}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.35; color: #000; margin: 1.5cm; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 12px; }
          th, td { border: 1px solid #000; padding: 6px; font-size: 10pt; }
          th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
          .no-border td { border: none; padding: 2.5px 4px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .header-line { border-bottom: 3px double #000; margin-bottom: 16px; padding-bottom: 8px; }
        </style>
      </head>
      <body>
        ${printableRef.current.innerHTML}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BAP_BMD_${record.namaPegawaiAsal.replace(/[^a-zA-Z0-9]/g, '_')}_${record.alasan.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#E5E7EB] flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* Modal Header Controls (Hidden during print) */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] bg-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] flex items-center justify-center text-[#0F766E] shrink-0 border border-[#0F766E]/20">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">
                  Berita Acara Resmi Pelepasan Aset
                </span>
                <span className="text-xs text-[#6B7280]">· BAP-BMD</span>
              </div>
              <h3 className="text-base font-bold text-[#111827]">
                Pelepasan Aset: {record.namaPegawaiAsal}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0F766E] bg-white hover:bg-teal-50 border border-teal-300 rounded-xl transition-colors cursor-pointer shadow-2xs disabled:opacity-75"
              title="Unduh langsung file PDF (.pdf)"
            >
              <FileDown className="w-4 h-4 text-[#0F766E]" />
              {isGeneratingPdf ? (pdfProgress || 'Membuat PDF...') : 'Unduh PDF'}
            </button>
            <button
              type="button"
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#111827] bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
              title="Unduh format Microsoft Word (.doc)"
            >
              <FileDown className="w-4 h-4 text-[#6B7280]" />
              Unduh Word
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F3F4F6] print:bg-white print:p-0">
          <div
            ref={printableRef}
            className="bg-white max-w-2xl mx-auto p-8 sm:p-12 shadow-sm border border-[#E5E7EB] text-[#111827] font-serif print:shadow-none print:border-none print:p-0 print:max-w-none text-[12.5px] leading-relaxed"
          >
            {/* Kop Surat Resmi Sesuai Format Pemerintah Kota Banjarmasin */}
            <div className="text-center relative pb-2 mb-4" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              <div className="flex items-center justify-between gap-4">
                {/* Logo Resmi Kota Banjarmasin */}
                <div className="w-20 h-24 shrink-0 flex items-center justify-center">
                  <img
                    src={instansi.logoUtamaUrl || LOGO_PEMKOT_BANJARMASIN_BASE64}
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

                {/* Right Balance Spacer */}
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

            {/* Document Title */}
            <div className="text-center mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider underline text-black">
                BERITA ACARA SERAH TERIMA PENGEMBALIAN / PELEPASAN BARANG MILIK DAERAH
              </h2>
              <p className="text-xs font-sans font-semibold text-black mt-1">
                Nomor: <span className="font-mono">{record.nomorBAP}</span>
              </p>
            </div>

            {/* Mukadimah */}
            <div className="space-y-4 text-justify mb-5 text-[12px]">
              <p>
                Pada hari ini, tanggal <strong>{formatTanggalIndonesia(record.tanggal)}</strong>, bertempat di Kantor Inspektorat Daerah Kota Banjarmasin, sehubungan dengan adanya <strong>{record.alasan}</strong> bagi pegawai yang bersangkutan, kami yang bertanda tangan di bawah ini:
              </p>

              {/* Pihak Pertama (Pegawai yang Menyerahkan Kembali BMD) */}
              <div className="pl-4 border-l-2 border-black space-y-1">
                <table className="w-full text-[11.5px] border-none">
                  <tbody>
                    <tr>
                      <td className="w-32 font-bold py-0.5 border-none">Nama</td>
                      <td className="w-3 py-0.5 border-none">:</td>
                      <td className="font-bold py-0.5 border-none">{record.namaPegawaiAsal}</td>
                    </tr>
                    <tr>
                      <td className="font-bold py-0.5 border-none">NIP</td>
                      <td className="py-0.5 border-none">:</td>
                      <td className="py-0.5 font-mono border-none">{record.nipPegawaiAsal}</td>
                    </tr>
                    <tr>
                      <td className="font-bold py-0.5 border-none">Jabatan</td>
                      <td className="py-0.5 border-none">:</td>
                      <td className="py-0.5 border-none">{record.jabatanPegawaiAsal}</td>
                    </tr>
                    <tr>
                      <td className="font-bold py-0.5 border-none">Unit Kerja</td>
                      <td className="py-0.5 border-none">:</td>
                      <td className="py-0.5 border-none">{record.unitKerjaPegawaiAsal}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[11px] italic mt-1">
                  Selanjutnya disebut sebagai <strong>PIHAK PERTAMA (Yang Menyerahkan Kembali)</strong>.
                </p>
              </div>

              {/* Pihak Kedua (Pengurus Barang) */}
              <div className="pl-4 border-l-2 border-black space-y-1 mt-3">
                <table className="w-full text-[11.5px] border-none">
                  <tbody>
                    <tr>
                      <td className="w-32 font-bold py-0.5 border-none">Nama</td>
                      <td className="w-3 py-0.5 border-none">:</td>
                      <td className="font-bold py-0.5 border-none">{pengurusBarang.nama}</td>
                    </tr>
                    <tr>
                      <td className="font-bold py-0.5 border-none">NIP</td>
                      <td className="py-0.5 border-none">:</td>
                      <td className="py-0.5 font-mono border-none">{pengurusBarang.nip}</td>
                    </tr>
                    <tr>
                      <td className="font-bold py-0.5 border-none">Pangkat / Gol.</td>
                      <td className="py-0.5 border-none">:</td>
                      <td className="py-0.5 border-none">{pengurusBarang.pangkatGol}</td>
                    </tr>
                    <tr>
                      <td className="font-bold py-0.5 border-none">Jabatan</td>
                      <td className="py-0.5 border-none">:</td>
                      <td className="py-0.5 border-none">{pengurusBarang.jabatan}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[11px] italic mt-1">
                  Selanjutnya disebut sebagai <strong>PIHAK KEDUA (Pengurus Barang Pengguna)</strong>.
                </p>
              </div>

              <p className="mt-3">
                Menyatakan bahwa <strong>PIHAK PERTAMA</strong> telah menyerahkan kembali kepada <strong>PIHAK KEDUA</strong>, dan <strong>PIHAK KEDUA</strong> telah menerima dengan baik dan lengkap seluruh Barang Milik Daerah (BMD) yang sebelumnya dikuasai/dipergunakan oleh PIHAK PERTAMA dengan rincian sebagai berikut:
              </p>
            </div>

            {/* Table of Released Assets */}
            <div className="mb-5">
              <table className="w-full border-collapse border border-black text-[11px]">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-black py-1.5 px-2 text-center w-8">No</th>
                    <th className="border border-black py-1.5 px-2 text-left">Kode Barang</th>
                    <th className="border border-black py-1.5 px-2 text-left">Nama / Jenis Barang</th>
                    <th className="border border-black py-1.5 px-2 text-left">Merk / Tipe / Seri</th>
                    <th className="border border-black py-1.5 px-2 text-center w-16">Kondisi</th>
                    <th className="border border-black py-1.5 px-2 text-left">Status Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {record.items.map((item, idx) => (
                    <tr key={item.idBarang || idx}>
                      <td className="border border-black py-1.5 px-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-black py-1.5 px-2 font-mono text-[10px]">{item.kodeBarang}</td>
                      <td className="border border-black py-1.5 px-2 font-semibold">{item.namaBarang}</td>
                      <td className="border border-black py-1.5 px-2 text-[10.5px]">
                        {item.merkTipe} {item.noSeri && item.noSeri !== '-' ? `(No: ${item.noSeri})` : ''}
                      </td>
                      <td className="border border-black py-1.5 px-2 text-center font-bold">
                        {item.kondisi === 'B' ? 'Baik' : item.kondisi === 'RR' ? 'Rusak Ringan' : 'Rusak Berat'}
                      </td>
                      <td className="border border-black py-1.5 px-2 text-[10.5px]">
                        {item.tindakan === 'Gudang' ? (
                          <span className="font-semibold text-emerald-800">Kembali ke Gudang (Tersedia)</span>
                        ) : (
                          <span className="font-semibold text-blue-800">
                            Dialihkan ke: {item.namaPegawaiBaru || 'Pegawai Pengganti'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Klausul Penutup */}
            <div className="text-justify text-[11.5px] space-y-2 mb-8">
              <p>
                Dengan ditandatanganinya Berita Acara ini, maka hak pakai dan tanggung jawab pemeliharaan atas barang-barang tersebut di atas pada <strong>PIHAK PERTAMA</strong> dinyatakan <strong>SELESAI</strong>. Status kepegawaian administratif yang bersangkutan dicatat sebagai: <strong>{record.statusPegawaiBaru}</strong>.
              </p>
              {record.keteranganAlasan && (
                <p className="italic text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">
                  Catatan Tambahan: {record.keteranganAlasan}
                </p>
              )}
              <p>
                Demikian Berita Acara Serah Terima Pengembalian/Pelepasan Barang Milik Daerah ini dibuat dalam rangkap 3 (tiga) untuk dipergunakan sebagaimana mestinya.
              </p>
            </div>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-8 text-center text-[11.5px] mt-6">
              <div>
                <p className="font-semibold">PIHAK PERTAMA</p>
                <p className="text-[10px] text-slate-600">Yang Menyerahkan Kembali,</p>
                <div className="h-20 flex items-center justify-center">
                  <span className="text-[11px] text-slate-400 italic">[ Tanda Tangan ]</span>
                </div>
                <p className="font-bold underline uppercase">{record.namaPegawaiAsal}</p>
                <p className="font-mono text-[10px]">NIP. {record.nipPegawaiAsal}</p>
              </div>

              <div>
                <p className="font-semibold">PIHAK KEDUA</p>
                <p className="text-[10px] text-slate-600">Pengurus Barang Pengguna,</p>
                <div className="h-20 flex items-center justify-center">
                  <span className="text-[11px] text-slate-400 italic">[ Tanda Tangan ]</span>
                </div>
                <p className="font-bold underline uppercase">{pengurusBarang.nama}</p>
                <p className="font-mono text-[10px]">NIP. {pengurusBarang.nip}</p>
              </div>
            </div>

            {/* Mengetahui Inspektur */}
            <div className="text-center text-[11.5px] mt-8 pt-4">
              <p className="font-semibold">MENGETAHUI,</p>
              <p className="text-[10.5px] font-bold uppercase">{penggunaBarang.jabatan}</p>
              <div className="h-20 flex items-center justify-center">
                <span className="text-[11px] text-slate-400 italic">[ Tanda Tangan & Cap DInas ]</span>
              </div>
              <p className="font-bold underline uppercase">{penggunaBarang.nama}</p>
              <p className="font-mono text-[10px]">NIP. {penggunaBarang.nip}</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
