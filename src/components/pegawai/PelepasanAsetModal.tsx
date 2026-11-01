import React, { useState } from 'react';
import {
  X,
  PackageCheck,
  Building2,
  Calendar,
  UserCheck,
  ArrowRightLeft,
  Warehouse,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
  Users,
} from 'lucide-react';
import type {
  BarangBMD,
  Pegawai,
  Pejabat,
  PelepasanAsetRecord,
  PelepasanItemAction,
  StatusPegawai,
} from '../../types/index.ts';

interface PelepasanAsetModalProps {
  pegawai: Pegawai;
  heldItems: BarangBMD[];
  allPegawaiList: Pegawai[];
  pejabatList: Pejabat[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (record: PelepasanAsetRecord) => void;
}

export const PelepasanAsetModal: React.FC<PelepasanAsetModalProps> = ({
  pegawai,
  heldItems,
  allPegawaiList,
  pejabatList,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();
  const defaultNoBAP = `027/${Math.floor(100 + Math.random() * 900)}/BAP-BMD/ITK-BJM/${currentYear}`;
  const todayStr = new Date().toISOString().split('T')[0];

  const [nomorBAP, setNomorBAP] = useState(defaultNoBAP);
  const [tanggal, setTanggal] = useState(todayStr);
  const [alasan, setAlasan] = useState<'Mutasi/Pindah Tugas' | 'Purna Tugas (Pensiun)' | 'Penarikan Dinas Rutin'>('Mutasi/Pindah Tugas');
  const [statusPegawaiBaru, setStatusPegawaiBaru] = useState<StatusPegawai>('Mutasi/Pindah');
  const [keteranganAlasan, setKeteranganAlasan] = useState('');

  // Candidate replacement employees (excluding current employee)
  const candidateEmployees = allPegawaiList.filter(p => p.id !== pegawai.id && p.status === 'Aktif');

  // Item actions state
  const [itemActions, setItemActions] = useState<Record<string, { tindakan: 'Gudang' | 'AlihkanPegawai'; idPegawaiBaru?: string }>>(() => {
    const initial: Record<string, { tindakan: 'Gudang' | 'AlihkanPegawai'; idPegawaiBaru?: string }> = {};
    heldItems.forEach(item => {
      initial[item.id] = {
        tindakan: 'Gudang',
        idPegawaiBaru: candidateEmployees[0]?.id || '',
      };
    });
    return initial;
  });

  // Handle reason change and auto-set appropriate employee status
  const handleAlasanChange = (newAlasan: 'Mutasi/Pindah Tugas' | 'Purna Tugas (Pensiun)' | 'Penarikan Dinas Rutin') => {
    setAlasan(newAlasan);
    if (newAlasan === 'Mutasi/Pindah Tugas') {
      setStatusPegawaiBaru('Mutasi/Pindah');
    } else if (newAlasan === 'Purna Tugas (Pensiun)') {
      setStatusPegawaiBaru('Pensiun');
    } else {
      setStatusPegawaiBaru(pegawai.status);
    }
  };

  // Bulk actions
  const handleSetAllGudang = () => {
    const updated = { ...itemActions };
    heldItems.forEach(i => {
      updated[i.id] = { ...updated[i.id], tindakan: 'Gudang' };
    });
    setItemActions(updated);
  };

  const handleSetAllAlihkan = () => {
    const defaultReplacement = candidateEmployees[0]?.id || '';
    const updated = { ...itemActions };
    heldItems.forEach(i => {
      updated[i.id] = { tindakan: 'AlihkanPegawai', idPegawaiBaru: defaultReplacement };
    });
    setItemActions(updated);
  };

  const handleItemTindakanChange = (itemId: string, tindakan: 'Gudang' | 'AlihkanPegawai') => {
    setItemActions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        tindakan,
        idPegawaiBaru: prev[itemId]?.idPegawaiBaru || candidateEmployees[0]?.id || '',
      },
    }));
  };

  const handleItemReplacementChange = (itemId: string, newPegawaiId: string) => {
    setItemActions(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        idPegawaiBaru: newPegawaiId,
      },
    }));
  };

  const pengurusBarang = pejabatList.find(p => p.peran === 'Pengurus Barang');
  const penggunaBarang = pejabatList.find(p => p.peran === 'Pengguna Barang');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedItems: PelepasanItemAction[] = heldItems.map(item => {
      const act = itemActions[item.id] || { tindakan: 'Gudang' };
      const replacementPeg = candidateEmployees.find(p => p.id === act.idPegawaiBaru);

      return {
        idBarang: item.id,
        kodeBarang: item.kodeBarang,
        namaBarang: item.namaBarang,
        merkTipe: item.merkTipe,
        noSeri: item.noSeri,
        kondisi: item.kondisi,
        tindakan: act.tindakan,
        idPegawaiBaru: act.tindakan === 'AlihkanPegawai' ? act.idPegawaiBaru : undefined,
        namaPegawaiBaru: act.tindakan === 'AlihkanPegawai' ? replacementPeg?.nama : undefined,
      };
    });

    const record: PelepasanAsetRecord = {
      id: `pelepasan-${Date.now()}`,
      nomorBAP: nomorBAP.trim() || defaultNoBAP,
      tanggal,
      idPegawaiAsal: pegawai.id,
      namaPegawaiAsal: pegawai.nama,
      nipPegawaiAsal: pegawai.nip,
      jabatanPegawaiAsal: pegawai.jabatan,
      unitKerjaPegawaiAsal: pegawai.unitKerja,
      alasan,
      keteranganAlasan: keteranganAlasan.trim() || undefined,
      items: formattedItems,
      idPejabatPengurus: pengurusBarang?.id,
      namaPejabatPengurus: pengurusBarang?.nama,
      nipPejabatPengurus: pengurusBarang?.nip,
      idInspektur: penggunaBarang?.id,
      namaInspektur: penggunaBarang?.nama,
      nipInspektur: penggunaBarang?.nip,
      statusPegawaiBaru,
      createdAt: new Date().toISOString(),
    };

    onConfirm(record);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#0F766E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#CCFBF1] tracking-wider uppercase">
                Pelepasan & Serah Terima Aset BMD
              </span>
              <h3 className="text-base font-bold text-white">
                Pengembalian Aset: {pegawai.nama}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-[#111827]">
          
          {/* Employee Info Card */}
          <div className="bg-[#F3F4F6] p-4 rounded-xl border border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={pegawai.foto}
                alt={pegawai.nama}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
              />
              <div>
                <p className="font-bold text-sm text-[#111827]">{pegawai.nama}</p>
                <p className="text-xs text-[#6B7280]">NIP. {pegawai.nip} · {pegawai.pangkatGol}</p>
                <p className="text-xs text-[#0F766E] font-medium mt-0.5">{pegawai.jabatan} ({pegawai.unitKerja})</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#CCFBF1] text-[#0F766E] border border-[#0F766E]/20">
                <PackageCheck className="w-4 h-4" />
                {heldItems.length} Aset BMD Dipegang
              </span>
              <p className="text-[11px] text-[#6B7280] mt-1">Status saat ini: {pegawai.status}</p>
            </div>
          </div>

          {/* Form Fields: Alasan & Dokumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Alasan Pelepasan / Pengembalian <span className="text-rose-500">*</span>
              </label>
              <select
                value={alasan}
                onChange={e => handleAlasanChange(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                required
              >
                <option value="Mutasi/Pindah Tugas">Mutasi / Pindah Tugas (Keluar Unit/Dinas)</option>
                <option value="Purna Tugas (Pensiun)">Purna Tugas (Pensiun / Berhenti Hormat)</option>
                <option value="Penarikan Dinas Rutin">Penarikan Dinas Rutin / Rotasi Internal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Status Kepegawaian Akhir <span className="text-rose-500">*</span>
              </label>
              <select
                value={statusPegawaiBaru}
                onChange={e => setStatusPegawaiBaru(e.target.value as StatusPegawai)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                required
              >
                <option value="Mutasi/Pindah">Mutasi/Pindah (Arsip Historis Aktif)</option>
                <option value="Pensiun">Pensiun (Purna Tugas)</option>
                <option value="Non-Aktif">Non-Aktif</option>
                <option value="Aktif">Tetap Aktif (Hanya Lepas Barang)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Nomor Berita Acara (BAP-BMD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nomorBAP}
                onChange={e => setNomorBAP(e.target.value)}
                placeholder="Contoh: 027/123/BAP-BMD/ITK-BJM/2026"
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Tanggal Serah Terima <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Keterangan Tambahan / Nomor Surat Keputusan (SK) Mutasi/Pensiun
              </label>
              <input
                type="text"
                value={keteranganAlasan}
                onChange={e => setKeteranganAlasan(e.target.value)}
                placeholder="Misal: Berdasarkan SK Walikota No. 821/2026 tentang Mutasi Pejabat Fungsional..."
                className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
              />
            </div>
          </div>

          {/* Asset Allocation Section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] pb-2">
              <div>
                <h4 className="text-xs font-bold text-[#111827]">
                  Tentukan Tindakan untuk Setiap Aset BMD ({heldItems.length} Barang)
                </h4>
                <p className="text-[11px] text-[#6B7280]">
                  Pilih apakah barang dikembalikan ke gudang penyimpanan atau dialihkan langsung ke rekan pengganti.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSetAllGudang}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#0F766E] bg-[#CCFBF1] hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                >
                  Semua ke Gudang
                </button>
                {candidateEmployees.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSetAllAlihkan}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#111827] bg-[#F3F4F6] hover:bg-slate-200 border border-[#E5E7EB] rounded-lg transition-colors cursor-pointer"
                  >
                    Semua Alihkan Pegawai
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {heldItems.map((item, idx) => {
                const currentAction = itemActions[item.id] || { tindakan: 'Gudang' };
                return (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-[#E5E7EB] hover:border-teal-300 transition-colors flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-[220px] flex-1">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-mono text-[11px] font-bold text-[#6B7280]">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-[#111827]">{item.namaBarang}</p>
                        <p className="font-mono text-[11px] text-[#6B7280]">
                          {item.kodeBarang} · {item.merkTipe} {item.noSeri && item.noSeri !== '-' ? `· SN: ${item.noSeri}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-lg border border-[#E5E7EB]">
                        <button
                          type="button"
                          onClick={() => handleItemTindakanChange(item.id, 'Gudang')}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                            currentAction.tindakan === 'Gudang'
                              ? 'bg-white text-[#0F766E] shadow-2xs font-bold'
                              : 'text-[#6B7280] hover:text-[#111827]'
                          }`}
                        >
                          <Warehouse className="w-3.5 h-3.5" />
                          Gudang (Tersedia)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemTindakanChange(item.id, 'AlihkanPegawai')}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                            currentAction.tindakan === 'AlihkanPegawai'
                              ? 'bg-white text-[#0F766E] shadow-2xs font-bold'
                              : 'text-[#6B7280] hover:text-[#111827]'
                          }`}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Alihkan Rekan
                        </button>
                      </div>

                      {currentAction.tindakan === 'AlihkanPegawai' && (
                        <div className="w-48">
                          <select
                            value={currentAction.idPegawaiBaru}
                            onChange={e => handleItemReplacementChange(item.id, e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-white border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#0F766E]"
                            required
                          >
                            {candidateEmployees.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.nama} ({c.jabatan})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notice Box */}
          <div className="p-3.5 bg-[#CCFBF1]/40 border border-[#0F766E]/20 rounded-xl flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <p className="text-[#0F766E] leading-relaxed">
              Setelah konfirmasi, seluruh aset akan diperbarui statusnya di database cloud, status pegawai akan dialihkan ke <strong>{statusPegawaiBaru}</strong>, dan dokumen resmi <strong>Berita Acara Serah Terima Pengembalian (BAP-BMD)</strong> akan langsung diterbitkan untuk dicetak.
            </p>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#111827] bg-white hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              Proses Pelepasan & Terbitkan Berita Acara
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
