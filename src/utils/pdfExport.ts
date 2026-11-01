import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface GeneratePdfOptions {
  fileName: string;
  orientation?: 'portrait' | 'landscape';
  onProgress?: (progressText: string) => void;
}

/**
 * Downloads DOM elements as an A4 PDF document reliably, even inside iframes.
 * Intelligently supports mixed orientations (e.g. Portrait for decree text, Landscape for wide asset tables).
 */
export async function downloadElementAsPdf(
  elementOrSelector: HTMLElement | string,
  options: GeneratePdfOptions
): Promise<void> {
  const { fileName, orientation = 'portrait', onProgress } = options;

  let rootElement: HTMLElement | null = null;
  if (typeof elementOrSelector === 'string') {
    rootElement = document.querySelector(elementOrSelector);
  } else {
    rootElement = elementOrSelector;
  }

  if (!rootElement) {
    throw new Error('Elemen dokumen tidak ditemukan untuk pembuatan PDF.');
  }

  onProgress?.('Menyiapkan halaman dokumen...');

  // Look for distinct page sheets (portrait or landscape)
  let pageElements = Array.from(
    rootElement.querySelectorAll<HTMLElement>('.document-page-sheet, .document-page-sheet-landscape')
  );

  const isMultiSheet = pageElements.length > 0;
  if (!isMultiSheet) {
    pageElements = [rootElement];
  }

  // Determine first page orientation
  const firstEl = pageElements[0];
  const firstIsLandscape =
    firstEl?.classList.contains('document-page-sheet-landscape') ||
    firstEl?.getAttribute('data-orientation') === 'landscape' ||
    orientation === 'landscape';

  const pdf = new jsPDF({
    orientation: firstIsLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (let i = 0; i < pageElements.length; i++) {
    const pageEl = pageElements[i];
    onProgress?.(`Memproses halaman ${i + 1} dari ${pageElements.length}...`);

    const isCurrentLandscape =
      pageEl.classList.contains('document-page-sheet-landscape') ||
      pageEl.getAttribute('data-orientation') === 'landscape' ||
      (!isMultiSheet && orientation === 'landscape');

    const curWidth = isCurrentLandscape ? 297 : 210;
    const curHeight = isCurrentLandscape ? 210 : 297;
    const curOrientation = isCurrentLandscape ? 'landscape' : 'portrait';

    if (i > 0) {
      pdf.addPage('a4', curOrientation);
    }

    // Render using html2canvas-pro with proper pixel width
    const canvas = await html2canvas(pageEl, {
      scale: 2, // 300 DPI equivalent for razor-sharp text and images
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: isCurrentLandscape ? 1123 : 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (isMultiSheet) {
      // Exactly 1 page per sheet
      pdf.addImage(imgData, 'JPEG', 0, 0, curWidth, curHeight, undefined, 'FAST');
    } else {
      // Single continuous element (like a wide table in LaporanRekapitulasi)
      const imgWidth = curWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= curHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage('a4', curOrientation);
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= curHeight;
      }
    }
  }

  onProgress?.('Mengunduh file PDF...');

  // Safe Blob download (guaranteed to work inside sandboxed iframes)
  const pdfBlob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  downloadLink.style.display = 'none';

  document.body.appendChild(downloadLink);
  downloadLink.click();

  // Cleanup after a short delay
  setTimeout(() => {
    if (document.body.contains(downloadLink)) {
      document.body.removeChild(downloadLink);
    }
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}
