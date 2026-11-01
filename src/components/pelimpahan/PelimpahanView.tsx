import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  FileText,
  Award,
  ShieldAlert,
  Edit2,
  Trash2,
  Plus,
  Search,
  User,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileDown,
} from 'lucide-react';
import type { BarangBMD, InstansiConfig, Pegawai, Pejabat, PelimpahanBMD, Ruangan } from '../../types/index.ts';
import { formatTanggalIndonesia, formatRupiah } from '../../utils/logic.ts';
import { OfficialDocumentModal } from '../documents/OfficialDocumentModal.tsx';
import { ConfirmModal } from '../common/ConfirmModal.tsx';

interface PelimpahanViewProps {
  pelimpahanList: PelimpahanBMD[];
  pegawaiList: Pegawai[];
  barangList: BarangBMD[];
  pejabatList: Pejabat[];
  instansi: InstansiConfig;
  ruanganList?: Ruangan[];
  onOpenCreate: () => void;
  onEdit: (pelimpahan: PelimpahanBMD) => void;
  onDelete: (id: string) => void;
  onUpdatePelimpahan: (updated: PelimpahanBMD) => void;
}

export const PelimpahanView: React.FC<PelimpahanViewProps> = ({
  pelimpahanList,
  pegawaiList,
  barangList,
  pejabatList,
  instansi,
  ruanganList,
  onOpenCreate,
  onEdit,
  onDelete,
  onUpdatePelimpahan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForDoc, setSelectedForDoc] = useState<{
    pelimpahan: PelimpahanBMD;
    initialTab: 'BAST' | 'SK' | 'SPTJM';
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null);

  const filteredList = pelimpahanList.filter(item => {
    const peg = pegawaiList.find(p => p.id === item.idPegawai);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    const matchDoc =
      item.nomorBAST.toLowerCase().includes(q) ||
      item.nomorSK.toLowerCase().includes(q) ||
      item.nomorSPTJM.toLowerCase().includes(q);

    const matchPeg =
      peg?.nama.toLowerCase().includes(q) ||
      peg?.nip.toLowerCase().includes(q) ||
      peg?.jabatan.toLowerCase().includes(q);

    return matchDoc || matchPeg;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Title */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded border border-[#0F766E]/20">
              Transaksi Penggunaan Aset
            </span>
            <span className="text-xs text-[#6B7280]">Inspektorat Kota Banjarmasin</span>
          </div>
          <h2 className="text-lg font-bold text-[#111827] mt-1">
            Data Pelimpahan Barang Milik Daerah (BMD)
          </h2>
          <p className="text-xs text-[#6B7280]">
            Kelola penyerahan aset kepada pegawai, cetak BAST, SK Penetapan Pemegang, dan SPTJM Bermaterai.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0d6861] active:bg-[#115E59] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Buat Pelimpahan Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama pegawai, NIP, nomor BAST, SK..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="text-xs text-slate-500">
          Menampilkan <span className="font-bold text-slate-800">{filteredList.length}</span> transaksi pelimpahan
        </div>
      </div>

      {/* Pelimpahan Card List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
            <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Belum Ada Data Pelimpahan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Belum ada riwayat pelimpahan barang yang sesuai. Klik tombol di bawah untuk membuat pelimpahan baru.
            </p>
            <button
              type="button"
              onClick={onOpenCreate}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Pelimpahan Sekarang
            </button>
          </div>
        ) : (
          filteredList.map(item => {
            const peg = pegawaiList.find(p => p.id === item.idPegawai);
            const itemsHeld = barangList.filter(b => item.barangIds.includes(b.id));
            const totalNilai = itemsHeld.reduce((sum, b) => sum + (b.nilaiPerolehan || 0), 0);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header of the card */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={peg?.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'}
                      alt={peg?.nama || 'Pegawai'}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{peg?.nama || 'Nama Tidak Ditemukan'}</h3>
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {peg?.pangkatGol}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        NIP. {peg?.nip} · {peg?.jabatan} ({peg?.unitKerja})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {item.statusDokumen === 'Disahkan' ? 'Dokumen Disahkan' : 'Draf Pelimpahan'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Pelimpahan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: item.id, nama: peg?.nama || 'Pegawai' })}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus / Kembalikan Barang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Meta document row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Nomor BAST:</span>
                      <span className="font-mono font-medium text-slate-800">{item.nomorBAST}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Nomor SK Inspektur:</span>
                      <span className="font-mono font-medium text-slate-800">{item.nomorSK}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Tanggal Penetapan:</span>
                      <span className="font-medium text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {formatTanggalIndonesia(item.tanggal)}
                      </span>
                    </div>
                  </div>

                  {/* List of Held Items */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        Daftar Barang Yang Dipegang ({itemsHeld.length} Aset):
                      </span>
                      <span className="font-bold text-slate-900">
                        Total Nilai: <span className="text-blue-700">{formatRupiah(totalNilai)}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {itemsHeld.map((b, idx) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs"
                        >
                          <img
                            src={b.fotoBarang}
                            alt={b.namaBarang}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{b.namaBarang}</p>
                            <p className="text-[11px] text-slate-500 truncate">{b.merkTipe}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              <span>SN: {b.noSeri}</span>
                              <span>·</span>
                              <span className="font-semibold text-emerald-700">
                                {b.kondisi === 'B' ? 'Kondisi Baik' : 'Rusak Ringan'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-medium text-slate-800">
                              {formatRupiah(b.nilaiPerolehan)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keperluan */}
                  {item.keperluan && (
                    <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700">Keperluan:</span> {item.keperluan}
                    </div>
                  )}

                  {/* Document Action Buttons (BAST, SK, SPTJM) */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span>Pengesahan:</span>
                      <span className="font-medium text-slate-700">
                        {item.tandaTanganPenggunaBarang ? '✓ Inspektur' : '○ Belum TTD Inspektur'}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-slate-700">
                        {item.tandaTanganPihakKedua ? '✓ Pemakai' : '○ Belum TTD Pemakai'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedForDoc({ pelimpahan: item, initialTab: 'BAST' })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Cetak BAST
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedForDoc({ pelimpahan: item, initialTab: 'SK' })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Cetak SK Pemegang
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedForDoc({ pelimpahan: item, initialTab: 'SPTJM' })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Cetak SPTJM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Official Document Generator Modal */}
      {selectedForDoc && (
        <OfficialDocumentModal
          pelimpahan={selectedForDoc.pelimpahan}
          pegawai={
            pegawaiList.find(p => p.id === selectedForDoc.pelimpahan.idPegawai) || {
              id: 'unknown',
              nama: 'Pegawai Tidak Ditemukan',
              nip: '-',
              pangkatGol: '-',
              jabatan: '-',
              foto: '',
              unitKerja: 'Inspektorat',
              status: 'Aktif',
              masaKerjaJabatan: '-',
            }
          }
          barangList={barangList.filter(b => selectedForDoc.pelimpahan.barangIds.includes(b.id))}
          pejabatList={pejabatList}
          instansi={instansi}
          ruanganList={ruanganList}
          initialDocType={selectedForDoc.initialTab}
          onClose={() => setSelectedForDoc(null)}
          onUpdatePelimpahan={updated => {
            onUpdatePelimpahan(updated);
            setSelectedForDoc({ pelimpahan: updated, initialTab: selectedForDoc.initialTab });
          }}
        />
      )}

      {/* Confirmation Modal for Deleting Pelimpahan */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Batalkan / Hapus Pelimpahan BMD?"
        message={`Apakah Anda yakin ingin membatalkan ketetapan pelimpahan barang milik daerah untuk ${deleteTarget?.nama}?`}
        subMessage="Seluruh barang inventaris yang terdaftar pada pelimpahan ini akan secara otomatis dikembalikan ke status 'Tersedia' di gudang."
        confirmLabel="Ya, Batalkan Pelimpahan"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
