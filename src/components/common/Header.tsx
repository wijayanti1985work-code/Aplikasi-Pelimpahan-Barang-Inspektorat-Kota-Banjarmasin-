import React from 'react';
import {
  Building2,
  Search,
  Database,
  Calendar,
  Menu,
  X,
  FileSpreadsheet,
  CloudCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { Pejabat, InstansiConfig } from '../../types/index.ts';
import type { CloudSyncState } from '../../services/firestore.ts';
import { LOGO_PEMKOT_BANJARMASIN_BASE64 } from '../../assets/logoPemko.ts';

interface HeaderProps {
  activeTab: string;
  onResetDatabase: () => void;
  pejabatList: Pejabat[];
  instansi: InstansiConfig;
  onOpenGoogleBackup: () => void;
  globalSearch: string;
  onGlobalSearchChange: (val: string) => void;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  cloudSyncState?: CloudSyncState;
  onRefreshCloudSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onResetDatabase,
  pejabatList,
  instansi,
  onOpenGoogleBackup,
  globalSearch,
  onGlobalSearchChange,
  isMobileMenuOpen,
  onToggleMobileMenu,
  cloudSyncState = { status: 'connected', message: 'Tersinkronisasi Realtime dengan Cloud Firestore' },
  onRefreshCloudSync,
}) => {
  const inspektur = pejabatList.find(p => p.peran === 'Pengguna Barang');
  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="no-print bg-[#0F766E] border-b border-[#0d6861] sticky top-0 z-30 shadow-md text-white">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile hamburger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-teal-100 hover:text-white hover:bg-teal-800/80 rounded-lg transition-colors cursor-pointer"
            aria-label="Buka Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center shadow-xs border border-teal-500/30 text-amber-300 overflow-hidden shrink-0">
            <img
              src={instansi.logoUtamaUrl || LOGO_PEMKOT_BANJARMASIN_BASE64}
              alt="Logo Pemerintah Kota Banjarmasin"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none uppercase drop-shadow-xs">
                {instansi.namaInstansi || 'INSPEKTORAT DAERAH'}
              </h1>
              <span className="hidden md:inline-flex items-center text-[10px] font-bold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded uppercase shadow-2xs">
                {instansi.namaPemda || 'KOTA BANJARMASIN'}
              </span>
            </div>
            <p className="text-[11px] text-teal-100/90 mt-0.5 flex items-center gap-1.5 font-normal">
              <span>SIP-BMD (Pelimpahan Barang Milik Daerah)</span>
              <span className="hidden lg:inline text-teal-300/60">•</span>
              <span className="hidden lg:inline text-teal-100 font-medium">{instansi.semboyan || 'KAYUH BAIMBAI'}</span>
            </p>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-teal-200 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={e => onGlobalSearchChange(e.target.value)}
              placeholder="Cari pegawai, kode barang, NIB, plat/seri..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-teal-800/60 hover:bg-teal-800/80 focus:bg-white focus:text-[#111827] focus:placeholder-gray-400 border border-teal-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CCFBF1] transition-all text-white placeholder:text-teal-200"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => onGlobalSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-teal-300 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Date, Cloud Status & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Cloud Database Persistence Badge */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
              cloudSyncState.status === 'connected' || cloudSyncState.status === 'synced'
                ? 'bg-teal-800/90 text-[#CCFBF1] border-teal-500/40'
                : cloudSyncState.status === 'connecting'
                ? 'bg-teal-800/50 text-teal-200 border-teal-600/30'
                : 'bg-amber-900/60 text-amber-200 border-amber-600/40'
            }`}
            title={cloudSyncState.message}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-semibold">Cloud Database Aktif</span>
            {onRefreshCloudSync && (
              <button
                type="button"
                onClick={onRefreshCloudSync}
                className="ml-1 p-0.5 text-teal-200 hover:text-white hover:bg-teal-700 rounded transition-colors"
                title="Perbarui Sinkronisasi Cloud"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="hidden xl:flex flex-col text-right">
            <span className="text-[11px] font-medium text-teal-100 flex items-center justify-end gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#CCFBF1]" />
              {todayStr}
            </span>
            <span className="text-xs font-semibold text-white truncate max-w-[190px]">
              {inspektur ? inspektur.nama : 'Inspektur Kota'}
            </span>
          </div>

          <div className="flex items-center gap-2 border-l border-teal-600/60 pl-2.5">
            {/* Google Sheet Backup button with Pastel Aqua highlight */}
            <button
              type="button"
              onClick={onOpenGoogleBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0F766E] bg-[#CCFBF1] hover:bg-white active:bg-teal-50 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Cadangkan database ke Google Sheets online & Google Drive"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F766E]" />
              <span className="hidden sm:inline">Backup G-Sheets</span>
            </button>

            {/* Reset Database Button */}
            <button
              type="button"
              onClick={onResetDatabase}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-teal-100 hover:text-rose-200 hover:bg-teal-800/80 border border-teal-600/40 rounded-lg transition-colors cursor-pointer"
              title="Kembalikan data ke data awal resmi"
            >
              <Database className="w-3.5 h-3.5 text-teal-200" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
