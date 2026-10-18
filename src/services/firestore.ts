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
      const snap = await getDocs(collection(db, FIRESTORE_COLLECTIONS.BARANG));
      return snap.empty;
    } catch (err) {
      console.warn('Could not inspect cloud database state:', err);
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
  }): Promise<void> {
    try {
      // 1. Instansi
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.INSTANSI, 'config'), params.instansi);

      // 2. Pejabat
      for (const p of params.pejabat) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PEJABAT, p.id), p);
      }

      // 3. Pegawai
      for (const peg of params.pegawai) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PEGAWAI, peg.id), peg);
      }

      // 4. Barang
      for (const b of params.barang) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.BARANG, b.id), b);
      }

      // 5. Pelimpahan
      for (const pel of params.pelimpahan) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PELIMPAHAN, pel.id), pel);
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
  } | null> {
    try {
      const [instansiSnap, pejabatSnap, pegawaiSnap, barangSnap, pelimpahanSnap, backupSnap] = await Promise.all([
        getDocs(collection(db, FIRESTORE_COLLECTIONS.INSTANSI)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.PEJABAT)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.PEGAWAI)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.BARANG)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.PELIMPAHAN)),
        getDocs(collection(db, FIRESTORE_COLLECTIONS.GSHEET_BACKUPS)),
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

      return {
        instansi,
        pejabat,
        pegawai,
        barang,
        pelimpahan,
        gsheetBackups,
      };
    } catch (error) {
      console.error('Error loading cloud data from Firestore:', error);
      return null;
    }
  },

  // Save single entity helpers
  async saveInstansi(config: InstansiConfig): Promise<void> {
    try {
      await setDoc(doc(db, FIRESTORE_COLLECTIONS.INSTANSI, 'config'), config);
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
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PEJABAT, p.id), p);
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

      for (const id of existingIds) {
        if (!newIds.has(id)) {
          await deleteDoc(doc(db, FIRESTORE_COLLECTIONS.PEGAWAI, id));
        }
      }
      for (const p of pegawaiList) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PEGAWAI, p.id), p);
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
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.BARANG, b.id), b);
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
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.PELIMPAHAN, p.id), p);
      }
    } catch (err) {
      console.error('Firestore savePelimpahan error:', err);
    }
  },

  async saveGoogleSheetBackups(backupList: GoogleSheetBackupRecord[]): Promise<void> {
    try {
      for (const b of backupList) {
        await setDoc(doc(db, FIRESTORE_COLLECTIONS.GSHEET_BACKUPS, b.id), b);
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

  // Reset database in Firestore back to official default seed
  async resetCloudDefaults(params: {
    instansi: InstansiConfig;
    pejabat: Pejabat[];
    pegawai: Pegawai[];
    barang: BarangBMD[];
    pelimpahan: PelimpahanBMD[];
  }): Promise<void> {
    // Clear existing docs in each collection
    const collectionsToClear = [
      FIRESTORE_COLLECTIONS.PEJABAT,
      FIRESTORE_COLLECTIONS.PEGAWAI,
      FIRESTORE_COLLECTIONS.BARANG,
      FIRESTORE_COLLECTIONS.PELIMPAHAN,
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
