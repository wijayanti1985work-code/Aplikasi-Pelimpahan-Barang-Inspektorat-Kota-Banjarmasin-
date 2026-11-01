import React, { useState, useMemo } from 'react';
import {
  Network,
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  Users,
  Package,
  Banknote,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Eye,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  FileText,
  X,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import type { UnitKerja, Pegawai, BarangBMD, InstansiConfig } from '../../types/index.ts';
import { formatRupiah, labelKondisi } from '../../utils/logic.ts';
import { UnitKerjaModal } from './UnitKerjaModal.tsx';
import { ConfirmModal } from '../common/ConfirmModal.tsx';

interface UnitKerjaViewProps {
  unitKerjaList: UnitKerja[];
  pegawaiList: Pegawai[];
  barangList: BarangBMD[];
  instansi: InstansiConfig;
  onAddUnitKerja: (u: UnitKerja) => void;
  onUpdateUnitKerja: (u: UnitKerja) => void;
  onDeleteUnitKerja: (id: string) => void;
  onSyncUnitsFromPegawai?: (newUnits: UnitKerja[]) => void;
}

// Menghitung skor kecocokan antara data pegawai dengan Unit Kerja (0 - 100).
// Menggunakan batasan ketat (word boundary dan negative lookahead) agar tidak terjadi tumpang tindih
// (Contoh: "Wilayah III" TIDAK BOLEH mencocokkan "Wilayah I").
export const calculatePegawaiUnitMatchScore = (p: Pegawai, unit: UnitKerja): number => {
  const pUnit = (p.unitKerja || '').trim().toLowerCase();
  const pWilayah = (p.wilayahKerja || '').trim().toLowerCase();
  const uName = (unit.namaUnit || '').trim().toLowerCase();
  const uCode = (unit.kodeUnit || '').trim().toLowerCase();
  const uWilayah = (unit.wilayahKerja || '').trim().toLowerCase();

  if (!pUnit && !pWilayah) return 0;

  // 1. Kecocokan Pasti (Exact Match) pada Kode Unit atau Nama Unit (Prioritas Tertinggi: 100)
  if (pUnit === uName || pUnit === uCode) {
    return 100;
  }

  // 2. Kecocokan Nama Bersih (tanpa spasi/tanda minus)
  const cleanP = pUnit.replace(/[\s\-_]/g, '');
  const cleanUCode = uCode.replace(/[\s\-_]/g, '');
  const cleanUName = uName.replace(/[\s\-_]/g, '');
  if (cleanP === cleanUCode || cleanP === cleanUName) {
    return 98;
  }

  // 3. Pengecekan Khusus Unit Irban I - IV dengan Batasan Ketat (Negative Lookahead)
  // Menghindari bug klasik di mana 'wilayah iii' atau 'wilayah ii' mengandung substring 'wilayah i'
  const isTargetUnitIV = uCode.includes('irban-iv') || uName.includes('wilayah iv') || uName.includes('wilayah 4');
  const isTargetUnitIII = uCode.includes('irban-iii') || uName.includes('wilayah iii') || uName.includes('wilayah 3');
  const isTargetUnitII = uCode.includes('irban-ii') || uName.includes('wilayah ii') || uName.includes('wilayah 2');
  const isTargetUnitI =
    (uCode.includes('irban-i') && !uCode.includes('irban-ii') && !uCode.includes('irban-iii') && !uCode.includes('irban-iv')) ||
    (uName.includes('wilayah i') && !uName.includes('wilayah ii') && !uName.includes('wilayah iii') && !uName.includes('wilayah iv')) ||
    uName.includes('wilayah 1');

  if (isTargetUnitIV) {
    if (/\b(?:irban|wilayah|pembantu\s*wilayah)?\s*[-_]?\s*(?:iv|4)(?![0-9a-z])/i.test(pUnit)) return 92;
    if (/\b(?:banjarmasin\s*barat|banjarmasin\s*timur)\b/i.test(pUnit) || /\b(?:banjarmasin\s*barat|banjarmasin\s*timur)\b/i.test(pWilayah)) return 70;
  } else if (isTargetUnitIII) {
    if (/\b(?:irban|wilayah|pembantu\s*wilayah)?\s*[-_]?\s*(?:iii|3)(?![0-9a-z])/i.test(pUnit)) return 92;
    if (/\bbanjarmasin\s*selatan\b/i.test(pUnit) || /\bbanjarmasin\s*selatan\b/i.test(pWilayah)) return 70;
  } else if (isTargetUnitII) {
    // Harus TIDAK diikuti huruf 'i' (agar 'wilayah iii' tidak cocok ke unit ii)
    if (/\b(?:irban|wilayah|pembantu\s*wilayah)?\s*[-_]?\s*(?:ii|2)(?![iv0-9a-z])/i.test(pUnit)) return 92;
    if (/\bbanjarmasin\s*utara\b/i.test(pUnit) || /\bbanjarmasin\s*utara\b/i.test(pWilayah)) return 70;
  } else if (isTargetUnitI) {
    // Harus TIDAK diikuti huruf 'i', 'v', atau digit (agar 'wilayah ii', 'wilayah iii', 'wilayah iv' tidak cocok ke unit i)
    if (/\b(?:irban|wilayah|pembantu\s*wilayah)?\s*[-_]?\s*(?:i|1)(?![iv0-9a-z])/i.test(pUnit)) return 92;
    if (/\bbanjarmasin\s*tengah\b/i.test(pUnit) || /\bbanjarmasin\s*tengah\b/i.test(pWilayah)) return 70;
  }

  // 4. Irban Khusus / Sus / Investigasi
  if (uCode.includes('sus') || uName.includes('khusus')) {
    if (/\b(?:khusus|irban[-_ ]?sus|irbansus|investigasi|saber\s*pungli|tlhp)\b/i.test(pUnit)) return 92;
    if (/\b(?:khusus|investigasi|saber\s*pungli)\b/i.test(pWilayah)) return 75;
  }

  // 5. Sekretariat / SET / Subbagian
  if (uCode === 'set' || uName.includes('sekretariat')) {
    if (/\b(?:sekretariat|subbag|umum|kepegawaian|keuangan|perencanaan|set)\b/i.test(pUnit)) return 92;
    if (/\b(?:sekretariat|subbag|tata\s*usaha)\b/i.test(pWilayah)) return 75;
  }

  // 6. Substring match pada nama unit (hanya bila nama unit spesifik & panjang > 4 karakter)
  if (uName.length > 5 && pUnit.includes(uName)) return 80;
  if (pUnit.length > 5 && uName.includes(pUnit)) return 75;

  // 7. Wilayah Kerja exact or token match
  if (pWilayah && uWilayah) {
    if (pWilayah === uWilayah) return 80;
    if (pWilayah.length > 6 && uWilayah.includes(pWilayah)) return 60;
    if (uWilayah.length > 6 && pWilayah.includes(uWilayah)) return 60;
  }

  return 0;
};

export const isPegawaiMatchedToUnit = (p: Pegawai, unit: UnitKerja): boolean => {
  return calculatePegawaiUnitMatchScore(p, unit) > 0;
};

export const UnitKerjaView: React.FC<UnitKerjaViewProps> = ({
  unitKerjaList,
  pegawaiList,
  barangList,
  instansi,
  onAddUnitKerja,
  onUpdateUnitKerja,
  onDeleteUnitKerja,
  onSyncUnitsFromPegawai,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitKerja | null>(null);
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<UnitKerja | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string; pegawaiCount: number } | null>(null);

  // =========================================================================
  // 1-TO-1 STRICT PARTITION (HINDARI DATA GANDA: 1 ORANG HANYA DI 1 UNIT)
  // Tiap pegawai dipetakan secara eksklusif hanya ke 1 unit dengan skor tertinggi.
  // =========================================================================
  const { unitToPegawaiMap, unmappedPegawai } = useMemo(() => {
    const unitMap = new Map<string, Pegawai[]>();
    const unmapped: Pegawai[] = [];

    // Inisialisasi wadah penampung unik untuk tiap unit
    unitKerjaList.forEach(u => unitMap.set(u.id, []));

    // Iterasi setiap pegawai tepat 1 kali
    pegawaiList.forEach(p => {
      let bestUnit: UnitKerja | null = null;
      let highestScore = 0;

      for (const unit of unitKerjaList) {
        const score = calculatePegawaiUnitMatchScore(p, unit);
        if (score > highestScore) {
          highestScore = score;
          bestUnit = unit;
        }
      }

      // Hanya petakan ke unit jika skor kecocokan valid (> 0)
      if (bestUnit && highestScore > 0) {
        unitMap.get(bestUnit.id)?.push(p);
      } else {
        unmapped.push(p);
      }
    });

    return {
      unitToPegawaiMap: unitMap,
      unmappedPegawai: unmapped,
    };
  }, [pegawaiList, unitKerjaList]);

  // Linkage helper: Pegawai assigned to a unit (dijamin 100% eksklusif, tanpa duplikasi)
  const getPegawaiInUnit = (unit: UnitKerja): Pegawai[] => {
    return unitToPegawaiMap.get(unit.id) || [];
  };

  // Linkage helper: Barang BMD held by employees of this unit
  const getBarangInUnit = (unit: UnitKerja): BarangBMD[] => {
    const pegawaiInUnit = getPegawaiInUnit(unit);
    const pegawaiIds = new Set(pegawaiInUnit.map(p => p.id));
    return barangList.filter(b => b.idPegawaiPemakai && pegawaiIds.has(b.idPegawaiPemakai));
  };

  // Total valuation of assets in unit
  const getNilaiAsetInUnit = (unit: UnitKerja): number => {
    const barangInUnit = getBarangInUnit(unit);
    return barangInUnit.reduce((sum, b) => sum + (b.nilaiPerolehan || 0), 0);
  };

  // Filter units
  const filteredUnits = unitKerjaList.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.kodeUnit.toLowerCase().includes(q) ||
      u.namaUnit.toLowerCase().includes(q) ||
      u.wilayahKerja.toLowerCase().includes(q) ||
      (u.namaPimpinan && u.namaPimpinan.toLowerCase().includes(q)) ||
      (u.nipPimpinan && u.nipPimpinan.toLowerCase().includes(q)) ||
      (u.keterangan && u.keterangan.toLowerCase().includes(q))
    );
  });

  // Aggregate statistics - Dijamin tanpa duplikasi (total terpetakan <= total pegawai di database)
  const totalUnit = unitKerjaList.length;
  const totalPegawaiMapped = Array.from(unitToPegawaiMap.values()).reduce((sum, list) => sum + list.length, 0);
  const totalBarangInUnits = unitKerjaList.reduce((acc, u) => acc + getBarangInUnit(u).length, 0);
  const totalNilaiInUnits = unitKerjaList.reduce((acc, u) => acc + getNilaiAsetInUnit(u), 0);

  // Extract distinct unmapped unit names
  const distinctUnmappedUnits = Array.from(
    new Set(unmappedPegawai.map(p => (p.unitKerja || '').trim()).filter(Boolean))
  );

  const handleAutoSyncUnmappedUnits = () => {
    if (distinctUnmappedUnits.length === 0) return;
    const newUnitsToCreate: UnitKerja[] = distinctUnmappedUnits.map((uName, index) => {
      const samplePeg = unmappedPegawai.find(p => p.unitKerja === uName);
      const sampleWilayah = samplePeg?.wilayahKerja || `Lingkup Pengawasan & Wilayah Kerja ${uName}`;
      const codeCandidate = uName
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .substring(0, 6);

      const kodeUnit = codeCandidate.length >= 2 ? codeCandidate : `UNIT-${index + 1}`;
      return {
        id: 'unit-' + Date.now() + '-' + index,
        kodeUnit,
        namaUnit: uName,
        wilayahKerja: sampleWilayah,
        keterangan: 'Otomatis disinkronkan dari data pegawai',
        createdAt: new Date().toISOString().split('T')[0],
      };
    });

    if (onSyncUnitsFromPegawai) {
      onSyncUnitsFromPegawai(newUnitsToCreate);
    } else {
      newUnitsToCreate.forEach(u => onAddUnitKerja(u));
    }
  };

  const handleOpenAdd = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: UnitKerja) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleSave = (unit: UnitKerja) => {
    if (editingUnit) {
      onUpdateUnitKerja(unit);
    } else {
      onAddUnitKerja(unit);
    }
    setIsModalOpen(false);
    setEditingUnit(null);
  };

  const handleRequestDelete = (unit: UnitKerja) => {
    const pCount = getPegawaiInUnit(unit).length;
    setDeleteTarget({
      id: unit.id,
      nama: `${unit.kodeUnit} - ${unit.namaUnit}`,
      pegawaiCount: pCount,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDeleteUnitKerja(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'Kode Unit',
      'Nama Unit Kerja',
      'Wilayah Kerja / Lingkup Pengawasan',
      'Pimpinan Unit',
      'NIP Pimpinan',
      'Jabatan Pimpinan',
      'Kontak Unit',
      'Jumlah Pegawai',
      'Jumlah BMD Terpakai',
      'Total Nilai BMD (Rp)',
      'Keterangan',
    ];

    const rows = unitKerjaList.map((u, idx) => {
      const pCount = getPegawaiInUnit(u).length;
      const bCount = getBarangInUnit(u).length;
      const nilai = getNilaiAsetInUnit(u);
      return [
        idx + 1,
        `"${u.kodeUnit}"`,
        `"${u.namaUnit.replace(/"/g, '""')}"`,
        `"${u.wilayahKerja.replace(/"/g, '""')}"`,
        `"${(u.namaPimpinan || '-').replace(/"/g, '""')}"`,
        `"${u.nipPimpinan || '-'}"`,
        `"${(u.jabatanPimpinan || '-').replace(/"/g, '""')}"`,
        `"${u.kontakUnit || '-'}"`,
        pCount,
        bCount,
        nilai,
        `"${(u.keterangan || '-').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Master_Unit_Kerja_${instansi.namaInstansi.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">Master Data Unit / Wilayah Kerja</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-[#0F766E] border border-teal-200">
              {totalUnit} Unit Organisasi
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Pemetaan Eksklusif: 1 Pegawai = 1 Unit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan struktur Inspektorat Daerah Kota Banjarmasin, pembagian wilayah kerja teritorial kecamatan, dan pengawasan OPD binaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ekspor Data ke Format CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#0F766E] hover:bg-teal-800 text-white shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Unit Kerja</span>
          </button>
        </div>
      </div>

      {/* Auto-Sync Banner if there are unmapped units from pegawai */}
      {distinctUnmappedUnits.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-900">
                  Sinkronisasi Input Pegawai ke Master Unit Kerja
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                  {unmappedPegawai.length} Pegawai Belum Terdaftar di Master Unit
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Ditemukan unit kerja dari data pegawai yang belum terdaftar di Master Unit: <span className="font-semibold underline">{distinctUnmappedUnits.join(', ')}</span>.
                Klik tombol di samping untuk menyelaraskan dan mendaftarkannya secara otomatis ke Master Unit & Wilayah Kerja.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoSyncUnmappedUnits}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer self-start md:self-center"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sinkronkan ke Master Unit</span>
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Unit Kerja */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Unit Kerja</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalUnit}</h3>
            <p className="text-[11px] text-teal-600 font-medium mt-0.5">Sekretariat & Irban Wilayah</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E]">
            <Network className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Pegawai Terpetakan */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pegawai Terpetakan</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-800">{totalPegawaiMapped}</h3>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/80">
                1 Orang = 1 Unit
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">dari total {pegawaiList.length} personel (bebas duplikasi)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: BMD Terpakai di Seluruh Unit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aset BMD Terdistribusi</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{totalBarangInUnits}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">unit inventaris digunakan</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Nilai Aset BMD */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nilai Aset Terkelola</p>
            <h3 className="text-lg font-black text-slate-800 mt-1">{formatRupiah(totalNilaiInUnits)}</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">dipegang pegawai unit</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Banknote className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter, Search & View Mode Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari kode, nama unit, wilayah kerja, pimpinan..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#0F766E] shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Kartu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Kartu</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#0F766E] shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Cards or Table */}
      {filteredUnits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0F766E] mx-auto flex items-center justify-center mb-4">
            <Network className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Tidak ada Unit Kerja yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchQuery
              ? `Tidak ditemukan unit kerja dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
              : 'Belum ada data unit kerja yang ditambahkan.'}
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-[#0F766E] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
            >
              Hapus Pencarian
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-teal-800 rounded-xl transition-colors cursor-pointer"
            >
              Tambah Unit Kerja Pertama
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUnits.map(unit => {
            const pegawaiInUnit = getPegawaiInUnit(unit);
            const barangInUnit = getBarangInUnit(unit);
            const nilaiAset = getNilaiAsetInUnit(unit);

            return (
              <div
                key={unit.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 bg-linear-to-r from-slate-50/80 to-teal-50/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black tracking-wide bg-[#0F766E] text-white shadow-2xs">
                        {unit.kodeUnit}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm leading-snug">
                        {unit.namaUnit}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(unit)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        title="Ubah Unit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestDelete(unit)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Unit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Wilayah Kerja */}
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        <span>Wilayah Kerja & Lingkup Pengawasan</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {unit.wilayahKerja}
                      </p>
                    </div>

                    {/* Pimpinan Unit */}
                    {unit.namaPimpinan && (
                      <div className="pt-2 border-t border-slate-100 flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{unit.namaPimpinan}</p>
                          <p className="text-[11px] text-slate-500">
                            {unit.jabatanPimpinan || 'Pimpinan Unit'} {unit.nipPimpinan ? `• NIP: ${unit.nipPimpinan}` : ''}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Contact & Keterangan */}
                    {(unit.kontakUnit || unit.keterangan) && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        {unit.kontakUnit && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{unit.kontakUnit}</span>
                          </div>
                        )}
                        {unit.keterangan && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                            "{unit.keterangan}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary Badges: Pegawai & BMD */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-2 text-center mb-3">
                      <div className="bg-teal-50/70 border border-teal-100/80 p-2 rounded-xl">
                        <span className="block text-xs font-bold text-[#0F766E]">
                          {pegawaiInUnit.length} Pegawai
                        </span>
                        <span className="text-[10px] text-teal-700/80">Personel Unit</span>
                      </div>
                      <div className="bg-amber-50/70 border border-amber-100/80 p-2 rounded-xl">
                        <span className="block text-xs font-bold text-amber-800">
                          {barangInUnit.length} BMD
                        </span>
                        <span className="text-[10px] text-amber-700/80">{formatRupiah(nilaiAset)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedUnitForDetail(unit)}
                      className="w-full py-2 px-3 text-xs font-semibold text-[#0F766E] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Personel & Aset BMD</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4 w-28">Kode Unit</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Nama Unit Kerja</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Wilayah Kerja / Lingkup Pengawasan</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Pimpinan Unit</th>
                  <th className="py-3.5 px-4 text-center">Personel</th>
                  <th className="py-3.5 px-4 text-center">BMD Digunakan</th>
                  <th className="py-3.5 px-4 text-right">Nilai Aset</th>
                  <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnits.map((unit, idx) => {
                  const pegawaiInUnit = getPegawaiInUnit(unit);
                  const barangInUnit = getBarangInUnit(unit);
                  const nilaiAset = getNilaiAsetInUnit(unit);

                  return (
                    <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-teal-50 text-[#0F766E] border border-teal-200">
                          {unit.kodeUnit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{unit.namaUnit}</span>
                        {unit.kontakUnit && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {unit.kontakUnit}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-700 leading-relaxed font-medium line-clamp-2" title={unit.wilayahKerja}>
                          {unit.wilayahKerja}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        {unit.namaPimpinan ? (
                          <div>
                            <span className="font-semibold text-slate-800 block">{unit.namaPimpinan}</span>
                            <span className="text-[11px] text-slate-500">
                              {unit.jabatanPimpinan || 'Pimpinan Unit'} {unit.nipPimpinan ? `• NIP: ${unit.nipPimpinan}` : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-[#0F766E] border border-teal-100">
                          <Users className="w-3 h-3" />
                          {pegawaiInUnit.length}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          <Package className="w-3 h-3" />
                          {barangInUnit.length}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                        {formatRupiah(nilaiAset)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedUnitForDetail(unit)}
                            className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Personel & BMD"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(unit)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                            title="Ubah Unit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRequestDelete(unit)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Unit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: Personel & Aset BMD in Unit */}
      {selectedUnitForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0F766E] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Network className="w-5 h-5 text-[#CCFBF1]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/20 text-white">
                      {selectedUnitForDetail.kodeUnit}
                    </span>
                    <h3 className="font-bold text-base text-white">
                      {selectedUnitForDetail.namaUnit}
                    </h3>
                  </div>
                  <p className="text-xs text-teal-100">
                    Informasi terinci wilayah kerja, personel aktif, dan aset BMD yang dikelola
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUnitForDetail(null)}
                className="p-1.5 text-teal-100 hover:text-white hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Unit Overview Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Wilayah Kerja & Lingkup Pengawasan
                  </span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {selectedUnitForDetail.wilayahKerja}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Pimpinan Unit</span>
                    <span className="font-semibold text-slate-800 block">
                      {selectedUnitForDetail.namaPimpinan || '-'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedUnitForDetail.jabatanPimpinan || 'Pimpinan Unit'}
                      {selectedUnitForDetail.nipPimpinan ? ` (NIP: ${selectedUnitForDetail.nipPimpinan})` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Kontak Unit</span>
                    <span className="font-semibold text-slate-800">
                      {selectedUnitForDetail.kontakUnit || '-'}
                    </span>
                  </div>
                </div>

                {selectedUnitForDetail.keterangan && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Fungsi / Uraian Tugas</span>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {selectedUnitForDetail.keterangan}
                    </p>
                  </div>
                )}
              </div>

              {/* Tab / Section 1: Daftar Pegawai di Unit */}
              {(() => {
                const pegawaiInThisUnit = getPegawaiInUnit(selectedUnitForDetail);
                const barangInThisUnit = getBarangInUnit(selectedUnitForDetail);
                const totalNilai = getNilaiAsetInUnit(selectedUnitForDetail);

                return (
                  <div className="space-y-6">
                    {/* Section Pegawai */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#0F766E]" />
                          <h4 className="font-bold text-slate-800 text-sm">
                            Daftar Personel / Pegawai ({pegawaiInThisUnit.length})
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Status penempatan di {selectedUnitForDetail.namaUnit}
                        </span>
                      </div>

                      {pegawaiInThisUnit.length === 0 ? (
                        <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                          Belum ada pegawai yang terdaftar pada unit kerja ini.
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                          {pegawaiInThisUnit.map(peg => {
                            const assetsHeld = barangList.filter(b => b.idPegawaiPemakai === peg.id);
                            return (
                              <div key={peg.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={peg.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'}
                                    alt={peg.nama}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                                  />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs text-slate-800">{peg.nama}</span>
                                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                        peg.status === 'Aktif'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                                      }`}>
                                        {peg.status}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      {peg.jabatan} • {peg.pangkatGol} • NIP: {peg.nip}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        <Building2 className="w-2.5 h-2.5 text-slate-500" />
                                        Unit Input: {peg.unitKerja || '-'}
                                      </span>
                                      <span className="inline-flex items-center gap-1 text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/70 max-w-sm truncate" title={peg.wilayahKerja || selectedUnitForDetail.wilayahKerja}>
                                        <MapPin className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                                        Wilayah: {peg.wilayahKerja || selectedUnitForDetail.wilayahKerja}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-[#0F766E] border border-teal-100">
                                    <Package className="w-3.5 h-3.5" />
                                    <span>{assetsHeld.length} Barang BMD</span>
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Section Barang BMD */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-amber-600" />
                          <h4 className="font-bold text-slate-800 text-sm">
                            Inventaris BMD Yang Digunakan Unit ({barangInThisUnit.length})
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-amber-700">
                          Total Nilai: {formatRupiah(totalNilai)}
                        </span>
                      </div>

                      {barangInThisUnit.length === 0 ? (
                        <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                          Belum ada barang BMD yang dilimpahkan kepada pegawai di unit kerja ini.
                        </div>
                      ) : (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                              <tr>
                                <th className="py-2.5 px-3">Kode / NIB</th>
                                <th className="py-2.5 px-3">Nama Barang</th>
                                <th className="py-2.5 px-3">Pemegang</th>
                                <th className="py-2.5 px-3 text-center">Kondisi</th>
                                <th className="py-2.5 px-3 text-right">Nilai Perolehan</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {barangInThisUnit.map(b => {
                                const pemegang = pegawaiList.find(p => p.id === b.idPegawaiPemakai);
                                return (
                                  <tr key={b.id} className="hover:bg-slate-50/70">
                                    <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-600">
                                      {b.kodeBarang}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <span className="font-bold text-slate-800 block">{b.namaBarang}</span>
                                      <span className="text-[10px] text-slate-500">{b.merkTipe} {b.noSeri ? `• Seri: ${b.noSeri}` : ''}</span>
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-slate-700">
                                      {pemegang?.nama || '-'}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        b.kondisi === 'B'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : b.kondisi === 'RR'
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                                      }`}>
                                        {labelKondisi(b.kondisi).full}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                                      {formatRupiah(b.nilaiPerolehan)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Data terintegrasi otomatis dengan master pegawai & penatausahaan inventaris BMD.
              </span>
              <button
                type="button"
                onClick={() => setSelectedUnitForDetail(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah / Ubah Unit Kerja */}
      {isModalOpen && (
        <UnitKerjaModal
          initialData={editingUnit || undefined}
          existingUnitKerjaList={unitKerjaList}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUnit(null);
          }}
        />
      )}

      {/* MODAL: Konfirmasi Hapus Unit */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={true}
          title="Konfirmasi Hapus Unit Kerja"
          message={
            deleteTarget.pegawaiCount > 0
              ? `PERINGATAN: Unit kerja "${deleteTarget.nama}" saat ini masih memiliki ${deleteTarget.pegawaiCount} pegawai terdaftar. Menghapus unit ini akan menyebabkan pegawai tersebut tidak memiliki unit kerja terdaftar. Apakah Anda yakin ingin tetap menghapus?`
              : `Apakah Anda yakin ingin menghapus unit kerja "${deleteTarget.nama}" dari sistem? Tindakan ini tidak dapat dibatalkan.`
          }
          confirmLabel="Ya, Hapus Unit"
          cancelLabel="Batal"
          variant={deleteTarget.pegawaiCount > 0 ? 'warning' : 'danger'}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
