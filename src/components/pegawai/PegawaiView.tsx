import React, { useState } from 'react';
import {
  Users,
  Plus,
  FileSpreadsheet,
  Download,
  Search,
  Edit2,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import type { BarangBMD, Pegawai, PelimpahanBMD } from '../../types/index.ts';
import { filterPegawai } from '../../utils/logic.ts';
import { exportPegawaiToExcel } from '../../utils/excelService.ts';
import { PegawaiModal } from './PegawaiModal.tsx';
import { ImportPegawaiModal } from './ImportPegawaiModal.tsx';
import { ConfirmModal } from '../common/ConfirmModal.tsx';

interface PegawaiViewProps {
  pegawaiList: Pegawai[];
  barangList: BarangBMD[];
  pelimpahanList: PelimpahanBMD[];
  onAddPegawai: (p: Pegawai) => void;
  onUpdatePegawai: (p: Pegawai) => void;
  onDeletePegawai: (id: string) => void;
  onBulkAddPegawai: (list: Pegawai[]) => void;
  onOpenCreatePelimpahanWithPegawai?: (pegawaiId: string) => void;
}

const UNIT_KERJA_FILTER = [
  'Semua',
  'Inspektorat Pembantu Wilayah I',
  'Inspektorat Pembantu Wilayah II',
  'Inspektorat Pembantu Wilayah III',
  'Inspektorat Pembantu Khusus',
  'Sekretariat',
];

export const PegawaiView: React.FC<PegawaiViewProps> = ({
  pegawaiList,
  barangList,
  pelimpahanList,
  onAddPegawai,
  onUpdatePegawai,
  onDeletePegawai,
  onBulkAddPegawai,
  onOpenCreatePelimpahanWithPegawai,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string; heldCount: number } | null>(null);

  const filtered = filterPegawai(pegawaiList, searchQuery, filterUnit, filterStatus);

  const handleEdit = (p: Pegawai) => {
    setEditingPegawai(p);
    setIsModalOpen(true);
  };

  const handleSave = (p: Pegawai) => {
    if (editingPegawai) {
      onUpdatePegawai(p);
    } else {
      onAddPegawai(p);
    }
    setIsModalOpen(false);
    setEditingPegawai(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Master Data Pegawai
            </span>
            <span className="text-xs text-slate-400">Inspektorat Kota Banjarmasin</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Data Pegawai (Pemakai BMD)
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data aparatur Inspektorat pemegang hak pakai aset Barang Milik Daerah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportPegawaiToExcel(pegawaiList)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Ekspor seluruh data pegawai ke file Excel"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Ekspor Excel
          </button>

          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Impor data dari file Excel (.xlsx / .csv)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Impor dari Excel
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingPegawai(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Pegawai
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama pegawai, NIP, jabatan..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="w-48">
            <select
              value={filterUnit}
              onChange={e => setFilterUnit(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
            >
              {UNIT_KERJA_FILTER.map(u => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Total: <span className="font-bold text-slate-800">{filtered.length}</span> Pegawai
        </div>
      </div>

      {/* Pegawai Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Pegawai / NIP</th>
                <th className="py-3 px-4">Pangkat / Golongan</th>
                <th className="py-3 px-4">Jabatan & Unit Kerja</th>
                <th className="py-3 px-4">Masa Kerja</th>
                <th className="py-3 px-4">Barang Dipegang</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data pegawai yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((peg, idx) => {
                  const heldItems = barangList.filter(b => b.idPegawaiPemakai === peg.id);
                  return (
                    <tr key={peg.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={peg.foto}
                            alt={peg.nama}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">{peg.nama}</p>
                            <p className="font-mono text-[11px] text-slate-500 mt-0.5">NIP. {peg.nip}</p>
                            {peg.telepon && (
                              <p className="text-[10px] text-slate-400">{peg.telepon}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{peg.pangkatGol}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{peg.jabatan}</p>
                        <p className="text-[11px] text-slate-500">{peg.unitKerja}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {peg.masaKerjaJabatan}
                      </td>
                      <td className="py-3 px-4">
                        {heldItems.length > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              <Package className="w-3 h-3 text-blue-600" />
                              {heldItems.length} Aset BMD
                            </span>
                            <p className="text-[10px] text-slate-500 max-w-[200px] truncate" title={heldItems.map(i => i.namaBarang).join(', ')}>
                              {heldItems.map(i => i.namaBarang).join(', ')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Belum Ada Aset</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                            peg.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {peg.status === 'Aktif' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {peg.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(peg)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Pegawai"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTarget({
                                id: peg.id,
                                nama: peg.nama,
                                heldCount: heldItems.length,
                              });
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Pegawai"
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
        <PegawaiModal
          initialData={editingPegawai || undefined}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPegawai(null);
          }}
        />
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <ImportPegawaiModal
          onImportSuccess={imported => {
            onBulkAddPegawai(imported);
            setIsImportOpen(false);
          }}
          onClose={() => setIsImportOpen(false)}
        />
      )}
    </div>
  );
};
