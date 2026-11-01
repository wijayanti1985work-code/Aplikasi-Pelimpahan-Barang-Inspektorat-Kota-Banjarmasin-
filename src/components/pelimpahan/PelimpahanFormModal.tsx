import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  Search,
  Package,
  User,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Layers,
  Calendar,
} from 'lucide-react';
import type { BarangBMD, Pegawai, PelimpahanBMD, Ruangan } from '../../types/index.ts';
import { formatRupiah, generateNomorDokumen, labelKondisi, getTanggalDinasDetail, formatLokasiRuang, findRuanganForItem } from '../../utils/logic.ts';

interface PelimpahanFormModalProps {
  initialData?: PelimpahanBMD;
  pegawaiList: Pegawai[];
  barangList: BarangBMD[];
  ruanganList?: Ruangan[];
  existingPelimpahanCount: number;
  onSave: (data: PelimpahanBMD) => void;
  onClose: () => void;
}

export const PelimpahanFormModal: React.FC<PelimpahanFormModalProps> = ({
  initialData,
  pegawaiList,
  barangList,
  ruanganList = [],
  existingPelimpahanCount,
  onSave,
  onClose,
}) => {
  const currentYear = new Date().getFullYear();
  const nextSeq = existingPelimpahanCount + 1;

  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>(
    initialData?.idPegawai || (pegawaiList[0]?.id ?? '')
  );

  const [selectedBarangIds, setSelectedBarangIds] = useState<string[]>(
    initialData?.barangIds || []
  );

  const [nomorBAST, setNomorBAST] = useState<string>(
    initialData?.nomorBAST || generateNomorDokumen('BAST', nextSeq, currentYear)
  );

  const [nomorSK, setNomorSK] = useState<string>(
    initialData?.nomorSK || generateNomorDokumen('SK', nextSeq, currentYear)
  );

  const [nomorSPTJM, setNomorSPTJM] = useState<string>(
    initialData?.nomorSPTJM || generateNomorDokumen('SPTJM', nextSeq, currentYear)
  );

  const [tanggal, setTanggal] = useState<string>(
    initialData?.tanggal || new Date().toISOString().slice(0, 10)
  );

  const tglDetail = getTanggalDinasDetail(tanggal);

  const [keperluan, setKeperluan] = useState<string>(
    initialData?.keperluan ||
      'Menunjang kelancaran pelaksanaan tugas pengawasan, reviu, monitoring, dan pemeriksaan tahunan di lingkungan Inspektorat Daerah Kota Banjarmasin.'
  );

  const [catatan, setCatatan] = useState<string>(
    initialData?.catatan || 'Barang diserahkan dalam keadaan lengkap fisik, aksesoris orisinal, dan berfungsi normal.'
  );

  const [barangSearch, setBarangSearch] = useState('');
  const [filterRuang, setFilterRuang] = useState('Semua');

  const selectedPegawai = pegawaiList.find(p => p.id === selectedPegawaiId);

  // Filter selectable items (include already selected ones or available ones)
  const selectableBarang = barangList.filter(b => {
    // If editing, allow currently assigned items for this record
    const isCurrentlyInThis = initialData?.barangIds.includes(b.id);
    const isTersedia = b.statusPemakaian === 'Tersedia';
    return isTersedia || isCurrentlyInThis;
  });

  const filteredBarangList = selectableBarang.filter(b => {
    const q = barangSearch.toLowerCase();
    const matchSearch =
      !q ||
      b.namaBarang.toLowerCase().includes(q) ||
      b.kodeBarang.toLowerCase().includes(q) ||
      b.merkTipe.toLowerCase().includes(q) ||
      b.noSeri.toLowerCase().includes(q);

    const formattedItemRoom = formatLokasiRuang(b, ruanganList);
    const matchedRoom = findRuanganForItem(b, ruanganList);
    const matchRuang =
      filterRuang === 'Semua' ||
      b.kodeLokasiRuang === filterRuang ||
      formattedItemRoom === filterRuang ||
      matchedRoom?.kodeRuang === filterRuang ||
      matchedRoom?.namaRuang === filterRuang;
    return matchSearch && matchRuang;
  });

  const toggleSelectBarang = (id: string) => {
    setSelectedBarangIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const selectedItemsData = barangList.filter(b => selectedBarangIds.includes(b.id));
  const totalNilaiSelected = selectedItemsData.reduce((acc, b) => acc + (b.nilaiPerolehan || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPegawaiId) {
      alert('Pilih Pegawai Pemegang terlebih dahulu!');
      return;
    }
    if (selectedBarangIds.length === 0) {
      alert('Pilih minimal satu Barang Milik Daerah (BMD) untuk dilimpahkan!');
      return;
    }

    const payload: PelimpahanBMD = {
      id: initialData?.id || 'pel-' + Date.now(),
      nomorBAST: nomorBAST.trim(),
      nomorSK: nomorSK.trim(),
      nomorSPTJM: nomorSPTJM.trim(),
      tanggal,
      idPegawai: selectedPegawaiId,
      barangIds: selectedBarangIds,
      keperluan: keperluan.trim(),
      statusDokumen: initialData?.statusDokumen || 'Draf',
      catatan: catatan.trim(),
      tandaTanganPihakPertama: initialData?.tandaTanganPihakPertama,
      tandaTanganPihakKedua: initialData?.tandaTanganPihakKedua,
      tandaTanganPenggunaBarang: initialData?.tandaTanganPenggunaBarang,
    };

    onSave(payload);
  };

  const uniqueRooms = [
    'Semua',
    ...new Set([
      ...ruanganList.map(r => `[${r.kodeRuang}] ${r.namaRuang}`),
      ...barangList.map(b => formatLokasiRuang(b, ruanganList)),
    ]),
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {initialData ? 'Ubah Data Pelimpahan BMD' : 'Formulir Pelimpahan BMD Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                Penetapan hak pakai aset inventaris daerah kepada pegawai Inspektorat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Pemegang & Tanggal */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              1. Pihak Kedua (Pegawai Pemakai / Pemegang BMD)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Pegawai Pemakai <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedPegawaiId}
                  onChange={e => setSelectedPegawaiId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 font-medium"
                  required
                >
                  {pegawaiList.map(peg => (
                    <option key={peg.id} value={peg.id}>
                      {peg.nama} - {peg.jabatan} ({peg.unitKerja})
                    </option>
                  ))}
                </select>

                {selectedPegawai && (
                  <div className="mt-2 p-2.5 bg-white rounded-lg border border-slate-200 text-xs space-y-0.5">
                    <p className="font-semibold text-slate-800">{selectedPegawai.nama}</p>
                    <p className="text-slate-600">NIP. {selectedPegawai.nip} · {selectedPegawai.pangkatGol}</p>
                    <p className="text-slate-500">{selectedPegawai.jabatan} - {selectedPegawai.unitKerja}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Berita Acara & Penetapan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                  required
                />
                <p className="mt-1.5 text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/80 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Hari: <b className="font-bold text-teal-900">{tglDetail.hari}</b> ({tglDetail.hariTanggalFormatted})</span>
                </p>

                <div className="mt-2 space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                      Nomor BAST Otomatis
                    </label>
                    <input
                      type="text"
                      value={nomorBAST}
                      onChange={e => setNomorBAST(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/80">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                  Nomor SK Inspektur
                </label>
                <input
                  type="text"
                  value={nomorSK}
                  onChange={e => setNomorSK(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                  Nomor SPTJM Bermaterai
                </label>
                <input
                  type="text"
                  value={nomorSPTJM}
                  onChange={e => setNomorSPTJM(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pemilihan Multi Barang BMD */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  2. Pilih Barang Milik Daerah (Multi-Aset)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Satu pegawai dapat dilimpahkan lebih dari satu barang (misal: Laptop + Printer + Kendaraan Dinas).
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-slate-800">
                  Terpilih: <span className="text-blue-700 font-bold">{selectedBarangIds.length} Barang</span>
                </span>
                <span className="text-xs text-slate-500 ml-2">
                  ({formatRupiah(totalNilaiSelected)})
                </span>
              </div>
            </div>

            {/* Filter & Search Barang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={barangSearch}
                  onChange={e => setBarangSearch(e.target.value)}
                  placeholder="Cari nama barang, NIB, merk, plat/seri..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <select
                  value={filterRuang}
                  onChange={e => setFilterRuang(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                >
                  {uniqueRooms.map(r => (
                    <option key={r} value={r}>
                      Lokasi: {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Item Checklist Table */}
            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden max-h-60 overflow-y-auto">
              {filteredBarangList.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Tidak ada barang yang cocok dengan filter atau semua barang sedang dipakai.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2.5 w-10 text-center">Pilih</th>
                      <th className="p-2.5">Barang & Spesifikasi</th>
                      <th className="p-2.5">Kode / No. Seri</th>
                      <th className="p-2.5">Kondisi</th>
                      <th className="p-2.5 text-right">Nilai Aset</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBarangList.map(item => {
                      const isSelected = selectedBarangIds.includes(item.id);
                      const kondisi = labelKondisi(item.kondisi);
                      return (
                        <tr
                          key={item.id}
                          onClick={() => toggleSelectBarang(item.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50/70 hover:bg-blue-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by row click
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                            />
                          </td>
                          <td className="p-2.5">
                            <p className="font-semibold text-slate-900">{item.namaBarang}</p>
                            <p className="text-[11px] text-slate-500">{item.merkTipe}</p>
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-600">
                            <div>{item.kodeBarang}</div>
                            <div className="text-slate-400">{item.noSeri}</div>
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${kondisi.bg} ${kondisi.color}`}
                            >
                              {kondisi.full}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-medium text-slate-800">
                            {formatRupiah(item.nilaiPerolehan)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* List of Selected Items Preview */}
            {selectedItemsData.length > 0 && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1.5">
                <span className="text-[11px] font-bold text-blue-900">Daftar Barang Terpilih untuk Pemakai Ini:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItemsData.map((item, idx) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200 text-xs text-slate-800 shadow-2xs"
                    >
                      <span className="font-medium text-blue-900">{idx + 1}.</span>
                      <span className="font-medium">{item.namaBarang}</span>
                      <span className="text-slate-400">({item.noSeri})</span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          toggleSelectBarang(item.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Keperluan & Catatan */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keperluan / Peruntukan Pemakaian <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={keperluan}
                onChange={e => setKeperluan(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Kondisi / Kelengkapan Penyerahan
              </label>
              <input
                type="text"
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              * Dokumen BAST, SK, dan SPTJM otomatis dapat dicetak setelah pelimpahan disimpan.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                {initialData ? 'Perbarui Pelimpahan' : 'Simpan & Terbitkan BAST'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
