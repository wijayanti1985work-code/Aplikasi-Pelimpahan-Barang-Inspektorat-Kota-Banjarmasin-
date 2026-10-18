import React from 'react';
import { BookOpen, ShieldCheck, FileText, CheckCircle2, AlertOctagon, HelpCircle, Scale } from 'lucide-react';

export const RegulasiView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Dasar Hukum & Tata Kelola
            </span>
            <span className="text-xs text-slate-400">Inspektorat Kota Banjarmasin</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Panduan & Regulasi Pengelolaan Barang Milik Daerah (BMD)
          </h2>
          <p className="text-xs text-slate-500">
            Pedoman hak dan kewajiban aparatur pemakai aset, ketentuan BAST, dan penyelesaian ganti rugi.
          </p>
        </div>
      </div>

      {/* Grid of Legal references */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dasar Hukum */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Dasar Hukum Pengelolaan BMD</h3>
          </div>

          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span><b>UU Nomor 23 Tahun 2014</b> tentang Pemerintahan Daerah jo. UU No. 6 Tahun 2023.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span><b>PP Nomor 27 Tahun 2014 jo. PP No. 28 Tahun 2020</b> tentang Pengelolaan Barang Milik Negara/Daerah.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span><b>Permendagri Nomor 19 Tahun 2016</b> tentang Pedoman Pengelolaan Barang Milik Daerah.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span><b>Peraturan Daerah Kota Banjarmasin No. 7 Tahun 2016</b> tentang Pembentukan Susunan Perangkat Daerah.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <span><b>Peraturan Walikota Banjarmasin No. 104 Tahun 2016</b> tentang Kedudukan dan Tugas Pokok Inspektorat.</span>
            </li>
          </ul>
        </div>

        {/* 3 Dokumen Resmi */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Fungsi 3 Dokumen Wajib</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-800">1. Berita Acara Serah Terima (BAST)</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Bukti yuridis penyerahan fisik barang dari Pengurus Barang (Pihak Pertama) kepada Pegawai Pemakai (Pihak Kedua) yang disetujui Pengguna Barang.
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-800">2. Surat Keputusan (SK) Pemegang</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Ketetapan resmi Inspektur Kota Banjarmasin yang melegitimasi wewenang operasional pegawai atas aset daerah bersangkutan.
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <p className="font-bold text-slate-800">3. Surat Pernyataan Tanggung Jawab Mutlak (SPTJM)</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Pernyataan bermaterai kesanggupan memelihara dan bersedia menanggung ganti rugi (TGR) apabila terjadi kehilangan akibat kelalaian.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kewajiban & Larangan Pemakai BMD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Kewajiban Pemakai BMD</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600 list-disc ml-5">
            <li>Mempergunakan barang semata-mata untuk menunjang kelancaran tugas dinas pengawasan.</li>
            <li>Menjaga keamanan fisik, kelengkapan aksesoris, dan kebersihan barang.</li>
            <li>Segera melaporkan kepada Pengurus Barang apabila terjadi kendala teknis / kerusakan.</li>
            <li>Mengembalikan barang dalam kondisi baik apabila mutasi, promosi, atau pensiun.</li>
            <li>Bersedia dilakukan pemeriksaan fisik sewaktu-waktu oleh Tim Pengurus Barang / BPK.</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <span>Larangan Keras Pemakai BMD</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-600 list-disc ml-5">
            <li>Dilarang meminjamkan barang milik daerah kepada pihak lain tanpa izin resmi.</li>
            <li>Dilarang menyewakan, menggadaikan, atau memperjualbelikan aset pemerintah.</li>
            <li>Dilarang mengubah spesifikasi atau merombak bentuk barang tanpa persetujuan Pengguna Barang.</li>
            <li>Dilarang menggunakan fasilitas barang dinas untuk kepentingan komersial pribadi.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
