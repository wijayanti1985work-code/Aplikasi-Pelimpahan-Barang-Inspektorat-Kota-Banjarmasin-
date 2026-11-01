import React, { useState } from 'react';
import { X, Network, Building2, User, Phone, FileText, Check, AlertCircle, MapPin } from 'lucide-react';
import type { UnitKerja } from '../../types/index.ts';

interface UnitKerjaModalProps {
  initialData?: UnitKerja;
  existingUnitKerjaList: UnitKerja[];
  onSave: (unitKerja: UnitKerja) => void;
  onClose: () => void;
}

export const UnitKerjaModal: React.FC<UnitKerjaModalProps> = ({
  initialData,
  existingUnitKerjaList,
  onSave,
  onClose,
}) => {
  const [kodeUnit, setKodeUnit] = useState(initialData?.kodeUnit || '');
  const [namaUnit, setNamaUnit] = useState(initialData?.namaUnit || '');
  const [wilayahKerja, setWilayahKerja] = useState(initialData?.wilayahKerja || '');
  const [namaPimpinan, setNamaPimpinan] = useState(initialData?.namaPimpinan || '');
  const [nipPimpinan, setNipPimpinan] = useState(initialData?.nipPimpinan || '');
  const [jabatanPimpinan, setJabatanPimpinan] = useState(initialData?.jabatanPimpinan || '');
  const [kontakUnit, setKontakUnit] = useState(initialData?.kontakUnit || '');
  const [keterangan, setKeterangan] = useState(initialData?.keterangan || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!kodeUnit.trim()) {
      setErrorMsg('Kode Unit / Singkatan wajib diisi!');
      return;
    }
    if (!namaUnit.trim()) {
      setErrorMsg('Nama Unit Kerja wajib diisi!');
      return;
    }
    if (!wilayahKerja.trim()) {
      setErrorMsg('Wilayah Kerja / Lingkup Pengawasan wajib diisi!');
      return;
    }

    // Check duplicate kodeUnit (case insensitive)
    const isDuplicateKode = existingUnitKerjaList.some(
      u => u.kodeUnit.trim().toLowerCase() === kodeUnit.trim().toLowerCase() && u.id !== initialData?.id
    );
    if (isDuplicateKode) {
      setErrorMsg(`Kode Unit "${kodeUnit}" sudah digunakan oleh unit lain.`);
      return;
    }

    const payload: UnitKerja = {
      id: initialData?.id || 'unit-' + Date.now(),
      kodeUnit: kodeUnit.trim().toUpperCase(),
      namaUnit: namaUnit.trim(),
      wilayahKerja: wilayahKerja.trim(),
      namaPimpinan: namaPimpinan.trim() || undefined,
      nipPimpinan: nipPimpinan.trim() || undefined,
      jabatanPimpinan: jabatanPimpinan.trim() || undefined,
      kontakUnit: kontakUnit.trim() || undefined,
      keterangan: keterangan.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F766E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Network className="w-5 h-5 text-[#CCFBF1]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {initialData ? 'Ubah Data Unit / Wilayah Kerja' : 'Tambah Master Unit / Wilayah Kerja'}
              </h3>
              <p className="text-xs text-teal-100">
                Inspektorat Kota Banjarmasin - Struktur Organisasi & Pengawasan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-teal-100 hover:text-white hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Kode Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Unit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={kodeUnit}
                onChange={e => setKodeUnit(e.target.value)}
                placeholder="mis. IRBAN-I, SET"
                className="w-full px-3 py-2 text-sm uppercase rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
              />
              <span className="text-[10px] text-slate-400">Singkatan / ID unit</span>
            </div>

            {/* Nama Unit */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Unit Kerja <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaUnit}
                onChange={e => setNamaUnit(e.target.value)}
                placeholder="mis. Inspektorat Pembantu Wilayah I"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
              />
            </div>
          </div>

          {/* Wilayah Kerja / Lingkup Pengawasan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Wilayah Kerja / Lingkup Pengawasan <span className="text-rose-500">*</span></span>
            </label>
            <textarea
              required
              rows={2}
              value={wilayahKerja}
              onChange={e => setWilayahKerja(e.target.value)}
              placeholder="mis. Kecamatan Banjarmasin Tengah & Perangkat Daerah Bidang Tata Pemerintahan, Hukum, dan Aparatur"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent resize-none"
            />
            <span className="text-[10px] text-slate-400">Cakupan wilayah teritorial kecamatan dan OPD binaan yang diawasi</span>
          </div>

          {/* Section: Pimpinan Unit */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <User className="w-4 h-4 text-teal-600" />
              <span>Pimpinan Unit Kerja / Penanggung Jawab</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nama Pimpinan (beserta gelar)
                </label>
                <input
                  type="text"
                  value={namaPimpinan}
                  onChange={e => setNamaPimpinan(e.target.value)}
                  placeholder="mis. Ahmad Fauzi, S.E., M.Si, Ak, CA"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  NIP Pimpinan
                </label>
                <input
                  type="text"
                  value={nipPimpinan}
                  onChange={e => setNipPimpinan(e.target.value)}
                  placeholder="mis. 19820315 200604 1 009"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Jabatan Pimpinan
                </label>
                <input
                  type="text"
                  value={jabatanPimpinan}
                  onChange={e => setJabatanPimpinan(e.target.value)}
                  placeholder="mis. Inspektur Pembantu Wilayah I"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>Kontak / Ext / No. HP Unit</span>
                </label>
                <input
                  type="text"
                  value={kontakUnit}
                  onChange={e => setKontakUnit(e.target.value)}
                  placeholder="mis. 0812-5111-1021 / Ext. 101"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>
            </div>
          </div>

          {/* Keterangan / Uraian Tugas Pengawasan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Keterangan & Uraian Tugas Pengawasan</span>
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              placeholder="mis. Pengawasan intern, audit kinerja, reviu tata kelola, dan evaluasi akuntabilitas kinerja OPD..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-teal-800 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Perbarui Unit' : 'Simpan Unit Kerja'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
