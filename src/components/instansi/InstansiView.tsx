import React, { useState } from 'react';
import {
  Building2,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  Camera,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  Sliders,
} from 'lucide-react';
import type { InstansiConfig } from '../../types/index.ts';
import { DEFAULT_INSTANSI } from '../../services/storage.ts';
import { ConfirmModal } from '../common/ConfirmModal.tsx';
import { LOGO_PEMKOT_BANJARMASIN_BASE64 } from '../../assets/logoPemko.ts';

interface InstansiViewProps {
  instansi: InstansiConfig;
  onSaveInstansi: (config: InstansiConfig) => void;
}

export const InstansiView: React.FC<InstansiViewProps> = ({
  instansi,
  onSaveInstansi,
}) => {
  const [form, setForm] = useState<InstansiConfig>({ ...instansi });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean) => {
    const file = e.target.files?.[0];
    setUploadError('');
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Ukuran file logo melebihi 2 MB. Silakan gunakan format PNG/JPG yang lebih ringkas.');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        if (isPrimary) {
          setForm(prev => ({ ...prev, logoUtamaUrl: event.target?.result as string }));
        } else {
          setForm(prev => ({ ...prev, logoSekunderUrl: event.target?.result as string }));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInstansi(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    setForm({ ...DEFAULT_INSTANSI });
    onSaveInstansi({ ...DEFAULT_INSTANSI });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded border border-[#0F766E]/20">
              Master Profil Instansi & Tata Naskah
            </span>
            <span className="text-xs text-[#6B7280]">Pengaturan Kop Dokumen Resmi</span>
          </div>
          <h2 className="text-lg font-bold text-[#111827] mt-1">
            Setting Profil Instansi, Kop Surat & Logo
          </h2>
          <p className="text-xs text-[#6B7280]">
            Kustomisasi nama instansi, alamat, logo daerah, dan format garis kop dinas yang tampil pada BAST, SK, dan SPTJM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Tersimpan & Terhubung!
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            Setelan Awal
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-center justify-between gap-2">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError('')}
            className="text-rose-500 hover:text-rose-700 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Live Preview of Kop Dinas */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-600" />
            Pratinjau Langsung Kop Surat Dinas
          </span>
          <span className="text-[11px] text-slate-400">
            Tampilan ini akan otomatis digunakan pada BAST, SK, dan SPTJM saat dicetak atau diunduh Word.
          </span>
        </div>

        {/* Kop Box */}
        <div className="bg-slate-50 p-6 sm:p-8 rounded-xl border border-slate-200 font-serif-doc text-slate-900">
          <div
            className={`pb-3 ${
              form.ketebalanGarisKop === 'double'
                ? 'border-b-[3px] border-double border-slate-900'
                : form.ketebalanGarisKop === 'thick-thin'
                ? 'border-b-2 border-slate-900'
                : 'border-b border-slate-900'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Logo Kiri (Utama) */}
              <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                <img
                  src={form.logoUtamaUrl || LOGO_PEMKOT_BANJARMASIN_BASE64}
                  alt="Logo Pemerintah Kota Banjarmasin"
                  className="max-h-20 max-w-20 object-contain"
                />
              </div>

              {/* Teks Kop Surat */}
              <div className="flex-1 text-center font-serif-doc">
                <h3 className="text-sm sm:text-base font-bold tracking-wider text-slate-900 uppercase">
                  {form.namaPemda}
                </h3>
                <h2 className="text-lg sm:text-2xl font-black tracking-wide text-slate-900 uppercase">
                  {form.namaInstansi}
                </h2>
                <p className="text-[10pt] text-slate-700 leading-tight mt-1">
                  {form.alamat}
                </p>
                <p className="text-[9pt] text-slate-600 leading-tight mt-0.5">
                  Telepon {form.telepon}, Faksimile {form.faksimile} · Pos-el: {form.email} · Laman: {form.website}
                </p>
              </div>

              {/* Logo Kanan (Opsional) */}
              {form.tampilkanLogoKanan && (
                <div className="w-20 h-20 shrink-0 hidden sm:flex items-center justify-center">
                  {form.logoSekunderUrl ? (
                    <img
                      src={form.logoSekunderUrl}
                      alt="Logo Sekunder"
                      className="max-h-20 max-w-20 object-contain"
                    />
                  ) : (
                    <div className="w-16 h-16 border-2 border-slate-900 rounded-full flex flex-col items-center justify-center text-[8pt] text-center font-bold p-1">
                      <span>INSPEKTORAT</span>
                      <span className="text-[7pt] text-emerald-800">KOTA BJM</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Setting Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          Formulir Pengaturan Kop & Identitas Dinas
        </h3>

        {/* Bagian Logo Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          {/* Logo Utama */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              1. Logo Utama (Kiri Kop)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white border-2 border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={form.logoUtamaUrl || LOGO_PEMKOT_BANJARMASIN_BASE64}
                  alt="Logo Utama"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-[11px] text-slate-500">
                  Format PNG transparan atau JPG (maks 2MB). Jika dikosongkan, logo default Banjarmasin digunakan.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <label
                    htmlFor="logo-utama-input"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Pilih File Logo
                  </label>
                  <input
                    id="logo-utama-input"
                    type="file"
                    accept="image/*"
                    onChange={e => handleLogoUpload(e, true)}
                    className="hidden"
                  />
                  {form.logoUtamaUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logoUtamaUrl: '' })}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Logo Sekunder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                2. Logo Sekunder / Cap Kanan (Opsional)
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.tampilkanLogoKanan}
                  onChange={e => setForm({ ...form, tampilkanLogoKanan: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Tampilkan di Kop</span>
              </label>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white border-2 border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
                {form.logoSekunderUrl ? (
                  <img src={form.logoSekunderUrl} alt="Logo Sekunder" className="w-full h-full object-contain p-1" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-[11px] text-slate-500">
                  Cap dinas instansi, sertifikasi ISO, atau logo BerAKHLAK (maks 2MB).
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <label
                    htmlFor="logo-sekunder-input"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Pilih File Logo
                  </label>
                  <input
                    id="logo-sekunder-input"
                    type="file"
                    accept="image/*"
                    onChange={e => handleLogoUpload(e, false)}
                    className="hidden"
                  />
                  {form.logoSekunderUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logoSekunderUrl: '' })}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Teks Instansi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Pemerintah Daerah <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.namaPemda}
              onChange={e => setForm({ ...form, namaPemda: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Instansi / Badan / Dinas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.namaInstansi}
              onChange={e => setForm({ ...form, namaInstansi: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Alamat Kantor Lengkap <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.alamat}
            onChange={e => setForm({ ...form, alamat: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Telepon
            </label>
            <input
              type="text"
              value={form.telepon}
              onChange={e => setForm({ ...form, telepon: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Faksimile
            </label>
            <input
              type="text"
              value={form.faksimile}
              onChange={e => setForm({ ...form, faksimile: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Resmi (Pos-el)
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Laman Resmi (Website)
            </label>
            <input
              type="text"
              value={form.website}
              onChange={e => setForm({ ...form, website: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Semboyan Daerah / Tagline
            </label>
            <input
              type="text"
              value={form.semboyan || ''}
              onChange={e => setForm({ ...form, semboyan: e.target.value })}
              placeholder="Contoh: KAYUH BAIMBAI"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Model Garis Pembatas Kop Surat
            </label>
            <select
              value={form.ketebalanGarisKop}
              onChange={e => setForm({ ...form, ketebalanGarisKop: e.target.value as any })}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
            >
              <option value="double">Garis Ganda Resmi (Double Line - Standar Naskah Dinas)</option>
              <option value="solid">Garis Tunggal Ramping (Single Line)</option>
              <option value="thick-thin">Garis Tebal (Thick Line)</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Simpan Pengaturan Instansi
          </button>
        </div>
      </form>

      {/* Confirmation Modal for Resetting to Defaults */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Kembalikan ke Setelan Awal?"
        message="Pengaturan profil instansi, format kop dinas, dan logo akan dikembalikan ke data standar Inspektorat Kota Banjarmasin."
        confirmLabel="Ya, Kembalikan ke Standar"
        cancelLabel="Batal"
        variant="warning"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
