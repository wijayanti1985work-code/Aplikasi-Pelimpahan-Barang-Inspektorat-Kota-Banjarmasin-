import React, { useState, useRef } from 'react';
import {
  X,
  Package,
  Upload,
  Check,
  AlertCircle,
  Camera,
  Banknote,
  Loader2,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { BarangBMD, KondisiBarang, StatusPemakaian, Ruangan } from '../../types/index.ts';
import { terbilangRupiah, findRuanganForItem } from '../../utils/logic.ts';
import {
  compressImageFile,
  getBase64SizeKb,
  formatSize,
  PRESET_ASSET_PHOTOS,
} from '../../utils/imageCompressor.ts';

interface BarangModalProps {
  initialData?: BarangBMD;
  ruanganList?: Ruangan[];
  onSave: (barang: BarangBMD) => void;
  onClose: () => void;
}

const DEFAULT_RUANG_OPTIONS = [
  '[R.01] Ruang Riksa Irban I',
  '[R.02] Ruang Riksa Irban II',
  '[R.03] Ruang Riksa Irban III',
  '[R.04] Ruang Investigasi Irban Khusus',
  '[R.05] Ruang Sekretariat / Subbag Umum & Kepegawaian',
  '[R.06] Ruang Rapat Utama Inspektorat',
  '[R.07] Ruang Pengurus Barang & Aset',
  '[R.08] Garasi Kendaraan Dinas Inspektorat',
  '[R.09] Gudang Aset / BMD',
  '[R.10] Ruang Riksa Irban IV',
];

const DEFAULT_PHOTO_PLACEHOLDER =
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80';

export const BarangModal: React.FC<BarangModalProps> = ({
  initialData,
  ruanganList,
  onSave,
  onClose,
}) => {
  const roomOptions =
    ruanganList && ruanganList.length > 0
      ? ruanganList.map(r => `[${r.kodeRuang}] ${r.namaRuang}`)
      : DEFAULT_RUANG_OPTIONS;

  const [kodeBarang, setKodeBarang] = useState(
    initialData?.kodeBarang || `1.3.2.05.01.${Math.floor(100 + Math.random() * 900)}`
  );
  const [namaBarang, setNamaBarang] = useState(initialData?.namaBarang || '');
  const [merkTipe, setMerkTipe] = useState(initialData?.merkTipe || '');
  const [noSeri, setNoSeri] = useState(initialData?.noSeri || '');
  const [tahunPerolehan, setTahunPerolehan] = useState(initialData?.tahunPerolehan || new Date().getFullYear());
  const [jumlah, setJumlah] = useState(initialData?.jumlah || 1);
  const [satuan, setSatuan] = useState(initialData?.satuan || 'Unit');

  // Nilai Perolehan with Thousands Separator
  const initialNilai = initialData?.nilaiPerolehan ?? 0;
  const [nilaiPerolehan, setNilaiPerolehan] = useState<number>(initialNilai);
  const [displayNilai, setDisplayNilai] = useState<string>(
    initialNilai > 0 ? new Intl.NumberFormat('id-ID').format(initialNilai) : initialNilai === 0 ? '0' : ''
  );

  const [kondisi, setKondisi] = useState<KondisiBarang>(initialData?.kondisi || 'B');
  const [sumberDana, setSumberDana] = useState(initialData?.sumberDana || `APBD Kota Banjarmasin TA ${new Date().getFullYear()}`);

  const matchedRoom = initialData && ruanganList ? findRuanganForItem(initialData, ruanganList) : null;
  const initialRoomVal = matchedRoom
    ? `[${matchedRoom.kodeRuang}] ${matchedRoom.namaRuang}`
    : initialData?.kodeLokasiRuang || roomOptions[0];
  const [kodeLokasiRuang, setKodeLokasiRuang] = useState(initialRoomVal);
  const [keterangan, setKeterangan] = useState(initialData?.keterangan || '');

  // Photo States with compression & multi-mode
  const [fotoBarang, setFotoBarang] = useState<string>(
    initialData?.fotoBarang || DEFAULT_PHOTO_PLACEHOLDER
  );
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [photoSizeBadge, setPhotoSizeBadge] = useState<string>(() => {
    if (initialData?.fotoBarang) {
      const kb = getBase64SizeKb(initialData.fotoBarang);
      return kb > 0 ? `Ukuran: ${formatSize(kb)}` : 'Foto Tersimpan';
    }
    return 'Foto Standar';
  });
  const [photoInputMode, setPhotoInputMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [urlInputVal, setUrlInputVal] = useState('');
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle formatted numeric input with thousands separator
  const handleNilaiInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanedDigits = rawVal.replace(/\D/g, '');

    if (!cleanedDigits) {
      setDisplayNilai('');
      setNilaiPerolehan(0);
      return;
    }

    const numericValue = parseInt(cleanedDigits, 10);
    setDisplayNilai(new Intl.NumberFormat('id-ID').format(numericValue));
    setNilaiPerolehan(numericValue);
  };

  /**
   * Automatic Canvas Compression Upload Handler
   * Resizes camera/phone photos to max 1000px and compresses to ~40-75 KB JPEG.
   * Completely bypasses LocalStorage 5MB quota and Firestore 1MB document limit.
   */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsCompressingPhoto(true);

    try {
      // Automatic canvas compression with high quality retention
      const result = await compressImageFile(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.78,
        targetMaxKb: 150,
      });

      setFotoBarang(result.dataUrl);
      setPhotoSizeBadge(`Ukuran: ${formatSize(result.sizeKb)} (Terkoreksi Ringan)`);
      setSuccessMsg(`Foto berhasil dioptimalkan (${formatSize(result.originalSizeKb)} ➔ ${formatSize(result.sizeKb)}) dan siap disimpan.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Photo compression error:', err);
      setErrorMsg(err?.message || 'Gagal memproses foto gambar. Pastikan file berupa foto yang valid.');
    } finally {
      setIsCompressingPhoto(false);
      // Reset input value so selecting the same photo triggers onChange
      if (e.target) e.target.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!urlInputVal.trim()) {
      setErrorMsg('Masukkan URL gambar yang valid.');
      return;
    }
    setFotoBarang(urlInputVal.trim());
    setPhotoSizeBadge('Tautan URL Eksternal');
    setUrlInputVal('');
    setPhotoInputMode('upload');
    setSuccessMsg('URL foto berhasil diterapkan.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSelectPreset = (url: string, label: string) => {
    setFotoBarang(url);
    setPhotoSizeBadge(`Preset: ${label}`);
    setShowPresetPicker(false);
    setSuccessMsg(`Foto "${label}" berhasil dipilih.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleResetPhoto = () => {
    setFotoBarang(DEFAULT_PHOTO_PLACEHOLDER);
    setPhotoSizeBadge('Foto Standar');
    setSuccessMsg('Foto dikembalikan ke foto standar.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!namaBarang.trim()) {
      setErrorMsg('Nama barang tidak boleh kosong');
      return;
    }
    if (!kodeBarang.trim()) {
      setErrorMsg('Kode Barang / NIB tidak boleh kosong');
      return;
    }

    const finalNilai = isNaN(nilaiPerolehan) || nilaiPerolehan < 0 ? 0 : nilaiPerolehan;

    const payload: BarangBMD = {
      id: initialData?.id || 'bmd-' + Date.now(),
      kodeBarang: kodeBarang.trim(),
      namaBarang: namaBarang.trim(),
      merkTipe: merkTipe.trim() || '-',
      noSeri: noSeri.trim() || '-',
      tahunPerolehan: Number(tahunPerolehan) || new Date().getFullYear(),
      jumlah: Number(jumlah) || 1,
      satuan: satuan.trim() || 'Unit',
      nilaiPerolehan: finalNilai,
      kondisi,
      sumberDana: sumberDana.trim(),
      kodeLokasiRuang,
      fotoBarang,
      statusPemakaian: initialData?.statusPemakaian || ('Tersedia' as StatusPemakaian),
      idPegawaiPemakai: initialData?.idPegawaiPemakai,
      tanggalPelimpahan: initialData?.tanggalPelimpahan,
      keterangan: keterangan.trim(),
    };

    try {
      onSave(payload);
    } catch (saveErr: any) {
      console.error('Error in onSave:', saveErr);
      setErrorMsg('Gagal menyimpan data barang: ' + (saveErr?.message || 'Terjadi kesalahan sistem'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden text-[#111827]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F766E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#CCFBF1] uppercase tracking-wider">
                Manajemen Inventaris BMD
              </span>
              <h2 className="text-base font-bold text-white">
                {initialData ? 'Ubah Data Inventaris BMD' : 'Tambah Inventaris BMD Baru'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Photo Section with Multi-mode & Canvas Optimizer */}
          <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#0F766E]" />
                  Foto Dokumentasi Fisik Barang Milik Daerah (BMD)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {photoSizeBadge}
                </span>
              </div>

              {/* Mode switch buttons */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E2E8F0] text-[11px]">
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('upload')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    photoInputMode === 'upload'
                      ? 'bg-[#0F766E] text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Unggah Foto
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('url')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    photoInputMode === 'url'
                      ? 'bg-[#0F766E] text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tautan URL
                </button>
                <button
                  type="button"
                  onClick={() => setShowPresetPicker(prev => !prev)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    showPresetPicker
                      ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  Galeri Standar
                </button>
              </div>
            </div>

            {/* Photo Preview & Upload Controls */}
            <div className="flex items-start gap-4">
              <div className="relative group shrink-0">
                <img
                  src={fotoBarang}
                  alt="Preview Barang"
                  className="w-28 h-24 rounded-xl object-cover border-2 border-white shadow-md bg-slate-100"
                  onError={() => {
                    // Fallback to placeholder if url fails
                    setFotoBarang(DEFAULT_PHOTO_PLACEHOLDER);
                  }}
                />
                {isCompressingPhoto && (
                  <div className="absolute inset-0 bg-slate-950/70 rounded-xl flex flex-col items-center justify-center text-white text-[10px] gap-1">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-300" />
                    <span>Mengompres...</span>
                  </div>
                )}
                <label
                  htmlFor="photo-upload-bmd-quick"
                  className="absolute inset-0 bg-slate-900/60 rounded-xl text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px]"
                  title="Ganti Foto"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  Ganti Foto
                </label>
                <input
                  id="photo-upload-bmd-quick"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1 space-y-2 text-xs">
                {photoInputMode === 'upload' && (
                  <div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Pilih foto dari kamera ponsel atau komputer (label NIB, merek, nomor seri terlihat jelas). Foto akan
                      <strong className="text-teal-700"> dioptimalkan & dikompres otomatis</strong> sehingga tersimpan cepat dan tidak membebani memori.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <label
                        htmlFor="photo-upload-bmd-main"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F766E] hover:bg-[#0d6861] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        {isCompressingPhoto ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Memproses Foto...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            Pilih File Foto / Buka Kamera
                          </>
                        )}
                      </label>
                      <input
                        id="photo-upload-bmd-main"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={handleResetPhoto}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl text-[11px] font-medium transition-colors cursor-pointer"
                        title="Kembalikan ke foto standar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Reset Foto
                      </button>
                    </div>
                  </div>
                )}

                {photoInputMode === 'url' && (
                  <div className="space-y-1.5">
                    <p className="text-slate-600 text-[11px]">
                      Masukkan tautan langsung gambar (Google Drive publik, server foto, atau tautan gambar web):
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={urlInputVal}
                          onChange={e => setUrlInputVal(e.target.value)}
                          placeholder="https://example.com/foto-laptop.jpg"
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        className="px-3 py-1.5 bg-[#0F766E] hover:bg-[#0d6861] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Terapkan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Preset Asset Gallery Modal / Collapsible */}
            {showPresetPicker && (
              <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Pilih Foto Standar Kategori BMD (1-Klik Terapkan):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPresetPicker(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                  {PRESET_ASSET_PHOTOS.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url, preset.label)}
                      className="group p-1.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-400 rounded-xl text-left transition-all cursor-pointer flex flex-col items-center"
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-14 rounded-lg object-cover mb-1 border border-slate-200 group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] font-semibold text-slate-800 text-center line-clamp-1 leading-tight group-hover:text-teal-800">
                        {preset.label}
                      </span>
                      <span className="text-[9px] text-slate-500 line-clamp-1">
                        {preset.kategori}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Kode Barang / NIB <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={kodeBarang}
                onChange={e => setKodeBarang(e.target.value)}
                placeholder="Contoh: 1.3.2.05.01.01.001"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl font-mono focus:ring-2 focus:ring-[#0F766E]/20 text-[#111827] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Nama / Jenis Barang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={namaBarang}
                onChange={e => setNamaBarang(e.target.value)}
                placeholder="Contoh: Laptop Pengawasan / Kendaraan Dinas"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#0F766E]/20 text-[#111827] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Merk / Tipe / Spesifikasi Teknis
              </label>
              <input
                type="text"
                value={merkTipe}
                onChange={e => setMerkTipe(e.target.value)}
                placeholder="Contoh: ASUS ExpertBook Core i7 / 16GB"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                No. Seri / No. Rangka / No. Polisi
              </label>
              <input
                type="text"
                value={noSeri}
                onChange={e => setNoSeri(e.target.value)}
                placeholder="Contoh: DA 1024 BZ / SN: 948194X"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl font-mono text-[#111827] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Tahun Perolehan
              </label>
              <input
                type="number"
                value={tahunPerolehan}
                onChange={e => setTahunPerolehan(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Jumlah & Satuan
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  value={jumlah}
                  onChange={e => setJumlah(Number(e.target.value))}
                  min={1}
                  className="w-16 px-2.5 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-center focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
                />
                <input
                  type="text"
                  value={satuan}
                  onChange={e => setSatuan(e.target.value)}
                  placeholder="Unit"
                  className="w-full px-2 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-center focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Nilai Perolehan with Thousands Separator & Free Range */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#111827] mb-1 flex items-center justify-between">
                <span>Nilai Perolehan Aset</span>
                <span className="text-[11px] font-normal text-[#6B7280]">
                  Bebas nominal (tanpa batasan range)
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#0F766E]">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayNilai}
                  onChange={handleNilaiInputChange}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl font-mono text-[#111827] font-semibold tracking-wide focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] focus:outline-none"
                />
              </div>

              {/* Terbilang Spelled-out live preview */}
              <div className="mt-1 px-1">
                {nilaiPerolehan > 0 ? (
                  <p className="text-[11px] text-[#0F766E] font-medium italic flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 shrink-0" />
                    <span>Terbilang: {terbilangRupiah(nilaiPerolehan)}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-[#6B7280]">
                    Ketik angka nominal (titik pemisah ribuan akan ditambahkan otomatis).
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Kondisi Barang Milik Daerah
              </label>
              <select
                value={kondisi}
                onChange={e => setKondisi(e.target.value as KondisiBarang)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] font-semibold focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
              >
                <option value="B">Baik (B) - Siap Pakai</option>
                <option value="RR">Rusak Ringan (RR) - Perlu Servis</option>
                <option value="RB">Rusak Berat (RB) - Usul Hapus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Lokasi / Kode Ruangan
              </label>
              <select
                value={kodeLokasiRuang}
                onChange={e => setKodeLokasiRuang(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
              >
                {roomOptions.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1">
                Sumber Dana Pengadaan
              </label>
              <input
                type="text"
                value={sumberDana}
                onChange={e => setSumberDana(e.target.value)}
                placeholder="Contoh: APBD Kota Banjarmasin"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1">
              Keterangan / Kelengkapan Tambahan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              placeholder="Contoh: Termasuk tas bawaan orisinal, charger, buku manual"
              className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:ring-2 focus:ring-[#0F766E]/20 focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#111827] bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Simpan Data Inventaris
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
