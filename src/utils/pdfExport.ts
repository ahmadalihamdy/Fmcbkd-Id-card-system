import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportPDFOptions {
  frontElementId: string;
  backElementId: string;
  exportSide: 'both' | 'front' | 'back' | 'a4-sheet';
  fileName?: string;
  cardWidthMm?: number;
  cardHeightMm?: number;
}

export async function exportCardToPDF(options: ExportPDFOptions): Promise<void> {
  const {
    frontElementId,
    backElementId,
    exportSide,
    fileName = 'FMCBKD_Staff_ID_Card.pdf',
    cardWidthMm = 54,
    cardHeightMm = 85.6,
  } = options;

  const frontEl = document.getElementById(frontElementId);
  const backEl = document.getElementById(backElementId);

  if (!frontEl && (exportSide === 'front' || exportSide === 'both' || exportSide === 'a4-sheet')) {
    throw new Error('Front card element not found in DOM');
  }
  if (!backEl && (exportSide === 'back' || exportSide === 'both' || exportSide === 'a4-sheet')) {
    throw new Error('Back card element not found in DOM');
  }

  // Common high-resolution html2canvas options
  const canvasOptions = {
    scale: 3, // Crisp high-DPI rendering
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  };

  if (exportSide === 'a4-sheet') {
    // Export both cards onto an A4 page with trim guides for desktop PVC / paper printing
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const frontCanvas = await html2canvas(frontEl!, canvasOptions);
    const backCanvas = await html2canvas(backEl!, canvasOptions);

    const frontImgData = frontCanvas.toDataURL('image/png');
    const backImgData = backCanvas.toDataURL('image/png');

    // Header info on A4
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('FEDERAL MEDICAL CENTRE, BIRNIN KUDU', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('IT Unit — Printing Section | Staff ID Card Print Sheet', 105, 26, { align: 'center' });

    // Place Front Card at x=40, y=45
    // Place Back Card at x=115, y=45
    const yPos = 45;
    const xFront = 40;
    const xBack = 115;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('FRONT SIDE', xFront + cardWidthMm / 2, yPos - 3, { align: 'center' });
    doc.text('BACK SIDE', xBack + cardWidthMm / 2, yPos - 3, { align: 'center' });

    doc.addImage(frontImgData, 'PNG', xFront, yPos, cardWidthMm, cardHeightMm);
    doc.addImage(backImgData, 'PNG', xBack, yPos, cardWidthMm, cardHeightMm);

    // Draw crop marks / trim lines
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    // Front card border guide
    doc.rect(xFront, yPos, cardWidthMm, cardHeightMm);
    doc.rect(xBack, yPos, cardWidthMm, cardHeightMm);

    // Notes at bottom
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Dimensions: CR80 standard 54.0mm x 85.6mm (2.125" x 3.375"). Print at 100% scale (Do not fit to page).', 105, yPos + cardHeightMm + 15, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, yPos + cardHeightMm + 20, { align: 'center' });

    doc.save(fileName);
    return;
  }

  // Standard CR80 ID Card dimensions (54mm x 85.6mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [cardWidthMm, cardHeightMm],
  });

  if (exportSide === 'front') {
    const frontCanvas = await html2canvas(frontEl!, canvasOptions);
    const imgData = frontCanvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, cardWidthMm, cardHeightMm);
    doc.save(fileName);
    return;
  }

  if (exportSide === 'back') {
    const backCanvas = await html2canvas(backEl!, canvasOptions);
    const imgData = backCanvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 0, 0, cardWidthMm, cardHeightMm);
    doc.save(fileName);
    return;
  }

  if (exportSide === 'both') {
    // Page 1: Front
    const frontCanvas = await html2canvas(frontEl!, canvasOptions);
    const frontImgData = frontCanvas.toDataURL('image/png');
    doc.addImage(frontImgData, 'PNG', 0, 0, cardWidthMm, cardHeightMm);

    // Page 2: Back
    doc.addPage([cardWidthMm, cardHeightMm], 'portrait');
    const backCanvas = await html2canvas(backEl!, canvasOptions);
    const backImgData = backCanvas.toDataURL('image/png');
    doc.addImage(backImgData, 'PNG', 0, 0, cardWidthMm, cardHeightMm);

    doc.save(fileName);
  }
}
