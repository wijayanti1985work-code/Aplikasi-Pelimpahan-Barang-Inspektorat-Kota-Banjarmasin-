import type {
  BarangBMD,
  Pegawai,
  Pejabat,
  PelimpahanBMD,
  InstansiConfig,
  GoogleSheetBackupRecord,
  PelepasanAsetRecord,
  Ruangan,
  UnitKerja,
} from '../types/index.ts';
import { FirestoreService, type CloudSyncState } from './firestore.ts';
import { LOGO_PEMKOT_BANJARMASIN_BASE64 } from '../assets/logoPemko.ts';
import { SEED_PEGAWAI_150, MAX_PEGAWAI_LIMIT } from '../data/seedPegawai150.ts';

export { MAX_PEGAWAI_LIMIT };

const STORAGE_KEYS = {
  PEGAWAI: 'sip_bmd_pegawai_v2',
  BARANG: 'sip_bmd_barang_v1',
  PELIMPAHAN: 'sip_bmd_pelimpahan_v1',
  PEJABAT: 'sip_bmd_pejabat_v1',
  INSTANSI: 'sip_bmd_instansi_v1',
  GSHEET_BACKUPS: 'sip_bmd_gsheet_backups_v1',
  PELEPASAN: 'sip_bmd_pelepasan_v1',
  RUANGAN: 'sip_bmd_ruangan_v1',
  UNIT_KERJA: 'sip_bmd_unit_kerja_v1',
};

export const DEFAULT_INSTANSI: InstansiConfig = {
  namaPemda: 'PEMERINTAH KOTA BANJARMASIN',
  namaInstansi: 'INSPEKTORAT',
  subJudul: 'KOTA BANJARMASIN',
  alamat: 'JALAN TIRTA DHARMA (KOMP. PDAM) RT. 34 NO. 70 BANJARMASIN 70249',
  telepon: 'WA 0812-5111-1020',
  faksimile: '(0511) 3353844',
  email: 'inspektorat@mail.banjarmasinkota.id inspbjm@gmail.com',
  website: 'inspektorat.banjarmasinkota.go.id',
  semboyan: 'KAYUH BAIMBAI',
  logoUtamaUrl: LOGO_PEMKOT_BANJARMASIN_BASE64,
  logoSekunderUrl: '',
  tampilkanLogoKanan: false,
  ketebalanGarisKop: 'double',
};

// Seed Pejabat sesuai format resmi dokumen PDF
export const SEED_PEJABAT: Pejabat[] = [
  {
    id: 'pejabat-1',
    peran: 'Pengguna Barang',
    nama: 'RABIATUL ADAWIYAH, S.H., M.H.',
    nip: '19790128 200212 2 003',
    pangkatGol: 'Pembina Tingkat I / IV b',
    jabatan: 'Inspektur Kota Banjarmasin',
    instansi: 'Inspektorat Kota Banjarmasin',
  },
  {
    id: 'pejabat-2',
    peran: 'Pengurus Barang',
    nama: 'Dian Dahniar',
    nip: '197311232007012008',
    pangkatGol: 'Penata Tingkat I / III/d',
    jabatan: 'Pengurus Barang Pengguna',
    instansi: 'Inspektorat Kota Banjarmasin',
  },
];

// Seed Master Ruangan / Kode Lokasi
export const SEED_RUANGAN: Ruangan[] = [
  {
    id: 'ruang-1',
    kodeRuang: 'R.01',
    namaRuang: 'Ruang Riksa Irban I',
    lantaiGedung: 'Lantai 2 Gedung PDAM',
    penanggungJawab: 'Inspektur Pembantu Wilayah I',
    keterangan: 'Pemeriksaan wilayah I Kota Banjarmasin',
  },
  {
    id: 'ruang-2',
    kodeRuang: 'R.02',
    namaRuang: 'Ruang Riksa Irban II',
    lantaiGedung: 'Lantai 2 Gedung PDAM',
    penanggungJawab: 'Inspektur Pembantu Wilayah II',
    keterangan: 'Pemeriksaan wilayah II Kota Banjarmasin',
  },
  {
    id: 'ruang-3',
    kodeRuang: 'R.03',
    namaRuang: 'Ruang Riksa Irban III',
    lantaiGedung: 'Lantai 2 Gedung PDAM',
    penanggungJawab: 'Inspektur Pembantu Wilayah III',
    keterangan: 'Pemeriksaan wilayah III Kota Banjarmasin',
  },
  {
    id: 'ruang-4',
    kodeRuang: 'R.04',
    namaRuang: 'Ruang Investigasi Irban Khusus',
    lantaiGedung: 'Lantai 2 Gedung PDAM',
    penanggungJawab: 'Inspektur Pembantu Khusus',
    keterangan: 'Audit investigasi dan forensik digital',
  },
  {
    id: 'ruang-5',
    kodeRuang: 'R.05',
    namaRuang: 'Ruang Sekretariat / Subbag Umum & Kepegawaian',
    lantaiGedung: 'Lantai 1 Gedung PDAM',
    penanggungJawab: 'Kasubag Umum & Kepegawaian',
    keterangan: 'Administrasi umum dan kepegawaian',
  },
  {
    id: 'ruang-6',
    kodeRuang: 'R.06',
    namaRuang: 'Ruang Rapat Utama Inspektorat',
    lantaiGedung: 'Lantai 2 Gedung PDAM',
    penanggungJawab: 'Sekretariat Inspektorat',
    keterangan: 'Pertemuan pleno dan ekspose hasil pengawasan',
  },
  {
    id: 'ruang-7',
    kodeRuang: 'R.07',
    namaRuang: 'Ruang Pengurus Barang & Aset',
    lantaiGedung: 'Lantai 1 Gedung PDAM',
    penanggungJawab: 'Pengurus Barang Pengguna',
    keterangan: 'Pengelolaan administrasi penatausahaan BMD',
  },
  {
    id: 'ruang-8',
    kodeRuang: 'R.08',
    namaRuang: 'Garasi Kendaraan Dinas Inspektorat',
    lantaiGedung: 'Area Parkir / Garasi Bawah',
    penanggungJawab: 'Pengurus Barang Pengguna',
    keterangan: 'Tempat parkir kendaraan dinas operasional roda 4 dan roda 2',
  },
  {
    id: 'ruang-9',
    kodeRuang: 'R.09',
    namaRuang: 'Gudang Aset / BMD',
    lantaiGedung: 'Lantai 1 Gedung PDAM',
    penanggungJawab: 'Pengurus Barang Pengguna',
    keterangan: 'Penyimpanan inventaris yang tersedia dan menunggu penyerahan',
  },
  {
    id: 'ruang-10',
    kodeRuang: 'R.10',
    namaRuang: 'Ruang Riksa Irban IV',
    lantaiGedung: 'Lantai 2 Gedung PDAM',
    penanggungJawab: 'Inspektur Pembantu Wilayah IV',
    keterangan: 'Pemeriksaan wilayah IV Kota Banjarmasin',
  },
];

// Seed Master Unit Kerja / Wilayah Kerja Inspektorat Kota Banjarmasin
export const SEED_UNIT_KERJA: UnitKerja[] = [
  {
    id: 'unit-1',
    kodeUnit: 'SET',
    namaUnit: 'Sekretariat',
    wilayahKerja: 'Subbagian Umum & Kepegawaian, Subbagian Keuangan, dan Subbagian Perencanaan Program & Pelaporan',
    namaPimpinan: 'Drs. H. M. Zainal Arifin, M.AP',
    nipPimpinan: '19750512 199803 1 004',
    jabatanPimpinan: 'Sekretaris Inspektorat Daerah',
    kontakUnit: '(0511) 3353844 / Ext. 101',
    keterangan: 'Penyelenggaraan koordinasi pelaksanaan tugas dan fungsi pembinaan administrasi, organisasi, keuangan, kepegawaian, perlengkapan, dan kehumasan.',
    createdAt: '2024-01-02',
  },
  {
    id: 'unit-2',
    kodeUnit: 'IRBAN-I',
    namaUnit: 'Inspektorat Pembantu Wilayah I',
    wilayahKerja: 'Kecamatan Banjarmasin Tengah & Perangkat Daerah Bidang Tata Pemerintahan, Hukum, dan Aparatur',
    namaPimpinan: 'Ahmad Fauzi, S.E., M.Si, Ak, CA',
    nipPimpinan: '19820315 200604 1 009',
    jabatanPimpinan: 'Inspektur Pembantu Wilayah I',
    kontakUnit: '0812-5111-1021',
    keterangan: 'Pengawasan intern, audit kinerja, reviu tata kelola, dan evaluasi akuntabilitas kinerja OPD di Wilayah I.',
    createdAt: '2024-01-02',
  },
  {
    id: 'unit-3',
    kodeUnit: 'IRBAN-II',
    namaUnit: 'Inspektorat Pembantu Wilayah II',
    wilayahKerja: 'Kecamatan Banjarmasin Utara & Perangkat Daerah Bidang Pendidikan, Kesehatan, dan Kesejahteraan Sosial',
    namaPimpinan: 'Hj. Siti Rahmah, S.Sos., M.Si',
    nipPimpinan: '19780822 200312 2 006',
    jabatanPimpinan: 'Inspektur Pembantu Wilayah II',
    kontakUnit: '0812-5111-1022',
    keterangan: 'Pengawasan intern, audit kepatuhan, dan pendampingan pengelolaan dana BOS, BOK, dan bantuan sosial di Wilayah II.',
    createdAt: '2024-01-02',
  },
  {
    id: 'unit-4',
    kodeUnit: 'IRBAN-III',
    namaUnit: 'Inspektorat Pembantu Wilayah III',
    wilayahKerja: 'Kecamatan Banjarmasin Selatan & Perangkat Daerah Bidang Pekerjaan Umum, Penataan Ruang, Perkim, Lingkungan Hidup, dan Dishub',
    namaPimpinan: 'Ir. H. Muhammad Ridwan, S.T., M.Eng',
    nipPimpinan: '19800614 200501 1 011',
    jabatanPimpinan: 'Inspektur Pembantu Wilayah III',
    kontakUnit: '0812-5111-1023',
    keterangan: 'Pengawasan teknis infrastruktur fisik, audit pengadaan barang dan jasa, reviu DED dan konstruksi di Wilayah III.',
    createdAt: '2024-01-02',
  },
  {
    id: 'unit-5',
    kodeUnit: 'IRBAN-IV',
    namaUnit: 'Inspektorat Pembantu Wilayah IV',
    wilayahKerja: 'Kecamatan Banjarmasin Barat & Perangkat Daerah Bidang Perekonomian, Perdagangan, Pajak Daerah, dan Pengelolaan Aset BMD',
    namaPimpinan: 'Hendra Gunawan, S.E., Ak., M.M.',
    nipPimpinan: '19840210 200801 1 005',
    jabatanPimpinan: 'Inspektur Pembantu Wilayah IV',
    kontakUnit: '0812-5111-1024',
    keterangan: 'Pengawasan pengelolaan keuangan daerah, optimalisasi PAD, reviu laporan keuangan daerah (LKPD), dan inventarisasi aset BMD.',
    createdAt: '2024-01-02',
  },
  {
    id: 'unit-6',
    kodeUnit: 'IRBAN-SUS',
    namaUnit: 'Inspektorat Pembantu Khusus',
    wilayahKerja: 'Seluruh Wilayah Kota Banjarmasin (Audit Investigatif, Saber Pungli, Pengaduan Masyarakat WBS, dan Forensik Digital)',
    namaPimpinan: 'Bambang Kusuma, S.H., M.H., CFrA',
    nipPimpinan: '19811105 200604 1 012',
    jabatanPimpinan: 'Inspektur Pembantu Khusus',
    kontakUnit: '0812-5111-1025',
    keterangan: 'Pelaksanaan audit investigasi, pemeriksaan dengan tujuan tertentu (PDTT), penanganan tindak lanjut aduan masyarakat / Whistleblowing System (WBS), dan pencegahan tindak pidana korupsi.',
    createdAt: '2024-01-02',
  },
];

// Seed Pegawai awal default kosong agar pengguna dapat menambahkan data pegawai baru secara leluasa
export const SEED_PEGAWAI: Pegawai[] = [];

// Seed Barang Milik Daerah (BMD)
export const SEED_BARANG: BarangBMD[] = [
  {
    id: 'bmd-1',
    kodeBarang: '1.3.2.05.01.01.001',
    namaBarang: 'Laptop Pengawasan / Audit',
    merkTipe: 'ASUS ExpertBook B9400CBA Core i7-1255U / 16GB / 1TB SSD',
    noSeri: 'M8N0CX12A459021',
    tahunPerolehan: 2023,
    jumlah: 1,
    satuan: 'Unit',
    nilaiPerolehan: 24750000,
    kondisi: 'B',
    sumberDana: 'APBD Kota Banjarmasin TA 2023',
    kodeLokasiRuang: 'Ruang Riksa Irban I',
    fotoBarang: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
    statusPemakaian: 'Dipakai',
    idPegawaiPemakai: 'peg-1',
    tanggalPelimpahan: '2024-01-15',
    keterangan: 'Kelengkapan charger, mouse wireless, tas resmi Asus',
  },
  {
    id: 'bmd-2',
    kodeBarang: '1.3.2.01.01.01.004',
    namaBarang: 'Kendaraan Dinas Jabatan Roda 4',
    merkTipe: 'Toyota Kijang Innova Venturer 2.4 AT Diesel',
    noSeri: 'DA 1024 BZ / MHFM1BA3J890123 / 2GD-FTV45981',
    tahunPerolehan: 2022,
    jumlah: 1,
    satuan: 'Unit',
    nilaiPerolehan: 498000000,
    kondisi: 'B',
    sumberDana: 'APBD Kota Banjarmasin TA 2022',
    kodeLokasiRuang: 'Garasi Kendaraan Dinas Inspektorat',
    fotoBarang: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    statusPemakaian: 'Dipakai',
    idPegawaiPemakai: 'peg-1',
    tanggalPelimpahan: '2024-01-15',
    keterangan: 'Dilengkapi STNK Dinas dan Kunci Kontak Cadangan',
  },
  {
    id: 'bmd-3',
    kodeBarang: '1.3.2.05.01.01.002',
    namaBarang: 'Laptop Auditor Lapangan',
    merkTipe: 'Lenovo ThinkPad T14s Gen 3 Ryzen 7 Pro / 16GB / 512GB',
    noSeri: 'PF-3XB819',
    tahunPerolehan: 2023,
    jumlah: 1,
    satuan: 'Unit',
    nilaiPerolehan: 21500000,
    kondisi: 'B',
    sumberDana: 'APBD Kota Banjarmasin TA 2023',
    kodeLokasiRuang: 'Ruang Riksa Irban II',
    fotoBarang: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80',
    statusPemakaian: 'Dipakai',
    idPegawaiPemakai: 'peg-2',
    tanggalPelimpahan: '2024-02-10',
    keterangan: 'Kondisi fisik mulus, baterai prima',
  },
  {
    id: 'bmd-4',
    kodeBarang: '1.3.2.05.02.06.008',
    namaBarang: 'Printer Portabel Mobile Audit',
    merkTipe: 'Canon PIXMA TR150 Portable Printer with Battery',
    noSeri: 'KMGQ94812',
    tahunPerolehan: 2023,
    jumlah: 1,
    satuan: 'Unit',
    nilaiPerolehan: 5200000,
    kondisi: 'B',
    sumberDana: 'APBD Kota Banjarmasin TA 2023',
    kodeLokasiRuang: 'Ruang Riksa Irban II',
    fotoBarang: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=400&q=80',
    statusPemakaian: 'Dipakai',
    idPegawaiPemakai: 'peg-2',
    tanggalPelimpahan: '2024-02-10',
    keterangan: 'Untuk cetak sampling dan Berita Acara di lapangan',
  },
  {
    id: 'bmd-5',
    kodeBarang: '1.3.2.05.01.02.003',
    namaBarang: 'PC Workstation Investigasi & Analisis Data',
    merkTipe: 'Dell OptiPlex 7000 Tower Core i9 / 32GB / RTX 3060',
    noSeri: '8TY6NM2',
    tahunPerolehan: 2023,
    jumlah: 1,
    satuan: 'Unit',
    nilaiPerolehan: 36800000,
    kondisi: 'B',
    sumberDana: 'APBD Kota Banjarmasin TA 2023',
    kodeLokasiRuang: 'Ruang Investigasi Irban Khusus',
    fotoBarang: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=400&q=80',
    statusPemakaian: 'Dipakai',
    idPegawaiPemakai: 'peg-4',
    tanggalPelimpahan: '2024-03-01',
    keterangan: 'Termasuk Monitor Dual 27 inch Dell UltraSharp',
  },
  {
    id: 'bmd-6',
    kodeBarang: '1.3.2.08.02.01.005',
    namaBarang: 'Drone Inspeksi Fisik Proyek Konstruksi',
    merkTipe: 'DJI Mavic 3 Enterprise Thermal & Zoom Camera',
    noSeri: '1581F4590391E00',
    tahunPerolehan: 2024,
    jumlah: 1,
    satuan: 'Set',
    nilaiPerolehan: 68500000,
    kondisi: 'B',
    sumberDana: 'APBD Kota Banjarmasin TA 2024',
    kodeLokasiRuang: 'Ruang Investigasi Irban Khusus',
    fotoBarang: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=400&q=80',
    statusPemakaian: 'Dipakai',
    idPegawaiPemakai: 'peg-4',
    tanggalPelimpahan: '2024-03-01',
    keterangan: 'Lengkap Remote RC Pro, 3 Baterai, Tas Hardcase',
  },
  {
    id: 'bmd-7',
    kodeBarang: '1.3.2.01.01.04.012',
    namaBarang: 'Kendaraan Dinas Operasional Roda 2',
    merkTipe: 'Honda Vario 160 CBS Active Black',
    noSeri: 'DA 2831 IT / MH1KF8119PK10482',
    tahunPerolehan: 2023,
    jumlah: 1,
    satuan: 'Unit',
    nilaiPerolehan: 27900000,
    kondisi: 'B',
    sumberDana: 'APBD Kota Banjarmasin TA 2023',
    kodeLokasiRuang: 'Garasi Kendaraan Dinas Inspektorat',
    fotoBarang: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80',
    statusPemakaian: 'Tersedia',
    keterangan: 'Siap pakai operasional pengawasan',
  },
  {
    id: 'bmd-8',
    kodeBarang: '1.3.2.05.02.01.015',
    namaBarang: 'Proyektor Ruang Rapat Khusus',
    merkTipe: 'Epson EB-2250U WUXGA 5000 Lumens',
    noSeri: 'V11H871052',
    tahunPerolehan: 2021,
    jumlah: 1,
    satuan: 'Unit',
    nilaiPerolehan: 23400000,
    kondisi: 'RR',
    sumberDana: 'APBD Kota Banjarmasin TA 2021',
    kodeLokasiRuang: 'Ruang Rapat Utama Inspektorat',
    fotoBarang: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80',
    statusPemakaian: 'Tersedia',
    keterangan: 'Lampu proyektor perlu penggantian berkala (rusak ringan)',
  },
  {
    id: 'bmd-9',
    kodeBarang: '1.3.2.05.01.01.020',
    namaBarang: 'Laptop Inventaris Cadangan',
    merkTipe: 'Acer Aspire 5 Intel Core i5 Gen 11',
    noSeri: 'NXA1SSN002',
    tahunPerolehan: 2020,
    jumlah: 1,
    satuan: 'Unit',
    nilaiPerolehan: 11200000,
    kondisi: 'RB',
    sumberDana: 'APBD Kota Banjarmasin TA 2020',
    kodeLokasiRuang: 'Gudang Aset / BMD',
    fotoBarang: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=400&q=80',
    statusPemakaian: 'Tersedia',
    keterangan: 'Motherboard rusak berat, menunggu usulan penghapusan aset',
  },
];

// Seed Pelimpahan BMD
export const SEED_PELIMPAHAN: PelimpahanBMD[] = [
  {
    id: 'pel-1',
    nomorBAST: '027/012/BAST-BMD/ITK-BJM/2024',
    nomorSK: '800.1.11.1/024-SK/ITK-BJM/2024',
    nomorSPTJM: '028/012/SPTJM-BMD/ITK-BJM/2024',
    tanggal: '2024-01-15',
    idPegawai: 'peg-1',
    barangIds: ['bmd-1', 'bmd-2'], // Satu pegawai memegang lebih dari satu barang (Laptop + Mobil Dinas)
    keperluan: 'Menunjang pelaksanaan pengawasan, reviu, monitoring, dan pemeriksaan reguler di lingkungan Inspektorat Pembantu Wilayah I Kota Banjarmasin.',
    statusDokumen: 'Disahkan',
    catatan: 'Barang telah diperiksa fisik dalam keadaan lengkap dan baik.',
  },
  {
    id: 'pel-2',
    nomorBAST: '027/018/BAST-BMD/ITK-BJM/2024',
    nomorSK: '800.1.11.1/035-SK/ITK-BJM/2024',
    nomorSPTJM: '028/018/SPTJM-BMD/ITK-BJM/2024',
    tanggal: '2024-02-10',
    idPegawai: 'peg-2',
    barangIds: ['bmd-3', 'bmd-4'], // Satu pegawai memegang laptop + printer portable
    keperluan: 'Operasional pemeriksaan khusus dan reviu laporan keuangan OPD di wilayah kerja Irban II.',
    statusDokumen: 'Disahkan',
    catatan: 'Diserahkan lengkap bersama perlengkapan baterai dan kabel konektor.',
  },
  {
    id: 'pel-3',
    nomorBAST: '027/025/BAST-BMD/ITK-BJM/2024',
    nomorSK: '800.1.11.1/048-SK/ITK-BJM/2024',
    nomorSPTJM: '028/025/SPTJM-BMD/ITK-BJM/2024',
    tanggal: '2024-03-01',
    idPegawai: 'peg-4',
    barangIds: ['bmd-5', 'bmd-6'], // PC Workstation + Drone inspeksi
    keperluan: 'Penyelidikan forensik digital, audit investigasi, serta pengawasan fisik konstruksi bangunan di Kota Banjarmasin.',
    statusDokumen: 'Disahkan',
    catatan: 'Pelimpahan perangkat sensitif untuk keperluan investigasi pengawasan.',
  },
];

/**
 * Storage Service Helper
 */
export const StorageService = {
  // Pejabat
  getPejabat(): Pejabat[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PEJABAT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PEJABAT, JSON.stringify(SEED_PEJABAT));
      return SEED_PEJABAT;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_PEJABAT;
    }
  },
  savePejabat(data: Pejabat[]) {
    localStorage.setItem(STORAGE_KEYS.PEJABAT, JSON.stringify(data));
    FirestoreService.savePejabat(data).catch(err => console.warn('Sync savePejabat:', err));
  },
  updatePejabat(pejabat: Pejabat) {
    const current = this.getPejabat();
    const updated = current.map(p => (p.id === pejabat.id ? pejabat : p));
    this.savePejabat(updated);
  },

  // Pegawai (Maksimal 150 Orang)
  getPegawai(): Pegawai[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PEGAWAI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify([]));
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, MAX_PEGAWAI_LIMIT);
      }
      return [];
    } catch {
      return [];
    }
  },
  savePegawai(data: Pegawai[]) {
    const limitedData = data.slice(0, MAX_PEGAWAI_LIMIT);
    try {
      localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(limitedData));
    } catch (e) {
      console.warn('LocalStorage savePegawai quota warning:', e);
    }
    FirestoreService.savePegawai(limitedData).catch(err => console.warn('Sync savePegawai:', err));
  },
  clearAllPegawai(): { updatedBarang: BarangBMD[] } {
    localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify([]));
    localStorage.setItem('sip_bmd_pegawai_cleared_for_user_v2', 'true');
    localStorage.removeItem('sip_bmd_pegawai_v1');

    FirestoreService.savePegawai([]).catch(err => console.warn('Sync clearAllPegawai Firestore:', err));

    // Kembalikan semua barang yang dipegang pegawai menjadi status Tersedia
    const currentBarang = this.getBarang();
    const updatedBarang = currentBarang.map(b => {
      if (b.statusPemakaian === 'Dipakai' || b.idPegawaiPemakai) {
        const { idPegawaiPemakai, tanggalPelimpahan, ...rest } = b;
        return {
          ...rest,
          statusPemakaian: 'Tersedia' as const,
        };
      }
      return b;
    });
    this.saveBarang(updatedBarang);

    return { updatedBarang };
  },
  addPegawai(pegawai: Pegawai): { success: boolean; message?: string } {
    const current = this.getPegawai();
    if (current.length >= MAX_PEGAWAI_LIMIT) {
      return {
        success: false,
        message: `Kapasitas data pegawai telah mencapai batasan maksimal ${MAX_PEGAWAI_LIMIT} orang.`,
      };
    }
    this.savePegawai([pegawai, ...current]);
    return { success: true };
  },
  addBulkPegawai(list: Pegawai[]): { added: number; total: number; truncated: boolean } {
    const current = this.getPegawai();
    const availableSlots = Math.max(0, MAX_PEGAWAI_LIMIT - current.length);
    const toAdd = list.slice(0, availableSlots);
    const updated = [...toAdd, ...current];
    this.savePegawai(updated);
    return {
      added: toAdd.length,
      total: updated.length,
      truncated: list.length > availableSlots,
    };
  },
  seed150Pegawai(): Pegawai[] {
    // Tidak menimpa data baru yang diinput pengguna
    return this.getPegawai();
  },
  updatePegawai(pegawai: Pegawai) {
    const current = this.getPegawai();
    const updated = current.map(p => (p.id === pegawai.id ? pegawai : p));
    this.savePegawai(updated);
  },
  deletePegawai(id: string) {
    const current = this.getPegawai();
    const updated = current.filter(p => p.id !== id);
    this.savePegawai(updated);
    FirestoreService.deletePegawaiDoc(id).catch(err => console.warn('Sync deletePegawaiDoc:', err));
  },

  // Barang BMD
  getBarang(): BarangBMD[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BARANG);
    if (!raw) {
      try {
        localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(SEED_BARANG));
      } catch (e) {
        console.warn('Initial seed saveBarang warning:', e);
      }
      return SEED_BARANG;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_BARANG;
    }
  },
  saveBarang(data: BarangBMD[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(data));
    } catch (quotaErr) {
      console.warn('LocalStorage quota limit reached in saveBarang, applying safety recovery:', quotaErr);
      try {
        // If quota exceeded due to legacy uncompressed base64 images, replace oversized base64
        const sanitized = data.map(b => {
          if (b.fotoBarang && b.fotoBarang.startsWith('data:image') && b.fotoBarang.length > 180000) {
            return {
              ...b,
              fotoBarang: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
            };
          }
          return b;
        });
        localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(sanitized));
      } catch (fatalErr) {
        console.error('LocalStorage critical save error:', fatalErr);
      }
    }
    FirestoreService.saveBarang(data).catch(err => console.warn('Sync saveBarang to Cloud:', err));
  },
  addBarang(barang: BarangBMD) {
    const current = this.getBarang();
    this.saveBarang([barang, ...current]);
  },
  updateBarang(barang: BarangBMD) {
    const current = this.getBarang();
    const updated = current.map(b => (b.id === barang.id ? barang : b));
    this.saveBarang(updated);
  },
  deleteBarang(id: string) {
    const current = this.getBarang();
    this.saveBarang(current.filter(b => b.id !== id));
    FirestoreService.deleteBarangDoc(id).catch(err => console.warn('Sync deleteBarangDoc:', err));
  },

  // Pelimpahan BMD
  getPelimpahan(): PelimpahanBMD[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PELIMPAHAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PELIMPAHAN, JSON.stringify(SEED_PELIMPAHAN));
      return SEED_PELIMPAHAN;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_PELIMPAHAN;
    }
  },
  savePelimpahan(data: PelimpahanBMD[]) {
    localStorage.setItem(STORAGE_KEYS.PELIMPAHAN, JSON.stringify(data));
    FirestoreService.savePelimpahan(data).catch(err => console.warn('Sync savePelimpahan:', err));
  },
  addPelimpahan(pelimpahan: PelimpahanBMD) {
    const current = this.getPelimpahan();
    this.savePelimpahan([pelimpahan, ...current]);

    // Update status barang terkait menjadi "Dipakai"
    const currentBarang = this.getBarang();
    const updatedBarang = currentBarang.map(b => {
      if (pelimpahan.barangIds.includes(b.id)) {
        return {
          ...b,
          statusPemakaian: 'Dipakai' as const,
          idPegawaiPemakai: pelimpahan.idPegawai,
          tanggalPelimpahan: pelimpahan.tanggal,
        };
      }
      return b;
    });
    this.saveBarang(updatedBarang);
  },
  updatePelimpahan(pelimpahan: PelimpahanBMD) {
    const current = this.getPelimpahan();
    const updated = current.map(p => (p.id === pelimpahan.id ? pelimpahan : p));
    this.savePelimpahan(updated);
  },
  deletePelimpahan(id: string) {
    const current = this.getPelimpahan();
    const target = current.find(p => p.id === id);
    if (target) {
      // Kembalikan barang yang sebelumnya dipakai menjadi 'Tersedia'
      const currentBarang = this.getBarang();
      const updatedBarang = currentBarang.map(b => {
        if (target.barangIds.includes(b.id)) {
          return {
            ...b,
            statusPemakaian: 'Tersedia' as const,
            idPegawaiPemakai: undefined,
            tanggalPelimpahan: undefined,
          };
        }
        return b;
      });
      this.saveBarang(updatedBarang);
    }
    this.savePelimpahan(current.filter(p => p.id !== id));
    FirestoreService.deletePelimpahanDoc(id).catch(err => console.warn('Sync deletePelimpahanDoc:', err));
  },

  // Instansi & Kop Surat Config
  getInstansi(): InstansiConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTANSI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INSTANSI, JSON.stringify(DEFAULT_INSTANSI));
      return DEFAULT_INSTANSI;
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_INSTANSI,
        ...parsed,
        logoUtamaUrl: parsed.logoUtamaUrl || LOGO_PEMKOT_BANJARMASIN_BASE64,
      };
    } catch {
      return DEFAULT_INSTANSI;
    }
  },
  saveInstansi(config: InstansiConfig) {
    localStorage.setItem(STORAGE_KEYS.INSTANSI, JSON.stringify(config));
    FirestoreService.saveInstansi(config).catch(err => console.warn('Sync saveInstansi:', err));
  },

  // Google Sheet Backups History
  getGoogleSheetBackups(): GoogleSheetBackupRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GSHEET_BACKUPS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
  saveGoogleSheetBackups(records: GoogleSheetBackupRecord[]) {
    localStorage.setItem(STORAGE_KEYS.GSHEET_BACKUPS, JSON.stringify(records));
    FirestoreService.saveGoogleSheetBackups(records).catch(err => console.warn('Sync saveBackups:', err));
  },
  addGoogleSheetBackup(record: GoogleSheetBackupRecord) {
    const current = this.getGoogleSheetBackups();
    this.saveGoogleSheetBackups([record, ...current]);
  },
  deleteGoogleSheetBackup(id: string) {
    const current = this.getGoogleSheetBackups();
    this.saveGoogleSheetBackups(current.filter(r => r.id !== id));
    FirestoreService.deleteGoogleSheetBackup(id).catch(err => console.warn('Sync deleteBackup:', err));
  },

  // Pelepasan Aset BMD History
  getPelepasan(): PelepasanAsetRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PELEPASAN);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
  savePelepasan(record: PelepasanAsetRecord) {
    const current = this.getPelepasan();
    const updated = [record, ...current.filter(r => r.id !== record.id)];
    localStorage.setItem(STORAGE_KEYS.PELEPASAN, JSON.stringify(updated));
    FirestoreService.savePelepasan(record).catch(err => console.warn('Sync savePelepasan:', err));
  },
  executePelepasanAset(params: {
    record: PelepasanAsetRecord;
    allBarang: BarangBMD[];
    allPegawai: Pegawai[];
  }): { updatedBarang: BarangBMD[]; updatedPegawai: Pegawai[] } {
    const { record, allBarang, allPegawai } = params;

    // 1. Process items actions
    const itemActionMap = new Map(record.items.map(it => [it.idBarang, it]));
    const updatedBarang = allBarang.map(b => {
      const action = itemActionMap.get(b.id);
      if (!action) return b;

      if (action.tindakan === 'Gudang') {
        return {
          ...b,
          statusPemakaian: 'Tersedia' as const,
          idPegawaiPemakai: undefined,
          tanggalPelimpahan: undefined,
          keterangan: `Dikembalikan ke gudang dari ${record.namaPegawaiAsal} (${record.alasan}) - BAP: ${record.nomorBAP}`,
        };
      } else {
        // Alihkan ke pegawai baru
        return {
          ...b,
          statusPemakaian: 'Dipakai' as const,
          idPegawaiPemakai: action.idPegawaiBaru,
          tanggalPelimpahan: record.tanggal,
          keterangan: `Dialihkan dari ${record.namaPegawaiAsal} ke ${action.namaPegawaiBaru || 'Pegawai Pengganti'} - BAP: ${record.nomorBAP}`,
        };
      }
    });

    // 2. Update employee status
    const updatedPegawai = allPegawai.map(p => {
      if (p.id === record.idPegawaiAsal) {
        return {
          ...p,
          status: record.statusPegawaiBaru,
        };
      }
      return p;
    });

    // 3. Persist barang, pegawai, and record
    this.saveBarang(updatedBarang);
    this.savePegawai(updatedPegawai);
    this.savePelepasan(record);

    return { updatedBarang, updatedPegawai };
  },

  // Master Ruangan / Kode Lokasi
  getRuangan(): Ruangan[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RUANGAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RUANGAN, JSON.stringify(SEED_RUANGAN));
      return SEED_RUANGAN;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Preserves all user data and merges any missing standard rooms (e.g. R.10 Irban IV)
        let hasChanges = false;
        const currentList: Ruangan[] = [...parsed];
        SEED_RUANGAN.forEach(seedR => {
          if (!currentList.some(r => r.kodeRuang === seedR.kodeRuang || r.id === seedR.id)) {
            currentList.push(seedR);
            hasChanges = true;
          }
        });
        if (hasChanges) {
          localStorage.setItem(STORAGE_KEYS.RUANGAN, JSON.stringify(currentList));
        }
        return currentList;
      }
      return SEED_RUANGAN;
    } catch {
      return SEED_RUANGAN;
    }
  },
  saveRuangan(data: Ruangan[]) {
    localStorage.setItem(STORAGE_KEYS.RUANGAN, JSON.stringify(data));
    FirestoreService.saveRuangan(data).catch(err => console.warn('Sync saveRuangan:', err));
  },
  addRuangan(ruangan: Ruangan) {
    const current = this.getRuangan();
    this.saveRuangan([ruangan, ...current]);
  },
  updateRuangan(ruangan: Ruangan) {
    const current = this.getRuangan();
    const updated = current.map(r => (r.id === ruangan.id ? ruangan : r));
    this.saveRuangan(updated);
  },
  deleteRuangan(id: string) {
    const current = this.getRuangan();
    this.saveRuangan(current.filter(r => r.id !== id));
    FirestoreService.deleteRuanganDoc(id).catch(err => console.warn('Sync deleteRuanganDoc:', err));
  },

  // Master Unit Kerja / Wilayah Kerja
  getUnitKerja(): UnitKerja[] {
    const raw = localStorage.getItem(STORAGE_KEYS.UNIT_KERJA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.UNIT_KERJA, JSON.stringify(SEED_UNIT_KERJA));
      return SEED_UNIT_KERJA;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_UNIT_KERJA;
    } catch {
      return SEED_UNIT_KERJA;
    }
  },
  saveUnitKerja(data: UnitKerja[]) {
    localStorage.setItem(STORAGE_KEYS.UNIT_KERJA, JSON.stringify(data));
    FirestoreService.saveUnitKerja(data).catch(err => console.warn('Sync saveUnitKerja:', err));
  },
  addUnitKerja(unitKerja: UnitKerja) {
    const current = this.getUnitKerja();
    this.saveUnitKerja([unitKerja, ...current]);
  },
  updateUnitKerja(unitKerja: UnitKerja) {
    const current = this.getUnitKerja();
    const updated = current.map(u => (u.id === unitKerja.id ? unitKerja : u));
    this.saveUnitKerja(updated);
  },
  deleteUnitKerja(id: string) {
    const current = this.getUnitKerja();
    this.saveUnitKerja(current.filter(u => u.id !== id));
    FirestoreService.deleteUnitKerjaDoc(id).catch(err => console.warn('Sync deleteUnitKerjaDoc:', err));
  },

  // Cloud Database Synchronization
  async syncWithCloud(onDataLoaded?: (data: {
    instansi: InstansiConfig;
    pejabat: Pejabat[];
    pegawai: Pegawai[];
    barang: BarangBMD[];
    pelimpahan: PelimpahanBMD[];
    gsheetBackups: GoogleSheetBackupRecord[];
    pelepasan?: PelepasanAsetRecord[];
    ruangan?: Ruangan[];
    unitKerja?: UnitKerja[];
  }) => void): Promise<CloudSyncState> {
    try {
      // 1. Check if Firestore is empty on the cloud
      const isEmpty = await FirestoreService.isCloudDatabaseEmpty();
      if (isEmpty) {
        // First initialization: seed cloud Firestore with current/seed data
        const currentData = {
          instansi: this.getInstansi(),
          pejabat: this.getPejabat(),
          pegawai: this.getPegawai(),
          barang: this.getBarang(),
          pelimpahan: this.getPelimpahan(),
          ruangan: this.getRuangan(),
          unitKerja: this.getUnitKerja(),
        };
        await FirestoreService.seedInitialCloudData(currentData);
        return {
          status: 'synced',
          message: 'Database Cloud Firestore berhasil diinisialisasi & tersimpan permanen',
          lastSyncedAt: new Date(),
        };
      }

      // 2. Cloud has existing data - fetch all data from Firestore
      const cloudData = await FirestoreService.loadAllCloudData();
      if (cloudData) {
        const mergedInstansi = cloudData.instansi || this.getInstansi();
        const mergedPejabat = cloudData.pejabat.length > 0 ? cloudData.pejabat : this.getPejabat();
        // Pertahankan data pegawai yang baru diinput pengguna (baik dari lokal maupun cloud)
        const localPegawai = this.getPegawai();
        const cloudPegawai = cloudData.pegawai || [];

        let mergedPegawai: Pegawai[] = [];
        if (localPegawai.length > 0 && cloudPegawai.length > 0) {
          const map = new Map<string, Pegawai>();
          cloudPegawai.forEach(p => map.set(p.id, p));
          localPegawai.forEach(p => map.set(p.id, p));
          mergedPegawai = Array.from(map.values()).slice(0, MAX_PEGAWAI_LIMIT);
        } else if (localPegawai.length > 0) {
          mergedPegawai = localPegawai.slice(0, MAX_PEGAWAI_LIMIT);
          FirestoreService.savePegawai(mergedPegawai).catch(err => console.warn('Sync local pegawai to cloud:', err));
        } else if (cloudPegawai.length > 0) {
          mergedPegawai = cloudPegawai.slice(0, MAX_PEGAWAI_LIMIT);
        } else {
          mergedPegawai = [];
        }

        const mergedBarang = cloudData.barang.length > 0 ? cloudData.barang : this.getBarang();
        const mergedPelimpahan = cloudData.pelimpahan.length > 0 ? cloudData.pelimpahan : this.getPelimpahan();
        const mergedBackups = cloudData.gsheetBackups;
        const mergedPelepasan = cloudData.pelepasan.length > 0 ? cloudData.pelepasan : this.getPelepasan();
        const mergedRuangan = cloudData.ruangan && cloudData.ruangan.length > 0 ? cloudData.ruangan : this.getRuangan();
        const mergedUnitKerja = cloudData.unitKerja && cloudData.unitKerja.length > 0 ? cloudData.unitKerja : this.getUnitKerja();

        // Persist to local storage as offline cache
        localStorage.setItem(STORAGE_KEYS.INSTANSI, JSON.stringify(mergedInstansi));
        localStorage.setItem(STORAGE_KEYS.PEJABAT, JSON.stringify(mergedPejabat));
        localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(mergedPegawai));
        localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(mergedBarang));
        localStorage.setItem(STORAGE_KEYS.PELIMPAHAN, JSON.stringify(mergedPelimpahan));
        localStorage.setItem(STORAGE_KEYS.GSHEET_BACKUPS, JSON.stringify(mergedBackups));
        localStorage.setItem(STORAGE_KEYS.PELEPASAN, JSON.stringify(mergedPelepasan));
        localStorage.setItem(STORAGE_KEYS.RUANGAN, JSON.stringify(mergedRuangan));
        localStorage.setItem(STORAGE_KEYS.UNIT_KERJA, JSON.stringify(mergedUnitKerja));

        if (onDataLoaded) {
          onDataLoaded({
            instansi: mergedInstansi,
            pejabat: mergedPejabat,
            pegawai: mergedPegawai,
            barang: mergedBarang,
            pelimpahan: mergedPelimpahan,
            gsheetBackups: mergedBackups,
            pelepasan: mergedPelepasan,
            ruangan: mergedRuangan,
            unitKerja: mergedUnitKerja,
          });
        }

        return {
          status: 'connected',
          message: 'Tersinkronisasi Realtime dengan Cloud Firestore',
          lastSyncedAt: new Date(),
        };
      }
      return {
        status: 'offline',
        message: 'Menggunakan penyimpanan lokal offline',
        lastSyncedAt: new Date(),
      };
    } catch (err) {
      console.error('syncWithCloud error:', err);
      return {
        status: 'error',
        message: 'Gagal menghubungkan ke Cloud Firestore (Offline Fallback)',
      };
    }
  },

  async forcePushToCloud(): Promise<void> {
    const instansi = this.getInstansi();
    const pejabat = this.getPejabat();
    const pegawai = this.getPegawai();
    const barang = this.getBarang();
    const pelimpahan = this.getPelimpahan();
    const backups = this.getGoogleSheetBackups();
    const ruangan = this.getRuangan();
    const unitKerja = this.getUnitKerja();

    await FirestoreService.saveInstansi(instansi);
    await FirestoreService.savePejabat(pejabat);
    await FirestoreService.savePegawai(pegawai);
    await FirestoreService.saveBarang(barang);
    await FirestoreService.savePelimpahan(pelimpahan);
    await FirestoreService.saveGoogleSheetBackups(backups);
    await FirestoreService.saveRuangan(ruangan);
    await FirestoreService.saveUnitKerja(unitKerja);
  },

  // Reset database back to default seed
  resetDefaults() {
    localStorage.setItem(STORAGE_KEYS.PEJABAT, JSON.stringify(SEED_PEJABAT));
    localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify([]));
    localStorage.setItem('sip_bmd_pegawai_cleared_for_user_v2', 'true');
    const cleanBarang = SEED_BARANG.map(b => {
      const { idPegawaiPemakai, tanggalPelimpahan, ...rest } = b;
      return {
        ...rest,
        statusPemakaian: 'Tersedia' as const,
      };
    });
    localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(cleanBarang));
    localStorage.setItem(STORAGE_KEYS.PELIMPAHAN, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INSTANSI, JSON.stringify(DEFAULT_INSTANSI));
    localStorage.setItem(STORAGE_KEYS.RUANGAN, JSON.stringify(SEED_RUANGAN));
    localStorage.setItem(STORAGE_KEYS.UNIT_KERJA, JSON.stringify(SEED_UNIT_KERJA));

    // Reset cloud Firestore as well
    FirestoreService.resetCloudDefaults({
      instansi: DEFAULT_INSTANSI,
      pejabat: SEED_PEJABAT,
      pegawai: [],
      barang: cleanBarang,
      pelimpahan: [],
      ruangan: SEED_RUANGAN,
      unitKerja: SEED_UNIT_KERJA,
    }).catch(err => console.warn('Cloud reset error:', err));
  },

  // Export full backup
  exportBackup(): string {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      instansi: this.getInstansi(),
      pejabat: this.getPejabat(),
      pegawai: this.getPegawai(),
      barang: this.getBarang(),
      pelimpahan: this.getPelimpahan(),
      ruangan: this.getRuangan(),
      unitKerja: this.getUnitKerja(),
    }, null, 2);
  },

  // Import full backup
  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.instansi) this.saveInstansi(parsed.instansi);
      if (parsed.pejabat) this.savePejabat(parsed.pejabat);
      if (parsed.pegawai) this.savePegawai(parsed.pegawai);
      if (parsed.barang) this.saveBarang(parsed.barang);
      if (parsed.pelimpahan) this.savePelimpahan(parsed.pelimpahan);
      if (parsed.ruangan) this.saveRuangan(parsed.ruangan);
      if (parsed.unitKerja) this.saveUnitKerja(parsed.unitKerja);
      return true;
    } catch {
      return false;
    }
  }
};

