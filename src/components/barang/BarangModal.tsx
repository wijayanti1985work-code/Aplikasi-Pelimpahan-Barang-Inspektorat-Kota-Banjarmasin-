import React, { useState } from 'react';
import { X, Package, Upload, Check, AlertCircle, Camera, Banknote } from 'lucide-react';
import type { BarangBMD, KondisiBarang, StatusPemakaian, Ruangan } from '../../types/index.ts';
import { terbilangRupiah, findRuanganForItem } from '../../utils/logic.ts';

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
  const [fotoBarang, setFotoBarang] = useState(
    initialData?.fotoBarang || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80'
  );

  const [errorMsg, setErrorMsg] = useState('');

  // Handle formatted numeric input with thousands separator
  const handleNilaiInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleanedDigits = rawVal.replace(/\D/g, '');

    if (!cleanedDigits) {
      setDisplayNilai('');
      setNilaiPerolehan(0);
      return;
    }

    const numericValue = parseInt(cleanedDigits, 10);
    // Format with Indonesian thousand separators (e.g. 15.000.000)
    setDisplayNilai(new Intl.NumberFormat('id-ID').format(numericValue));
    setNilaiPerolehan(numericValue);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Ukuran foto maksimal 3 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        setFotoBarang(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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

    // No restrictive range validation: any non-negative number is valid
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

    onSave(payload);
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

          {/* Photo Upload & Preview */}
          <div className="flex items-center gap-5 p-4 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB]">
            <div className="relative group shrink-0">
              <img
                src={fotoBarang}
                alt="Preview Barang"
                className="w-24 h-20 rounded-xl object-cover border-2 border-white shadow-xs"
              />
              <label
                htmlFor="photo-upload-bmd"
                className="absolute inset-0 bg-slate-900/60 rounded-xl text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px]"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                Ganti
              </label>
              <input
                id="photo-upload-bmd"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-[#111827]">Foto Fisik Barang Milik Daerah</p>
              <p className="text-[#6B7280] text-[11px]">
                Unggah dokumentasi fisik aset (label barcode/NIB atau nomor seri tampak jelas).
              </p>
              <label
                htmlFor="photo-upload-bmd-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[11px] font-semibold text-[#111827] cursor-pointer transition-colors shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-[#0F766E]" />
                Pilih Foto Barang
              </label>
              <input
                id="photo-upload-bmd-btn"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
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
