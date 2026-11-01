import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type {
  Pegawai,
  BarangBMD,
  PelimpahanBMD,
  Pejabat,
  InstansiConfig,
  GoogleSheetBackupRecord,
  PelepasanAsetRecord,
  Ruangan,
  UnitKerja,
} from '../types/index.ts';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with configured databaseId (if specified)
export const db: Firestore = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection names
export const FIRESTORE_COLLECTIONS = {
  INSTANSI: 'instansi',
  PEJABAT: 'pejabat',
  PEGAWAI: 'pegawai',
  BARANG: 'barang',
  PELIMPAHAN: 'pelimpahan',
  GSHEET_BACKUPS: 'gsheet_backups',
  PELEPASAN: 'pelepasan',
  RUANGAN: 'ruangan',
  UNIT_KERJA: 'unitKerja',
  SYSTEM_META: 'system_meta',
};

// Validate connection per Firebase skill directive
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network unavailable. Using local storage fallback.');
      return false;
    }
    // Document not existing on server is normal and means connection succeeded
    return true;
  }
}

/**
 * Recursively strips keys with undefined values from objects and arrays
 * so Firestore setDoc / updateDoc never throws:
 * "FirebaseError: Function setDoc() called with invalid data. Unsupported field value: undefined"
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

export interface CloudSyncState {
  status: 'connecting' | 'connected' | 'synced' | 'error' | 'offline';
  message: string;
  lastSyncedAt?: Date;
}

export const FirestoreService = {
  // Test connection
  testConnection: testFirestoreConnection,

  // Check if Firestore collections are empty (first time run)
  async isCloudDatabaseEmpty(): Promise<boolean> {
    try {
      // Check system init doc first
      const [metaSnap, barangSnap, pegawaiSnap] = await Promise.all([
        getDocs(collection(db, FIRESTORE_COLLECTIONS.SYSTEM_META)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.BARANG)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.PEGAWAI)),
      ]);

      if (!metaSnap.empty || !barangSnap.empty || !pegawaiSnap.empty) {
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Could not inspect cloud database state:', err);
      // If we cannot reach cloud, assume NOT empty to prevent accidental reseed overwrite!
      return false;
    }
  },

  // Seed initial cloud data if empty
  async seedInitialCloudData(params: {
    instansi: InstansiConfig;
    pejabat: Pejabat[];
    pegawai: Pegawai[];
    barang: BarangBMD[];
    pelimpahan: PelimpahanBMD[];
    ruangan?: Ruangan[];
    unitKerja?: UnitKerja[];
  }): Promise<void> {
    try {
      // Mark system as initialized so future restarts never re-seed
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.SYSTEM_META, 'init_flag'), {
        initialized: true,
        seededAt: new Date().toISOString(),
        version: '1.3.0',
      });

      // 1. Instansi
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.INSTANSI, 'config'), sanitizeForFirestore(params.instansi));

      // 2. Pejabat
      for (const p of params.pejabat) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PEJABAT, p.id), sanitizeForFirestore(p));
      }

      // 3. Pegawai
      for (const peg of params.pegawai) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PEGAWAI, peg.id), sanitizeForFirestore(peg));
      }

      // 4. Barang
      for (const b of params.barang) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.BARANG, b.id), sanitizeForFirestore(b));
      }

      // 5. Pelimpahan
      for (const pel of params.pelimpahan) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PELIMPAHAN, pel.id), sanitizeForFirestore(pel));
      }

      // 6. Ruangan
      if (params.ruangan && params.ruangan.length > 0) {
        for (const r of params.ruangan) {
          await setDoc(doc(db, FIRESTORE_COLLECTIONS.RUANGAN, r.id), sanitizeForFirestore(r));
        }
      }

      // 7. Unit Kerja
      if (params.unitKerja && params.unitKerja.length > 0) {
        for (const u of params.unitKerja) {
          await setDoc(doc(db, FIRESTORE_COLLECTIONS.UNIT_KERJA, u.id), sanitizeForFirestore(u));
        }
      }
    } catch (error) {
      console.error('Error seeding initial data to Firestore:', error);
      throw error;
    }
  },

  // Load all data from Firestore
  async loadAllCloudData(): Promise<{
    instansi?: InstansiConfig;
    pejabat: Pejabat[];
    pegawai: Pegawai[];
    barang: BarangBMD[];
    pelimpahan: PelimpahanBMD[];
    gsheetBackups: GoogleSheetBackupRecord[];
    pelepasan: PelepasanAsetRecord[];
    ruangan: Ruangan[];
    unitKerja: UnitKerja[];
  } | null> {
    try {
      const [instansiSnap, pejabatSnap, pegawaiSnap, barangSnap, pelimpahanSnap, backupSnap, pelepasanSnap, ruanganSnap, unitKerjaSnap] = await Promise.all([
        getDocs(collection(db, FIRESTORE_COLLECTIONS.INSTANSI)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.PEJABAT)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.PEGAWAI)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.BARANG)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.PELIMPAHAN)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.GSHEET_BACKUPS)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.PELEPASAN)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.RUANGAN)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.UNIT_KERJA)),
      ]);

      let instansi: InstansiConfig | undefined;
      instansiSnap.forEach(d => {
        if (d.id === 'config') instansi = d.data() as InstansiConfig;
      });

      const pejabat: Pejabat[] = [];
      pejabatSnap.forEach(d => pejabat.push(d.data() as Pejabat));

      const pegawai: Pegawai[] = [];
      pegawaiSnap.forEach(d => pegawai.push(d.data() as Pegawai));

      const barang: BarangBMD[] = [];
      barangSnap.forEach(d => barang.push(d.data() as BarangBMD));

      const pelimpahan: PelimpahanBMD[] = [];
      pelimpahanSnap.forEach(d => pelimpahan.push(d.data() as PelimpahanBMD));

      const gsheetBackups: GoogleSheetBackupRecord[] = [];
      backupSnap.forEach(d => gsheetBackups.push(d.data() as GoogleSheetBackupRecord));

      const pelepasan: PelepasanAsetRecord[] = [];
      pelepasanSnap.forEach(d => pelepasan.push(d.data() as PelepasanAsetRecord));

      const ruangan: Ruangan[] = [];
      ruanganSnap.forEach(d => ruangan.push(d.data() as Ruangan));

      const unitKerja: UnitKerja[] = [];
      unitKerjaSnap.forEach(d => unitKerja.push(d.data() as UnitKerja));

      return {
        instansi,
        pejabat,
        pegawai,
        barang,
        pelimpahan,
        gsheetBackups,
        pelepasan,
        ruangan,
        unitKerja,
      };
    } catch (error) {
      console.error('Error loading cloud data from Firestore:', error);
      return null;
    }
  },

  // Save single entity helpers
  async saveInstansi(config: InstansiConfig): Promise<void> {
    try {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.INSTANSI, 'config'), sanitizeForFirestore(config));
    } catch (err) {
      console.error('Firestore saveInstansi error:', err);
    }
  },

  async savePejabat(pejabatList: Pejabat[]): Promise<void> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.PEJABAT));
      const existingIds = new Set(snap.docs.map(d => d.id));
      const newIds = new Set(pejabatList.map(p => p.id));

      // Remove deleted
      for (const id of existingIds) {
        if (!newIds.has(id)) {
          await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.PEJABAT, id));
        }
      }
      // Save all current
      for (const p of pejabatList) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PEJABAT, p.id), sanitizeForFirestore(p));
      }
    } catch (err) {
      console.error('Firestore savePejabat error:', err);
    }
  },

  async savePegawai(pegawaiList: Pegawai[]): Promise<void> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.PEGAWAI));
      const existingIds = new Set(snap.docs.map(d => d.id));
      const newIds = new Set(pegawaiList.map(p => p.id));

      let batch = writeBatch(db);
      let count = 0;

      // Delete removed docs
      for (const id of existingIds) {
        if (!newIds.has(id)) {
          batch.delete(doc(db, FIRESTORE_COLLECTIONS.PEGAWAI, id));
          count++;
          if (count >= 400) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        }
      }

      // Upsert current docs
      for (const p of pegawaiList) {
        batch.set(doc(db, FIRESTORE_COLLECTIONS.PEGAWAI, p.id), sanitizeForFirestore(p));
        count++;
        if (count >= 400) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        await batch.commit();
      }
    } catch (err) {
      console.error('Firestore savePegawai error:', err);
    }
  },

  async saveBarang(barangList: BarangBMD[]): Promise<void> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.BARANG));
      const existingIds = new Set(snap.docs.map(d => d.id));
      const newIds = new Set(barangList.map(b => b.id));

      for (const id of existingIds) {
        if (!newIds.has(id)) {
          await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.BARANG, id));
        }
      }
      for (const b of barangList) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.BARANG, b.id), sanitizeForFirestore(b));
      }
    } catch (err) {
      console.error('Firestore saveBarang error:', err);
    }
  },

  async savePelimpahan(pelimpahanList: PelimpahanBMD[]): Promise<void> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.PELIMPAHAN));
      const existingIds = new Set(snap.docs.map(d => d.id));
      const newIds = new Set(pelimpahanList.map(p => p.id));

      for (const id of existingIds) {
        if (!newIds.has(id)) {
          await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.PELIMPAHAN, id));
        }
      }
      for (const p of pelimpahanList) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PELIMPAHAN, p.id), sanitizeForFirestore(p));
      }
    } catch (err) {
      console.error('Firestore savePelimpahan error:', err);
    }
  },

  async saveGoogleSheetBackups(backupList: GoogleSheetBackupRecord[]): Promise<void> {
    try {
      for (const b of backupList) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.GSHEET_BACKUPS, b.id), sanitizeForFirestore(b));
      }
    } catch (err) {
      console.error('Firestore saveGoogleSheetBackups error:', err);
    }
  },

  async deleteGoogleSheetBackup(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.GSHEET_BACKUPS, id));
    } catch (err) {
      console.error('Firestore deleteGoogleSheetBackup error:', err);
    }
  },

  // Pelepasan Aset Records
  async savePelepasan(record: PelepasanAsetRecord): Promise<void> {
    try {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.PELEPASAN, record.id), sanitizeForFirestore(record));
    } catch (err) {
      console.error('Firestore savePelepasan error:', err);
    }
  },

  async getPelepasanList(): Promise<PelepasanAsetRecord[]> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.PELEPASAN));
      const list: PelepasanAsetRecord[] = [];
      snap.forEach(d => list.push(d.data() as PelepasanAsetRecord));
      return list;
    } catch (err) {
      console.error('Firestore getPelepasanList error:', err);
      return [];
    }
  },

  async deletePegawaiDoc(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.PEGAWAI, id));
    } catch (err) {
      console.error('Firestore deletePegawaiDoc error:', err);
    }
  },

  async deleteBarangDoc(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.BARANG, id));
    } catch (err) {
      console.error('Firestore deleteBarangDoc error:', err);
    }
  },

  async deletePelimpahanDoc(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.PELIMPAHAN, id));
    } catch (err) {
      console.error('Firestore deletePelimpahanDoc error:', err);
    }
  },

  // Master Ruangan methods
  async saveRuangan(ruanganList: Ruangan[]): Promise<void> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.RUANGAN));
      const existingIds = new Set(snap.docs.map(d => d.id));
      const newIds = new Set(ruanganList.map(r => r.id));

      for (const id of existingIds) {
        if (!newIds.has(id)) {
          await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.RUANGAN, id));
        }
      }
      for (const r of ruanganList) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.RUANGAN, r.id), sanitizeForFirestore(r));
      }
    } catch (err) {
      console.error('Firestore saveRuangan error:', err);
    }
  },

  async deleteRuanganDoc(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.RUANGAN, id));
    } catch (err) {
      console.error('Firestore deleteRuanganDoc error:', err);
    }
  },

  // Master Unit Kerja / Wilayah Kerja methods
  async saveUnitKerja(unitKerjaList: UnitKerja[]): Promise<void> {
    try {
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.UNIT_KERJA));
      const existingIds = new Set(snap.docs.map(d => d.id));
      const newIds = new Set(unitKerjaList.map(u => u.id));

      for (const id of existingIds) {
        if (!newIds.has(id)) {
          await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.UNIT_KERJA, id));
        }
      }
      for (const u of unitKerjaList) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.UNIT_KERJA, u.id), sanitizeForFirestore(u));
      }
    } catch (err) {
      console.error('Firestore saveUnitKerja error:', err);
    }
  },

  async deleteUnitKerjaDoc(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.UNIT_KERJA, id));
    } catch (err) {
      console.error('Firestore deleteUnitKerjaDoc error:', err);
    }
  },

  // Reset database in Firestore back to official default seed
  async resetCloudDefaults(params: {
    instansi: InstansiConfig;
    pejabat: Pejabat[];
    pegawai: Pegawai[];
    barang: BarangBMD[];
    pelimpahan: PelimpahanBMD[];
    ruangan?: Ruangan[];
    unitKerja?: UnitKerja[];
  }): Promise<void> {
    // Clear existing docs in each collection
    const collectionsToClear = [
      FIRESTORE_COLLECTIONS.PEJABAT,
      FIRESTORE_COLLECTIONS.PEGAWAI,
      FIRESTORE_COLLECTIONS.BARANG,
      FIRESTORE_COLLECTIONS.PELIMPAHAN,
      FIRESTORE_COLLECTIONS.RUANGAN,
      FIRESTORE_COLLECTIONS.UNIT_KERJA,
    ];

    for (const colName of collectionsToClear) {
      const snap = await getDocs(collection(db, colName));
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    }

    await this.seedInitialCloudData(params);
  },
};
