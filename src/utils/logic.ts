/**
 * Pure business logic and calculation helpers for SIP-BMD Inspektorat Kota Banjarmasin
 */

import type { BarangBMD, KondisiBarang, Pegawai, PelimpahanBMD, DashboardStats } from '../types/index.ts';

/**
 * Format number into Indonesian Rupiah format
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert number into Indonesian Terbilang (Spelled-out words)
 */
export function terbilang(n: number): string {
  if (n < 0) return 'minus ' + terbilang(Math.abs(n));
  if (n === 0) return 'nol';

  const satuan = [
    '', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan',
    'sepuluh', 'sebelas'
  ];

  if (n < 12) {
    return satuan[Math.floor(n)];
  } else if (n < 20) {
    return terbilang(n - 10) + ' belas';
  } else if (n < 100) {
    return terbilang(Math.floor(n / 10)) + ' puluh' + (n % 10 !== 0 ? ' ' + terbilang(n % 10) : '');
  } else if (n < 200) {
    return 'seratus' + (n % 100 !== 0 ? ' ' + terbilang(n % 100) : '');
  } else if (n < 1000) {
    return terbilang(Math.floor(n / 100)) + ' ratus' + (n % 100 !== 0 ? ' ' + terbilang(n % 100) : '');
  } else if (n < 2000) {
    return 'seribu' + (n % 1000 !== 0 ? ' ' + terbilang(n % 1000) : '');
  } else if (n < 1000000) {
    return terbilang(Math.floor(n / 1000)) + ' ribu' + (n % 1000 !== 0 ? ' ' + terbilang(n % 1000) : '');
  } else if (n < 1000000000) {
    return terbilang(Math.floor(n / 1000000)) + ' juta' + (n % 1000000 !== 0 ? ' ' + terbilang(n % 1000000) : '');
  } else if (n < 1000000000000) {
    return terbilang(Math.floor(n / 1000000000)) + ' milyar' + (n % 1000000000 !== 0 ? ' ' + terbilang(n % 1000000000) : '');
  }
  return terbilang(Math.floor(n / 1000000000000)) + ' triliun' + (n % 1000000000000 !== 0 ? ' ' + terbilang(n % 1000000000000) : '');
}

/**
 * Capitalize terbilang for legal document display
 */
export function terbilangRupiah(n: number): string {
  const words = terbilang(n).trim();
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  return `${capitalized} Rupiah`;
}

/**
 * Format ISO date string into formal Indonesian date string
 */
export function formatTanggalIndonesia(dateStr?: string, includeDay = false): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const namaHari = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];

  const tgl = d.getDate();
  const bulan = namaBulan[d.getMonth()];
  const tahun = d.getFullYear();

  if (includeDay) {
    const hari = namaHari[d.getDay()];
    return `${hari}, ${tgl} ${bulan} ${tahun}`;
  }
  return `${tgl} ${bulan} ${tahun}`;
}

/**
 * Convert condition code into human-readable label
 */
export function labelKondisi(kondisi: KondisiBarang): { text: string; full: string; color: string; bg: string } {
  switch (kondisi) {
    case 'B':
      return { text: 'B', full: 'Baik', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
    case 'RR':
      return { text: 'RR', full: 'Rusak Ringan', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
    case 'RB':
      return { text: 'RB', full: 'Rusak Berat', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' };
    default:
      return { text: '-', full: 'Tidak Diketahui', color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' };
  }
}

/**
 * Compute aggregate statistics for the dashboard
 */
export function computeDashboardStats(
  pegawaiList: Pegawai[],
  barangList: BarangBMD[],
  pelimpahanList: PelimpahanBMD[]
): DashboardStats {
  const totalPegawai = pegawaiList.length;
  const pegawaiAktif = pegawaiList.filter(p => p.status === 'Aktif').length;

  const totalBarang = barangList.length;
  const barangTerpakai = barangList.filter(b => b.statusPemakaian === 'Dipakai').length;
  const barangTersedia = barangList.filter(b => b.statusPemakaian === 'Tersedia').length;

  const totalNilaiAset = barangList.reduce((acc, curr) => acc + (curr.nilaiPerolehan || 0), 0);

  const kondisiBaik = barangList.filter(b => b.kondisi === 'B').length;
  const kondisiRusakRingan = barangList.filter(b => b.kondisi === 'RR').length;
  const kondisiRusakBerat = barangList.filter(b => b.kondisi === 'RB').length;

  return {
    totalPegawai,
    pegawaiAktif,
    totalBarang,
    barangTerpakai,
    barangTersedia,
    totalNilaiAset,
    kondisiBaik,
    kondisiRusakRingan,
    kondisiRusakBerat,
    totalPelimpahan: pelimpahanList.length,
  };
}

/**
 * Validate NIP format (Indonesian 18 digits standard)
 */
export function isValidNIP(nip: string): boolean {
  if (!nip) return false;
  const cleaned = nip.replace(/\s+/g, '');
  return /^\d{18}$/.test(cleaned);
}

/**
 * Filter items by multi-field search term
 */
export function filterBarang(
  items: BarangBMD[],
  query: string,
  filterRuang: string,
  filterKondisi: string,
  filterStatus: string
): BarangBMD[] {
  const q = query.toLowerCase().trim();
  return items.filter(item => {
    const matchQuery = !q ||
      item.namaBarang.toLowerCase().includes(q) ||
      item.kodeBarang.toLowerCase().includes(q) ||
      item.merkTipe.toLowerCase().includes(q) ||
      item.noSeri.toLowerCase().includes(q) ||
      item.kodeLokasiRuang.toLowerCase().includes(q);

    const matchRuang = !filterRuang || filterRuang === 'Semua' || item.kodeLokasiRuang === filterRuang;
    const matchKondisi = !filterKondisi || filterKondisi === 'Semua' || item.kondisi === filterKondisi;
    const matchStatus = !filterStatus || filterStatus === 'Semua' || item.statusPemakaian === filterStatus;

    return matchQuery && matchRuang && matchKondisi && matchStatus;
  });
}

/**
 * Filter pegawai list
 */
export function filterPegawai(
  items: Pegawai[],
  query: string,
  filterUnit: string,
  filterStatus: string
): Pegawai[] {
  const q = query.toLowerCase().trim();
  return items.filter(item => {
    const matchQuery = !q ||
      item.nama.toLowerCase().includes(q) ||
      item.nip.toLowerCase().includes(q) ||
      item.jabatan.toLowerCase().includes(q) ||
      item.unitKerja.toLowerCase().includes(q);

    const matchUnit = !filterUnit || filterUnit === 'Semua' || item.unitKerja === filterUnit;
    const matchStatus = !filterStatus || filterStatus === 'Semua' || item.status === filterStatus;

    return matchQuery && matchUnit && matchStatus;
  });
}

/**
 * Generate sequential document numbers
 */
export function generateNomorDokumen(type: 'BAST' | 'SK' | 'SPTJM', sequence: number, year = new Date().getFullYear()): string {
  const seqStr = String(sequence).padStart(3, '0');
  switch (type) {
    case 'BAST':
      return `027/${seqStr}/BAST-BMD/ITK-BJM/${year}`;
    case 'SK':
      return `800.1.11.1/${seqStr}-SK/ITK-BJM/${year}`;
    case 'SPTJM':
      return `028/${seqStr}/SPTJM-BMD/ITK-BJM/${year}`;
  }
}
