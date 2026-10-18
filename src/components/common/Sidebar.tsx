import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  Package,
  UserCog,
  BookOpen,
  PlusCircle,
  FileText,
  Shield,
  Layers,
  Building2,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'pelimpahan' | 'pegawai' | 'barang' | 'pejabat' | 'instansi' | 'regulasi';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCreatePelimpahan: () => void;
  counts: {
    pegawai: number;
    barang: number;
    pelimpahan: number;
    barangDipakai: number;
  };
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreatePelimpahan,
  counts,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard & Statistik',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'pelimpahan' as NavTab,
      label: 'Pelimpahan BMD',
      icon: FileCheck2,
      badge: counts.pelimpahan,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'pegawai' as NavTab,
      label: 'Pegawai (Pemakai BMD)',
      icon: Users,
      badge: counts.pegawai,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'barang' as NavTab,
      label: 'Inventaris BMD',
      icon: Package,
      badge: counts.barang,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'pejabat' as NavTab,
      label: 'Master Pejabat',
      icon: UserCog,
      badge: null,
    },
    {
      id: 'instansi' as NavTab,
      label: 'Master Instansi & Kop',
      icon: Building2,
      badge: null,
    },
    {
      id: 'regulasi' as NavTab,
      label: 'Panduan & Regulasi',
      icon: BookOpen,
      badge: null,
    },
  ];

  const content = (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-61px)] border-r border-slate-800">
      {/* Quick Action Button */}
      <div className="p-4 border-b border-slate-800/80">
        <button
          type="button"
          onClick={() => {
            onOpenCreatePelimpahan();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white rounded-xl font-medium text-xs shadow-md shadow-blue-900/30 transition-all cursor-pointer group"
        >
          <PlusCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span>Pelimpahan BMD Baru</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Navigasi
        </div>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600/90 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Pengelolaan Aset Daerah</span>
        </div>
        <p className="text-slate-500 leading-relaxed text-[10px]">
          Sesuai Permendagri No. 19 Tahun 2016 & Perwali Kota Banjarmasin.
        </p>
        <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Barang Dipakai:</span>
          <span className="font-bold text-emerald-400">{counts.barangDipakai} Unit</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="no-print hidden md:flex shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="no-print fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex h-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
