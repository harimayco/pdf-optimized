import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function createSamplePdf(title: string, color: [number, number, number], pageCount: number = 2): Promise<File> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pageCount; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Draw header banner
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: rgb(color[0], color[1], color[2]),
    });

    page.drawText(title, {
      x: 50,
      y: height - 70,
      size: 28,
      font: font,
      color: rgb(1, 1, 1),
    });

    page.drawText(`Page ${i} of ${pageCount}`, {
      x: 50,
      y: height - 95,
      size: 14,
      font: regularFont,
      color: rgb(0.9, 0.9, 0.9),
    });

    // Draw decorative content
    page.drawText(`Document Sample: ${title}`, {
      x: 50,
      y: height - 170,
      size: 18,
      font: font,
      color: rgb(0.12, 0.11, 0.29),
    });

    const sampleParagraphs = [
      'This is a client-side generated PDF sample designed to test in-browser compression,',
      'aspect ratio preservation, and document merging capabilities.',
      'Notice how the PDF retains its crisp vector structure or can be optimized using',
      'customizable DPI and JPEG quality settings in browser level.',
      '',
      'Key Features Tested:',
      '• Pure browser-side client processing (no data leaves your device)',
      '• Multi-file reordering with drag-and-drop preview cards',
      '• Standardized page width scaling and aspect ratio preservation',
      '• Claymorphic 3D tactile interface elements with fluid animations'
    ];

    let currentY = height - 210;
    for (const line of sampleParagraphs) {
      page.drawText(line, {
        x: 50,
        y: currentY,
        size: 12,
        font: regularFont,
        color: rgb(0.2, 0.2, 0.3),
      });
      currentY -= 20;
    }

    // Draw a colored graphic box
    page.drawRectangle({
      x: 50,
      y: currentY - 140,
      width: width - 100,
      height: 120,
      borderColor: rgb(color[0], color[1], color[2]),
      borderWidth: 2,
      color: rgb(0.96, 0.97, 1),
    });

    page.drawText(`Interactive Test Section - Sheet ${i}`, {
      x: 70,
      y: currentY - 50,
      size: 14,
      font: font,
      color: rgb(0.1, 0.1, 0.3),
    });

    page.drawText('Status: Ready for high-efficiency browser compression & merge testing.', {
      x: 70,
      y: currentY - 80,
      size: 11,
      font: regularFont,
      color: rgb(0.3, 0.3, 0.4),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new File([pdfBytes], `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`, {
    type: 'application/pdf',
  });
}
