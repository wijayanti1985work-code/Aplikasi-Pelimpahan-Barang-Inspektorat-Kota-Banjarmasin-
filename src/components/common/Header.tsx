import React from 'react';
import { Building2, Search, Bell, ShieldCheck, Database, Calendar, Menu, X, FileSpreadsheet } from 'lucide-react';
import type { Pejabat, InstansiConfig } from '../../types/index.ts';

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
}) => {
  const inspektur = pejabatList.find(p => p.peran === 'Pengguna Barang');
  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="no-print bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile hamburger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Buka Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-950 flex items-center justify-center shadow-xs border border-blue-800/40 text-amber-400 overflow-hidden shrink-0">
            {instansi.logoUtamaUrl ? (
              <img src={instansi.logoUtamaUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
            ) : (
              <Building2 className="w-5 h-5 text-amber-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-none uppercase">
                {instansi.namaInstansi || 'SIP-BMD INSPEKTORAT'}
              </h1>
              <span className="hidden md:inline-flex items-center text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 uppercase">
                {instansi.namaPemda || 'Kota Banjarmasin'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>Sistem Informasi Pelimpahan Barang Milik Daerah</span>
              <span className="hidden lg:inline text-slate-300">|</span>
              <span className="hidden lg:inline text-slate-500 font-medium">{instansi.semboyan || 'Baiman & Bermartabat'}</span>
            </p>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearch}
              onChange={e => onGlobalSearchChange(e.target.value)}
              placeholder="Cari pegawai, kode barang, NIB, plat/seri..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800 placeholder:text-slate-400"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => onGlobalSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Date, Inspector info & Quick Database Action */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex flex-col text-right">
            <span className="text-[11px] font-medium text-slate-500 flex items-center justify-end gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {todayStr}
            </span>
            <span className="text-xs font-semibold text-slate-800">
              {inspektur ? inspektur.nama : 'Inspektur Kota Banjarmasin'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <button
              type="button"
              onClick={onOpenGoogleBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Cadangkan database ke Google Sheets online"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Backup Google Sheet</span>
            </button>

            <button
              type="button"
              onClick={onResetDatabase}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Kembalikan data simulasi ke data awal resmi"
            >
              <Database className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
              <span className="hidden sm:inline">Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
