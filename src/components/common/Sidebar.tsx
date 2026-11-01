import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  Package,
  UserCog,
  BookOpen,
  PlusCircle,
  Building2,
  Shield,
  Layers,
  DoorOpen,
  Network,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'pelimpahan' | 'pegawai' | 'barang' | 'ruangan' | 'unitKerja' | 'pejabat' | 'instansi' | 'regulasi';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenCreatePelimpahan: () => void;
  counts: {
    pegawai: number;
    barang: number;
    pelimpahan: number;
    barangDipakai: number;
    ruangan?: number;
    unitKerja?: number;
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
    },
    {
      id: 'pegawai' as NavTab,
      label: 'Pegawai (Pemakai BMD)',
      icon: Users,
      badge: counts.pegawai,
    },
    {
      id: 'barang' as NavTab,
      label: 'Inventaris BMD',
      icon: Package,
      badge: counts.barang,
    },
    {
      id: 'ruangan' as NavTab,
      label: 'Master Lokasi / Ruang',
      icon: DoorOpen,
      badge: counts.ruangan ?? null,
    },
    {
      id: 'unitKerja' as NavTab,
      label: 'Master Unit / Wilayah',
      icon: Network,
      badge: counts.unitKerja ?? null,
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
    <div className="w-64 bg-white text-[#111827] flex flex-col shrink-0 min-h-[calc(100vh-57px)] border-r border-[#E5E7EB]">
      {/* Primary Action Button: #0F766E (Deep Teal) */}
      <div className="p-4 border-b border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => {
            onOpenCreatePelimpahan();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] text-white rounded-xl font-semibold text-xs shadow-sm transition-all cursor-pointer group"
        >
          <PlusCircle className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
          <span>Pelimpahan BMD Baru</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#CCFBF1] text-[#0F766E] font-bold shadow-2xs border-l-4 border-[#0F766E]'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0F766E]' : 'text-[#6B7280]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                    isActive
                      ? 'bg-[#0F766E] text-white'
                      : 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]'
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
      <div className="p-4 border-t border-[#E5E7EB] bg-[#F3F4F6]/50 space-y-2">
        <div className="flex items-center gap-2 text-[#111827] font-bold text-xs">
          <Shield className="w-4 h-4 text-[#0F766E]" />
          <span>Pengelolaan BMD Daerah</span>
        </div>
        <p className="text-[#6B7280] leading-relaxed text-[10px]">
          Sesuai Permendagri No. 19 Tahun 2016 & Standar Tata Kelola Kota Banjarmasin.
        </p>
        <div className="pt-1.5 border-t border-[#E5E7EB] text-[10px] flex items-center justify-between">
          <span className="text-[#6B7280]">Barang Terpakai:</span>
          <span className="font-bold text-[#0F766E] bg-[#CCFBF1] px-1.5 py-0.5 rounded">
            {counts.barangDipakai} Unit
          </span>
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
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
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
