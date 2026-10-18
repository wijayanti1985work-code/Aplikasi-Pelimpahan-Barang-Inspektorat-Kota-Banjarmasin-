import type { BarangBMD, Pegawai, Pejabat, PelimpahanBMD, InstansiConfig, GoogleSheetBackupRecord } from '../types/index.ts';

const STORAGE_KEYS = {
  PEGAWAI: 'sip_bmd_pegawai_v1',
  BARANG: 'sip_bmd_barang_v1',
  PELIMPAHAN: 'sip_bmd_pelimpahan_v1',
  PEJABAT: 'sip_bmd_pejabat_v1',
  INSTANSI: 'sip_bmd_instansi_v1',
  GSHEET_BACKUPS: 'sip_bmd_gsheet_backups_v1',
};

export const DEFAULT_INSTANSI: InstansiConfig = {
  namaPemda: 'PEMERINTAH KOTA BANJARMASIN',
  namaInstansi: 'INSPEKTORAT DAERAH',
  subJudul: 'KOTA BANJARMASIN',
  alamat: 'Jalan RE Martadinata No. 1 Gedung Blok B Lantai 2 Banjarmasin Kode Pos 70111',
  telepon: '(0511) 3353844',
  faksimile: '(0511) 3353844',
  email: 'inspektorat@banjarmasinkota.go.id',
  website: 'inspektorat.banjarmasinkota.go.id',
  semboyan: 'KAYUH BAIMBAI',
  logoUtamaUrl: '', // uses authentic vector Banjarmasin emblem when empty or custom dataURL
  logoSekunderUrl: '',
  tampilkanLogoKanan: true,
  ketebalanGarisKop: 'double',
};

// Seed Pejabat
export const SEED_PEJABAT: Pejabat[] = [
  {
    id: 'pejabat-1',
    peran: 'Pengguna Barang',
    nama: 'Drs. H. Dolly Syahbana, M.M.',
    nip: '196805121994031006',
    pangkatGol: 'Pembina Utama Muda / IV/c',
    jabatan: 'Inspektur Daerah Kota Banjarmasin',
    instansi: 'Inspektorat Daerah Kota Banjarmasin',
  },
  {
    id: 'pejabat-2',
    peran: 'Pengurus Barang',
    nama: 'Dian Dahniar',
    nip: '197311232007012008',
    pangkatGol: 'Penata Tingkat I / III/d',
    jabatan: 'Pengurus Barang Pengguna',
    instansi: 'Inspektorat Daerah Kota Banjarmasin',
  },
];

// Seed Pegawai
export const SEED_PEGAWAI: Pegawai[] = [
  {
    id: 'peg-1',
    nama: 'H. Akhmad Ridhani, S.Sos., M.A.P.',
    nip: '197508142000031005',
    pangkatGol: 'Pembina Tingkat I / IV/b',
    jabatan: 'Inspektur Pembantu Wilayah I',
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    unitKerja: 'Inspektorat Pembantu Wilayah I',
    status: 'Aktif',
    masaKerjaJabatan: '4 Tahun 2 Bulan',
    email: 'ridhani.irban1@banjarmasinkota.go.id',
    telepon: '081251239901',
  },
  {
    id: 'peg-2',
    nama: 'Siti Rahmah, S.E., Ak., CA',
    nip: '198404172008012011',
    pangkatGol: 'Penata Tingkat I / III/d',
    jabatan: 'Auditor Ahli Muda',
    foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
    unitKerja: 'Inspektorat Pembantu Wilayah II',
    status: 'Aktif',
    masaKerjaJabatan: '3 Tahun 6 Bulan',
    email: 'siti.rahmah@banjarmasinkota.go.id',
    telepon: '081348112233',
  },
  {
    id: 'peg-3',
    nama: 'Muhammad Fadillah, S.T., M.Eng.',
    nip: '198811052010011009',
    pangkatGol: 'Penata / III/c',
    jabatan: 'Pengawas Penyelenggaraan Urusan Pemerintahan Daerah (PPUPD) Muda',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    unitKerja: 'Inspektorat Pembantu Wilayah III',
    status: 'Aktif',
    masaKerjaJabatan: '2 Tahun 8 Bulan',
    email: 'fadillah.ppupd@banjarmasinkota.go.id',
    telepon: '085249008877',
  },
  {
    id: 'peg-4',
    nama: 'Noor Aida, S.Kom.',
    nip: '199203152015032004',
    pangkatGol: 'Penata Muda Tingkat I / III/b',
    jabatan: 'Pranata Komputer / Auditor Investigasi',
    foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
    unitKerja: 'Inspektorat Pembantu Khusus',
    status: 'Aktif',
    masaKerjaJabatan: '1 Tahun 10 Bulan',
    email: 'nooraida.itk@banjarmasinkota.go.id',
    telepon: '081253445566',
  },
  {
    id: 'peg-5',
    nama: 'Rizky Maulana, S.AP.',
    nip: '199507202019021003',
    pangkatGol: 'Penata Muda / III/a',
    jabatan: 'Pengelola Pengadaan Barang/Jasa & Sarana',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    unitKerja: 'Sekretariat',
    status: 'Aktif',
    masaKerjaJabatan: '2 Tahun 1 Bulan',
    email: 'rizky.sekretariat@banjarmasinkota.go.id',
    telepon: '087812993344',
  },
  {
    id: 'peg-6',
    nama: 'Dra. Hj. Gusti Marlina, M.Si.',
    nip: '196901021995032001',
    pangkatGol: 'Pembina Utama Muda / IV/c',
    jabatan: 'Auditor Ahli Utama',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80',
    unitKerja: 'Sekretariat',
    status: 'Non-Aktif',
    masaKerjaJabatan: '5 Tahun 0 Bulan',
    email: 'gusti.marlina@banjarmasinkota.go.id',
    telepon: '08115004455',
  },
];

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
    kodeLokasiRuang: 'Garasi Inspektorat Kota Banjarmasin',
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
    kodeLokasiRuang: 'Garasi Inspektorat Kota Banjarmasin',
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
  },
  updatePejabat(pejabat: Pejabat) {
    const current = this.getPejabat();
    const updated = current.map(p => (p.id === pejabat.id ? pejabat : p));
    this.savePejabat(updated);
  },

  // Pegawai
  getPegawai(): Pegawai[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PEGAWAI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(SEED_PEGAWAI));
      return SEED_PEGAWAI;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_PEGAWAI;
    }
  },
  savePegawai(data: Pegawai[]) {
    localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(data));
  },
  addPegawai(pegawai: Pegawai) {
    const current = this.getPegawai();
    this.savePegawai([pegawai, ...current]);
  },
  updatePegawai(pegawai: Pegawai) {
    const current = this.getPegawai();
    const updated = current.map(p => (p.id === pegawai.id ? pegawai : p));
    this.savePegawai(updated);
  },
  deletePegawai(id: string) {
    const current = this.getPegawai();
    this.savePegawai(current.filter(p => p.id !== id));
  },

  // Barang BMD
  getBarang(): BarangBMD[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BARANG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(SEED_BARANG));
      return SEED_BARANG;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_BARANG;
    }
  },
  saveBarang(data: BarangBMD[]) {
    localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(data));
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
  },

  // Instansi & Kop Surat Config
  getInstansi(): InstansiConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTANSI);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INSTANSI, JSON.stringify(DEFAULT_INSTANSI));
      return DEFAULT_INSTANSI;
    }
    try {
      return { ...DEFAULT_INSTANSI, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_INSTANSI;
    }
  },
  saveInstansi(config: InstansiConfig) {
    localStorage.setItem(STORAGE_KEYS.INSTANSI, JSON.stringify(config));
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
  },
  addGoogleSheetBackup(record: GoogleSheetBackupRecord) {
    const current = this.getGoogleSheetBackups();
    this.saveGoogleSheetBackups([record, ...current]);
  },
  deleteGoogleSheetBackup(id: string) {
    const current = this.getGoogleSheetBackups();
    this.saveGoogleSheetBackups(current.filter(r => r.id !== id));
  },

  // Reset database back to default seed
  resetDefaults() {
    localStorage.setItem(STORAGE_KEYS.PEJABAT, JSON.stringify(SEED_PEJABAT));
    localStorage.setItem(STORAGE_KEYS.PEGAWAI, JSON.stringify(SEED_PEGAWAI));
    localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(SEED_BARANG));
    localStorage.setItem(STORAGE_KEYS.PELIMPAHAN, JSON.stringify(SEED_PELIMPAHAN));
    localStorage.setItem(STORAGE_KEYS.INSTANSI, JSON.stringify(DEFAULT_INSTANSI));
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
      return true;
    } catch {
      return false;
    }
  }
};
