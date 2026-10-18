import React, { useState } from 'react';
import { X, Package, Upload, Check, AlertCircle, Camera } from 'lucide-react';
import type { BarangBMD, KondisiBarang, StatusPemakaian } from '../../types/index.ts';

interface BarangModalProps {
  initialData?: BarangBMD;
  onSave: (barang: BarangBMD) => void;
  onClose: () => void;
}

const RUANG_OPTIONS = [
  'Ruang Riksa Irban I',
  'Ruang Riksa Irban II',
  'Ruang Riksa Irban III',
  'Ruang Investigasi Irban Khusus',
  'Ruang Sekretariat / Aset',
  'Ruang Rapat Utama Inspektorat',
  'Garasi Inspektorat Kota Banjarmasin',
  'Gudang Aset / BMD',
];

export const BarangModal: React.FC<BarangModalProps> = ({
  initialData,
  onSave,
  onClose,
}) => {
  const [kodeBarang, setKodeBarang] = useState(
    initialData?.kodeBarang || `1.3.2.05.01.${Math.floor(100 + Math.random() * 900)}`
  );
  const [namaBarang, setNamaBarang] = useState(initialData?.namaBarang || '');
  const [merkTipe, setMerkTipe] = useState(initialData?.merkTipe || '');
  const [noSeri, setNoSeri] = useState(initialData?.noSeri || '');
  const [tahunPerolehan, setTahunPerolehan] = useState(initialData?.tahunPerolehan || new Date().getFullYear());
  const [jumlah, setJumlah] = useState(initialData?.jumlah || 1);
  const [satuan, setSatuan] = useState(initialData?.satuan || 'Unit');
  const [nilaiPerolehan, setNilaiPerolehan] = useState(initialData?.nilaiPerolehan || 0);
  const [kondisi, setKondisi] = useState<KondisiBarang>(initialData?.kondisi || 'B');
  const [sumberDana, setSumberDana] = useState(initialData?.sumberDana || `APBD Kota Banjarmasin TA ${new Date().getFullYear()}`);
  const [kodeLokasiRuang, setKodeLokasiRuang] = useState(initialData?.kodeLokasiRuang || RUANG_OPTIONS[0]);
  const [keterangan, setKeterangan] = useState(initialData?.keterangan || '');
  const [fotoBarang, setFotoBarang] = useState(
    initialData?.fotoBarang || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80'
  );

  const [errorMsg, setErrorMsg] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran foto maksimal 3 MB');
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
    if (!namaBarang.trim()) {
      setErrorMsg('Nama barang tidak boleh kosong');
      return;
    }
    if (!kodeBarang.trim()) {
      setErrorMsg('Kode Barang / NIB tidak boleh kosong');
      return;
    }

    const payload: BarangBMD = {
      id: initialData?.id || 'bmd-' + Date.now(),
      kodeBarang: kodeBarang.trim(),
      namaBarang: namaBarang.trim(),
      merkTipe: merkTipe.trim() || '-',
      noSeri: noSeri.trim() || '-',
      tahunPerolehan: Number(tahunPerolehan),
      jumlah: Number(jumlah) || 1,
      satuan: satuan.trim() || 'Unit',
      nilaiPerolehan: Number(nilaiPerolehan) || 0,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold">
              {initialData ? 'Ubah Data Inventaris BMD' : 'Tambah Inventaris BMD Baru'}
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

          {/* Photo Upload & Preview */}
          <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="relative group shrink-0">
              <img
                src={fotoBarang}
                alt="Preview Barang"
                className="w-24 h-20 rounded-xl object-cover border-2 border-white shadow-sm"
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
              <p className="font-semibold text-slate-800">Foto Fisik Barang Milik Daerah</p>
              <p className="text-slate-500 text-[11px]">
                Unggah dokumentasi fisik aset (label barcode/NIB, nomor seri tampak jelas).
              </p>
              <label
                htmlFor="photo-upload-bmd-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Barang / NIB <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={kodeBarang}
                onChange={e => setKodeBarang(e.target.value)}
                placeholder="Contoh: 1.3.2.05.01.01.001"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama / Jenis Barang <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={namaBarang}
                onChange={e => setNamaBarang(e.target.value)}
                placeholder="Contoh: Laptop Pengawasan / Kendaraan Dinas"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Merk / Tipe / Spesifikasi Teknis
              </label>
              <input
                type="text"
                value={merkTipe}
                onChange={e => setMerkTipe(e.target.value)}
                placeholder="Contoh: ASUS ExpertBook Core i7 / 16GB"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Seri / No. Rangka / No. Polisi
              </label>
              <input
                type="text"
                value={noSeri}
                onChange={e => setNoSeri(e.target.value)}
                placeholder="Contoh: DA 1024 BZ / SN: 948194X"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Perolehan
              </label>
              <input
                type="number"
                value={tahunPerolehan}
                onChange={e => setTahunPerolehan(Number(e.target.value))}
                min={2000}
                max={2030}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah & Satuan
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  value={jumlah}
                  onChange={e => setJumlah(Number(e.target.value))}
                  min={1}
                  className="w-16 px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 text-center"
                />
                <input
                  type="text"
                  value={satuan}
                  onChange={e => setSatuan(e.target.value)}
                  placeholder="Unit"
                  className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 text-center"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nilai Perolehan (Rp)
              </label>
              <input
                type="number"
                value={nilaiPerolehan}
                onChange={e => setNilaiPerolehan(Number(e.target.value))}
                min={0}
                step={50000}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kondisi Barang Milik Daerah
              </label>
              <select
                value={kondisi}
                onChange={e => setKondisi(e.target.value as KondisiBarang)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                <option value="B">Baik (B) - Siap Pakai</option>
                <option value="RR">Rusak Ringan (RR) - Perlu Servis</option>
                <option value="RB">Rusak Berat (RB) - Usul Hapus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi / Kode Ruangan
              </label>
              <select
                value={kodeLokasiRuang}
                onChange={e => setKodeLokasiRuang(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                {RUANG_OPTIONS.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sumber Dana Pengadaan
              </label>
              <input
                type="text"
                value={sumberDana}
                onChange={e => setSumberDana(e.target.value)}
                placeholder="Contoh: APBD Kota Banjarmasin"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan / Kelengkapan Tambahan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              placeholder="Contoh: Termasuk tas bawaan orisinal, charger, buku manual"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
            />
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
              Simpan Data Inventaris
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
