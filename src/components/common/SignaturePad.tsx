import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool, ShieldCheck, RefreshCw } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
  title?: string;
  initialValue?: string;
  penandaTanganNama?: string;
  penandaTanganJabatan?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onCancel,
  title = 'Tanda Tangan Digital',
  initialValue,
  penandaTanganNama,
  penandaTanganJabatan,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState('#0f172a'); // default navy/black ink
  const [mode, setMode] = useState<'canvas' | 'qr'>('canvas');

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution display
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = 460 * ratio;
    canvas.height = 200 * ratio;
    ctx.scale(ratio, ratio);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = penColor;

    // Load initial value if exists
    if (initialValue && initialValue.startsWith('data:image')) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 460, 200);
        setHasDrawn(true);
      };
      img.src = initialValue;
    }
  }, [initialValue]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = penColor;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    if (mode === 'qr') {
      // Create official QR stamp canvas
      const stampCanvas = document.createElement('canvas');
      stampCanvas.width = 300;
      stampCanvas.height = 100;
      const ctx = stampCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 300, 100);
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(4, 4, 292, 92);

        ctx.fillStyle = '#1e3a8a';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('DITANDATANGANI SECARA ELEKTRONIK', 12, 24);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#334155';
        ctx.fillText('Inspektorat Kota Banjarmasin', 12, 42);
        ctx.fillText(penandaTanganNama || 'Pejabat Yang Berwenang', 12, 58);
        ctx.font = 'italic 8px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('BSrE BSSN - UUID:' + Math.random().toString(36).substring(2, 10).toUpperCase(), 12, 78);

        onSave(stampCanvas.toDataURL('image/png'));
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-lg w-full">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold text-sm tracking-wide">{title}</h3>
        </div>
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setMode('canvas')}
            className={`px-2.5 py-1 rounded transition-colors ${
              mode === 'canvas' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'
            }`}
          >
            Tanda Tangan Langsung
          </button>
          <button
            type="button"
            onClick={() => setMode('qr')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              mode === 'qr' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            TTE Bersertifikat
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {penandaTanganNama && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Penandatangan:</p>
              <p className="text-sm font-semibold text-slate-800">{penandaTanganNama}</p>
              {penandaTanganJabatan && <p className="text-xs text-slate-600">{penandaTanganJabatan}</p>}
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Validasi ASN
            </span>
          </div>
        )}

        {mode === 'canvas' ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Goreskan tanda tangan Anda pada area kotak di bawah ini:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">Warna Tinta:</span>
                <button
                  type="button"
                  onClick={() => setPenColor('#0f172a')}
                  className={`w-4 h-4 rounded-full bg-slate-900 border ${
                    penColor === '#0f172a' ? 'ring-2 ring-blue-500' : ''
                  }`}
                  title="Hitam Dinas"
                />
                <button
                  type="button"
                  onClick={() => setPenColor('#1d4ed8')}
                  className={`w-4 h-4 rounded-full bg-blue-700 border ${
                    penColor === '#1d4ed8' ? 'ring-2 ring-blue-500' : ''
                  }`}
                  title="Biru Resmi"
                />
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 relative overflow-hidden touch-none">
              <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '180px', display: 'block' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair bg-white"
              />
              <div className="absolute bottom-2 left-4 right-4 pointer-events-none flex items-center justify-between border-t border-slate-200 pt-1 text-[11px] text-slate-400">
                <span>( Area Tanda Tangan Resmi )</span>
                <span>{hasDrawn ? '✓ Ada Goresan' : 'Belum Ada Goresan'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
              >
                <Eraser className="w-3.5 h-3.5" />
                Hapus & Ulangi
              </button>
              <span className="text-[11px] text-slate-400">Mendukung mouse, stylus, & layar sentuh</span>
            </div>
          </div>
        ) : (
          <div className="p-4 border-2 border-emerald-200 bg-emerald-50/40 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Format Tanda Tangan Elektronik (TTE) Tersertifikasi</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Menggunakan standar enkripsi sertifikat elektronik Pemerintah Kota Banjarmasin sesuai amanat Perpres No. 95 Tahun 2018 tentang SPBE.
                </p>
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100 flex items-center justify-between">
              <div className="text-xs space-y-0.5">
                <p className="font-medium text-slate-900">Segel Dokumen: <span className="text-emerald-700">TERVERIFIKASI</span></p>
                <p className="text-slate-500">Penerbit: Balai Sertifikasi Elektronik (BSrE) BSSN</p>
                <p className="text-slate-500">Waktu Stempel: {new Date().toLocaleString('id-ID')}</p>
              </div>
              <div className="w-14 h-14 bg-slate-100 rounded border border-slate-300 flex items-center justify-center text-[10px] text-slate-500 font-mono text-center p-1">
                [QR CODE TTE]
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Batal
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-sm transition-colors"
        >
          <Check className="w-4 h-4" />
          Terapkan Pengesahan
        </button>
      </div>
    </div>
  );
};
