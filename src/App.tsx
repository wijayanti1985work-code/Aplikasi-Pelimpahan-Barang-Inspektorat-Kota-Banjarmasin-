import React, { useState, useEffect } from 'react';
import type { BarangBMD, InstansiConfig, Pegawai, Pejabat, PelimpahanBMD, PelepasanAsetRecord, Ruangan, UnitKerja } from './types/index.ts';
import { StorageService } from './services/storage.ts';
import { Header } from './components/common/Header.tsx';
import { Sidebar, NavTab } from './components/common/Sidebar.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { PelimpahanView } from './components/pelimpahan/PelimpahanView.tsx';
import { PelimpahanFormModal } from './components/pelimpahan/PelimpahanFormModal.tsx';
import { PegawaiView } from './components/pegawai/PegawaiView.tsx';
import { BarangView } from './components/barang/BarangView.tsx';
import { RuanganView } from './components/ruangan/RuanganView.tsx';
import { UnitKerjaView } from './components/unitKerja/UnitKerjaView.tsx';
import { PejabatView } from './components/pejabat/PejabatView.tsx';
import { InstansiView } from './components/instansi/InstansiView.tsx';
import { RegulasiView } from './components/regulasi/RegulasiView.tsx';
import { OfficialDocumentModal } from './components/documents/OfficialDocumentModal.tsx';
import { GoogleSheetBackupModal } from './components/backup/GoogleSheetBackupModal.tsx';
import { ConfirmModal } from './components/common/ConfirmModal.tsx';
import type { CloudSyncState } from './services/firestore.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core collections in state
  const [pejabatList, setPejabatList] = useState<Pejabat[]>([]);
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [barangList, setBarangList] = useState<BarangBMD[]>([]);
  const [pelimpahanList, setPelimpahanList] = useState<PelimpahanBMD[]>([]);
  const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);
  const [unitKerjaList, setUnitKerjaList] = useState<UnitKerja[]>([]);
  const [instansi, setInstansi] = useState<InstansiConfig>(StorageService.getInstansi());

  // Cloud Database Sync state
  const [cloudSyncState, setCloudSyncState] = useState<CloudSyncState>({
    status: 'connecting',
    message: 'Menghubungkan ke Cloud Database...',
  });

  // Modals state
  const [isCreatePelimpahanOpen, setIsCreatePelimpahanOpen] = useState(false);
  const [editingPelimpahan, setEditingPelimpahan] = useState<PelimpahanBMD | null>(null);
  const [isGoogleBackupOpen, setIsGoogleBackupOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Quick document view modal from Dashboard
  const [quickDocData, setQuickDocData] = useState<PelimpahanBMD | null>(null);

  // Global search query
  const [globalSearch, setGlobalSearch] = useState('');

  // Synchronize with Cloud Firestore & local storage
  const syncCloud = () => {
    setCloudSyncState({ status: 'connecting', message: 'Menghubungkan ke Cloud Database...' });
    StorageService.syncWithCloud(cloudData => {
      setInstansi(cloudData.instansi);
      setPejabatList(cloudData.pejabat);
      setPegawaiList(cloudData.pegawai);
      setBarangList(cloudData.barang);
      setPelimpahanList(cloudData.pelimpahan);
      if (cloudData.ruangan) setRuanganList(cloudData.ruangan);
      if (cloudData.unitKerja) setUnitKerjaList(cloudData.unitKerja);
    })
      .then(res => {
        setCloudSyncState(res);
      })
      .catch(err => {
        console.warn('Initial cloud sync error:', err);
        setCloudSyncState({
          status: 'offline',
          message: 'Mode offline (Penyimpanan lokal aktif)',
        });
      });
  };

  // Initial load
  useEffect(() => {
    // 1. Instant local load (memuat data pegawai baru yang diinput pengguna)
    setPejabatList(StorageService.getPejabat());
    setPegawaiList(StorageService.getPegawai());
    setBarangList(StorageService.getBarang());
    setPelimpahanList(StorageService.getPelimpahan());
    setRuanganList(StorageService.getRuangan());
    setUnitKerjaList(StorageService.getUnitKerja());
    setInstansi(StorageService.getInstansi());

    // 2. Cloud Firestore sync
    syncCloud();
  }, []);

  // Handlers for Instansi
  const handleSaveInstansi = (config: InstansiConfig) => {
    StorageService.saveInstansi(config);
    setInstansi(config);
  };

  // Handlers for Pejabat
  const handleUpdatePejabat = (p: Pejabat) => {
    StorageService.updatePejabat(p);
    setPejabatList(StorageService.getPejabat());
  };

  // Handlers for Pegawai
  const handleAddPegawai = (p: Pegawai) => {
    const res = StorageService.addPegawai(p);
    if (!res.success) {
      setNotificationToast(res.message || 'Kapasitas maksimal 150 pegawai tercapai.');
      setTimeout(() => setNotificationToast(null), 4000);
      return;
    }
    const updated = StorageService.getPegawai();
    setPegawaiList(updated);
    setNotificationToast(`Pegawai ${p.nama} berhasil ditambahkan (${updated.length}/150).`);
    setTimeout(() => setNotificationToast(null), 4000);
  };
  const handleUpdatePegawai = (p: Pegawai) => {
    StorageService.updatePegawai(p);
    setPegawaiList(StorageService.getPegawai());
    setNotificationToast(`Data pegawai ${p.nama} berhasil diperbarui.`);
    setTimeout(() => setNotificationToast(null), 4000);
  };
  const handleDeletePegawai = (id: string) => {
    StorageService.deletePegawai(id);
    setPegawaiList(StorageService.getPegawai());
    setNotificationToast('Data pegawai berhasil dihapus.');
    setTimeout(() => setNotificationToast(null), 4000);
  };
  const handleBulkAddPegawai = (list: Pegawai[]) => {
    const res = StorageService.addBulkPegawai(list);
    setPegawaiList(StorageService.getPegawai());
    if (res.truncated) {
      setNotificationToast(`Ditambahkan ${res.added} pegawai (dibatasi maksimal 150 orang).`);
    } else {
      setNotificationToast(`Berhasil mengimpor ${res.added} pegawai baru.`);
    }
    setTimeout(() => setNotificationToast(null), 4000);
  };
  const handleClearAllPegawai = () => {
    const result = StorageService.clearAllPegawai();
    setPegawaiList([]);
    setBarangList(result.updatedBarang);
    setNotificationToast('Semua data pegawai telah dikosongkan. Anda dapat menambahkan data pegawai baru.');
    setTimeout(() => setNotificationToast(null), 4500);
  };

  // Handlers for Barang BMD
  const handleAddBarang = (b: BarangBMD) => {
    StorageService.addBarang(b);
    setBarangList(StorageService.getBarang());
    setNotificationToast(`Inventaris "${b.namaBarang}" beserta foto dokumentasi berhasil disimpan.`);
    setTimeout(() => setNotificationToast(null), 3500);
  };
  const handleUpdateBarang = (b: BarangBMD) => {
    StorageService.updateBarang(b);
    setBarangList(StorageService.getBarang());
    setNotificationToast(`Perubahan data inventaris "${b.namaBarang}" berhasil diperbarui.`);
    setTimeout(() => setNotificationToast(null), 3500);
  };
  const handleDeleteBarang = (id: string) => {
    StorageService.deleteBarang(id);
    setBarangList(StorageService.getBarang());
    setNotificationToast('Data inventaris BMD berhasil dihapus.');
    setTimeout(() => setNotificationToast(null), 3500);
  };
  const handleBulkAddBarang = (list: BarangBMD[]) => {
    const current = StorageService.getBarang();
    StorageService.saveBarang([...list, ...current]);
    setBarangList(StorageService.getBarang());
  };

  // Handlers for Pelimpahan
  const handleSavePelimpahan = (data: PelimpahanBMD) => {
    if (editingPelimpahan) {
      StorageService.updatePelimpahan(data);
    } else {
      StorageService.addPelimpahan(data);
    }
    setPelimpahanList(StorageService.getPelimpahan());
    setBarangList(StorageService.getBarang()); // sync barang status
    setIsCreatePelimpahanOpen(false);
    setEditingPelimpahan(null);
    setActiveTab('pelimpahan');
  };

  const handleDeletePelimpahan = (id: string) => {
    StorageService.deletePelimpahan(id);
    setPelimpahanList(StorageService.getPelimpahan());
    setBarangList(StorageService.getBarang()); // sync restored barang
  };

  const handleUpdatePelimpahanDoc = (updated: PelimpahanBMD) => {
    StorageService.updatePelimpahan(updated);
    setPelimpahanList(StorageService.getPelimpahan());
  };

  // Handlers for Ruangan
  const handleAddRuangan = (r: Ruangan) => {
    StorageService.addRuangan(r);
    setRuanganList(StorageService.getRuangan());
    setNotificationToast(`Ruangan "${r.kodeRuang} - ${r.namaRuang}" berhasil ditambahkan.`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const handleUpdateRuangan = (r: Ruangan) => {
    StorageService.updateRuangan(r);
    setRuanganList(StorageService.getRuangan());
    setNotificationToast(`Data ruangan "${r.kodeRuang}" berhasil diperbarui.`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const handleDeleteRuangan = (id: string) => {
    StorageService.deleteRuangan(id);
    setRuanganList(StorageService.getRuangan());
    setNotificationToast('Master ruangan berhasil dihapus.');
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Handlers for Master Unit / Wilayah Kerja
  const handleAddUnitKerja = (u: UnitKerja) => {
    StorageService.addUnitKerja(u);
    setUnitKerjaList(StorageService.getUnitKerja());
    setNotificationToast(`Unit kerja "${u.namaUnit}" berhasil ditambahkan.`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const handleUpdateUnitKerja = (u: UnitKerja) => {
    StorageService.updateUnitKerja(u);
    setUnitKerjaList(StorageService.getUnitKerja());
    setNotificationToast(`Unit kerja "${u.namaUnit}" berhasil diperbarui.`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const handleDeleteUnitKerja = (id: string) => {
    StorageService.deleteUnitKerja(id);
    setUnitKerjaList(StorageService.getUnitKerja());
    setNotificationToast('Master unit kerja berhasil dihapus.');
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const handleSyncUnitsFromPegawai = (newUnits: UnitKerja[]) => {
    newUnits.forEach(u => StorageService.addUnitKerja(u));
    setUnitKerjaList(StorageService.getUnitKerja());
    setNotificationToast(`${newUnits.length} Master Unit & Wilayah Kerja berhasil disinkronkan dari data pegawai.`);
    setTimeout(() => setNotificationToast(null), 4500);
  };

  // Handler for Pelepasan Aset BMD (Pindah / Pensiun)
  const handleExecutePelepasanAset = (record: PelepasanAsetRecord) => {
    const result = StorageService.executePelepasanAset({
      record,
      allBarang: barangList,
      allPegawai: pegawaiList,
    });
    setBarangList(result.updatedBarang);
    setPegawaiList(result.updatedPegawai);
    setNotificationToast(`Aset berhasil dilepaskan dari ${record.namaPegawaiAsal} (BAP: ${record.nomorBAP})`);
    setTimeout(() => setNotificationToast(null), 5000);
  };

  // Reset database back to default seed
  const handleOpenResetDialog = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmResetDatabase = () => {
    setIsResetConfirmOpen(false);
    StorageService.resetDefaults();
    setPejabatList(StorageService.getPejabat());
    setPegawaiList(StorageService.getPegawai());
    setBarangList(StorageService.getBarang());
    setPelimpahanList(StorageService.getPelimpahan());
    setRuanganList(StorageService.getRuangan());
    setUnitKerjaList(StorageService.getUnitKerja());
    setInstansi(StorageService.getInstansi());
    setNotificationToast('Database berhasil diatur ulang ke data standar resmi Inspektorat Kota Banjarmasin.');
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const counts = {
    pegawai: pegawaiList.length,
    barang: barangList.length,
    pelimpahan: pelimpahanList.length,
    barangDipakai: barangList.filter(b => b.statusPemakaian === 'Dipakai').length,
    ruangan: ruanganList.length,
    unitKerja: unitKerjaList.length,
  };

  // When global search changes and is submitted, navigate to best matched tab
  const handleGlobalSearchChange = (val: string) => {
    setGlobalSearch(val);
    if (val.trim() && activeTab === 'dashboard') {
      setActiveTab('pelimpahan');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans text-[#111827]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onResetDatabase={handleOpenResetDialog}
        pejabatList={pejabatList}
        instansi={instansi}
        onOpenGoogleBackup={() => setIsGoogleBackupOpen(true)}
        globalSearch={globalSearch}
        onGlobalSearchChange={handleGlobalSearchChange}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        cloudSyncState={cloudSyncState}
        onRefreshCloudSync={syncCloud}
      />

      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-5 right-5 z-60 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-semibold">{notificationToast}</span>
          <button
            type="button"
            onClick={() => setNotificationToast(null)}
            className="text-emerald-300 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={tab => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          onOpenCreatePelimpahan={() => {
            setEditingPelimpahan(null);
            setIsCreatePelimpahanOpen(true);
            setIsMobileMenuOpen(false);
          }}
          counts={counts}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              pegawaiList={pegawaiList}
              barangList={barangList}
              pelimpahanList={pelimpahanList}
              pejabatList={pejabatList}
              onNavigateTab={setActiveTab}
              onOpenCreatePelimpahan={() => {
                setEditingPelimpahan(null);
                setIsCreatePelimpahanOpen(true);
              }}
              onQuickViewDoc={pel => setQuickDocData(pel)}
            />
          )}

          {activeTab === 'pelimpahan' && (
            <PelimpahanView
              pelimpahanList={pelimpahanList}
              pegawaiList={pegawaiList}
              barangList={barangList}
              pejabatList={pejabatList}
              instansi={instansi}
              onOpenCreate={() => {
                setEditingPelimpahan(null);
                setIsCreatePelimpahanOpen(true);
              }}
              onEdit={pel => {
                setEditingPelimpahan(pel);
                setIsCreatePelimpahanOpen(true);
              }}
              onDelete={handleDeletePelimpahan}
              onUpdatePelimpahan={handleUpdatePelimpahanDoc}
            />
          )}

          {activeTab === 'pegawai' && (
            <PegawaiView
              pegawaiList={pegawaiList}
              barangList={barangList}
              pelimpahanList={pelimpahanList}
              pejabatList={pejabatList}
              instansi={instansi}
              unitKerjaList={unitKerjaList}
              onAddPegawai={handleAddPegawai}
              onUpdatePegawai={handleUpdatePegawai}
              onDeletePegawai={handleDeletePegawai}
              onBulkAddPegawai={handleBulkAddPegawai}
              onOpenCreatePelimpahanWithPegawai={() => {
                setEditingPelimpahan(null);
                setIsCreatePelimpahanOpen(true);
              }}
              onExecutePelepasanAset={handleExecutePelepasanAset}
              onClearAllPegawai={handleClearAllPegawai}
              onAddNewUnitKerja={handleAddUnitKerja}
            />
          )}

          {activeTab === 'barang' && (
            <BarangView
              barangList={barangList}
              pegawaiList={pegawaiList}
              pejabatList={pejabatList}
              instansi={instansi}
              ruanganList={ruanganList}
              onAddBarang={handleAddBarang}
              onUpdateBarang={handleUpdateBarang}
              onDeleteBarang={handleDeleteBarang}
              onBulkAddBarang={handleBulkAddBarang}
            />
          )}

          {activeTab === 'ruangan' && (
            <RuanganView
              ruanganList={ruanganList}
              barangList={barangList}
              instansi={instansi}
              onAddRuangan={handleAddRuangan}
              onUpdateRuangan={handleUpdateRuangan}
              onDeleteRuangan={handleDeleteRuangan}
            />
          )}

          {activeTab === 'unitKerja' && (
            <UnitKerjaView
              unitKerjaList={unitKerjaList}
              pegawaiList={pegawaiList}
              barangList={barangList}
              instansi={instansi}
              onAddUnitKerja={handleAddUnitKerja}
              onUpdateUnitKerja={handleUpdateUnitKerja}
              onDeleteUnitKerja={handleDeleteUnitKerja}
              onSyncUnitsFromPegawai={handleSyncUnitsFromPegawai}
            />
          )}

          {activeTab === 'pejabat' && (
            <PejabatView
              pejabatList={pejabatList}
              onUpdatePejabat={handleUpdatePejabat}
            />
          )}

          {activeTab === 'instansi' && (
            <InstansiView
              instansi={instansi}
              onSaveInstansi={handleSaveInstansi}
            />
          )}

          {activeTab === 'regulasi' && <RegulasiView />}
        </main>
      </div>

      {/* Pelimpahan Create / Edit Modal */}
      {isCreatePelimpahanOpen && (
        <PelimpahanFormModal
          initialData={editingPelimpahan || undefined}
          pegawaiList={pegawaiList}
          barangList={barangList}
          ruanganList={ruanganList}
          existingPelimpahanCount={pelimpahanList.length}
          onSave={handleSavePelimpahan}
          onClose={() => {
            setIsCreatePelimpahanOpen(false);
            setEditingPelimpahan(null);
          }}
        />
      )}

      {/* Quick View Document Modal from Dashboard */}
      {quickDocData && (
        <OfficialDocumentModal
          pelimpahan={quickDocData}
          pegawai={
            pegawaiList.find(p => p.id === quickDocData.idPegawai) || {
              id: 'unknown',
              nama: 'Pegawai',
              nip: '-',
              pangkatGol: '-',
              jabatan: '-',
              foto: '',
              unitKerja: '-',
              status: 'Aktif',
              masaKerjaJabatan: '-',
            }
          }
          barangList={barangList.filter(b => quickDocData.barangIds.includes(b.id))}
          pejabatList={pejabatList}
          instansi={instansi}
          ruanganList={ruanganList}
          onClose={() => setQuickDocData(null)}
          onUpdatePelimpahan={updated => {
            handleUpdatePelimpahanDoc(updated);
            setQuickDocData(updated);
          }}
        />
      )}

      {/* Google Sheet Backup Modal */}
      {isGoogleBackupOpen && (
        <GoogleSheetBackupModal
          pegawaiList={pegawaiList}
          barangList={barangList}
          pelimpahanList={pelimpahanList}
          pejabatList={pejabatList}
          instansi={instansi}
          onClose={() => setIsGoogleBackupOpen(false)}
        />
      )}

      {/* Reset Database Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Data ke Standar Resmi?"
        message="Tindakan ini akan mengembalikan seluruh data pegawai, inventaris barang, pelimpahan, dan konfigurasi instansi ke setelan awal Inspektorat Kota Banjarmasin."
        subMessage="Data yang telah Anda tambahkan secara lokal akan digantikan dengan data contoh default."
        confirmLabel="Ya, Atur Ulang Data"
        cancelLabel="Batal"
        variant="warning"
        onConfirm={handleConfirmResetDatabase}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
