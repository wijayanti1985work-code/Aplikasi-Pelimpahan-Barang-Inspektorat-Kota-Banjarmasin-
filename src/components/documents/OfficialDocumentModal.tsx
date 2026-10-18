import React, { useState, useRef } from 'react';
import {
  X,
  Printer,
  FileDown,
  PenTool,
  CheckCircle,
  FileText,
  Award,
  ShieldAlert,
  Building2,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';
import type { BarangBMD, InstansiConfig, Pegawai, Pejabat, PelimpahanBMD } from '../../types/index.ts';
import { formatRupiah, formatTanggalIndonesia, terbilangRupiah } from '../../utils/logic.ts';
import { SignaturePad } from '../common/SignaturePad.tsx';

interface OfficialDocumentModalProps {
  pelimpahan: PelimpahanBMD;
  pegawai: Pegawai;
  barangList: BarangBMD[];
  pejabatList: Pejabat[];
  instansi: InstansiConfig;
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
  onClose,
  onUpdatePelimpahan,
  initialDocType = 'BAST',
}) => {
  const [activeTab, setActiveTab] = useState<'BAST' | 'SK' | 'SPTJM'>(initialDocType);
  const [signingRole, setSigningRole] = useState<'pihakPertama' | 'pihakKedua' | 'penggunaBarang' | null>(null);

  const printableRef = useRef<HTMLDivElement | null>(null);

  // Resolve Pejabat
  const pengurusBarang = pejabatList.find(p => p.peran === 'Pengurus Barang') || {
    nama: 'Dian Dahniar',
    nip: '197311232007012008',
    pangkatGol: 'Penata Tingkat I / III/d',
    jabatan: 'Pengurus Barang Pengguna',
    instansi: 'Inspektorat Daerah Kota Banjarmasin',
  };

  const penggunaBarang = pejabatList.find(p => p.peran === 'Pengguna Barang') || {
    nama: 'Drs. H. Dolly Syahbana, M.M.',
    nip: '196805121994031006',
    pangkatGol: 'Pembina Utama Muda / IV/c',
    jabatan: 'Inspektur Daerah Kota Banjarmasin',
    instansi: 'Inspektorat Daerah Kota Banjarmasin',
  };

  const totalNilai = barangList.reduce((sum, b) => sum + (b.nilaiPerolehan || 0), 0);

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

  // Direct Print / Save to PDF
  const handlePrint = () => {
    window.print();
  };

  // Export to Word (.doc)
  const handleExportWord = () => {
    if (!printableRef.current) return;
    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${activeTab} - ${pegawai.nama}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.3; color: #000; margin: 1.5cm; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
          th, td { border: 1px solid #000; padding: 6px; font-size: 10.5pt; }
          th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
          .no-border td { border: none; padding: 3px; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .header-line { border-bottom: 3px double #000; margin-bottom: 18px; padding-bottom: 8px; }
        </style>
      </head>
      <body>
        ${printableRef.current.innerHTML}
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print px-6 py-4 bg-[#0F766E] text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#0d6861]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#CCFBF1] text-[#0F766E] uppercase tracking-wider">
                Generator Dokumen Resmi
              </span>
              <span className="text-xs text-teal-100">Inspektorat Kota Banjarmasin</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {activeTab === 'BAST' && 'Berita Acara Serah Terima (BAST) Penggunaan BMD'}
              {activeTab === 'SK' && 'Surat Keputusan (SK) Penetapan Pemegang BMD'}
              {activeTab === 'SPTJM' && 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) BMD'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0F766E] bg-white hover:bg-teal-50 rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-4 h-4 text-[#0F766E]" />
              Cetak / PDF
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0F766E] bg-[#CCFBF1] hover:bg-white rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Unduh Format Microsoft Word (.doc)"
            >
              <FileDown className="w-4 h-4" />
              Unduh Word (.doc)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-teal-100 hover:text-white hover:bg-teal-800 rounded-lg transition-colors cursor-pointer ml-1"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Signature Bar (Hidden during print) */}
        <div className="no-print px-6 py-2.5 bg-[#F3F4F6] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E5E7EB] shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('BAST')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'BAST'
                  ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
              }`}
            >
              <FileText className="w-4 h-4" />
              1. BAST Penggunaan BMD
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SK')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'SK'
                  ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
              }`}
            >
              <Award className="w-4 h-4" />
              2. SK Pemegang BMD
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SPTJM')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === 'SPTJM'
                  ? 'bg-[#0F766E] text-white shadow-xs font-bold'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              3. SPTJM Tanggung Jawab Mutlak
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#6B7280] font-medium">Bubuhi Tanda Tangan:</span>
            <button
              type="button"
              onClick={() => setSigningRole('pihakPertama')}
              className="px-2.5 py-1 bg-white hover:bg-[#CCFBF1]/40 text-[#0F766E] border border-teal-200 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Pengurus Barang
            </button>
            <button
              type="button"
              onClick={() => setSigningRole('pihakKedua')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Pegawai Pemegang
            </button>
            <button
              type="button"
              onClick={() => setSigningRole('penggunaBarang')}
              className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium transition-colors cursor-pointer"
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
                  ? 'Tanda Tangan Pihak Kedua (Pegawai Pemegang)'
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

        {/* Printable Official Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50 flex justify-center">
          <div
            ref={printableRef}
            className="w-full max-w-[21cm] bg-white p-8 sm:p-12 shadow-md border border-slate-200 text-slate-900 font-serif-doc text-[12pt] leading-relaxed relative min-h-[29.7cm]"
          >
            {/* Kop Surat Resmi Sesuai Setting Instansi */}
            <div
              className={`pb-3 mb-6 text-center relative ${
                instansi.ketebalanGarisKop === 'double'
                  ? 'border-b-[3px] border-double border-slate-900'
                  : instansi.ketebalanGarisKop === 'thick-thin'
                  ? 'border-b-2 border-slate-900'
                  : 'border-b border-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Logo Utama Kiri */}
                <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                  {instansi.logoUtamaUrl ? (
                    <img
                      src={instansi.logoUtamaUrl}
                      alt="Logo Instansi"
                      className="max-h-20 max-w-20 object-contain"
                    />
                  ) : (
                    <svg className="w-16 h-16 text-blue-900" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                      <path
                        d="M50 5 L85 25 L85 70 L50 95 L15 70 L15 25 Z"
                        fill="#1e3a8a"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                      <path
                        d="M25 50 Q50 35 75 50 Q50 65 25 50 Z"
                        fill="#f8fafc"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                      />
                      <circle cx="50" cy="50" r="10" fill="#f59e0b" />
                      <text x="50" y="80" textAnchor="middle" fill="#f8fafc" fontSize="6" fontWeight="bold">
                        {instansi.semboyan || 'KAYUH BAIMBAI'}
                      </text>
                    </svg>
                  )}
                </div>

                {/* Teks Kop Surat */}
                <div className="flex-1 text-center font-serif-doc">
                  <h3 className="text-base sm:text-lg font-bold tracking-wider text-slate-900 uppercase">
                    {instansi.namaPemda}
                  </h3>
                  <h2 className="text-xl sm:text-2xl font-black tracking-wide text-slate-900 uppercase">
                    {instansi.namaInstansi}
                  </h2>
                  <p className="text-[10pt] text-slate-700 leading-tight mt-1">
                    {instansi.alamat}
                  </p>
                  <p className="text-[9pt] text-slate-600 leading-tight">
                    Telepon {instansi.telepon}, Faksimile {instansi.faksimile} · Pos-el: {instansi.email} · Laman:{' '}
                    {instansi.website}
                  </p>
                </div>

                {/* Logo Sekunder Kanan (Opsional) */}
                {instansi.tampilkanLogoKanan && (
                  <div className="w-20 h-20 shrink-0 hidden sm:flex items-center justify-center opacity-90">
                    {instansi.logoSekunderUrl ? (
                      <img
                        src={instansi.logoSekunderUrl}
                        alt="Logo Sekunder"
                        className="max-h-20 max-w-20 object-contain"
                      />
                    ) : (
                      <div className="w-16 h-16 border-2 border-slate-900 rounded-full flex flex-col items-center justify-center text-[8pt] text-center font-bold p-1">
                        <span>INSPEKTORAT</span>
                        <span className="text-[7pt] text-emerald-800">KOTA BJM</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* DOKUMEN 1: BERITA ACARA SERAH TERIMA (BAST) */}
            {activeTab === 'BAST' && (
              <div className="space-y-4">
                <div className="text-center space-y-1 mb-6">
                  <h3 className="text-base sm:text-lg font-bold uppercase underline underline-offset-4 tracking-wide">
                    Berita Acara Serah Terima Penggunaan Barang Milik Daerah (BMD)
                  </h3>
                  <p className="text-sm font-sans font-medium text-slate-700">
                    Nomor: {pelimpahan.nomorBAST}
                  </p>
                </div>

                <p className="text-justify indent-8 text-[11pt]">
                  Pada hari ini, <b>{formatTanggalIndonesia(pelimpahan.tanggal, true)}</b>, bertempat di Kantor Inspektorat
                  Daerah Kota Banjarmasin, kami yang bertanda tangan di bawah ini:
                </p>

                {/* Data Pihak Pertama */}
                <div className="text-[11pt] space-y-1 ml-4">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-1 font-bold">1.</span>
                    <span className="col-span-3 font-medium">Nama</span>
                    <span className="col-span-8">: <b>{pengurusBarang.nama}</b></span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-1"></span>
                    <span className="col-span-3 font-medium">NIP</span>
                    <span className="col-span-8">: {pengurusBarang.nip}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-1"></span>
                    <span className="col-span-3 font-medium">Pangkat / Golongan</span>
                    <span className="col-span-8">: {pengurusBarang.pangkatGol}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-1"></span>
                    <span className="col-span-3 font-medium">Jabatan</span>
                    <span className="col-span-8">: {pengurusBarang.jabatan}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-1"></span>
                    <span className="col-span-3 font-medium">Unit Kerja</span>
                    <span className="col-span-8">: {pengurusBarang.instansi}</span>
                  </div>
                  <p className="ml-8 italic text-slate-700">
                    Selanjutnya dalam Berita Acara ini disebut sebagai <b>PIHAK PERTAMA</b> (yang menyerahkan).
                  </p>
                </div>

                {/* Data Pihak Kedua */}
                <div className="text-[11pt] space-y-1 ml-4 mt-3">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-1 font-bold">2.</span>
                    <span className="col-span-3 font-medium">Nama</span>
                    <span className="col-span-8">: <b>{pegawai.nama}</b></span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-1"></span>
                    <span className="col-span-3 font-medium">NIP</span>
                    <span className="col-span-8">: {pegawai.nip}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-1"></span>
                    <span className="col-span-3 font-medium">Pangkat / Golongan</span>
                    <span className="col-span-8">: {pegawai.pangkatGol}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-1"></span>
                    <span className="col-span-3 font-medium">Jabatan</span>
                    <span className="col-span-8">: {pegawai.jabatan}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-1"></span>
                    <span className="col-span-3 font-medium">Unit Kerja</span>
                    <span className="col-span-8">: {pegawai.unitKerja}</span>
                  </div>
                  <p className="ml-8 italic text-slate-700">
                    Selanjutnya dalam Berita Acara ini disebut sebagai <b>PIHAK KEDUA</b> (yang menerima pemakaian).
                  </p>
                </div>

                <p className="text-justify indent-8 text-[11pt] mt-4">
                  Kedua belah pihak sepakat mengadakan serah terima penggunaan Barang Milik Daerah (BMD) dengan ketentuan
                  sebagai berikut:
                </p>

                {/* Pasal - Pasal */}
                <div className="space-y-3 text-[10.5pt] text-justify">
                  <div>
                    <p className="font-bold text-center">Pasal 1<br /><span className="font-normal italic">Penyerahan dan Penerimaan Barang</span></p>
                    <p className="indent-6 mt-1">
                      PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA, dan PIHAK KEDUA menerima dari PIHAK PERTAMA Barang Milik
                      Daerah (BMD) sebagaimana tercantum dalam lampiran Berita Acara ini dalam keadaan baik dan lengkap untuk
                      keperluan: <i>{pelimpahan.keperluan}</i>.
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-center">Pasal 2<br /><span className="font-normal italic">Hak dan Kewajiban Pemakai</span></p>
                    <p className="indent-6 mt-1">
                      PIHAK KEDUA berkewajiban merawat, menjaga keamanan fisik, keutuhan, dan kebersihan barang tersebut
                      dengan penuh tanggung jawab semata-mata untuk kelancaran pelaksanaan tugas pengawasan kedinasan
                      Pemerintah Kota Banjarmasin.
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-center">Pasal 3<br /><span className="font-normal italic">Larangan Pemindahtanganan</span></p>
                    <p className="indent-6 mt-1">
                      PIHAK KEDUA dilarang keras mengalihkan, meminjamkan, menyewakan, menjaminkan, atau mengubah bentuk fisik
                      barang tanpa izin tertulis dari Pengguna Barang / Inspektur Daerah Kota Banjarmasin.
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-center">Pasal 4<br /><span className="font-normal italic">Pengembalian Barang</span></p>
                    <p className="indent-6 mt-1">
                      Apabila PIHAK KEDUA mutasi jabatan, alih tugas ke instansi lain, memasuki masa purna tugas (pensiun),
                      atau barang ditarik kembali oleh kedinasan, maka PIHAK KEDUA wajib mengembalikan seluruh barang tersebut
                      dalam keadaan utuh, bersih, dan siap pakai kepada Pengurus Barang Inspektorat Kota Banjarmasin.
                    </p>
                  </div>
                </div>

                <p className="text-justify indent-8 text-[11pt] mt-4">
                  Demikian Berita Acara Serah Terima Penggunaan Barang Milik Daerah ini dibuat dalam rangkap 2 (dua) bermaterai
                  cukup dan mempunyai kekuatan hukum yang sama bagi kedua belah pihak.
                </p>

                {/* Tanda Tangan BAST */}
                <div className="mt-8 pt-4">
                  <div className="grid grid-cols-2 gap-8 text-center text-[10.5pt]">
                    <div>
                      <p className="font-semibold">PIHAK KEDUA</p>
                      <p className="text-slate-600 text-xs">Yang Menerima,</p>
                      <div className="h-24 flex items-center justify-center my-1">
                        {pelimpahan.tandaTanganPihakKedua ? (
                          <img
                            src={pelimpahan.tandaTanganPihakKedua}
                            alt="Tanda Tangan Pihak Kedua"
                            className="max-h-20 max-w-[180px] object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic font-sans border-b border-dashed border-slate-300 pb-1">
                            ( Belum Ditandatangani )
                          </span>
                        )}
                      </div>
                      <p className="font-bold underline">{pegawai.nama}</p>
                      <p className="text-xs text-slate-700">NIP. {pegawai.nip}</p>
                    </div>

                    <div>
                      <p className="font-semibold">PIHAK PERTAMA</p>
                      <p className="text-slate-600 text-xs">Pengurus Barang Pengguna,</p>
                      <div className="h-24 flex items-center justify-center my-1">
                        {pelimpahan.tandaTanganPihakPertama ? (
                          <img
                            src={pelimpahan.tandaTanganPihakPertama}
                            alt="Tanda Tangan Pihak Pertama"
                            className="max-h-20 max-w-[180px] object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-400 italic font-sans border-b border-dashed border-slate-300 pb-1">
                            ( Belum Ditandatangani )
                          </span>
                        )}
                      </div>
                      <p className="font-bold underline">{pengurusBarang.nama}</p>
                      <p className="text-xs text-slate-700">NIP. {pengurusBarang.nip}</p>
                    </div>
                  </div>

                  {/* Mengetahui Pengguna Barang */}
                  <div className="mt-6 text-center text-[10.5pt]">
                    <p className="text-xs text-slate-600">Mengetahui / Menyetujui,</p>
                    <p className="font-bold uppercase">PENGGUNA BARANG</p>
                    <p className="font-semibold text-sm">Inspektur Daerah Kota Banjarmasin</p>
                    <div className="h-24 flex items-center justify-center my-1">
                      {pelimpahan.tandaTanganPenggunaBarang ? (
                        <img
                          src={pelimpahan.tandaTanganPenggunaBarang}
                          alt="Tanda Tangan Pengguna Barang"
                          className="max-h-20 max-w-[200px] object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic font-sans border-b border-dashed border-slate-300 pb-1">
                          ( Cap Dinas & Tanda Tangan Pengguna Barang )
                        </span>
                      )}
                    </div>
                    <p className="font-bold underline">{penggunaBarang.nama}</p>
                    <p className="text-xs text-slate-700">
                      {penggunaBarang.pangkatGol} / NIP. {penggunaBarang.nip}
                    </p>
                  </div>
                </div>

                {/* LAMPIRAN TABEL RINCIAN BMD */}
                <div className="page-break pt-8 mt-10 border-t border-slate-300">
                  <div className="text-right text-[9pt] italic text-slate-600">
                    <p>Lampiran Berita Acara Serah Terima Penggunaan BMD</p>
                    <p>Nomor: {pelimpahan.nomorBAST}</p>
                    <p>Tanggal: {formatTanggalIndonesia(pelimpahan.tanggal)}</p>
                  </div>

                  <h4 className="text-center font-bold uppercase text-[11pt] my-4">
                    Daftar Rincian Barang Milik Daerah (BMD) Yang Diserahterimakan
                  </h4>

                  <table className="w-full border-collapse border border-slate-900 text-[10pt] mt-3">
                    <thead>
                      <tr className="bg-slate-100 text-center font-bold">
                        <th className="border border-slate-900 p-2 w-10">No</th>
                        <th className="border border-slate-900 p-2">Kode Barang / NIB</th>
                        <th className="border border-slate-900 p-2">Nama & Spesifikasi Barang</th>
                        <th className="border border-slate-900 p-2">No. Seri / Pabrik / Pelat</th>
                        <th className="border border-slate-900 p-2 w-14">Tahun</th>
                        <th className="border border-slate-900 p-2 w-14">Jml</th>
                        <th className="border border-slate-900 p-2 w-16">Kondisi</th>
                        <th className="border border-slate-900 p-2">Nilai Perolehan (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {barangList.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-900 p-2 font-mono text-[9pt]">{item.kodeBarang}</td>
                          <td className="border border-slate-900 p-2">
                            <span className="font-bold">{item.namaBarang}</span>
                            <br />
                            <span className="text-[9pt] text-slate-600">{item.merkTipe}</span>
                          </td>
                          <td className="border border-slate-900 p-2 font-mono text-[9pt] text-center">{item.noSeri}</td>
                          <td className="border border-slate-900 p-2 text-center">{item.tahunPerolehan}</td>
                          <td className="border border-slate-900 p-2 text-center">{item.jumlah} {item.satuan}</td>
                          <td className="border border-slate-900 p-2 text-center font-bold">
                            {item.kondisi === 'B' ? 'Baik' : item.kondisi === 'RR' ? 'Rusak Ringan' : 'Rusak Berat'}
                          </td>
                          <td className="border border-slate-900 p-2 text-right">{formatRupiah(item.nilaiPerolehan)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold">
                        <td colSpan={7} className="border border-slate-900 p-2 text-right uppercase">
                          Total Nilai Perolehan:
                        </td>
                        <td className="border border-slate-900 p-2 text-right">{formatRupiah(totalNilai)}</td>
                      </tr>
                      <tr>
                        <td colSpan={8} className="border border-slate-900 p-2 italic text-[9.5pt]">
                          Terbilang: <b>{terbilangRupiah(totalNilai)}</b>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* DOKUMEN 2: SK PEMEGANG BMD */}
            {activeTab === 'SK' && (
              <div className="space-y-4">
                <div className="text-center space-y-1 mb-6">
                  <h3 className="text-sm font-bold tracking-widest uppercase">
                    Keputusan Inspektur Daerah Kota Banjarmasin
                  </h3>
                  <p className="text-sm font-sans font-medium text-slate-800">
                    Nomor: {pelimpahan.nomorSK}
                  </p>
                  <p className="text-base font-bold uppercase mt-2">
                    Tentang
                  </p>
                  <p className="text-base font-bold uppercase max-w-lg mx-auto">
                    Penetapan Pegawai Sebagai Pemakai Barang Milik Daerah (BMD) Pada Inspektorat Daerah Kota Banjarmasin
                  </p>
                  <p className="text-sm font-bold uppercase pt-2">
                    Inspektur Daerah Kota Banjarmasin,
                  </p>
                </div>

                {/* Konsiderans Menimbang */}
                <div className="text-[10.5pt] space-y-2">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 font-bold">Menimbang</span>
                    <span className="col-span-1">:</span>
                    <div className="col-span-9 space-y-1 text-justify">
                      <div className="flex gap-2">
                        <span className="font-bold">a.</span>
                        <p>
                          bahwa dalam rangka menunjang kelancaran penyelenggaraan tugas pengawasan, pembinaan, dan
                          pemeriksaan di lingkungan Inspektorat Daerah Kota Banjarmasin secara tertib, efisien, dan
                          akuntabel, dipandang perlu menetapkan pegawai sebagai pemakai Barang Milik Daerah;
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold">b.</span>
                        <p>
                          bahwa pegawai yang namanya tercantum dalam Keputusan ini dinilai cakap dan memenuhi syarat
                          untuk ditunjuk sebagai pemakai serta penanggung jawab operasional Barang Milik Daerah;
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="font-bold">c.</span>
                        <p>
                          bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a dan huruf b, perlu
                          menetapkannya dengan Keputusan Inspektur Daerah Kota Banjarmasin.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Konsiderans Mengingat */}
                  <div className="grid grid-cols-12 gap-1 mt-3">
                    <span className="col-span-2 font-bold">Mengingat</span>
                    <span className="col-span-1">:</span>
                    <div className="col-span-9 space-y-1 text-justify text-[10pt]">
                      <p>1. Undang-Undang Nomor 27 Tahun 1959 tentang Penetapan Undang-Undang Darurat Nomor 3 Tahun 1953 tentang Pembentukan Daerah Tingkat II di Kalimantan;</p>
                      <p>2. Undang-Undang Nomor 23 Tahun 2014 tentang Pemerintahan Daerah sebagaimana telah diubah beberapa kali terakhir dengan Undang-Undang Nomor 6 Tahun 2023;</p>
                      <p>3. Peraturan Pemerintah Nomor 27 Tahun 2014 tentang Pengelolaan Barang Milik Negara/Daerah sebagaimana telah diubah dengan Peraturan Pemerintah Nomor 28 Tahun 2020;</p>
                      <p>4. Peraturan Menteri Dalam Negeri Nomor 19 Tahun 2016 tentang Pedoman Pengelolaan Barang Milik Daerah;</p>
                      <p>5. Peraturan Daerah Kota Banjarmasin Nomor 7 Tahun 2016 tentang Pembentukan dan Susunan Perangkat Daerah Kota Banjarmasin;</p>
                      <p>6. Peraturan Walikota Banjarmasin Nomor 104 Tahun 2016 tentang Kedudukan, Susunan Organisasi, Tugas, Fungsi dan Tata Kerja Inspektorat Kota Banjarmasin.</p>
                    </div>
                  </div>
                </div>

                <div className="text-center font-bold uppercase tracking-widest my-3 text-[11pt]">
                  Memutuskan :
                </div>

                {/* Diktum KESATU sampai KEDELAPAN */}
                <div className="text-[10pt] space-y-2 text-justify">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 font-bold">KESATU</span>
                    <span className="col-span-1">:</span>
                    <p className="col-span-9">
                      Menetapkan Saudara <b>{pegawai.nama}</b>, NIP {pegawai.nip}, Jabatan {pegawai.jabatan} pada{' '}
                      {pegawai.unitKerja} sebagai Pemakai Barang Milik Daerah sebagaimana rincian tercantum dalam Lampiran
                      yang merupakan bagian tidak terpisahkan dari Keputusan ini.
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 font-bold">KEDUA</span>
                    <span className="col-span-1">:</span>
                    <p className="col-span-9">
                      Pemakai Barang Milik Daerah berkewajiban menggunakan dan memanfaatkan barang tersebut semata-mata
                      untuk menunjang kelancaran pelaksanaan tugas dan fungsi kedinasan.
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 font-bold">KETIGA</span>
                    <span className="col-span-1">:</span>
                    <p className="col-span-9">
                      Pemakai Barang Milik Daerah bertanggung jawab secara penuh terhadap keberadaan, keutuhan, kebersihan,
                      dan pemeliharaan barang yang dilimpahkan kepadanya.
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 font-bold">KEEMPAT</span>
                    <span className="col-span-1">:</span>
                    <p className="col-span-9">
                      Pemakai dilarang keras mengubah bentuk, menyewakan, meminjamkan, atau memindahtangankan barang milik
                      daerah tersebut kepada pihak manapun tanpa persetujuan tertulis dari Inspektur Daerah Kota Banjarmasin.
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 font-bold">KELIMA</span>
                    <span className="col-span-1">:</span>
                    <p className="col-span-9">
                      Segala biaya pemeliharaan berkala yang diakibatkan oleh penggunaan operasional kedinasan dibebankan
                      pada Dokumen Pelaksanaan Anggaran (DPA) Inspektorat Daerah Kota Banjarmasin sesuai ketersediaan anggaran.
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 font-bold">KEENAM</span>
                    <span className="col-span-1">:</span>
                    <p className="col-span-9">
                      Apabila terjadi kehilangan, kerusakan sebagian, atau kerusakan total yang diakibatkan oleh kelalaian
                      atau kealpaan pemakai, maka pemakai bersedia dikenakan Tuntutan Perbendaharaan dan Tuntutan Ganti Rugi
                      (TP-TGR) sesuai peraturan perundang-undangan.
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 font-bold">KETUJUH</span>
                    <span className="col-span-1">:</span>
                    <p className="col-span-9">
                      Pemakai wajib menyerahkan kembali seluruh barang yang dipegangnya kepada Pengurus Barang dalam kondisi
                      lengkap dan laik fungsi apabila mutasi jabatan, purna tugas (pensiun), atau sewaktu-waktu ditarik oleh
                      Pengguna Barang.
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-2 font-bold">KEDELAPAN</span>
                    <span className="col-span-1">:</span>
                    <p className="col-span-9">
                      Keputusan ini mulai berlaku sejak tanggal ditetapkan, dengan ketentuan apabila di kemudian hari terdapat
                      kekeliruan akan diadakan perbaikan sebagaimana mestinya.
                    </p>
                  </div>
                </div>

                {/* Kolom Penetapan & Tanda Tangan Inspektur */}
                <div className="mt-8 pt-4 flex justify-end text-[10.5pt]">
                  <div className="w-72 text-left">
                    <p>Ditetapkan di Banjarmasin</p>
                    <p>Pada tanggal: {formatTanggalIndonesia(pelimpahan.tanggal)}</p>
                    <p className="font-bold uppercase mt-2">Inspektur Daerah Kota Banjarmasin,</p>
                    <div className="h-24 flex items-center justify-center my-1">
                      {pelimpahan.tandaTanganPenggunaBarang ? (
                        <img
                          src={pelimpahan.tandaTanganPenggunaBarang}
                          alt="Tanda Tangan Pengguna Barang"
                          className="max-h-20 max-w-[200px] object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic font-sans border-b border-dashed border-slate-300 pb-1">
                          ( Cap Dinas & Tanda Tangan )
                        </span>
                      )}
                    </div>
                    <p className="font-bold underline">{penggunaBarang.nama}</p>
                    <p className="text-xs text-slate-700">{penggunaBarang.pangkatGol}</p>
                    <p className="text-xs text-slate-700">NIP. {penggunaBarang.nip}</p>
                  </div>
                </div>
              </div>
            )}

            {/* DOKUMEN 3: SPTJM BMD */}
            {activeTab === 'SPTJM' && (
              <div className="space-y-4">
                <div className="text-center space-y-1 mb-6">
                  <h3 className="text-base sm:text-lg font-bold uppercase underline underline-offset-4 tracking-wide">
                    Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)
                  </h3>
                  <p className="text-sm font-semibold uppercase text-slate-800">
                    Penggunaan Barang Milik Daerah (BMD)
                  </p>
                  <p className="text-sm font-sans font-medium text-slate-700">
                    Nomor: {pelimpahan.nomorSPTJM}
                  </p>
                </div>

                <p className="text-justify indent-8 text-[11pt]">
                  Yang bertanda tangan di bawah ini:
                </p>

                <div className="text-[11pt] space-y-1 ml-6">
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 font-medium">Nama Lengkap</span>
                    <span className="col-span-9">: <b>{pegawai.nama}</b></span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 font-medium">NIP</span>
                    <span className="col-span-9">: {pegawai.nip}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 font-medium">Pangkat / Golongan</span>
                    <span className="col-span-9">: {pegawai.pangkatGol}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 font-medium">Jabatan</span>
                    <span className="col-span-9">: {pegawai.jabatan}</span>
                  </div>
                  <div className="grid grid-cols-12 gap-1">
                    <span className="col-span-3 font-medium">Unit Kerja</span>
                    <span className="col-span-9">: {pegawai.unitKerja}</span>
                  </div>
                </div>

                <p className="text-justify indent-8 text-[11pt] mt-4">
                  Dengan ini menyatakan dengan sesungguhnya dan penuh rasa tanggung jawab bahwa:
                </p>

                <ol className="list-decimal ml-8 space-y-2.5 text-[10.5pt] text-justify">
                  <li>
                    Saya telah menerima dan menggunakan Barang Milik Daerah (BMD) sebagaimana tercantum dalam daftar
                    rincian terlampir dalam keadaan baik, lengkap, dan berfungsi normal semata-mata untuk kepentingan
                    pelaksanaan tugas kedinasan pada Inspektorat Daerah Kota Banjarmasin.
                  </li>
                  <li>
                    Saya bertanggung jawab mutlak atas pengamanan fisik, penyimpanan, pemeliharaan rutin, serta keutuhan
                    barang inventaris milik daerah yang berada dalam penguasaan saya.
                  </li>
                  <li>
                    Saya tidak akan menyewakan, meminjamkan kepada pihak ketiga, menggadaikan, merombak atau memindahtangankan
                    barang milik daerah tersebut dengan cara dan alasan apapun tanpa persetujuan tertulis dari Pengguna Barang.
                  </li>
                  <li>
                    Apabila di kemudian hari terjadi kehilangan, kerusakan berat, atau pengurangan fungsi barang akibat
                    kelalaian, kecerobohan, maupun penyalahgunaan wewenang, maka saya bersedia mengganti kerugian daerah
                    tersebut secara tunai atau melalui mekanisme Tuntutan Ganti Rugi (TGR) sesuai dengan ketentuan peraturan
                    perundang-undangan yang berlaku.
                  </li>
                  <li>
                    Saya bersedia menyerahkan kembali seluruh barang milik daerah tersebut dalam keadaan lengkap, bersih, dan
                    berfungsi baik kepada Pengurus Barang apabila saya dialihtugaskan (mutasi), purna tugas (pensiun),
                    diberhentikan dari jabatan, atau sewaktu-waktu ditarik kembali oleh pimpinan.
                  </li>
                </ol>

                <p className="text-justify indent-8 text-[11pt] mt-4">
                  Demikian Surat Pernyataan Tanggung Jawab Mutlak ini saya buat dengan sadar, penuh kesadaran dan tanpa ada
                  paksaan atau tekanan dari pihak manapun untuk dipergunakan sebagaimana mestinya.
                </p>

                {/* Kolom Materai & Tanda Tangan Pemakai */}
                <div className="mt-8 pt-4 grid grid-cols-2 gap-8 text-[10.5pt]">
                  <div className="text-center">
                    <p className="text-xs text-slate-600">Mengetahui,</p>
                    <p className="font-bold uppercase">Pengguna Barang</p>
                    <p className="font-semibold text-xs text-slate-700">Inspektur Daerah Kota Banjarmasin</p>
                    <div className="h-28 flex items-center justify-center my-1">
                      {pelimpahan.tandaTanganPenggunaBarang ? (
                        <img
                          src={pelimpahan.tandaTanganPenggunaBarang}
                          alt="Tanda Tangan Pengguna Barang"
                          className="max-h-20 max-w-[180px] object-contain"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic font-sans border-b border-dashed border-slate-300 pb-1">
                          ( Cap Dinas & Pengesahan )
                        </span>
                      )}
                    </div>
                    <p className="font-bold underline">{penggunaBarang.nama}</p>
                    <p className="text-xs text-slate-700">NIP. {penggunaBarang.nip}</p>
                  </div>

                  <div className="text-center">
                    <p>Banjarmasin, {formatTanggalIndonesia(pelimpahan.tanggal)}</p>
                    <p className="font-bold">Yang Membuat Pernyataan,</p>
                    <div className="h-28 flex flex-col items-center justify-center relative my-1">
                      {/* Visual Materai 10000 */}
                      <div className="border border-slate-400 bg-rose-50/40 text-rose-800 text-[8pt] px-2 py-1 rounded w-24 text-center font-sans uppercase font-bold tracking-wider mb-1">
                        Materai Rp 10.000
                      </div>
                      {pelimpahan.tandaTanganPihakKedua ? (
                        <img
                          src={pelimpahan.tandaTanganPihakKedua}
                          alt="Tanda Tangan Pihak Kedua"
                          className="max-h-20 max-w-[180px] object-contain absolute z-10"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic font-sans border-b border-dashed border-slate-300 pb-1">
                          ( Tanda Tangan di atas Materai )
                        </span>
                      )}
                    </div>
                    <p className="font-bold underline">{pegawai.nama}</p>
                    <p className="text-xs text-slate-700">NIP. {pegawai.nip}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
