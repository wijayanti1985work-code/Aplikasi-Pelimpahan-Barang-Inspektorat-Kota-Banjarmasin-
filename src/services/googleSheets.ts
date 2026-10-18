import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import type {
  BarangBMD,
  InstansiConfig,
  Pegawai,
  Pejabat,
  PelimpahanBMD,
} from '../types/index.ts';
import { formatTanggalIndonesia, formatRupiah, labelKondisi } from '../utils/logic.ts';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Required scopes from user request and metadata
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token caching (NOT in localStorage per workspace-integration rules)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari akun Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

interface BackupPayload {
  pegawaiList: Pegawai[];
  barangList: BarangBMD[];
  pelimpahanList: PelimpahanBMD[];
  pejabatList: Pejabat[];
  instansi: InstansiConfig;
}

/**
 * Creates and formats a new Google Spreadsheet containing full BMD database
 */
export async function backupDatabaseToGoogleSheets(
  payload: BackupPayload
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Anda belum masuk dengan akun Google. Silakan login terlebih dahulu.');
  }

  const { pegawaiList, barangList, pelimpahanList, pejabatList, instansi } = payload;
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString('id-ID', { hour12: false }).replace(/:/g, '.');
  const title = `Backup_SIP_BMD_${instansi.namaInstansi.replace(/\s+/g, '_')}_${dateStr}_${timeStr}`;

  // 1. Create Spreadsheet with initial 4 sheets
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { title: 'Ringkasan & Profil' } },
        { properties: { title: 'Data Pegawai (Pemakai)' } },
        { properties: { title: 'Inventaris BMD' } },
        { properties: { title: 'Data Pelimpahan (BAST)' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error('Google Sheets create error:', errText);
    throw new Error(`Gagal membuat Google Spreadsheet: ${createRes.statusText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Data Rows for each sheet

  // Sheet 1: Ringkasan
  const totalNilaiAset = barangList.reduce((sum, b) => sum + (b.nilaiPerolehan || 0), 0);
  const ringkasanRows = [
    ['SISTEM INFORMASI PELIMPAHAN BARANG MILIK DAERAH (SIP-BMD)'],
    [instansi.namaPemda, instansi.namaInstansi],
    ['Alamat:', instansi.alamat],
    ['Kontak:', `Telp: ${instansi.telepon} | Email: ${instansi.email} | Web: ${instansi.website}`],
    [''],
    ['INFORMASI CADANGAN (BACKUP DATABASE)'],
    ['Tanggal & Jam Backup:', `${formatTanggalIndonesia(dateStr, true)} ${now.toLocaleTimeString('id-ID')}`],
    ['ID Dokumen Spreadsheet:', spreadsheetId],
    [''],
    ['STATISTIK REKAPITULASI ASET'],
    ['Total Pegawai Pemakai BMD:', pegawaiList.length, 'Orang'],
    ['Pegawai Aktif:', pegawaiList.filter(p => p.status === 'Aktif').length, 'Orang'],
    ['Total Inventaris BMD:', barangList.length, 'Unit / Aset'],
    ['Barang Sedang Dipakai:', barangList.filter(b => b.statusPemakaian === 'Dipakai').length, 'Unit'],
    ['Barang Tersedia di Gudang:', barangList.filter(b => b.statusPemakaian === 'Tersedia').length, 'Unit'],
    ['Total Nilai Perolehan Aset:', formatRupiah(totalNilaiAset)],
    ['Total Transaksi Pelimpahan (BAST):', pelimpahanList.length, 'Ketetapan'],
    [''],
    ['PEJABAT PENGELOLA BMD'],
    ['Pengguna Barang:', pejabatList.find(p => p.peran === 'Pengguna Barang')?.nama || '-', `NIP. ${pejabatList.find(p => p.peran === 'Pengguna Barang')?.nip || '-'}`],
    ['Pengurus Barang:', pejabatList.find(p => p.peran === 'Pengurus Barang')?.nama || '-', `NIP. ${pejabatList.find(p => p.peran === 'Pengurus Barang')?.nip || '-'}`],
  ];

  // Sheet 2: Data Pegawai
  const pegawaiRows = [
    [
      'No',
      'Nama Pegawai & Gelar',
      'NIP',
      'Pangkat / Golongan',
      'Jabatan',
      'Unit Kerja',
      'Status',
      'Masa Kerja Jabatan',
      'No. Telepon',
      'Email Dinas',
    ],
    ...pegawaiList.map((p, i) => [
      i + 1,
      p.nama,
      `'${p.nip}`,
      p.pangkatGol,
      p.jabatan,
      p.unitKerja,
      p.status,
      p.masaKerjaJabatan,
      p.telepon || '-',
      p.email || '-',
    ]),
  ];

  // Sheet 3: Inventaris BMD
  const barangRows = [
    [
      'No',
      'Kode Barang / NIB',
      'Nama Barang',
      'Merk / Spesifikasi',
      'No. Seri / Rangka / Plat',
      'Tahun',
      'Jumlah',
      'Satuan',
      'Nilai Perolehan (Rp)',
      'Kondisi',
      'Lokasi Ruangan',
      'Status Pemakaian',
      'Pegawai Pemakai',
      'Sumber Dana',
      'Keterangan',
    ],
    ...barangList.map((b, i) => {
      const pemakai = b.idPegawaiPemakai ? pegawaiList.find(p => p.id === b.idPegawaiPemakai) : null;
      const kondisi = labelKondisi(b.kondisi).full;
      return [
        i + 1,
        `'${b.kodeBarang}`,
        b.namaBarang,
        b.merkTipe,
        `'${b.noSeri}`,
        b.tahunPerolehan,
        b.jumlah,
        b.satuan,
        b.nilaiPerolehan,
        kondisi,
        b.kodeLokasiRuang,
        b.statusPemakaian,
        pemakai ? pemakai.nama : '-',
        b.sumberDana,
        b.keterangan || '-',
      ];
    }),
  ];

  // Sheet 4: Pelimpahan BMD
  const pelimpahanRows = [
    [
      'No',
      'Nomor BAST',
      'Nomor SK Penetapan',
      'Nomor SPTJM',
      'Tanggal Pelimpahan',
      'Pegawai Pemakai (Pihak Kedua)',
      'NIP Pemakai',
      'Jabatan Pemakai',
      'Jumlah Aset Dipegang',
      'Daftar Rincian Barang',
      'Total Nilai (Rp)',
      'Status Pengesahan',
      'Keperluan',
      'Catatan Penyerahan',
    ],
    ...pelimpahanList.map((pel, i) => {
      const peg = pegawaiList.find(p => p.id === pel.idPegawai);
      const items = barangList.filter(b => pel.barangIds.includes(b.id));
      const totalNilai = items.reduce((sum, b) => sum + (b.nilaiPerolehan || 0), 0);
      const itemsDetail = items.map(item => `${item.namaBarang} (${item.noSeri})`).join('; ');

      return [
        i + 1,
        pel.nomorBAST,
        pel.nomorSK,
        pel.nomorSPTJM,
        pel.tanggal,
        peg?.nama || '-',
        peg ? `'${peg.nip}` : '-',
        peg?.jabatan || '-',
        items.length,
        itemsDetail,
        totalNilai,
        pel.statusDokumen,
        pel.keperluan,
        pel.catatan || '-',
      ];
    }),
  ];

  // 3. Batch Update Values across all 4 sheets
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: "'Ringkasan & Profil'!A1",
            values: ringkasanRows,
          },
          {
            range: "'Data Pegawai (Pemakai)'!A1",
            values: pegawaiRows,
          },
          {
            range: "'Inventaris BMD'!A1",
            values: barangRows,
          },
          {
            range: "'Data Pelimpahan (BAST)'!A1",
            values: pelimpahanRows,
          },
        ],
      }),
    }
  );

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    console.error('Failed to populate Google Sheets rows:', errText);
    throw new Error('Spreadsheet berhasil dibuat namun pengisian baris gagal.');
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}
