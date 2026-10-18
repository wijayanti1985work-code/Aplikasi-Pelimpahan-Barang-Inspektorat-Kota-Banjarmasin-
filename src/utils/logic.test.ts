import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRupiah,
  terbilang,
  terbilangRupiah,
  formatTanggalIndonesia,
  labelKondisi,
  computeDashboardStats,
  isValidNIP,
  generateNomorDokumen,
  filterBarang,
  filterPegawai,
} from './logic.ts';
import type { BarangBMD, Pegawai, PelimpahanBMD } from '../types/index.ts';

test('formatRupiah correctly formats integer amount to IDR', () => {
  const result = formatRupiah(15000000);
  assert.ok(result.includes('15.000.000'));
  assert.equal(formatRupiah(0), 'Rp\u00a00');
});

test('terbilang converts numbers accurately', () => {
  assert.equal(terbilang(0), 'nol');
  assert.equal(terbilang(12), 'dua belas');
  assert.equal(terbilang(25), 'dua puluh lima');
  assert.equal(terbilang(105), 'seratus lima');
  assert.equal(terbilang(2500000), 'dua juta lima ratus ribu');
  assert.equal(terbilangRupiah(2500000), 'Dua juta lima ratus ribu Rupiah');
});

test('formatTanggalIndonesia formats date strings properly', () => {
  const formatted = formatTanggalIndonesia('2024-08-17');
  assert.equal(formatted, '17 Agustus 2024');
  assert.equal(formatTanggalIndonesia(undefined), '-');
});

test('labelKondisi returns correct Indonesian badges and texts', () => {
  assert.equal(labelKondisi('B').full, 'Baik');
  assert.equal(labelKondisi('RR').full, 'Rusak Ringan');
  assert.equal(labelKondisi('RB').full, 'Rusak Berat');
});

test('isValidNIP validates 18 digits format', () => {
  assert.equal(isValidNIP('197311232007012008'), true);
  assert.equal(isValidNIP('19731123 200701 2 008'), true);
  assert.equal(isValidNIP('123'), false);
  assert.equal(isValidNIP('abcd'), false);
});

test('generateNomorDokumen produces official government document codes', () => {
  assert.equal(generateNomorDokumen('BAST', 5, 2024), '027/005/BAST-BMD/ITK-BJM/2024');
  assert.equal(generateNomorDokumen('SK', 12, 2024), '800.1.11.1/012-SK/ITK-BJM/2024');
  assert.equal(generateNomorDokumen('SPTJM', 5, 2024), '028/005/SPTJM-BMD/ITK-BJM/2024');
});

test('computeDashboardStats calculates totals and counts accurately', () => {
  const dummyPegawai: Pegawai[] = [
    {
      id: 'p1',
      nama: 'Ahmad',
      nip: '198001012005011001',
      pangkatGol: 'Penata / III/c',
      jabatan: 'Auditor',
      foto: '',
      unitKerja: 'Irban I',
      status: 'Aktif',
      masaKerjaJabatan: '4 Tahun',
    },
    {
      id: 'p2',
      nama: 'Budi',
      nip: '198202022006021002',
      pangkatGol: 'Penata Muda / III/a',
      jabatan: 'Auditor Pertama',
      foto: '',
      unitKerja: 'Irban II',
      status: 'Non-Aktif',
      masaKerjaJabatan: '1 Tahun',
    },
  ];

  const dummyBarang: BarangBMD[] = [
    {
      id: 'b1',
      kodeBarang: '1.3.2.05.01',
      namaBarang: 'Laptop ASUS',
      merkTipe: 'Zenbook',
      noSeri: 'SN1234',
      tahunPerolehan: 2023,
      jumlah: 1,
      satuan: 'Unit',
      nilaiPerolehan: 18000000,
      kondisi: 'B',
      sumberDana: 'APBD',
      kodeLokasiRuang: 'Irban I',
      fotoBarang: '',
      statusPemakaian: 'Dipakai',
    },
    {
      id: 'b2',
      kodeBarang: '1.3.2.05.02',
      namaBarang: 'Printer Epson',
      merkTipe: 'L3210',
      noSeri: 'SN5678',
      tahunPerolehan: 2022,
      jumlah: 1,
      satuan: 'Unit',
      nilaiPerolehan: 3500000,
      kondisi: 'RR',
      sumberDana: 'APBD',
      kodeLokasiRuang: 'Sekretariat',
      fotoBarang: '',
      statusPemakaian: 'Tersedia',
    },
  ];

  const dummyPelimpahan: PelimpahanBMD[] = [
    {
      id: 'pel-1',
      nomorBAST: '027/001/BAST-BMD/ITK-BJM/2024',
      nomorSK: '800.1.11.1/001-SK/ITK-BJM/2024',
      nomorSPTJM: '028/001/SPTJM-BMD/ITK-BJM/2024',
      tanggal: '2024-01-10',
      idPegawai: 'p1',
      barangIds: ['b1'],
      keperluan: 'Pemeriksaan',
      statusDokumen: 'Disahkan',
    },
  ];

  const stats = computeDashboardStats(dummyPegawai, dummyBarang, dummyPelimpahan);
  assert.equal(stats.totalPegawai, 2);
  assert.equal(stats.pegawaiAktif, 1);
  assert.equal(stats.totalBarang, 2);
  assert.equal(stats.barangTerpakai, 1);
  assert.equal(stats.barangTersedia, 1);
  assert.equal(stats.totalNilaiAset, 21500000);
  assert.equal(stats.kondisiBaik, 1);
  assert.equal(stats.kondisiRusakRingan, 1);
  assert.equal(stats.kondisiRusakBerat, 0);
  assert.equal(stats.totalPelimpahan, 1);
});
