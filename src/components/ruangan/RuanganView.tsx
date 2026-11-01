import React, { useState } from 'react';
import {
  DoorOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  Package,
  Layers,
  Banknote,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Eye,
  CheckCircle2,
  User,
  X,
} from 'lucide-react';
import type { Ruangan, BarangBMD, InstansiConfig } from '../../types/index.ts';
import { formatRupiah, labelKondisi, findRuanganForItem, formatLokasiRuang } from '../../utils/logic.ts';
import { RuanganModal } from './RuanganModal.tsx';
import { ConfirmModal } from '../common/ConfirmModal.tsx';

interface RuanganViewProps {
  ruanganList: Ruangan[];
  barangList: BarangBMD[];
  instansi: InstansiConfig;
  onAddRuangan: (r: Ruangan) => void;
  onUpdateRuangan: (r: Ruangan) => void;
  onDeleteRuangan: (id: string) => void;
}

export const RuanganView: React.FC<RuanganViewProps> = ({
  ruanganList,
  barangList,
  instansi,
  onAddRuangan,
  onUpdateRuangan,
  onDeleteRuangan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState<Ruangan | null>(null);
  const [selectedRuanganForDetail, setSelectedRuanganForDetail] = useState<Ruangan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string; itemCount: number } | null>(null);

  // Helper to count items in room using authoritative unique mapping
  const getItemsInRoom = (ruang: Ruangan) => {
    return barangList.filter(b => findRuanganForItem(b, ruanganList)?.id === ruang.id);
  };

  // Check unmapped items
  const unmappedItems = barangList.filter(b => !findRuanganForItem(b, ruanganList));
  const isAllMapped = unmappedItems.length === 0;

  // Filtered rooms
  const filtered = ruanganList.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.kodeRuang.toLowerCase().includes(q) ||
      r.namaRuang.toLowerCase().includes(q) ||
      (r.lantaiGedung && r.lantaiGedung.toLowerCase().includes(q)) ||
      (r.penanggungJawab && r.penanggungJawab.toLowerCase().includes(q)) ||
      (r.keterangan && r.keterangan.toLowerCase().includes(q))
    );
  });

  // Calculate statistics
  const totalRuang = ruanganList.length;
  const occupiedRoomsCount = ruanganList.filter(r => getItemsInRoom(r).length > 0).length;
  const totalBarangInAllRooms = ruanganList.reduce((sum, r) => sum + getItemsInRoom(r).length, 0);
  const totalNilaiInAllRooms = ruanganList.reduce(
    (sum, r) => sum + getItemsInRoom(r).reduce((s, b) => s + (b.nilaiPerolehan || 0), 0),
    0
  );

  const handleOpenAdd = () => {
    setEditingRuangan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Ruangan) => {
    setEditingRuangan(r);
    setIsModalOpen(true);
  };

  const handleSave = (r: Ruangan) => {
    if (editingRuangan) {
      onUpdateRuangan(r);
    } else {
      onAddRuangan(r);
    }
    setIsModalOpen(false);
    setEditingRuangan(null);
  };

  const handleRequestDelete = (r: Ruangan) => {
    const items = getItemsInRoom(r);
    setDeleteTarget({
      id: r.id,
      nama: `${r.kodeRuang} - ${r.namaRuang}`,
      itemCount: items.length,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDeleteRuangan(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Kode Ruang', 'Nama Ruang', 'Lantai / Gedung', 'Penanggung Jawab', 'Jumlah Barang', 'Total Nilai Aset (Rp)', 'Keterangan'];
    const rows = ruanganList.map(r => {
      const items = getItemsInRoom(r);
      const nilai = items.reduce((sum, b) => sum + (b.nilaiPerolehan || 0), 0);
      return [
        `"${r.kodeRuang}"`,
        `"${r.namaRuang}"`,
        `"${r.lantaiGedung || ''}"`,
        `"${r.penanggungJawab || ''}"`,
        items.length,
        nilai,
        `"${r.keterangan || ''}"`,
      ].join(',');
    });

    const csvContent = '\ufeff' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Master_Data_Ruangan_BMD_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded border border-[#0F766E]/20">
              Master Data Lokasi
            </span>
            <span className="text-xs text-[#6B7280]">Inspektorat Kota Banjarmasin</span>
          </div>
          <h2 className="text-lg font-bold text-[#111827] mt-1">
            Master Data Lokasi & Kode Ruangan
          </h2>
          <p className="text-xs text-[#6B7280]">
            Pengelolaan kode ruangan, lantai gedung, dan pemetaan penempatan fisik Barang Milik Daerah (BMD).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ruangan Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Total Master Ruangan</p>
            <p className="text-2xl font-bold text-[#111827] mt-1">{totalRuang}</p>
            <p className="text-[11px] text-teal-600 mt-0.5 font-medium">Terdaftar di sistem</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#0F766E]">
            <DoorOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Ruangan Terisi Aset</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{occupiedRoomsCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Dari {totalRuang} ruangan total</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Total Barang Terpetakan</p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <p className="text-2xl font-bold text-emerald-700">{totalBarangInAllRooms}</p>
              <span className="text-xs font-medium text-slate-500">/ {barangList.length} unit total</span>
            </div>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium flex items-center gap-1">
              {isAllMapped ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>100% Terpetakan ke Master Ruangan</span>
                </>
              ) : (
                <span className="text-amber-600 font-semibold">
                  {unmappedItems.length} unit belum terpetakan
                </span>
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Nilai Aset di Ruangan</p>
            <p className="text-lg font-bold text-amber-700 mt-1">{formatRupiah(totalNilaiInAllRooms)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Nilai perolehan kumulatif</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Banknote className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari kode ruangan (R.01), nama ruangan, lantai gedung, penanggung jawab..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all"
          />
        </div>

        <div className="text-xs text-slate-500">
          Menampilkan <b>{filtered.length}</b> dari <b>{ruanganList.length}</b> ruangan
        </div>
      </div>

      {/* Table of Ruangan */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 w-28">Kode Ruang</th>
                <th className="py-3 px-4">Nama Ruangan & Lokasi Gedung</th>
                <th className="py-3 px-4">Penanggung Jawab</th>
                <th className="py-3 px-4 text-center">Populasi Aset</th>
                <th className="py-3 px-4 text-right">Nilai Aset BMD</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <DoorOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Tidak ada data ruangan ditemukan</p>
                    <p className="text-xs mt-1">Gunakan kata kunci lain atau tambahkan master ruangan baru.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => {
                  const roomItems = getItemsInRoom(r);
                  const roomValue = roomItems.reduce((acc, b) => acc + (b.nilaiPerolehan || 0), 0);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-500 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#CCFBF1] text-[#0F766E] border border-teal-200">
                          {r.kodeRuang}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{r.namaRuang}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{r.lantaiGedung || 'Lantai 2 Gedung PDAM'}</span>
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        {r.penanggungJawab ? (
                          <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                            <User className="w-3 h-3 text-slate-400" />
                            {r.penanggungJawab}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedRuanganForDetail(r)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                            roomItems.length > 0
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Klik untuk melihat daftar barang di ruangan ini"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>{roomItems.length} Unit</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                        {formatRupiah(roomValue)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                        {r.keterangan || '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedRuanganForDetail(r)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Barang di Ruangan Ini"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 text-slate-600 hover:text-[#0F766E] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Ubah Data Ruangan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRequestDelete(r)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Master Ruangan"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Submodal: Rincian Barang di Ruangan Terpilih */}
      {selectedRuanganForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#0F766E] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-[#CCFBF1]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-[#CCFBF1] text-[#0F766E] px-2 py-0.5 rounded">
                      {selectedRuanganForDetail.kodeRuang}
                    </span>
                    <h3 className="font-bold text-base text-white">
                      {selectedRuanganForDetail.namaRuang}
                    </h3>
                  </div>
                  <p className="text-xs text-teal-100 mt-0.5">
                    {selectedRuanganForDetail.lantaiGedung} · Penanggung Jawab: {selectedRuanganForDetail.penanggungJawab || '-'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRuanganForDetail(null)}
                className="p-1.5 text-teal-100 hover:text-white hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {(() => {
                const items = getItemsInRoom(selectedRuanganForDetail);
                const totalValue = items.reduce((sum, b) => sum + (b.nilaiPerolehan || 0), 0);

                if (items.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-400">
                      <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-medium text-slate-600">Belum ada barang BMD yang ditempatkan di ruangan ini</p>
                      <p className="text-xs mt-1">Anda dapat menetapkan lokasi ruangan saat menambah atau mengubah data inventaris BMD.</p>
                    </div>
                  );
                }

                return (
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="text-slate-600 font-medium">
                        Total <b>{items.length}</b> unit barang inventaris di ruangan ini
                      </span>
                      <span className="font-bold text-slate-800">
                        Total Nilai: <span className="font-mono text-[#0F766E]">{formatRupiah(totalValue)}</span>
                      </span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                            <th className="py-2.5 px-3 w-8 text-center">No</th>
                            <th className="py-2.5 px-3">Kode / NIB</th>
                            <th className="py-2.5 px-3">Nama & Spesifikasi Barang</th>
                            <th className="py-2.5 px-3 text-center">Tahun</th>
                            <th className="py-2.5 px-3 text-center">Kondisi</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                            <th className="py-2.5 px-3 text-right">Nilai (Rp)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {items.map((it, i) => (
                            <tr key={it.id} className="hover:bg-slate-50/70">
                              <td className="py-2.5 px-3 text-center text-slate-500">{i + 1}</td>
                              <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{it.kodeBarang}</td>
                              <td className="py-2.5 px-3">
                                <p className="font-bold text-slate-900">{it.namaBarang}</p>
                                <p className="text-[10px] text-slate-500">{it.merkTipe} {it.noSeri ? `· Seri: ${it.noSeri}` : ''}</p>
                              </td>
                              <td className="py-2.5 px-3 text-center">{it.tahunPerolehan}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  it.kondisi === 'B' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  it.kondisi === 'RR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {labelKondisi(it.kondisi).full}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  it.statusPemakaian === 'Dipakai'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {it.statusPemakaian}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                                {formatRupiah(it.nilaiPerolehan)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRuanganForDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <RuanganModal
          initialData={editingRuangan || undefined}
          existingRuanganList={ruanganList}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRuangan(null);
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title={deleteTarget.itemCount > 0 ? "Peringatan: Ruangan Masih Memiliki Barang" : "Hapus Master Ruangan"}
          message={
            deleteTarget.itemCount > 0
              ? `Ruangan "${deleteTarget.nama}" saat ini masih menampung ${deleteTarget.itemCount} unit barang inventaris BMD. Anda disarankan memindahkan lokasi penempatan barang ke ruangan lain terlebih dahulu sebelum menghapus master ruangan ini. Apakah Anda tetap ingin melanjutkan penghapusan?`
              : `Apakah Anda yakin ingin menghapus data master ruangan "${deleteTarget.nama}"? Tindakan ini tidak dapat dibatalkan.`
          }
          confirmLabel={deleteTarget.itemCount > 0 ? "Tetap Hapus Ruangan" : "Ya, Hapus Ruangan"}
          cancelLabel="Batal"
          variant={deleteTarget.itemCount > 0 ? "warning" : "danger"}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
