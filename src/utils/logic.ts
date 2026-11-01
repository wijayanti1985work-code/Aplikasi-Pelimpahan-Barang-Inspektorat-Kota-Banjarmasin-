/**
 * Pure business logic and calculation helpers for SIP-BMD Inspektorat Kota Banjarmasin
 */

import type { BarangBMD, KondisiBarang, Pegawai, PelimpahanBMD, DashboardStats, Ruangan } from '../types/index.ts';

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
  let d: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, day] = dateStr.split('-').map(Number);
    d = new Date(y, m - 1, day);
  } else {
    d = new Date(dateStr);
  }
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
 * Rincian hari, tanggal, bulan, tahun dan terbilang lengkap untuk naskah dinas resmi BAST, SK, dan SPTJM
 */
export interface TanggalDinasDetail {
  hari: string;               // e.g. "Selasa"
  tanggalAngka: number;       // e.g. 27
  tanggalPadded: string;      // e.g. "27"
  bulanAngka: number;         // e.g. 10
  bulanPadded: string;        // e.g. "10"
  tanggalTerbilang: string;   // e.g. "Dua Puluh Tujuh"
  bulan: string;              // e.g. "Oktober"
  tahunAngka: number;         // e.g. 2026
  tahunTerbilang: string;     // e.g. "Dua Ribu Dua Puluh Enam"
  dateNumStr: string;         // e.g. "27-10-2026"
  tanggalFormatted: string;   // e.g. "27 Oktober 2026"
  hariTanggalFormatted: string; // e.g. "Selasa, 27 Oktober 2026"
  paragrafPembukaBAST: string; // e.g. "Pada hari ini Selasa tanggal Dua Puluh Tujuh bulan Oktober tahun Dua Ribu Dua Puluh Enam (27-10-2026)..."
  paragrafPembukaBASTTanpaKode: string; // e.g. "Pada hari ini Selasa tanggal Dua Puluh Tujuh bulan Oktober tahun Dua Ribu Dua Puluh Enam..."
}

export function getTanggalDinasDetail(dateStr?: string): TanggalDinasDetail {
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const namaHari = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
  ];

  let dObj: Date;
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    dObj = new Date(y, m - 1, d);
  } else if (dateStr) {
    dObj = new Date(dateStr);
  } else {
    dObj = new Date();
  }

  if (isNaN(dObj.getTime())) {
    dObj = new Date();
  }

  const hari = namaHari[dObj.getDay()];
  const tanggalAngka = dObj.getDate();
  const bulanAngka = dObj.getMonth() + 1;
  const bulan = namaBulan[dObj.getMonth()];
  const tahunAngka = dObj.getFullYear();

  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, l => l.toUpperCase());

  const tanggalTerbilang = capitalizeWords(terbilang(tanggalAngka).trim());
  const tahunTerbilang = capitalizeWords(terbilang(tahunAngka).trim());
  const tanggalFormatted = `${tanggalAngka} ${bulan} ${tahunAngka}`;
  const hariTanggalFormatted = `${hari}, ${tanggalFormatted}`;

  const tanggalPadded = String(tanggalAngka).padStart(2, '0');
  const bulanPadded = String(bulanAngka).padStart(2, '0');
  const dateNumStr = `${tanggalPadded}-${bulanPadded}-${tahunAngka}`;

  const paragrafPembukaBAST = `Pada hari ini ${hari} tanggal ${tanggalTerbilang} bulan ${bulan} tahun ${tahunTerbilang}, bertempat di Kantor Inspektorat Kota Banjarmasin, kami yang bertanda tangan di bawah ini:`;
  const paragrafPembukaBASTTanpaKode = `Pada hari ini ${hari} tanggal ${tanggalTerbilang} bulan ${bulan} tahun ${tahunTerbilang}, bertempat di Kantor Inspektorat Kota Banjarmasin, kami yang bertanda tangan di bawah ini:`;

  return {
    hari,
    tanggalAngka,
    tanggalPadded,
    bulanAngka,
    bulanPadded,
    tanggalTerbilang,
    bulan,
    tahunAngka,
    tahunTerbilang,
    dateNumStr,
    tanggalFormatted,
    hariTanggalFormatted,
    paragrafPembukaBAST,
    paragrafPembukaBASTTanpaKode,
  };
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

/**
 * Resolves any item's location string to its designated Master Ruangan
 */
export function findRuanganForItem(
  item: BarangBMD | { kodeLokasiRuang?: string },
  ruanganList: Ruangan[]
): Ruangan | null {
  const loc = (item.kodeLokasiRuang || '').trim();
  if (!loc || !ruanganList || ruanganList.length === 0) return null;

  // 1. Direct match on kodeRuang (e.g. 'R.01'), id, or exact namaRuang
  const exact = ruanganList.find(
    r =>
      r.kodeRuang.toLowerCase() === loc.toLowerCase() ||
      r.id.toLowerCase() === loc.toLowerCase() ||
      r.namaRuang.toLowerCase() === loc.toLowerCase() ||
      loc.toLowerCase() === `[${r.kodeRuang.toLowerCase()}] ${r.namaRuang.toLowerCase()}`
  );
  if (exact) return exact;

  // 2. Bracket code match: e.g. '[R.01]' in loc
  const codeMatch = ruanganList.find(r => {
    const rx = new RegExp(`\\b${r.kodeRuang}\\b`, 'i');
    return rx.test(loc) || loc.toLowerCase().includes(`[${r.kodeRuang.toLowerCase()}]`);
  });
  if (codeMatch) return codeMatch;

  // 3. Normalized semantic matching
  const cleanLoc = loc
    .toLowerCase()
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanLoc.includes('garasi')) {
    return ruanganList.find(r => r.kodeRuang === 'R.08' || r.namaRuang.toLowerCase().includes('garasi')) || null;
  }
  if (cleanLoc.includes('gudang')) {
    return ruanganList.find(r => r.kodeRuang === 'R.09' || r.namaRuang.toLowerCase().includes('gudang')) || null;
  }
  if (cleanLoc.includes('rapat')) {
    return ruanganList.find(r => r.kodeRuang === 'R.06' || r.namaRuang.toLowerCase().includes('rapat')) || null;
  }
  if (cleanLoc.includes('investigasi') || cleanLoc.includes('khusus')) {
    return (
      ruanganList.find(
        r =>
          r.kodeRuang === 'R.04' ||
          r.namaRuang.toLowerCase().includes('khusus') ||
          r.namaRuang.toLowerCase().includes('investigasi')
      ) || null
    );
  }
  if (cleanLoc.includes('irban iv') || cleanLoc.includes('irban 4') || cleanLoc.includes('wilayah iv') || cleanLoc.includes('wilayah 4')) {
    return ruanganList.find(r => r.kodeRuang === 'R.10' || r.namaRuang.toLowerCase().includes('irban iv')) || null;
  }
  if (cleanLoc.includes('irban iii') || cleanLoc.includes('irban 3') || cleanLoc.includes('wilayah iii') || cleanLoc.includes('wilayah 3')) {
    return ruanganList.find(r => r.kodeRuang === 'R.03' || r.namaRuang.toLowerCase().includes('irban iii')) || null;
  }
  if (cleanLoc.includes('irban ii') || cleanLoc.includes('irban 2') || cleanLoc.includes('wilayah ii') || cleanLoc.includes('wilayah 2')) {
    return ruanganList.find(r => r.kodeRuang === 'R.02' || r.namaRuang.toLowerCase().includes('irban ii')) || null;
  }
  if (cleanLoc.includes('irban i') || cleanLoc.includes('irban 1') || cleanLoc.includes('wilayah i') || cleanLoc.includes('wilayah 1')) {
    return ruanganList.find(r => r.kodeRuang === 'R.01' || r.namaRuang.toLowerCase().includes('irban i')) || null;
  }
  if (cleanLoc.includes('pengurus barang') || cleanLoc.includes('aset')) {
    const r7 = ruanganList.find(r => r.kodeRuang === 'R.07' || r.namaRuang.toLowerCase().includes('pengurus barang'));
    if (r7) return r7;
  }
  if (cleanLoc.includes('sekretariat') || cleanLoc.includes('umum') || cleanLoc.includes('kepegawaian')) {
    return ruanganList.find(r => r.kodeRuang === 'R.05' || r.namaRuang.toLowerCase().includes('sekretariat')) || null;
  }

  // 4. Substring match
  const subMatch = ruanganList.find(r => {
    const cleanRoom = r.namaRuang
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleanLoc.includes(cleanRoom) || cleanRoom.includes(cleanLoc);
  });
  if (subMatch) return subMatch;

  return null;
}

/**
 * Returns standardized display format for item's location room: e.g. "[R.01] Ruang Riksa Irban I"
 */
export function formatLokasiRuang(
  item: BarangBMD | { kodeLokasiRuang?: string },
  ruanganList: Ruangan[]
): string {
  const room = findRuanganForItem(item, ruanganList);
  if (room) {
    return `[${room.kodeRuang}] ${room.namaRuang}`;
  }
  return item.kodeLokasiRuang || '-';
}
