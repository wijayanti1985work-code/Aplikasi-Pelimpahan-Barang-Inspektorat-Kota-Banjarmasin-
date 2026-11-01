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
  ArrowRightLeft,
  PackageCheck,
  Building2,
  Clock,
  ShieldAlert,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import type {
  BarangBMD,
  InstansiConfig,
  Pegawai,
  Pejabat,
  PelepasanAsetRecord,
  PelimpahanBMD,
  UnitKerja,
} from '../../types/index.ts';
import { filterPegawai } from '../../utils/logic.ts';
import { exportPegawaiToExcel, downloadTemplatePegawai } from '../../utils/excelService.ts';
import { DEFAULT_INSTANSI } from '../../services/storage.ts';
import { PegawaiModal } from './PegawaiModal.tsx';
import { ImportPegawaiModal } from './ImportPegawaiModal.tsx';
import { PelepasanAsetModal } from './PelepasanAsetModal.tsx';
import { BeritaAcaraPelepasanModal } from '../documents/BeritaAcaraPelepasanModal.tsx';
import { ConfirmModal } from '../common/ConfirmModal.tsx';

interface PegawaiViewProps {
  pegawaiList: Pegawai[];
  barangList: BarangBMD[];
  pelimpahanList: PelimpahanBMD[];
  pejabatList?: Pejabat[];
  instansi?: InstansiConfig;
  unitKerjaList?: UnitKerja[];
  onAddPegawai: (p: Pegawai) => void;
  onUpdatePegawai: (p: Pegawai) => void;
  onDeletePegawai: (id: string) => void;
  onBulkAddPegawai: (list: Pegawai[]) => void;
  onOpenCreatePelimpahanWithPegawai?: (pegawaiId: string) => void;
  onExecutePelepasanAset?: (record: PelepasanAsetRecord) => void;
  onClearAllPegawai?: () => void;
  onAddNewUnitKerja?: (unit: UnitKerja) => void;
}

const DEFAULT_UNIT_KERJA_FILTER = [
  'Semua',
  'Inspektorat Pembantu Wilayah I',
  'Inspektorat Pembantu Wilayah II',
  'Inspektorat Pembantu Wilayah III',
  'Inspektorat Pembantu Wilayah IV',
  'Inspektorat Pembantu Khusus',
  'Sekretariat',
];

export const PegawaiView: React.FC<PegawaiViewProps> = ({
  pegawaiList,
  barangList,
  pelimpahanList,
  pejabatList = [],
  instansi = DEFAULT_INSTANSI,
  unitKerjaList = [],
  onAddPegawai,
  onUpdatePegawai,
  onDeletePegawai,
  onBulkAddPegawai,
  onOpenCreatePelimpahanWithPegawai,
  onExecutePelepasanAset,
  onClearAllPegawai,
  onAddNewUnitKerja,
}) => {
  const MAX_PEGAWAI = 150;
  const isQuotaFull = pegawaiList.length >= MAX_PEGAWAI;
  const quotaPercentage = Math.min(100, Math.round((pegawaiList.length / MAX_PEGAWAI) * 100));

  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const unitFilterOptions = [
    'Semua',
    ...(unitKerjaList.length > 0
      ? unitKerjaList.map(u => u.namaUnit)
      : DEFAULT_UNIT_KERJA_FILTER.filter(u => u !== 'Semua')),
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<Pegawai | null>(null);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string; heldCount: number } | null>(null);

  // Pelepasan Aset modal state
  const [pelepasanTarget, setPelepasanTarget] = useState<{ pegawai: Pegawai; heldItems: BarangBMD[] } | null>(null);

  // Active BAP view modal state
  const [activeBAPRecord, setActiveBAPRecord] = useState<PelepasanAsetRecord | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleFilterUnitChange = (val: string) => {
    setFilterUnit(val);
    setCurrentPage(1);
  };

  const handleFilterStatusChange = (val: string) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };

  const filtered = filterPegawai(pegawaiList, searchQuery, filterUnit, filterStatus);
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPegawai = filtered.slice(startIndex, endIndex);

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

  const handleConfirmPelepasan = (record: PelepasanAsetRecord) => {
    if (onExecutePelepasanAset) {
      onExecutePelepasanAset(record);
    }
    setPelepasanTarget(null);
    setActiveBAPRecord(record);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aktif':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Aktif
          </span>
        );
      case 'Mutasi/Pindah':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <ArrowRightLeft className="w-3 h-3 text-blue-600" />
            Mutasi/Pindah
          </span>
        );
      case 'Pensiun':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3 text-purple-600" />
            Pensiun
          </span>
        );
      case 'Non-Aktif':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-500" />
            Non-Aktif
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded border border-[#0F766E]/20">
              Master Data Pegawai & Pemakai BMD
            </span>
            <span className="text-xs text-[#6B7280]">Inspektorat Kota Banjarmasin</span>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isQuotaFull
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : pegawaiList.length >= 120
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-teal-50 text-teal-700 border-teal-200'
              }`}
            >
              Batasan Kuota: {pegawaiList.length} / {MAX_PEGAWAI} Orang ({quotaPercentage}%)
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#111827] mt-1">
            Data Pegawai (Pemegang Hak Pakai BMD)
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-[#6B7280]">
              Kelola aparatur sipil pemakai aset, status mutasi/pensiun, dan serah terima pelepasan barang dinas.
            </p>
            {/* Visual Mini Progress Bar */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    isQuotaFull ? 'bg-rose-500' : pegawaiList.length >= 120 ? 'bg-amber-500' : 'bg-[#0F766E]'
                  }`}
                  style={{ width: `${quotaPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={downloadTemplatePegawai}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Unduh format template Excel untuk pengisian data pegawai baru hingga 150 orang"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Format Excel</span>
          </button>

          {onClearAllPegawai && pegawaiList.length > 0 && (
            <button
              type="button"
              onClick={() => setIsClearAllConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="Hapus seluruh data nama pegawai yang ada untuk memasukkan data baru"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Kosongkan Pegawai</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => exportPegawaiToExcel(pegawaiList)}
            disabled={pegawaiList.length === 0}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl shadow-2xs transition-colors ${
              pegawaiList.length === 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                : 'text-[#111827] bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] cursor-pointer'
            }`}
            title="Ekspor seluruh data pegawai ke file Excel"
          >
            <Download className="w-4 h-4 text-[#6B7280]" />
            Ekspor Excel
          </button>

          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            disabled={isQuotaFull}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl shadow-2xs transition-colors ${
              isQuotaFull
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                : 'text-[#0F766E] bg-[#CCFBF1] hover:bg-teal-100 border border-teal-300 cursor-pointer'
            }`}
            title={isQuotaFull ? 'Kapasitas maksimal 150 pegawai telah tercapai' : 'Impor data dari file Excel (.xlsx / .csv)'}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#0F766E]" />
            Impor Excel
          </button>

          {isQuotaFull ? (
            <div
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-400 bg-slate-100 border border-slate-300 rounded-xl cursor-not-allowed"
              title="Kapasitas maksimal 150 pegawai telah tercapai. Hapus atau mutasikan pegawai terlebih dahulu jika ingin menambah."
            >
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span>Tambah Pegawai (Penuh 150)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingPegawai(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Pegawai
            </button>
          )}
        </div>
      </div>

      {pegawaiList.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-[#E5E7EB] shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 bg-teal-50 text-[#0F766E] rounded-2xl flex items-center justify-center border border-teal-100 shadow-2xs">
            <Users className="w-8 h-8 text-[#0F766E]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Data Pegawai Sebelumnya Telah Dibersihkan (0 / {MAX_PEGAWAI} Orang)</span>
          </div>

          <h3 className="text-xl font-bold text-[#111827]">
            Data Pegawai Masih Kosong
          </h3>

          <p className="text-xs text-[#6B7280] max-w-lg mx-auto mt-2 leading-relaxed">
            Nama pegawai sebelumnya telah dihapus dari sistem. Anda dapat mulai menambahkan data pegawai baru hingga batasan <strong>{MAX_PEGAWAI} orang</strong> secara manual atau mengimpor langsung dari file Excel.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setEditingPegawai(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pegawai Baru</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#0F766E] bg-[#CCFBF1] hover:bg-teal-100 border border-teal-300 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#0F766E]" />
              <span>Impor Excel / CSV</span>
            </button>

            <button
              type="button"
              onClick={downloadTemplatePegawai}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-300 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Unduh format template Excel untuk pengisian data pegawai baru hingga 150 orang"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Unduh Format Excel</span>
            </button>
          </div>

          {/* Guidance Info: 6 Unit Kerja Inspektorat Banjarmasin */}
          <div className="mt-8 pt-6 border-t border-[#E5E7EB] max-w-3xl mx-auto text-left">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#0F766E]" />
                Pilihan Unit Kerja Penempatan Pegawai (6 Unit Resmi):
              </span>
              <span className="text-[11px] text-[#6B7280]">Inspektorat Kota Banjarmasin</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-800">1. Sekretariat (SET)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Subbag Umum & Kepegawaian, Keuangan, Program</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-800">2. Irban Wilayah I</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Kec. Banjarmasin Tengah & Tata Pemerintahan</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-800">3. Irban Wilayah II</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Kec. Banjarmasin Utara & Pendidikan/Kesehatan</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-800">4. Irban Wilayah III</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Kec. Banjarmasin Selatan & Teknis PU/Dishub</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-800">5. Irban Wilayah IV</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Kec. Banjarmasin Barat & Keuangan/BMD</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-800">6. Irban Khusus</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Audit Investigasi & Saber Pungli / WBS</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-xl shadow-xs border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder="Cari nama pegawai, NIP, jabatan..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
                />
              </div>

              <div className="w-48">
                <select
                  value={filterUnit}
                  onChange={e => handleFilterUnitChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827]"
                >
                  {unitFilterOptions.map(u => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-36">
                <select
                  value={filterStatus}
                  onChange={e => handleFilterStatusChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827]"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Mutasi/Pindah">Mutasi/Pindah</option>
                  <option value="Pensiun">Pensiun</option>
                  <option value="Non-Aktif">Non-Aktif</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-[#6B7280]">
              Total Hasil: <span className="font-bold text-[#111827]">{filtered.length}</span> dari {pegawaiList.length} Pegawai
            </div>
          </div>

          {/* Pegawai Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F3F4F6] border-b border-[#E5E7EB] text-[#6B7280] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Pegawai / NIP</th>
                    <th className="py-3 px-4">Pangkat / Golongan</th>
                    <th className="py-3 px-4">Jabatan & Unit Kerja</th>
                    <th className="py-3 px-4">Masa Kerja</th>
                    <th className="py-3 px-4">Barang Dipegang</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center w-36">Aksi & Pelepasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {paginatedPegawai.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#6B7280]">
                        Tidak ditemukan data pegawai yang sesuai dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedPegawai.map((peg, idx) => {
                      const heldItems = barangList.filter(b => b.idPegawaiPemakai === peg.id);
                      const displayIndex = startIndex + idx + 1;
                      return (
                        <tr key={peg.id} className="hover:bg-[#F3F4F6]/60 transition-colors">
                          <td className="py-3 px-4 text-center text-[#6B7280] font-medium">{displayIndex}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={peg.foto}
                                alt={peg.nama}
                                className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB] shrink-0"
                              />
                              <div>
                                <p className="font-bold text-[#111827] text-sm leading-tight">{peg.nama}</p>
                                <p className="font-mono text-[11px] text-[#6B7280] mt-0.5">NIP. {peg.nip}</p>
                                {peg.telepon && (
                                  <p className="text-[10px] text-[#6B7280]">{peg.telepon}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-[#111827]">{peg.pangkatGol}</span>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-[#111827]">{peg.jabatan}</p>
                            <div className="flex flex-col gap-0.5 mt-0.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                                <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{peg.unitKerja}</span>
                              </span>
                              {peg.wilayahKerja && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60 max-w-[220px] truncate" title={peg.wilayahKerja}>
                                  <MapPin className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                                  <span className="truncate">{peg.wilayahKerja}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#111827]">
                            {peg.masaKerjaJabatan}
                          </td>
                          <td className="py-3 px-4">
                            {heldItems.length > 0 ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded border border-[#0F766E]/20">
                                  <Package className="w-3 h-3 text-[#0F766E]" />
                                  {heldItems.length} Aset BMD
                                </span>
                                <p className="text-[10px] text-[#6B7280] max-w-[200px] truncate" title={heldItems.map(i => i.namaBarang).join(', ')}>
                                  {heldItems.map(i => i.namaBarang).join(', ')}
                                </p>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#6B7280] italic">Belum Ada Aset</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {getStatusBadge(peg.status)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Pelepasan Aset Button */}
                              {heldItems.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setPelepasanTarget({ pegawai: peg, heldItems })}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-[#0F766E] bg-[#CCFBF1] hover:bg-teal-100 border border-[#0F766E]/20 rounded-lg transition-colors cursor-pointer"
                                  title="Pelepasan Aset untuk Pegawai Pindah atau Pensiun"
                                >
                                  <PackageCheck className="w-3.5 h-3.5" />
                                  Pelepasan
                                </button>
                              ) : onOpenCreatePelimpahanWithPegawai && peg.status === 'Aktif' ? (
                                <button
                                  type="button"
                                  onClick={() => onOpenCreatePelimpahanWithPegawai(peg.id)}
                                  className="px-2 py-1 text-[11px] text-[#6B7280] hover:text-[#0F766E] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
                                  title="Limpahkan Barang Baru ke Pegawai ini"
                                >
                                  + Beri Aset
                                </button>
                              ) : null}

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleEdit(peg)}
                                className="p-1.5 text-[#6B7280] hover:text-[#0F766E] hover:bg-[#CCFBF1]/50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Pegawai"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTarget({
                                    id: peg.id,
                                    nama: peg.nama,
                                    heldCount: heldItems.length,
                                  });
                                }}
                                className="p-1.5 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

            {/* Pagination Bar */}
            {totalItems > 0 && (
              <div className="px-5 py-3.5 bg-slate-50 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
                <div className="flex flex-wrap items-center gap-3">
                  <span>
                    Menampilkan <strong className="text-[#111827]">{startIndex + 1}</strong> - <strong className="text-[#111827]">{endIndex}</strong> dari <strong className="text-[#111827]">{totalItems}</strong> pegawai (Batasan 150)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Tampilkan:</span>
                    <select
                      value={pageSize}
                      onChange={e => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none"
                    >
                      <option value={10}>10 / hal</option>
                      <option value={25}>25 / hal</option>
                      <option value={50}>50 / hal</option>
                      <option value={100}>100 / hal</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={safeCurrentPage === 1}
                    className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Halaman Pertama"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={safeCurrentPage === 1}
                    className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs">
                    {safeCurrentPage} / {totalPages}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Halaman Berikutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                    className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Halaman Terakhir"
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add/Edit Pegawai Modal */}
      {isModalOpen && (
        <PegawaiModal
          initialData={editingPegawai || undefined}
          unitKerjaList={unitKerjaList}
          currentPegawaiCount={pegawaiList.length}
          onSave={handleSave}
          onAddNewUnitKerja={onAddNewUnitKerja}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPegawai(null);
          }}
        />
      )}

      {/* Import Pegawai Modal */}
      {isImportOpen && (
        <ImportPegawaiModal
          currentPegawaiCount={pegawaiList.length}
          onImportSuccess={imported => {
            onBulkAddPegawai(imported);
            setIsImportOpen(false);
          }}
          onClose={() => setIsImportOpen(false)}
        />
      )}

      {/* Pelepasan Aset Modal */}
      {pelepasanTarget && (
        <PelepasanAsetModal
          pegawai={pelepasanTarget.pegawai}
          heldItems={pelepasanTarget.heldItems}
          allPegawaiList={pegawaiList}
          pejabatList={pejabatList}
          isOpen={!!pelepasanTarget}
          onClose={() => setPelepasanTarget(null)}
          onConfirm={handleConfirmPelepasan}
        />
      )}

      {/* Berita Acara Pelepasan Document View/Print Modal */}
      {activeBAPRecord && (
        <BeritaAcaraPelepasanModal
          record={activeBAPRecord}
          instansi={instansi}
          pejabatList={pejabatList}
          onClose={() => setActiveBAPRecord(null)}
        />
      )}

      {/* Delete Pegawai Confirmation Modal (Fixed & Active) */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title={deleteTarget.heldCount > 0 ? 'Peringatan: Pegawai Masih Memegang Aset BMD' : 'Konfirmasi Hapus Data Pegawai'}
          message={
            deleteTarget.heldCount > 0
              ? `Pegawai "${deleteTarget.nama}" saat ini masih menguasai ${deleteTarget.heldCount} barang milik daerah. Demi integritas pencatatan aset negara, Anda tidak dapat menghapus pegawai ini secara langsung. Silakan gunakan tombol "Pelepasan" di tabel terlebih dahulu untuk mengembalikan barang ke gudang atau mengalihkannya ke pegawai pengganti.`
              : `Apakah Anda yakin ingin menghapus data pegawai "${deleteTarget.nama}"? Data pegawai akan dihapus permanen dari sistem dan cloud database.`
          }
          confirmLabel={deleteTarget.heldCount > 0 ? 'Mengerti' : 'Hapus Pegawai'}
          cancelLabel="Batal"
          variant={deleteTarget.heldCount > 0 ? 'warning' : 'danger'}
          onConfirm={() => {
            if (deleteTarget.heldCount === 0) {
              onDeletePegawai(deleteTarget.id);
            }
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Clear All Pegawai Confirmation Modal */}
      {isClearAllConfirmOpen && (
        <ConfirmModal
          isOpen={isClearAllConfirmOpen}
          title="Hapus Seluruh Data Pegawai?"
          message={`Tindakan ini akan menghapus semua (${pegawaiList.length}) data nama pegawai dari sistem agar Anda dapat menginput nama-nama pegawai baru. Barang inventaris yang sebelumnya dipegang akan dikembalikan ke status 'Tersedia' di inventaris.`}
          confirmLabel="Ya, Kosongkan Semua Pegawai"
          cancelLabel="Batal"
          variant="danger"
          onConfirm={() => {
            setIsClearAllConfirmOpen(false);
            if (onClearAllPegawai) {
              onClearAllPegawai();
            }
          }}
          onCancel={() => setIsClearAllConfirmOpen(false)}
        />
      )}
    </div>
  );
};
