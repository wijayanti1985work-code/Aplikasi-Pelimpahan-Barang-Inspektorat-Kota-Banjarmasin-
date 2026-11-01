export type KondisiBarang = 'B' | 'RR' | 'RB'; // Baik, Rusak Ringan, Rusak Berat
export type StatusPegawai = 'Aktif' | 'Mutasi/Pindah' | 'Pensiun' | 'Non-Aktif';
export type StatusPemakaian = 'Tersedia' | 'Dipakai';
export type StatusDokumen = 'Draf' | 'Disahkan';

export interface PelepasanItemAction {
  idBarang: string;
  kodeBarang: string;
  namaBarang: string;
  merkTipe: string;
  noSeri: string;
  kondisi: KondisiBarang;
  tindakan: 'Gudang' | 'AlihkanPegawai';
  idPegawaiBaru?: string;
  namaPegawaiBaru?: string;
}

export interface PelepasanAsetRecord {
  id: string;
  nomorBAP: string; // e.g. "027/012/BAP-BMD/ITK-BJM/2026"
  tanggal: string;  // YYYY-MM-DD
  idPegawaiAsal: string;
  namaPegawaiAsal: string;
  nipPegawaiAsal: string;
  jabatanPegawaiAsal: string;
  unitKerjaPegawaiAsal: string;
  alasan: 'Mutasi/Pindah Tugas' | 'Purna Tugas (Pensiun)' | 'Penarikan Dinas Rutin';
  keteranganAlasan?: string;
  items: PelepasanItemAction[];
  idPejabatPengurus?: string;
  namaPejabatPengurus?: string;
  nipPejabatPengurus?: string;
  idInspektur?: string;
  namaInspektur?: string;
  nipInspektur?: string;
  statusPegawaiBaru: StatusPegawai;
  createdAt: string;
}

export interface Pejabat {
  id: string;
  peran: 'Pengguna Barang' | 'Pengurus Barang';
  nama: string;
  nip: string;
  pangkatGol: string;
  jabatan: string;
  instansi: string;
  tandaTanganUrl?: string;
}

export interface Pegawai {
  id: string;
  nama: string;
  nip: string;
  pangkatGol: string;
  jabatan: string;
  foto: string;
  unitKerja: string;
  wilayahKerja?: string; // Wilayah kerja / lingkup pengawasan spesifik pegawai
  status: StatusPegawai;
  masaKerjaJabatan: string;
  email?: string;
  telepon?: string;
  alamat?: string;
}

export interface BarangBMD {
  id: string;
  kodeBarang: string; // NIB / Kode Registrasi Barang
  namaBarang: string;
  merkTipe: string;
  noSeri: string; // No. Seri Pabrik / No. Rangka / No. Polisi
  tahunPerolehan: number;
  jumlah: number;
  satuan: string;
  nilaiPerolehan: number; // Rupiah
  kondisi: KondisiBarang;
  sumberDana: string;
  kodeLokasiRuang: string;
  fotoBarang: string;
  statusPemakaian: StatusPemakaian;
  idPegawaiPemakai?: string; // ID Pegawai jika sedang dipakai
  tanggalPelimpahan?: string;
  keterangan?: string;
}

export interface PelimpahanBMD {
  id: string;
  nomorBAST: string;
  nomorSK: string;
  nomorSPTJM: string;
  tanggal: string; // YYYY-MM-DD
  idPegawai: string;
  barangIds: string[];
  keperluan: string;
  statusDokumen: StatusDokumen;
  tandaTanganPihakPertama?: string; // Pengurus Barang
  tandaTanganPihakKedua?: string;   // Pegawai Pemegang
  tandaTanganPenggunaBarang?: string; // Inspektur
  catatan?: string;
}

export interface DashboardStats {
  totalPegawai: number;
  pegawaiAktif: number;
  totalBarang: number;
  barangTerpakai: number;
  barangTersedia: number;
  totalNilaiAset: number;
  kondisiBaik: number;
  kondisiRusakRingan: number;
  kondisiRusakBerat: number;
  totalPelimpahan: number;
}

export interface InstansiConfig {
  namaPemda: string;          // e.g. "PEMERINTAH KOTA BANJARMASIN"
  namaInstansi: string;       // e.g. "INSPEKTORAT DAERAH"
  subJudul?: string;          // e.g. "KOTA BANJARMASIN"
  alamat: string;             // e.g. "Jalan RE Martadinata No. 1 Gedung Blok B Lantai 2 Banjarmasin Kode Pos 70111"
  telepon: string;            // e.g. "(0511) 3353844"
  faksimile: string;          // e.g. "(0511) 3353844"
  email: string;              // e.g. "inspektorat@banjarmasinkota.go.id"
  website: string;            // e.g. "inspektorat.banjarmasinkota.go.id"
  semboyan?: string;          // e.g. "KAYUH BAIMBAI"
  logoUtamaUrl: string;       // DataURL or URL
  logoSekunderUrl?: string;   // Secondary logo/stamp
  tampilkanLogoKanan: boolean;
  ketebalanGarisKop: 'double' | 'solid' | 'thick-thin';
}

export interface GoogleSheetBackupRecord {
  id: string;
  spreadsheetId: string;
  spreadsheetUrl: string;
  spreadsheetTitle: string;
  createdAt: string;
  accountEmail?: string;
  totalPegawai: number;
  totalBarang: number;
  totalPelimpahan: number;
}

export interface Ruangan {
  id: string;
  kodeRuang: string; // e.g. "R.01", "R.02", "SEC.01"
  namaRuang: string; // e.g. "Ruang Riksa Irban I"
  lantaiGedung: string; // e.g. "Lantai 2 Gedung Blok B"
  penanggungJawab?: string;
  keterangan?: string;
}

export interface UnitKerja {
  id: string;
  kodeUnit: string;        // e.g. "SET", "IRBAN-I", "IRBAN-II", "IRBAN-III", "IRBAN-IV", "IRBAN-SUS"
  namaUnit: string;        // e.g. "Inspektorat Pembantu Wilayah I", "Sekretariat"
  wilayahKerja: string;    // e.g. "Kecamatan Banjarmasin Tengah & Perangkat Daerah Bidang Tata Pemerintahan dan Hukum"
  namaPimpinan?: string;   // Nama Kepala / Pimpinan Unit
  nipPimpinan?: string;    // NIP Pimpinan
  jabatanPimpinan?: string;// Jabatan Pimpinan
  kontakUnit?: string;     // No Telp / Ext / WA
  keterangan?: string;     // Deskripsi tugas pengawasan atau fungsi
  createdAt?: string;
}

