import * as XLSX from 'xlsx';
import type { BarangBMD, KondisiBarang, Pegawai, StatusPegawai, StatusPemakaian } from '../types/index.ts';

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
  totalRows: number;
}

/**
 * Download sample Excel template for Pegawai
 */
export function downloadTemplatePegawai() {
  const templateData = [
    {
      'Nama Lengkap': 'H. Akhmad Ridhani, S.Sos., M.A.P.',
      'NIP': '197508142000031005',
      'Pangkat / Golongan': 'Pembina Tingkat I / IV/b',
      'Jabatan': 'Inspektur Pembantu Wilayah I',
      'Unit Kerja': 'Inspektorat Pembantu Wilayah I',
      'Status (Aktif/Non-Aktif)': 'Aktif',
      'Masa Kerja Jabatan': '4 Tahun 2 Bulan',
      'Email Dinas': 'ridhani.irban1@banjarmasinkota.go.id',
      'No. Telepon / WhatsApp': '081251239901',
    },
    {
      'Nama Lengkap': 'Siti Rahmah, S.E., Ak., CA',
      'NIP': '198404172008012011',
      'Pangkat / Golongan': 'Penata Tingkat I / III/d',
      'Jabatan': 'Auditor Ahli Muda',
      'Unit Kerja': 'Inspektorat Pembantu Wilayah II',
      'Status (Aktif/Non-Aktif)': 'Aktif',
      'Masa Kerja Jabatan': '3 Tahun 6 Bulan',
      'Email Dinas': 'siti.rahmah@banjarmasinkota.go.id',
      'No. Telepon / WhatsApp': '081348112233',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Pegawai');
  XLSX.writeFile(workbook, 'Template_Impor_Pegawai_Inspektorat_Banjarmasin.xlsx');
}

/**
 * Download sample Excel template for BMD
 */
export function downloadTemplateBarang() {
  const templateData = [
    {
      'Kode Barang / NIB': '1.3.2.05.01.01.001',
      'Nama Barang': 'Laptop Pengawasan / Audit',
      'Merk / Tipe / Spesifikasi': 'ASUS ExpertBook B9400CBA Core i7-1255U / 16GB / 1TB SSD',
      'No. Seri / Rangka / Pelat': 'M8N0CX12A459021',
      'Tahun Perolehan': 2023,
      'Jumlah': 1,
      'Satuan': 'Unit',
      'Nilai Perolehan (Rp)': 24750000,
      'Kondisi (B/RR/RB)': 'B',
      'Sumber Dana': 'APBD Kota Banjarmasin TA 2023',
      'Kode Lokasi / Ruang': 'Ruang Riksa Irban I',
      'Keterangan': 'Lengkap tas dan charger orisinal',
    },
    {
      'Kode Barang / NIB': '1.3.2.01.01.01.004',
      'Nama Barang': 'Kendaraan Dinas Jabatan Roda 4',
      'Merk / Tipe / Spesifikasi': 'Toyota Kijang Innova Venturer 2.4 AT Diesel',
      'No. Seri / Rangka / Pelat': 'DA 1024 BZ / MHFM1BA3J890123',
      'Tahun Perolehan': 2022,
      'Jumlah': 1,
      'Satuan': 'Unit',
      'Nilai Perolehan (Rp)': 498000000,
      'Kondisi (B/RR/RB)': 'B',
      'Sumber Dana': 'APBD Kota Banjarmasin TA 2022',
      'Kode Lokasi / Ruang': 'Garasi Inspektorat Kota Banjarmasin',
      'Keterangan': 'Dilengkapi STNK Dinas dan Kunci Kontak',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template BMD');
  XLSX.writeFile(workbook, 'Template_Impor_Inventaris_BMD_Inspektorat.xlsx');
}

/**
 * Parse an uploaded Excel or CSV file
 */
export async function parseExcelFile(file: File): Promise<Record<string, unknown>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

/**
 * Validate and convert parsed rows to Pegawai objects
 */
export function validateAndMapPegawai(rows: Record<string, unknown>[]): ImportResult<Pegawai> {
  const data: Pegawai[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // header is row 1
    // flexible field extraction
    const nama = (row['Nama Lengkap'] || row['Nama'] || row['nama']) as string;
    const nip = String(row['NIP'] || row['nip'] || '').trim();
    const pangkatGol = (row['Pangkat / Golongan'] || row['Pangkat'] || row['Golongan'] || row['pangkatGol'] || '-') as string;
    const jabatan = (row['Jabatan'] || row['jabatan'] || '-') as string;
    const unitKerja = (row['Unit Kerja'] || row['unitKerja'] || 'Sekretariat') as string;
    const rawStatus = (row['Status (Aktif/Non-Aktif)'] || row['Status'] || row['status'] || 'Aktif') as string;
    const masaKerjaJabatan = (row['Masa Kerja Jabatan'] || row['Masa Kerja'] || '-') as string;
    const email = (row['Email Dinas'] || row['Email'] || row['email']) as string | undefined;
    const telepon = String(row['No. Telepon / WhatsApp'] || row['Telepon'] || row['telepon'] || '').trim();

    if (!nama || nama.trim().length === 0) {
      errors.push(`Baris ${rowNum}: Nama pegawai tidak boleh kosong.`);
      return;
    }

    if (!nip || nip.length < 5) {
      errors.push(`Baris ${rowNum}: NIP untuk "${nama}" tidak valid.`);
      return;
    }

    const status: StatusPegawai = rawStatus.toLowerCase().includes('non') ? 'Non-Aktif' : 'Aktif';

    data.push({
      id: 'peg-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      nama: nama.trim(),
      nip,
      pangkatGol,
      jabatan,
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      unitKerja,
      status,
      masaKerjaJabatan,
      email: email ? email.trim() : undefined,
      telepon: telepon || undefined,
    });
  });

  return {
    success: errors.length === 0,
    data,
    errors,
    totalRows: rows.length,
  };
}

/**
 * Validate and convert parsed rows to Barang BMD objects
 */
export function validateAndMapBarang(rows: Record<string, unknown>[]): ImportResult<BarangBMD> {
  const data: BarangBMD[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const kodeBarang = String(row['Kode Barang / NIB'] || row['Kode Barang'] || row['NIB'] || row['kodeBarang'] || '').trim();
    const namaBarang = (row['Nama Barang'] || row['Nama'] || row['namaBarang']) as string;
    const merkTipe = (row['Merk / Tipe / Spesifikasi'] || row['Merk / Tipe'] || row['Merk'] || row['merkTipe'] || '-') as string;
    const noSeri = String(row['No. Seri / Rangka / Pelat'] || row['No. Seri'] || row['noSeri'] || '-').trim();
    const tahunPerolehan = Number(row['Tahun Perolehan'] || row['Tahun'] || new Date().getFullYear());
    const jumlah = Number(row['Jumlah'] || 1);
    const satuan = (row['Satuan'] || 'Unit') as string;
    const nilaiRaw = row['Nilai Perolehan (Rp)'] || row['Nilai Perolehan'] || row['nilaiPerolehan'] || 0;
    const nilaiPerolehan = typeof nilaiRaw === 'number' ? nilaiRaw : parseFloat(String(nilaiRaw).replace(/[^\d.-]/g, '')) || 0;
    const rawKondisi = String(row['Kondisi (B/RR/RB)'] || row['Kondisi'] || 'B').trim().toUpperCase();
    const sumberDana = (row['Sumber Dana'] || 'APBD Kota Banjarmasin') as string;
    const kodeLokasiRuang = (row['Kode Lokasi / Ruang'] || row['Lokasi'] || row['Ruang'] || 'Sekretariat / Gudang') as string;
    const keterangan = (row['Keterangan'] || '') as string;

    if (!namaBarang || namaBarang.trim().length === 0) {
      errors.push(`Baris ${rowNum}: Nama barang tidak boleh kosong.`);
      return;
    }

    let kondisi: KondisiBarang = 'B';
    if (rawKondisi.includes('RB') || rawKondisi.includes('BERAT')) kondisi = 'RB';
    else if (rawKondisi.includes('RR') || rawKondisi.includes('RINGAN')) kondisi = 'RR';

    data.push({
      id: 'bmd-imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      kodeBarang: kodeBarang || `1.3.2.05.${Date.now().toString().slice(-4)}`,
      namaBarang: namaBarang.trim(),
      merkTipe,
      noSeri,
      tahunPerolehan,
      jumlah: isNaN(jumlah) || jumlah <= 0 ? 1 : jumlah,
      satuan,
      nilaiPerolehan: isNaN(nilaiPerolehan) ? 0 : nilaiPerolehan,
      kondisi,
      sumberDana,
      kodeLokasiRuang,
      fotoBarang: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
      statusPemakaian: 'Tersedia' as StatusPemakaian,
      keterangan,
    });
  });

  return {
    success: errors.length === 0,
    data,
    errors,
    totalRows: rows.length,
  };
}

/**
 * Export Pegawai list to Excel
 */
export function exportPegawaiToExcel(pegawaiList: Pegawai[]) {
  const exportData = pegawaiList.map((p, idx) => ({
    'No': idx + 1,
    'Nama Lengkap': p.nama,
    'NIP': p.nip,
    'Pangkat / Golongan': p.pangkatGol,
    'Jabatan': p.jabatan,
    'Unit Kerja': p.unitKerja,
    'Status': p.status,
    'Masa Kerja Jabatan': p.masaKerjaJabatan,
    'Email': p.email || '-',
    'No Telepon': p.telepon || '-',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Pegawai');
  XLSX.writeFile(wb, `Data_Pegawai_Pemakai_BMD_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export Barang BMD list to Excel
 */
export function exportBarangToExcel(barangList: BarangBMD[]) {
  const exportData = barangList.map((b, idx) => ({
    'No': idx + 1,
    'Kode Barang / NIB': b.kodeBarang,
    'Nama Barang': b.namaBarang,
    'Merk / Spesifikasi': b.merkTipe,
    'No. Seri / Rangka / Pelat': b.noSeri,
    'Tahun Perolehan': b.tahunPerolehan,
    'Jumlah': `${b.jumlah} ${b.satuan}`,
    'Nilai Perolehan (Rp)': b.nilaiPerolehan,
    'Kondisi': b.kondisi === 'B' ? 'Baik (B)' : b.kondisi === 'RR' ? 'Rusak Ringan (RR)' : 'Rusak Berat (RB)',
    'Status Pemakaian': b.statusPemakaian,
    'Kode Lokasi / Ruang': b.kodeLokasiRuang,
    'Sumber Dana': b.sumberDana,
    'Keterangan': b.keterangan || '-',
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventaris BMD');
  XLSX.writeFile(wb, `Data_Inventaris_BMD_Inspektorat_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
