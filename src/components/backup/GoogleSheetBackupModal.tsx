import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  CloudUpload,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Clock,
  ShieldCheck,
  AlertCircle,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type {
  BarangBMD,
  GoogleSheetBackupRecord,
  InstansiConfig,
  Pegawai,
  Pejabat,
  PelimpahanBMD,
} from '../../types/index.ts';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  backupDatabaseToGoogleSheets,
  getAccessToken,
} from '../../services/googleSheets.ts';
import { StorageService } from '../../services/storage.ts';
import { formatTanggalIndonesia } from '../../utils/logic.ts';

import { ConfirmModal } from '../common/ConfirmModal.tsx';

interface GoogleSheetBackupModalProps {
  pegawaiList: Pegawai[];
  barangList: BarangBMD[];
  pelimpahanList: PelimpahanBMD[];
  pejabatList: Pejabat[];
  instansi: InstansiConfig;
  onClose: () => void;
}

export const GoogleSheetBackupModal: React.FC<GoogleSheetBackupModalProps> = ({
  pegawaiList,
  barangList,
  pelimpahanList,
  pejabatList,
  instansi,
  onClose,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStep, setBackupStep] = useState<string>('');
  const [lastBackupResult, setLastBackupResult] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [backupHistory, setBackupHistory] = useState<GoogleSheetBackupRecord[]>([]);
  const [showBackupConfirm, setShowBackupConfirm] = useState(false);
  const [deleteHistoryId, setDeleteHistoryId] = useState<string | null>(null);

  useEffect(() => {
    setBackupHistory(StorageService.getGoogleSheetBackups());

    const unsubscribe = initAuth(
      user => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setErrorMsg('');
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      setCurrentUser(res.user);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Gagal login dengan akun Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await googleSignOut();
    setCurrentUser(null);
  };

  const proceedWithBackup = async () => {
    setShowBackupConfirm(false);
    setErrorMsg('');
    setLastBackupResult(null);

    setIsBackingUp(true);
    setBackupStep('Menginisialisasi Google Sheets API...');

    try {
      setBackupStep('Membuat file Spreadsheet baru di Google Drive...');
      const result = await backupDatabaseToGoogleSheets({
        pegawaiList,
        barangList,
        pelimpahanList,
        pejabatList,
        instansi,
      });

      setBackupStep('Menyimpan riwayat pencadangan...');
      const newRecord: GoogleSheetBackupRecord = {
        id: 'bkp-' + Date.now(),
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
        spreadsheetTitle: result.title,
        createdAt: new Date().toISOString(),
        accountEmail: currentUser?.email || undefined,
        totalPegawai: pegawaiList.length,
        totalBarang: barangList.length,
        totalPelimpahan: pelimpahanList.length,
      };

      StorageService.addGoogleSheetBackup(newRecord);
      setBackupHistory(StorageService.getGoogleSheetBackups());
      setLastBackupResult({ url: result.spreadsheetUrl, title: result.title });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Terjadi kesalahan saat mencadangkan ke Google Sheets.');
    } finally {
      setIsBackingUp(false);
      setBackupStep('');
    }
  };

  const confirmDeleteHistory = () => {
    if (deleteHistoryId) {
      StorageService.deleteGoogleSheetBackup(deleteHistoryId);
      setBackupHistory(StorageService.getGoogleSheetBackups());
      setDeleteHistoryId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Cadangkan Database ke Google Sheets</h2>
              <p className="text-xs text-slate-400">
                Ekspor seluruh data BMD ke Google Drive dalam bentuk spreadsheet online
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User Status / Login Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google Account'}
                    className="w-10 h-10 rounded-full border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      {currentUser.displayName || 'Akun Google Terhubung'}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                      Aktif
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-slate-800">Masuk dengan Akun Google</p>
                <p className="text-[11px] text-slate-500">
                  Diperlukan izin Google Sheets & Drive untuk membuat spreadsheet cadangan.
                </p>
              </div>
            )}

            <div>
              {currentUser ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar Akun
                </button>
              ) : (
                /* Official Google Sign-In button standard */
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Backup Summary Box */}
          <div className="p-4 bg-[#CCFBF1]/30 rounded-xl border border-teal-200 space-y-2">
            <h4 className="text-xs font-bold text-[#0F766E] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
              Rincian Data Yang Akan Dicadangkan:
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-[#E5E7EB] text-center">
                <span className="text-[11px] text-[#6B7280] block">Pegawai</span>
                <span className="text-base font-extrabold text-[#111827]">{pegawaiList.length}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#E5E7EB] text-center">
                <span className="text-[11px] text-[#6B7280] block">Inventaris BMD</span>
                <span className="text-base font-extrabold text-[#111827]">{barangList.length}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#E5E7EB] text-center">
                <span className="text-[11px] text-[#6B7280] block">Pelimpahan (BAST)</span>
                <span className="text-base font-extrabold text-[#111827]">{pelimpahanList.length}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#0F766E] pt-1">
              File akan dibuat dengan 4 sheet terstruktur: <b>Ringkasan & Profil</b>, <b>Data Pegawai</b>, <b>Inventaris BMD</b>, dan <b>Data Pelimpahan</b>.
            </p>
          </div>

          {/* Action Trigger Button */}
          <div>
            <button
              type="button"
              onClick={() => setShowBackupConfirm(true)}
              disabled={!currentUser || isBackingUp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{backupStep || 'Sedang Mencadangkan...'}</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>Cadangkan Database Sekarang ke Google Sheets</span>
                </>
              )}
            </button>
            {!currentUser && (
              <p className="text-[11px] text-slate-400 text-center mt-1.5">
                * Silakan Sign in with Google terlebih dahulu untuk mengaktifkan tombol cadangkan.
              </p>
            )}
          </div>

          {/* Last Backup Result Screen */}
          {lastBackupResult && (
            <div className="p-4 bg-emerald-100/70 border border-emerald-300 rounded-xl space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Pencadangan Berhasil Disimpan di Google Drive!</span>
              </div>
              <p className="text-xs text-emerald-900 font-medium">{lastBackupResult.title}</p>
              <a
                href={lastBackupResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>Buka Google Spreadsheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* History of Past Backups */}
          {backupHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700 block">
                Riwayat Pencadangan Google Sheets ({backupHistory.length})
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {backupHistory.map(b => (
                  <div
                    key={b.id}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate">{b.spreadsheetTitle}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(b.createdAt).toLocaleString('id-ID')} · {b.totalBarang} Aset
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={b.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Buka Spreadsheet"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteHistoryId(b.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Koneksi Aman OAuth 2.0 Google Workspace</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Google Sheets Backup */}
      <ConfirmModal
        isOpen={showBackupConfirm}
        title="Konfirmasi Pencadangan Google Sheets"
        message={`Aplikasi akan membuat spreadsheet baru di Google Drive (${currentUser?.email || 'Akun Google Anda'}) dan menyalin data inventaris BMD secara terstruktur.`}
        subMessage={`Total data yang akan dicadangkan: ${pegawaiList.length} Pegawai, ${barangList.length} Aset BMD, ${pelimpahanList.length} Ketetapan Pelimpahan, serta profil Instansi & Kop Surat.`}
        confirmLabel="Ya, Buat Spreadsheet Cadangan"
        cancelLabel="Batal"
        variant="success"
        onConfirm={proceedWithBackup}
        onCancel={() => setShowBackupConfirm(false)}
      />

      {/* Confirmation Modal for History Removal */}
      <ConfirmModal
        isOpen={deleteHistoryId !== null}
        title="Hapus Catatan Riwayat"
        message="Hapus catatan riwayat pencadangan ini dari daftar lokal? Spreadsheet di Google Drive Anda tidak akan terhapus."
        confirmLabel="Hapus dari Riwayat"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={confirmDeleteHistory}
        onCancel={() => setDeleteHistoryId(null)}
      />
    </div>
  );
};
