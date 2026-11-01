import type { Pegawai } from '../types/index.ts';

export const MAX_PEGAWAI_LIMIT = 150;

/**
 * Daftar pegawai lama telah dihapus secara tuntas sesuai permintaan pengguna.
 * Tidak ada lagi data nama pegawai lama bawaan pada sistem.
 * Data pegawai baru yang diinput oleh pengguna akan dipertahankan sepenuhnya.
 */
export const SEED_PEGAWAI_150: Pegawai[] = [];
