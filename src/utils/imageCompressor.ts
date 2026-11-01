/**
 * Image Compressor & Optimizer Utility for BMD Inventaris
 * Solves LocalStorage quota limits and Firestore 1MB document limit
 * by converting high-resolution smartphone/camera photos into lightweight,
 * crisp, web-optimized JPEG data URLs (typically 30 KB - 80 KB).
 */

export interface ImageCompressorOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetMaxKb?: number;
}

export interface CompressedImageResult {
  dataUrl: string;
  sizeKb: number;
  width: number;
  height: number;
  originalSizeKb: number;
}

export const PRESET_ASSET_PHOTOS = [
  {
    id: 'laptop-1',
    label: 'Laptop / Notebook',
    kategori: 'Peralatan Komputer',
    url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'laptop-2',
    label: 'Laptop Auditor / ThinkPad',
    kategori: 'Peralatan Komputer',
    url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'pc-1',
    label: 'PC Workstation / Desktop',
    kategori: 'Peralatan Komputer',
    url: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mobil-1',
    label: 'Mobil Dinas Operasional R4',
    kategori: 'Kendaraan Dinas',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'motor-1',
    label: 'Motor Dinas Operasional R2',
    kategori: 'Kendaraan Dinas',
    url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'printer-1',
    label: 'Printer / Mesin Scanner',
    kategori: 'Peralatan Kantor',
    url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'drone-1',
    label: 'Drone Inspeksi Lapangan',
    kategori: 'Peralatan Khusus',
    url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'proyektor-1',
    label: 'Proyektor Ruang Rapat',
    kategori: 'Peralatan Audio Visual',
    url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kamera-1',
    label: 'Kamera Digital / DSLR Dokumentasi',
    kategori: 'Peralatan Dokumentasi',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'furniture-1',
    label: 'Meja Rapat / Kursi Kerja',
    kategori: 'Mebeulair',
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ac-1',
    label: 'AC / Tata Udara Gedung',
    kategori: 'Peralatan Kantor',
    url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=600&q=80',
  },
];

/**
 * Calculates approximate size in Kilobytes of a base64 string
 */
export function getBase64SizeKb(base64String: string): number {
  if (!base64String) return 0;
  if (!base64String.startsWith('data:')) {
    return 0; // External HTTP URL, not base64 storage burden
  }
  const base64Length = base64String.length - (base64String.indexOf(',') + 1);
  const sizeInBytes = (base64Length * 3) / 4;
  return Math.round((sizeInBytes / 1024) * 10) / 10;
}

/**
 * Format bytes or KB into human-readable text
 */
export function formatSize(sizeInKb: number): string {
  if (sizeInKb <= 0) return '0 KB';
  if (sizeInKb < 1024) return `${sizeInKb.toFixed(1)} KB`;
  return `${(sizeInKb / 1024).toFixed(2)} MB`;
}

/**
 * Compresses an image File or Blob using HTML5 Canvas.
 * Automatically downsamples high-resolution smartphone camera pictures
 * while preserving sharpness and detail (labels, serial numbers, barcodes).
 */
export async function compressImageFile(
  file: File | Blob,
  options: ImageCompressorOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.78,
    targetMaxKb = 150,
  } = options;

  const originalSizeKb = Math.round((file.size / 1024) * 10) / 10;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = e => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung atau file korup.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Compute new dimensions keeping aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to original dataUrl if canvas context unavailable
            const fallbackUrl = e.target?.result as string;
            resolve({
              dataUrl: fallbackUrl,
              sizeKb: originalSizeKb,
              width: img.width,
              height: img.height,
              originalSizeKb,
            });
            return;
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // White background for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, 0, 0, width, height);

          // First pass compression
          let outputQuality = quality;
          let dataUrl = canvas.toDataURL('image/jpeg', outputQuality);
          let sizeKb = getBase64SizeKb(dataUrl);

          // Second pass if still above targetMaxKb
          if (sizeKb > targetMaxKb) {
            outputQuality = 0.65;
            dataUrl = canvas.toDataURL('image/jpeg', outputQuality);
            sizeKb = getBase64SizeKb(dataUrl);
          }

          // Third pass if still above targetMaxKb (downscale canvas slightly)
          if (sizeKb > targetMaxKb) {
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = Math.round(width * 0.75);
            smallCanvas.height = Math.round(height * 0.75);
            const smallCtx = smallCanvas.getContext('2d');
            if (smallCtx) {
              smallCtx.fillStyle = '#FFFFFF';
              smallCtx.fillRect(0, 0, smallCanvas.width, smallCanvas.height);
              smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
              dataUrl = smallCanvas.toDataURL('image/jpeg', 0.6);
              sizeKb = getBase64SizeKb(dataUrl);
              width = smallCanvas.width;
              height = smallCanvas.height;
            }
          }

          resolve({
            dataUrl,
            sizeKb,
            width,
            height,
            originalSizeKb,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Checks if a base64 string is overly large (> 200 KB) and compresses it
 */
export async function optimizeExistingDataUrl(
  dataUrl: string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }
  const sizeKb = getBase64SizeKb(dataUrl);
  if (sizeKb <= 120) {
    return dataUrl; // Already compact
  }

  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
