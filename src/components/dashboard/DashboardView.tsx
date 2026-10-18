import React from 'react';
import {
  Users,
  Package,
  Layers,
  FileCheck2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  FileText,
  Printer,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import type { BarangBMD, Pegawai, Pejabat, PelimpahanBMD } from '../../types/index.ts';
import { computeDashboardStats, formatRupiah, formatTanggalIndonesia } from '../../utils/logic.ts';
import type { NavTab } from '../common/Sidebar.tsx';

interface DashboardViewProps {
  pegawaiList: Pegawai[];
  barangList: BarangBMD[];
  pelimpahanList: PelimpahanBMD[];
  pejabatList: Pejabat[];
  onNavigateTab: (tab: NavTab) => void;
  onOpenCreatePelimpahan: () => void;
  onQuickViewDoc: (pelimpahan: PelimpahanBMD) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pegawaiList,
  barangList,
  pelimpahanList,
  pejabatList,
  onNavigateTab,
  onOpenCreatePelimpahan,
  onQuickViewDoc,
}) => {
  const stats = computeDashboardStats(pegawaiList, barangList, pelimpahanList);

  const percentDipakai = stats.totalBarang > 0 ? Math.round((stats.barangTerpakai / stats.totalBarang) * 100) : 0;
  const percentBaik = stats.totalBarang > 0 ? Math.round((stats.kondisiBaik / stats.totalBarang) * 100) : 0;
  const percentRR = stats.totalBarang > 0 ? Math.round((stats.kondisiRusakRingan / stats.totalBarang) * 100) : 0;
  const percentRB = stats.totalBarang > 0 ? Math.round((stats.kondisiRusakBerat / stats.totalBarang) * 100) : 0;

  const inspektur = pejabatList.find(p => p.peran === 'Pengguna Barang');
  const pengurus = pejabatList.find(p => p.peran === 'Pengurus Barang');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-amber-300 border border-white/15">
            <Building2 className="w-3.5 h-3.5" />
            <span>Pemerintah Kota Banjarmasin · Inspektorat Daerah</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Sistem Informasi Pelimpahan Barang Milik Daerah (SIP-BMD)
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Pengelolaan tertib administrasi penetapan hak pakai aset inventaris daerah, penerbitan Berita Acara Serah Terima (BAST), Surat Keputusan (SK) Pemegang, dan Surat Pernyataan Tanggung Jawab Mutlak (SPTJM).
          </p>

          {/* Quick Action Shortcuts */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenCreatePelimpahan}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Buat Pelimpahan Baru
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('pelimpahan')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              Kelola & Cetak Dokumen
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('instansi')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              Setting Kop & Logo
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cards (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pegawai */}
        <div
          onClick={() => onNavigateTab('pegawai')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90 hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pegawai (Pemakai)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats.totalPegawai}</span>
            <span className="text-xs text-slate-500 ml-1">Orang</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Pegawai Aktif: <b className="text-emerald-700">{stats.pegawaiAktif}</b></span>
            <span className="text-blue-600 font-semibold group-hover:underline">Lihat Semua →</span>
          </div>
        </div>

        {/* Card 2: Total BMD Inventaris */}
        <div
          onClick={() => onNavigateTab('barang')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90 hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Inventaris BMD</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats.totalBarang}</span>
            <span className="text-xs text-slate-500 ml-1">Unit / Aset</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Tersedia: <b className="text-emerald-700">{stats.barangTersedia}</b></span>
            <span className="text-emerald-600 font-semibold group-hover:underline">Inventaris →</span>
          </div>
        </div>

        {/* Card 3: Barang Terpakai vs Tersedia */}
        <div
          onClick={() => onNavigateTab('pelimpahan')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90 hover:border-indigo-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Aset Sedang Dipakai</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats.barangTerpakai}</span>
            <span className="text-xs text-slate-500 ml-1">Unit ({percentDipakai}%)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Dalam {stats.totalPelimpahan} Pelimpahan</span>
            <span className="text-indigo-600 font-semibold group-hover:underline">Rincian →</span>
          </div>
        </div>

        {/* Card 4: Total Nilai Aset */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Nilai Perolehan</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-xl font-bold text-slate-900 leading-tight block">
              {formatRupiah(stats.totalNilaiAset)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tercatat Pada SIMDA / SIPD BMD</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Kondisi BMD Chart & Pejabat Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Progress Breakdown: Kondisi Barang */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ringkasan Kondisi Barang Milik Daerah (BMD)
              </h3>
              <p className="text-xs text-slate-500">
                Klasifikasi fisik aset menurut Permendagri No. 19/2016
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Total {stats.totalBarang} Aset
            </span>
          </div>

          {/* Condition Stack Bar */}
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${percentBaik}%` }}
              className="bg-emerald-500 transition-all"
              title={`Baik: ${stats.kondisiBaik} unit (${percentBaik}%)`}
            />
            <div
              style={{ width: `${percentRR}%` }}
              className="bg-amber-400 transition-all"
              title={`Rusak Ringan: ${stats.kondisiRusakRingan} unit (${percentRR}%)`}
            />
            <div
              style={{ width: `${percentRB}%` }}
              className="bg-rose-500 transition-all"
              title={`Rusak Berat: ${stats.kondisiRusakBerat} unit (${percentRB}%)`}
            />
          </div>

          {/* Condition 3 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Baik (B)
                </span>
                <span className="font-bold text-emerald-800">{percentBaik}%</span>
              </div>
              <p className="text-2xl font-bold text-emerald-950 mt-1">{stats.kondisiBaik}</p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Siap pakai & operasional dinas</p>
            </div>

            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Rusak Ringan (RR)
                </span>
                <span className="font-bold text-amber-800">{percentRR}%</span>
              </div>
              <p className="text-2xl font-bold text-amber-950 mt-1">{stats.kondisiRusakRingan}</p>
              <p className="text-[10px] text-amber-700 mt-0.5">Perlu servis berkala / suku cadang</p>
            </div>

            <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Rusak Berat (RB)
                </span>
                <span className="font-bold text-rose-800">{percentRB}%</span>
              </div>
              <p className="text-2xl font-bold text-rose-950 mt-1">{stats.kondisiRusakBerat}</p>
              <p className="text-[10px] text-rose-700 mt-0.5">Usul pemusnahan / penghapusan aset</p>
            </div>
          </div>
        </div>

        {/* Pejabat Pengelola Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Pejabat Pengelola BMD</h3>
              <button
                type="button"
                onClick={() => onNavigateTab('pejabat')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Ubah →
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Otorisator penandatanganan Berita Acara & SK
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Pengguna Barang */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Pengguna Barang
              </span>
              <p className="font-bold text-slate-900 mt-1">{inspektur?.nama}</p>
              <p className="text-slate-500 text-[11px]">NIP. {inspektur?.nip}</p>
              <p className="text-slate-600 text-[11px]">{inspektur?.jabatan}</p>
            </div>

            {/* Pengurus Barang */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-0.5">
              <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Pengurus Barang
              </span>
              <p className="font-bold text-slate-900 mt-1">{pengurus?.nama}</p>
              <p className="text-slate-500 text-[11px]">NIP. {pengurus?.nip}</p>
              <p className="text-slate-600 text-[11px]">{pengurus?.jabatan}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Format Surat Sesuai Regulasi</span>
            <span className="text-emerald-700 font-semibold">Tersertifikasi ASN</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Pelimpahan Records with Quick Print */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pelimpahan BMD Terbaru
            </h3>
            <p className="text-xs text-slate-500">
              Riwayat transaksi penyerahan hak pakai barang kepada pegawai
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('pelimpahan')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua Pelimpahan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {pelimpahanList.slice(0, 4).map(pel => {
            const peg = pegawaiList.find(p => p.id === pel.idPegawai);
            const items = barangList.filter(b => pel.barangIds.includes(b.id));

            return (
              <div
                key={pel.id}
                className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={peg?.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'}
                    alt={peg?.nama}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{peg?.nama}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">({pel.nomorBAST})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {peg?.jabatan} · {formatTanggalIndonesia(pel.tanggal)}
                    </p>
                    <p className="text-[11px] text-blue-800 font-medium mt-0.5">
                      Memegang: {items.map(i => i.namaBarang).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onQuickViewDoc(pel)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Cetak Dokumen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
