import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, Check, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { BarangBMD } from '../../types/index.ts';
import { downloadTemplateBarang, parseExcelFile, validateAndMapBarang } from '../../utils/excelService.ts';
import { formatRupiah } from '../../utils/logic.ts';

interface ImportBarangModalProps {
  onImportSuccess: (barangList: BarangBMD[]) => void;
  onClose: () => void;
}

export const ImportBarangModal: React.FC<ImportBarangModalProps> = ({
  onImportSuccess,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedBarang, setParsedBarang] = useState<BarangBMD[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [hasParsed, setHasParsed] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setLoading(true);
    setErrors([]);

    try {
      const rows = await parseExcelFile(selected);
      const result = validateAndMapBarang(rows);
      setParsedBarang(result.data);
      setErrors(result.errors);
      setHasParsed(true);
    } catch {
      setErrors(['Gagal membaca file Excel. Pastikan file berformat .xlsx atau .csv yang valid.']);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = () => {
    if (parsedBarang.length === 0) return;
    onImportSuccess(parsedBarang);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Impor Inventaris BMD dari Excel / CSV</h2>
              <p className="text-xs text-slate-400">Penginputan massal daftar aset Barang Milik Daerah</p>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Step 1: Download Template */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
            <div className="text-xs space-y-0.5">
              <p className="font-semibold text-emerald-950">Template Resmi Inventaris BMD</p>
              <p className="text-emerald-800">
                Unduh template resmi dengan kolom Kode Barang/NIB, Merk/Tipe, No Seri/Plat, Tahun, Nilai, Kondisi, dsb.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadTemplateBarang}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              Unduh Template (.xlsx)
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {file ? file.name : 'Klik untuk memilih atau seret file Excel/CSV ke sini'}
              </p>
              <p className="text-[11px] text-slate-400">Mendukung format .xlsx, .xls, dan .csv</p>
            </div>
          </div>

          {loading && (
            <div className="p-4 text-center text-xs text-slate-500">
              Sedang memproses dan memvalidasi daftar barang...
            </div>
          )}

          {/* Errors display */}
          {errors.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Catatan Validasi Data ({errors.length} baris dilewati):
              </p>
              <ul className="list-disc ml-5 space-y-0.5 text-[11px]">
                {errors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {errors.length > 5 && <li>...dan {errors.length - 5} baris lainnya.</li>}
              </ul>
            </div>
          )}

          {/* Table Preview */}
          {hasParsed && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  Pratinjau Data Siap Diimpor ({parsedBarang.length} Barang BMD):
                </span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Format Valid
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-2 w-8 text-center">No</th>
                      <th className="p-2">Kode Barang / NIB</th>
                      <th className="p-2">Nama Barang & Merk</th>
                      <th className="p-2">No. Seri/Plat</th>
                      <th className="p-2 text-center">Kondisi</th>
                      <th className="p-2 text-right">Nilai (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedBarang.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-mono text-slate-600">{b.kodeBarang}</td>
                        <td className="p-2 font-medium text-slate-900">
                          {b.namaBarang}
                          <span className="block text-[10px] text-slate-400 font-normal">{b.merkTipe}</span>
                        </td>
                        <td className="p-2 font-mono text-slate-500">{b.noSeri}</td>
                        <td className="p-2 text-center">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {b.kondisi}
                          </span>
                        </td>
                        <td className="p-2 text-right font-medium text-slate-800">
                          {formatRupiah(b.nilaiPerolehan)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleCommit}
            disabled={parsedBarang.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Simpan {parsedBarang.length} Barang ke Inventaris
          </button>
        </div>
      </div>
    </div>
  );
};
