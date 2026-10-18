import React, { useState } from 'react';
import { X, Upload, Check, User, AlertCircle, Camera } from 'lucide-react';
import type { Pegawai, StatusPegawai } from '../../types/index.ts';

interface PegawaiModalProps {
  initialData?: Pegawai;
  onSave: (pegawai: Pegawai) => void;
  onClose: () => void;
}

const UNIT_KERJA_OPTIONS = [
  'Inspektorat Pembantu Wilayah I',
  'Inspektorat Pembantu Wilayah II',
  'Inspektorat Pembantu Wilayah III',
  'Inspektorat Pembantu Khusus',
  'Sekretariat',
];

const PANGKAT_GOL_OPTIONS = [
  'Pengatur Muda / II/a',
  'Pengatur Muda Tingkat I / II/b',
  'Pengatur / II/c',
  'Pengatur Tingkat I / II/d',
  'Penata Muda / III/a',
  'Penata Muda Tingkat I / III/b',
  'Penata / III/c',
  'Penata Tingkat I / III/d',
  'Pembina / IV/a',
  'Pembina Tingkat I / IV/b',
  'Pembina Utama Muda / IV/c',
  'Pembina Utama Madya / IV/d',
  'Pembina Utama / IV/e',
];

export const PegawaiModal: React.FC<PegawaiModalProps> = ({
  initialData,
  onSave,
  onClose,
}) => {
  const [nama, setNama] = useState(initialData?.nama || '');
  const [nip, setNip] = useState(initialData?.nip || '');
  const [pangkatGol, setPangkatGol] = useState(initialData?.pangkatGol || 'Penata / III/c');
  const [jabatan, setJabatan] = useState(initialData?.jabatan || 'Auditor Ahli Pertama');
  const [unitKerja, setUnitKerja] = useState(initialData?.unitKerja || UNIT_KERJA_OPTIONS[0]);
  const [status, setStatus] = useState<StatusPegawai>(initialData?.status || 'Aktif');
  const [masaKerjaJabatan, setMasaKerjaJabatan] = useState(initialData?.masaKerjaJabatan || '2 Tahun 0 Bulan');
  const [email, setEmail] = useState(initialData?.email || '');
  const [telepon, setTelepon] = useState(initialData?.telepon || '');
  const [foto, setFoto] = useState(
    initialData?.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
  );

  const [errorMsg, setErrorMsg] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        setFoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setErrorMsg('Nama pegawai tidak boleh kosong');
      return;
    }
    if (!nip.trim()) {
      setErrorMsg('NIP tidak boleh kosong');
      return;
    }

    const payload: Pegawai = {
      id: initialData?.id || 'peg-' + Date.now(),
      nama: nama.trim(),
      nip: nip.trim(),
      pangkatGol,
      jabatan: jabatan.trim(),
      unitKerja,
      status,
      masaKerjaJabatan: masaKerjaJabatan.trim(),
      email: email.trim() || undefined,
      telepon: telepon.trim() || undefined,
      foto,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold">
              {initialData ? 'Ubah Data Pegawai Pemakai BMD' : 'Tambah Pegawai Pemakai BMD Baru'}
            </h2>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Photo Preview & Upload */}
          <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative group shrink-0">
              <img
                src={foto}
                alt="Preview"
                className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-sm"
              />
              <label
                htmlFor="photo-upload-input"
                className="absolute inset-0 bg-slate-900/60 rounded-xl text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px]"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                Ganti
              </label>
              <input
                id="photo-upload-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-slate-800">Foto Profil Pegawai</p>
              <p className="text-slate-500 text-[11px]">
                Unggah pasfoto resmi pegawai berlatar belakang rapi (JPG/PNG, maks 2MB).
              </p>
              <label
                htmlFor="photo-upload-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Pilih File Foto
              </label>
              <input
                id="photo-upload-btn"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap & Gelar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={e => setNama(e.target.value)}
                placeholder="Contoh: H. Akhmad Ridhani, S.Sos., M.A.P."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP (18 Digit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nip}
                onChange={e => setNip(e.target.value)}
                placeholder="Contoh: 197508142000031005"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pangkat / Golongan Ruang
              </label>
              <select
                value={pangkatGol}
                onChange={e => setPangkatGol(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                {PANGKAT_GOL_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jabatan Dinas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={jabatan}
                onChange={e => setJabatan(e.target.value)}
                placeholder="Contoh: Auditor Ahli Muda"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Kerja / Wilayah Kerja
              </label>
              <select
                value={unitKerja}
                onChange={e => setUnitKerja(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                {UNIT_KERJA_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Kepegawaian
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as StatusPegawai)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Masa Kerja Jabatan
              </label>
              <input
                type="text"
                value={masaKerjaJabatan}
                onChange={e => setMasaKerjaJabatan(e.target.value)}
                placeholder="Contoh: 3 Tahun 4 Bulan"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Dinas (Opsional)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@banjarmasinkota.go.id"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Telepon / WA (Opsional)
              </label>
              <input
                type="text"
                value={telepon}
                onChange={e => setTelepon(e.target.value)}
                placeholder="0812xxxxxxx"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
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
              Simpan Data Pegawai
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
