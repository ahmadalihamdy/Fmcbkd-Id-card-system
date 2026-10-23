import * as pdfjsLib from 'pdfjs-dist';

// Configure worker URL from CDN to avoid bundler packaging issues
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
}

export interface RenderedPDFPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Extracts and renders pages from an uploaded PDF file as high-res images.
 */
export async function renderPDFPages(
  file: File,
  dpiScale: number = 2.5
): Promise<RenderedPDFPage[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const pages: RenderedPDFPage[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: dpiScale });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render PDF page into canvas
      await (page.render({
        canvasContext: ctx,
        viewport,
        canvas,
      } as any)).promise;

      const dataUrl = canvas.toDataURL('image/png', 0.95);
      pages.push({
        pageNumber: i,
        dataUrl,
        width: Math.round(viewport.width / dpiScale),
        height: Math.round(viewport.height / dpiScale),
      });
    }

    return pages;
  } catch (err) {
    console.warn('PDF.js client render failed, falling back to image reader:', err);
    throw err;
  }
}
