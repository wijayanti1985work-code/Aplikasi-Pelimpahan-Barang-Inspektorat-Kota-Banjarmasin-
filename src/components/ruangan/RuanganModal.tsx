import React, { useState } from 'react';
import { X, DoorOpen, Building2, User, FileText, Check, AlertCircle } from 'lucide-react';
import type { Ruangan } from '../../types/index.ts';

interface RuanganModalProps {
  initialData?: Ruangan;
  existingRuanganList: Ruangan[];
  onSave: (ruangan: Ruangan) => void;
  onClose: () => void;
}

export const RuanganModal: React.FC<RuanganModalProps> = ({
  initialData,
  existingRuanganList,
  onSave,
  onClose,
}) => {
  const [kodeRuang, setKodeRuang] = useState(
    initialData?.kodeRuang || `R.0${existingRuanganList.length + 1}`
  );
  const [namaRuang, setNamaRuang] = useState(initialData?.namaRuang || '');
  const [lantaiGedung, setLantaiGedung] = useState(
    initialData?.lantaiGedung || 'Lantai 2 Gedung PDAM'
  );
  const [penanggungJawab, setPenanggungJawab] = useState(initialData?.penanggungJawab || '');
  const [keterangan, setKeterangan] = useState(initialData?.keterangan || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!kodeRuang.trim()) {
      setErrorMsg('Kode Ruangan wajib diisi!');
      return;
    }
    if (!namaRuang.trim()) {
      setErrorMsg('Nama Ruangan wajib diisi!');
      return;
    }

    // Check duplicate kodeRuang
    const isDuplicate = existingRuanganList.some(
      r => r.kodeRuang.trim().toLowerCase() === kodeRuang.trim().toLowerCase() && r.id !== initialData?.id
    );
    if (isDuplicate) {
      setErrorMsg(`Kode Ruangan "${kodeRuang}" sudah terdaftar. Gunakan kode lain.`);
      return;
    }

    const payload: Ruangan = {
      id: initialData?.id || 'ruang-' + Date.now(),
      kodeRuang: kodeRuang.trim().toUpperCase(),
      namaRuang: namaRuang.trim(),
      lantaiGedung: lantaiGedung.trim() || 'Lantai 2 Gedung PDAM',
      penanggungJawab: penanggungJawab.trim() || undefined,
      keterangan: keterangan.trim() || undefined,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F766E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <DoorOpen className="w-5 h-5 text-[#CCFBF1]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {initialData ? 'Ubah Data Lokasi / Ruangan' : 'Tambah Master Ruangan Baru'}
              </h3>
              <p className="text-xs text-teal-100">
                Data master penempatan aset BMD Inspektorat Kota Banjarmasin
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Ruangan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={kodeRuang}
                onChange={e => setKodeRuang(e.target.value.toUpperCase())}
                placeholder="Contoh: R.01, R.06, GUDANG"
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all uppercase"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Kode unik identifikasi ruangan
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gedung / Lantai
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={lantaiGedung}
                  onChange={e => setLantaiGedung(e.target.value)}
                  placeholder="Contoh: Lantai 2 Gedung PDAM"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Ruangan / Lokasi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={namaRuang}
              onChange={e => setNamaRuang(e.target.value)}
              placeholder="Contoh: Ruang Riksa Irban I, Ruang Sekretariat / Aset"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Penanggung Jawab Ruangan (Opsional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={penanggungJawab}
                onChange={e => setPenanggungJawab(e.target.value)}
                placeholder="Contoh: Inspektur Pembantu Wilayah I, Kasubbag Umum"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan / Fungsi Ruangan (Opsional)
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              placeholder="Fungsi ruangan atau catatan penempatan inventaris..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {initialData ? 'Simpan Perubahan' : 'Tambahkan Ruangan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
