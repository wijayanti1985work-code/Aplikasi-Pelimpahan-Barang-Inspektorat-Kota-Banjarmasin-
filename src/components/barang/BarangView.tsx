import React, { useState } from 'react';
import {
  Package,
  Plus,
  FileSpreadsheet,
  Download,
  Search,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle,
  Clock,
  Layers,
  Banknote,
  FileText,
} from 'lucide-react';
import type { BarangBMD, InstansiConfig, Pegawai, Pejabat, Ruangan } from '../../types/index.ts';
import { filterBarang, formatRupiah, labelKondisi } from '../../utils/logic.ts';
import { exportBarangToExcel, exportRekapitulasiBMDToExcel } from '../../utils/excelService.ts';
import { DEFAULT_INSTANSI } from '../../services/storage.ts';
import { BarangModal } from './BarangModal.tsx';
import { ImportBarangModal } from './ImportBarangModal.tsx';
import { LaporanRekapitulasiModal } from '../documents/LaporanRekapitulasiModal.tsx';
import { ConfirmModal } from '../common/ConfirmModal.tsx';

interface BarangViewProps {
  barangList: BarangBMD[];
  pegawaiList: Pegawai[];
  pejabatList?: Pejabat[];
  instansi?: InstansiConfig;
  ruanganList?: Ruangan[];
  onAddBarang: (b: BarangBMD) => void;
  onUpdateBarang: (b: BarangBMD) => void;
  onDeleteBarang: (id: string) => void;
  onBulkAddBarang: (list: BarangBMD[]) => void;
}

export const BarangView: React.FC<BarangViewProps> = ({
  barangList,
  pegawaiList,
  pejabatList = [],
  instansi = DEFAULT_INSTANSI,
  ruanganList = [],
  onAddBarang,
  onUpdateBarang,
  onDeleteBarang,
  onBulkAddBarang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRuang, setFilterRuang] = useState('Semua');
  const [filterKondisi, setFilterKondisi] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isLaporanModalOpen, setIsLaporanModalOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState<BarangBMD | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; namaBarang: string; isDipakai: boolean; pemakaiNama?: string } | null>(null);

  const uniqueRooms = [
    'Semua',
    ...new Set([
      ...ruanganList.map(r => `[${r.kodeRuang}] ${r.namaRuang}`),
      ...barangList.map(b => b.kodeLokasiRuang),
    ].filter(Boolean)),
  ];

  const filtered = filterBarang(barangList, searchQuery, filterRuang, filterKondisi, filterStatus);

  const totalNilaiFiltered = filtered.reduce((acc, curr) => acc + (curr.nilaiPerolehan || 0), 0);

  const handleEdit = (b: BarangBMD) => {
    setEditingBarang(b);
    setIsModalOpen(true);
  };

  const handleSave = (b: BarangBMD) => {
    if (editingBarang) {
      onUpdateBarang(b);
    } else {
      onAddBarang(b);
    }
    setIsModalOpen(false);
    setEditingBarang(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded border border-[#0F766E]/20">
              Master Inventaris Aset
            </span>
            <span className="text-xs text-[#6B7280]">Inspektorat Kota Banjarmasin</span>
          </div>
          <h2 className="text-lg font-bold text-[#111827] mt-1">
            Data Barang Milik Daerah (BMD)
          </h2>
          <p className="text-xs text-[#6B7280]">
            Daftar inventaris sarana dan prasarana kerja pengawasan, perlengkapan IT, dan kendaraan dinas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLaporanModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0F766E] bg-[#CCFBF1] hover:bg-teal-100 border border-[#0F766E]/30 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Buka laporan rekapitulasi inventaris lengkap siap cetak PDF atau ekspor Excel"
          >
            <FileText className="w-4 h-4 text-[#0F766E]" />
            Laporan Rekapitulasi (PDF/Excel)
          </button>

          <button
            type="button"
            onClick={() => exportBarangToExcel(barangList)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#111827] bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Ekspor seluruh daftar inventaris BMD ke Excel"
          >
            <Download className="w-4 h-4 text-[#6B7280]" />
            Ekspor Excel
          </button>

          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#111827] bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Impor inventaris dari file Excel (.xlsx / .csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#6B7280]" />
            Impor dari Excel
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingBarang(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah BMD Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari kode barang, NIB, nama, merk, no seri..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
            />
          </div>

          <div className="w-44">
            <select
              value={filterRuang}
              onChange={e => setFilterRuang(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827]"
            >
              {uniqueRooms.map(r => (
                <option key={r} value={r}>
                  {r === 'Semua' ? 'Semua Ruangan' : r}
                </option>
              ))}
            </select>
          </div>

          <div className="w-36">
            <select
              value={filterKondisi}
              onChange={e => setFilterKondisi(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827]"
            >
              <option value="Semua">Semua Kondisi</option>
              <option value="B">Baik (B)</option>
              <option value="RR">Rusak Ringan (RR)</option>
              <option value="RB">Rusak Berat (RB)</option>
            </select>
          </div>

          <div className="w-32">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Dipakai">Dipakai</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#6B7280] flex items-center gap-1.5 font-mono">
          <span>Total: <strong className="text-[#111827]">{filtered.length}</strong> Barang</span>
          <span>·</span>
          <span className="font-semibold text-[#0F766E]">{formatRupiah(totalNilaiFiltered)}</span>
        </div>
      </div>

      {/* BMD Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F3F4F6] border-b border-[#E5E7EB] text-[#6B7280] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Barang & Spesifikasi</th>
                <th className="py-3 px-4">Kode NIB / No. Seri</th>
                <th className="py-3 px-4">Tahun / Lokasi</th>
                <th className="py-3 px-4 text-center">Kondisi</th>
                <th className="py-3 px-4 text-right">Nilai Perolehan</th>
                <th className="py-3 px-4">Status & Pemakai</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B7280]">
                    Tidak ditemukan inventaris barang yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((bmd, idx) => {
                  const kondisi = labelKondisi(bmd.kondisi);
                  const pemakai = bmd.idPegawaiPemakai
                    ? pegawaiList.find(p => p.id === bmd.idPegawaiPemakai)
                    : null;

                  return (
                    <tr key={bmd.id} className="hover:bg-[#F3F4F6]/60 transition-colors">
                      <td className="py-3 px-4 text-center text-[#6B7280]">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={bmd.fotoBarang}
                            alt={bmd.namaBarang}
                            className="w-12 h-10 rounded-lg object-cover border border-[#E5E7EB] shrink-0"
                          />
                          <div>
                            <p className="font-bold text-[#111827] text-sm leading-tight">{bmd.namaBarang}</p>
                            <p className="text-[11px] text-[#6B7280] mt-0.5">{bmd.merkTipe}</p>
                            {bmd.keterangan && (
                              <p className="text-[10px] text-[#6B7280] italic">{bmd.keterangan}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <p className="font-semibold text-[#111827]">{bmd.kodeBarang}</p>
                        <p className="text-[#6B7280]">{bmd.noSeri}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-[#111827]">Tahun {bmd.tahunPerolehan}</p>
                        <p className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#6B7280] shrink-0" />
                          {bmd.kodeLokasiRuang}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${kondisi.bg} ${kondisi.color}`}
                        >
                          {kondisi.full} ({kondisi.text})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-[#111827] font-mono tabular-nums">{formatRupiah(bmd.nilaiPerolehan)}</span>
                        <p className="text-[10px] text-[#6B7280]">{bmd.sumberDana}</p>
                      </td>
                      <td className="py-3 px-4">
                        {bmd.statusPemakaian === 'Dipakai' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Dipakai
                            </span>
                            <p className="font-medium text-[#111827] text-[11px]">
                              {pemakai ? pemakai.nama : 'Pegawai Terdaftar'}
                            </p>
                            {pemakai && <p className="text-[10px] text-[#6B7280]">{pemakai.jabatan}</p>}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Tersedia di Gudang
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(bmd)}
                            className="p-1.5 text-[#6B7280] hover:text-[#0F766E] hover:bg-[#CCFBF1]/50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Inventaris"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget({
                                id: bmd.id,
                                namaBarang: bmd.namaBarang,
                                isDipakai: bmd.statusPemakaian === 'Dipakai',
                                pemakaiNama: pemakai?.nama,
                              });
                            }}
                            className="p-1.5 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Inventaris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <BarangModal
          initialData={editingBarang || undefined}
          ruanganList={ruanganList}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBarang(null);
          }}
        />
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <ImportBarangModal
          onImportSuccess={imported => {
            onBulkAddBarang(imported);
            setIsImportOpen(false);
          }}
          onClose={() => setIsImportOpen(false)}
        />
      )}

      {/* Laporan Rekapitulasi Inventaris BMD Modal (PDF & Excel) */}
      {isLaporanModalOpen && (
        <LaporanRekapitulasiModal
          barangList={barangList}
          pegawaiList={pegawaiList}
          pejabatList={pejabatList}
          instansi={instansi}
          isOpen={isLaporanModalOpen}
          onClose={() => setIsLaporanModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title={deleteTarget.isDipakai ? 'Perhatian: Barang Sedang Dipakai' : 'Konfirmasi Hapus Inventaris BMD'}
          message={
            deleteTarget.isDipakai
              ? `Barang "${deleteTarget.namaBarang}" saat ini sedang dalam status "Dipakai"${deleteTarget.pemakaiNama ? ` oleh ${deleteTarget.pemakaiNama}` : ''}. Apakah Anda tetap ingin menghapus aset ini dari daftar inventaris?`
              : `Apakah Anda yakin ingin menghapus barang "${deleteTarget.namaBarang}" dari inventaris BMD? Data akan dihapus secara permanen.`
          }
          confirmLabel={deleteTarget.isDipakai ? 'Tetap Hapus' : 'Hapus Barang'}
          cancelLabel="Batal"
          variant={deleteTarget.isDipakai ? 'warning' : 'danger'}
          onConfirm={() => {
            onDeleteBarang(deleteTarget.id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
