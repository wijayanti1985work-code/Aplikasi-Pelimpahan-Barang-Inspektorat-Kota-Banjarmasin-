import React, { useState } from 'react';
import { UserCog, ShieldCheck, Check, Edit2, Building2, PenTool } from 'lucide-react';
import type { Pejabat } from '../../types/index.ts';

interface PejabatViewProps {
  pejabatList: Pejabat[];
  onUpdatePejabat: (p: Pejabat) => void;
}

export const PejabatView: React.FC<PejabatViewProps> = ({
  pejabatList,
  onUpdatePejabat,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Pejabat | null>(null);

  const startEdit = (p: Pejabat) => {
    setEditingId(p.id);
    setEditForm({ ...p });
  };

  const handleSave = () => {
    if (!editForm) return;
    onUpdatePejabat(editForm);
    setEditingId(null);
    setEditForm(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Master Pejabat Berwenang
            </span>
            <span className="text-xs text-slate-400">Inspektorat Kota Banjarmasin</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Data Pejabat Pengguna & Pengurus Barang
          </h2>
          <p className="text-xs text-slate-500">
            Kelola data penandatangan resmi BAST, Keputusan Inspektur (SK), dan pengesahan SPTJM.
          </p>
        </div>
      </div>

      {/* Pejabat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pejabatList.map(pej => {
          const isEditing = editingId === pej.id;
          const isPengguna = pej.peran === 'Pengguna Barang';

          return (
            <div
              key={pej.id}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col justify-between"
            >
              {/* Card Header */}
              <div
                className={`p-4 border-b flex items-center justify-between ${
                  isPengguna
                    ? 'bg-gradient-to-r from-blue-900 to-indigo-950 text-white border-blue-800'
                    : 'bg-gradient-to-r from-slate-800 to-slate-900 text-white border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isPengguna ? 'bg-amber-400 text-blue-950' : 'bg-emerald-400 text-slate-950'
                    }`}
                  >
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isPengguna ? 'bg-blue-800 text-amber-300' : 'bg-slate-700 text-emerald-300'
                      }`}
                    >
                      {pej.peran}
                    </span>
                    <h3 className="text-sm font-bold mt-0.5">{pej.jabatan}</h3>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => startEdit(pej)}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    title="Ubah Data Pejabat"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 space-y-4">
                {isEditing && editForm ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Nama Lengkap & Gelar</label>
                      <input
                        type="text"
                        value={editForm.nama}
                        onChange={e => setEditForm({ ...editForm, nama: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">NIP (18 Digit)</label>
                      <input
                        type="text"
                        value={editForm.nip}
                        onChange={e => setEditForm({ ...editForm, nip: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Pangkat / Golongan</label>
                      <input
                        type="text"
                        value={editForm.pangkatGol}
                        onChange={e => setEditForm({ ...editForm, pangkatGol: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Jabatan Kedinasan</label>
                      <input
                        type="text"
                        value={editForm.jabatan}
                        onChange={e => setEditForm({ ...editForm, jabatan: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Instansi</label>
                      <input
                        type="text"
                        value={editForm.instansi}
                        onChange={e => setEditForm({ ...editForm, instansi: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditForm(null);
                        }}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Simpan Perubahan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Nama Lengkap:</span>
                        <p className="font-bold text-slate-900 text-sm">{pej.nama}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 block text-[11px]">NIP:</span>
                          <p className="font-mono text-slate-800 font-medium">{pej.nip}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Pangkat / Golongan:</span>
                          <p className="text-slate-800 font-medium">{pej.pangkatGol}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Peran Dalam Dokumen:</span>
                        <p className="text-slate-700">
                          {isPengguna
                            ? 'Mengetahui & Menyetujui BAST, Menetapkan Keputusan Inspektur (SK), dan Mengesahkan SPTJM'
                            : 'Pihak Pertama yang Menyerahkan Barang Milik Daerah dalam BAST'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Data otomatis tersinkronisasi pada seluruh kop dokumen cetak.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
