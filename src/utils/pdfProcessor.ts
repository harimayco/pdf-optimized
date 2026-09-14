import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import { configurePdfWorker, pdfjsLib } from './pdfWorker';
import {
  CompressionLevel,
  CompressionResult,
  IndividualResult,
  ProcessingOptions,
  ProcessingProgress,
  UploadedPdfFile,
} from '../types';
import { calculateSavings } from './formatters';

configurePdfWorker();

// Extract thumbnail and metadata for a single PDF file
export async function extractPdfInfo(file: File): Promise<{
  pageCount: number;
  thumbnailUrl: string;
  firstPageWidth: number;
  firstPageHeight: number;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    const page = await pdfDoc.getPage(1);
    const originalViewport = page.getViewport({ scale: 1 });
    const width = originalViewport.width;
    const height = originalViewport.height;

    // Generate preview thumbnail (max width 240px)
    const scale = Math.min(240 / width, 320 / height, 1.5);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');

    let thumbnailUrl = '';
    if (ctx) {
      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render page to canvas
      const renderTask = page.render({
        canvasContext: ctx,
        viewport: viewport,
        canvas: canvas,
      } as any);
      await renderTask.promise;
      thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
    }

    return {
      pageCount,
      thumbnailUrl,
      firstPageWidth: Math.round(width),
      firstPageHeight: Math.round(height),
    };
  } catch (error) {
    console.error('Failed to extract PDF thumbnail', error);
    // Fallback info
    return {
      pageCount: 1,
      thumbnailUrl: '',
      firstPageWidth: 595,
      firstPageHeight: 842,
    };
  }
}

interface CompressionConfig {
  scale: number;
  quality: number;
}

function getCompressionConfig(level: CompressionLevel): CompressionConfig {
  switch (level) {
    case 'extreme':
      return { scale: 1.0, quality: 0.48 }; // ~72-96 DPI, heavy reduction
    case 'recommended':
      return { scale: 1.35, quality: 0.68 }; // ~100-130 DPI, balanced
    case 'less':
      return { scale: 1.85, quality: 0.84 }; // ~140-180 DPI, high fidelity
    case 'none':
    default:
      return { scale: 1.0, quality: 1.0 };
  }
}

// Render a single PDF.js page to JPEG bytes
async function renderPageToJpeg(
  page: any,
  scale: number,
  quality: number,
  rotation: number = 0
): Promise<{ bytes: Uint8Array; width: number; height: number; originalWidth: number; originalHeight: number }> {
  const origViewport = page.getViewport({ scale: 1, rotation });
  const viewport = page.getViewport({ scale, rotation });

  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const renderTask = page.render({
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas,
  } as any);
  await renderTask.promise;

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas to Blob failed'));
      },
      'image/jpeg',
      quality
    );
  });

  const arrayBuf = await blob.arrayBuffer();
  return {
    bytes: new Uint8Array(arrayBuf),
    width: canvas.width,
    height: canvas.height,
    originalWidth: origViewport.width,
    originalHeight: origViewport.height,
  };
}

// Process and compress PDFs according to chosen options
export async function processPdfs(
  files: UploadedPdfFile[],
  options: ProcessingOptions,
  onProgress: (prog: ProcessingProgress) => void
): Promise<CompressionResult> {
  if (files.length === 0) {
    throw new Error('No PDF files selected.');
  }

  const originalTotalSize = files.reduce((acc, f) => acc + f.size, 0);

  // Determine standard target width for unification
  const standardA4Width = 595.28;
  const standardA4Height = 841.89;
  let targetWidth = standardA4Width;
  let targetHeight = standardA4Height;

  if (options.targetPageStandard === 'FirstFile' && files[0]?.firstPageWidth) {
    targetWidth = files[0].firstPageWidth;
    targetHeight = files[0].firstPageHeight;
  } else if (options.targetPageStandard === 'Letter') {
    targetWidth = 612.0;
    targetHeight = 792.0;
  }

  onProgress({
    status: 'preparing',
    percent: 5,
    message: 'Analyzing documents...',
  });

  // Check if we are merging all files or keeping them separate
  if (!options.mergeFiles && files.length > 1) {
    return processSeparateFiles(files, options, targetWidth, targetHeight, onProgress);
  }

  // Merging all files into a single output PDF
  return processMergedFile(files, options, targetWidth, targetHeight, originalTotalSize, onProgress);
}

function resolveOutputFileName(customName: string | undefined, defaultName: string, ext: string = '.pdf'): string {
  if (customName && customName.trim()) {
    const trimmed = customName.trim();
    if (!trimmed.toLowerCase().endsWith(ext.toLowerCase())) {
      return `${trimmed}${ext}`;
    }
    return trimmed;
  }
  return defaultName;
}

// Implementation for Merging into a Single Document
async function processMergedFile(
  files: UploadedPdfFile[],
  options: ProcessingOptions,
  targetWidth: number,
  targetHeight: number,
  originalTotalSize: number,
  onProgress: (prog: ProcessingProgress) => void
): Promise<CompressionResult> {
  const outputDoc = await PDFDocument.create();
  const defaultFileName = files.length === 1 ? `compressed-${files[0].name}` : 'merged-compressed.pdf';
  const finalFileName = resolveOutputFileName(options.customOutputName, defaultFileName, '.pdf');

  // If compression level is 'none' and no multi-page sheet layout is requested:
  // we do fast lossless vector merging with optional page resizing
  if (options.compressionLevel === 'none' && (!options.samePageMerge || options.samePageLayout === 'sequential')) {
    let totalPagesCount = 0;

    for (let fIdx = 0; fIdx < files.length; fIdx++) {
      const fileItem = files[fIdx];
      const progressBase = 10 + Math.floor((fIdx / files.length) * 75);

      onProgress({
        status: 'assembling',
        percent: progressBase,
        message: `Merging ${fileItem.name} (${fIdx + 1}/${files.length})...`,
        currentFileIndex: fIdx + 1,
        totalFiles: files.length,
      });

      const fileBytes = await fileItem.file.arrayBuffer();
      const srcDoc = await PDFDocument.load(fileBytes);
      const pageIndices = srcDoc.getPageIndices();

      const copiedPages = await outputDoc.copyPages(srcDoc, pageIndices);

      for (let pIdx = 0; pIdx < copiedPages.length; pIdx++) {
        const page = copiedPages[pIdx];
        totalPagesCount++;

        // Apply rotation if any
        if (fileItem.rotation) {
          const currentRot = page.getRotation().angle;
          page.setRotation(degrees((currentRot + fileItem.rotation) % 360));
        }

        // Apply resizing options
        if (options.resizeSameSize) {
          const originalPageWidth = page.getWidth();
          const originalPageHeight = page.getHeight();

          if (options.keepOriginalRatio) {
            // Keep ratio: scale page to target width and scale height proportionally
            const scaleFactor = targetWidth / originalPageWidth;
            page.scale(scaleFactor, scaleFactor);
          } else {
            // Force fit to target width & target height
            const scaleX = targetWidth / originalPageWidth;
            const scaleY = targetHeight / originalPageHeight;
            page.scale(scaleX, scaleY);
          }
        }

        outputDoc.addPage(page);
      }
    }

    onProgress({
      status: 'compressing',
      percent: 90,
      message: 'Generating final optimized PDF...',
    });

    const compressedBytes = await outputDoc.save({ useObjectStreams: true });
    const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(compressedBlob);
    const savings = calculateSavings(originalTotalSize, compressedBlob.size);

    onProgress({
      status: 'completed',
      percent: 100,
      message: 'Compression & merge complete!',
    });

    return {
      isMerged: true,
      fileName: finalFileName,
      originalTotalSize,
      compressedTotalSize: compressedBlob.size,
      savedBytes: savings.savedBytes,
      savedPercentage: savings.savedPercentage,
      totalPages: totalPagesCount,
      blob: compressedBlob,
      downloadUrl,
    };
  }

  // Compression with rasterization or same-page multi-up layouts
  const { scale, quality } = getCompressionConfig(options.compressionLevel);

  // Calculate total pages across all files first
  const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);
  let processedPages = 0;

  // Cache rendered pages
  interface RenderedPageItem {
    jpegBytes: Uint8Array;
    originalWidth: number;
    originalHeight: number;
  }
  const renderedItems: RenderedPageItem[] = [];

  for (let fIdx = 0; fIdx < files.length; fIdx++) {
    const fileItem = files[fIdx];
    const fileBuf = await fileItem.file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({
      data: new Uint8Array(fileBuf),
      useSystemFonts: true,
    }).promise;

    for (let pNum = 1; pNum <= pdfDoc.numPages; pNum++) {
      processedPages++;
      const percent = 10 + Math.floor((processedPages / Math.max(1, totalPages)) * 60);

      onProgress({
        status: 'rendering',
        percent,
        message: `Compressing page ${processedPages} of ${totalPages}...`,
        currentPage: processedPages,
        totalPages,
      });

      const page = await pdfDoc.getPage(pNum);
      const rendered = await renderPageToJpeg(page, scale, quality, fileItem.rotation);

      renderedItems.push({
        jpegBytes: rendered.bytes,
        originalWidth: rendered.originalWidth,
        originalHeight: rendered.originalHeight,
      });
    }
  }

  onProgress({
    status: 'assembling',
    percent: 75,
    message: 'Assembling document sheets...',
  });

  // Assemble pages onto PDF document
  if (options.samePageMerge && options.samePageLayout === 'two-up') {
    // 2-Up Layout: place 2 pages on single landscape or portrait sheet
    const sheetWidth = 841.89; // Landscape A4
    const sheetHeight = 595.28;
    const margin = 20;
    const halfWidth = (sheetWidth - margin * 3) / 2;
    const maxContentHeight = sheetHeight - margin * 2;

    for (let i = 0; i < renderedItems.length; i += 2) {
      const sheet = outputDoc.addPage([sheetWidth, sheetHeight]);

      const item1 = renderedItems[i];
      const img1 = await outputDoc.embedJpg(item1.jpegBytes);

      // Fit item1 into left box
      const ratio1 = item1.originalWidth / item1.originalHeight;
      let fitW1 = halfWidth;
      let fitH1 = halfWidth / ratio1;
      if (fitH1 > maxContentHeight) {
        fitH1 = maxContentHeight;
        fitW1 = maxContentHeight * ratio1;
      }
      const x1 = margin + (halfWidth - fitW1) / 2;
      const y1 = margin + (maxContentHeight - fitH1) / 2;
      sheet.drawImage(img1, { x: x1, y: y1, width: fitW1, height: fitH1 });

      // Item 2 if exists
      if (i + 1 < renderedItems.length) {
        const item2 = renderedItems[i + 1];
        const img2 = await outputDoc.embedJpg(item2.jpegBytes);
        const ratio2 = item2.originalWidth / item2.originalHeight;
        let fitW2 = halfWidth;
        let fitH2 = halfWidth / ratio2;
        if (fitH2 > maxContentHeight) {
          fitH2 = maxContentHeight;
          fitW2 = maxContentHeight * ratio2;
        }
        const x2 = margin * 2 + halfWidth + (halfWidth - fitW2) / 2;
        const y2 = margin + (maxContentHeight - fitH2) / 2;
        sheet.drawImage(img2, { x: x2, y: y2, width: fitW2, height: fitH2 });
      }
    }
  } else if (options.samePageMerge && options.samePageLayout === 'four-up') {
    // 4-Up Layout: 2x2 grid
    const sheetWidth = 595.28;
    const sheetHeight = 841.89;
    const margin = 16;
    const cellWidth = (sheetWidth - margin * 3) / 2;
    const cellHeight = (sheetHeight - margin * 3) / 2;

    for (let i = 0; i < renderedItems.length; i += 4) {
      const sheet = outputDoc.addPage([sheetWidth, sheetHeight]);

      const coords = [
        { col: 0, row: 1 }, // top-left
        { col: 1, row: 1 }, // top-right
        { col: 0, row: 0 }, // bottom-left
        { col: 1, row: 0 }, // bottom-right
      ];

      for (let slot = 0; slot < 4; slot++) {
        const itemIdx = i + slot;
        if (itemIdx >= renderedItems.length) break;

        const item = renderedItems[itemIdx];
        const img = await outputDoc.embedJpg(item.jpegBytes);
        const ratio = item.originalWidth / item.originalHeight;

        let w = cellWidth;
        let h = cellWidth / ratio;
        if (h > cellHeight) {
          h = cellHeight;
          w = cellHeight * ratio;
        }

        const col = coords[slot].col;
        const row = coords[slot].row;
        const boxX = margin + col * (cellWidth + margin);
        const boxY = margin + row * (cellHeight + margin);

        const x = boxX + (cellWidth - w) / 2;
        const y = boxY + (cellHeight - h) / 2;

        sheet.drawImage(img, { x, y, width: w, height: h });
      }
    }
  } else {
    // Sequential single page per sheet
    for (let i = 0; i < renderedItems.length; i++) {
      const item = renderedItems[i];
      const img = await outputDoc.embedJpg(item.jpegBytes);

      let pageWidth = item.originalWidth;
      let pageHeight = item.originalHeight;

      if (options.resizeSameSize) {
        pageWidth = targetWidth;
        if (options.keepOriginalRatio) {
          const ratio = item.originalWidth / item.originalHeight;
          pageHeight = pageWidth / ratio;
        } else {
          pageHeight = targetHeight;
        }
      }

      const page = outputDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(img, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    }
  }

  onProgress({
    status: 'compressing',
    percent: 92,
    message: 'Encoding compressed document...',
  });

  const compressedBytes = await outputDoc.save({ useObjectStreams: true });
  const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(compressedBlob);
  const savings = calculateSavings(originalTotalSize, compressedBlob.size);

  onProgress({
    status: 'completed',
    percent: 100,
    message: 'Compression complete!',
  });

  return {
    isMerged: true,
    fileName: finalFileName,
    originalTotalSize,
    compressedTotalSize: compressedBlob.size,
    savedBytes: savings.savedBytes,
    savedPercentage: savings.savedPercentage,
    totalPages: outputDoc.getPageCount(),
    blob: compressedBlob,
    downloadUrl,
  };
}

// Implementation for Separate File Processing (when user turns off merge)
async function processSeparateFiles(
  files: UploadedPdfFile[],
  options: ProcessingOptions,
  targetWidth: number,
  targetHeight: number,
  onProgress: (prog: ProcessingProgress) => void
): Promise<CompressionResult> {
  const individualResults: IndividualResult[] = [];
  const zip = new JSZip();

  let originalTotal = 0;
  let compressedTotal = 0;
  let totalAllPages = 0;

  for (let fIdx = 0; fIdx < files.length; fIdx++) {
    const fileItem = files[fIdx];
    originalTotal += fileItem.size;

    onProgress({
      status: 'rendering',
      percent: 10 + Math.floor((fIdx / files.length) * 80),
      message: `Processing ${fileItem.name} (${fIdx + 1}/${files.length})...`,
      currentFileIndex: fIdx + 1,
      totalFiles: files.length,
    });

    const singleResult = await processMergedFile(
      [fileItem],
      options,
      targetWidth,
      targetHeight,
      fileItem.size,
      () => {}
    );

    compressedTotal += singleResult.compressedTotalSize;
    totalAllPages += singleResult.totalPages;

    const indResult: IndividualResult = {
      fileName: `compressed-${fileItem.name}`,
      originalSize: fileItem.size,
      compressedSize: singleResult.compressedTotalSize,
      savedBytes: singleResult.savedBytes,
      savedPercentage: singleResult.savedPercentage,
      blob: singleResult.blob,
      downloadUrl: singleResult.downloadUrl,
      pageCount: singleResult.totalPages,
    };

    individualResults.push(indResult);
    zip.file(indResult.fileName, singleResult.blob);
  }

  onProgress({
    status: 'assembling',
    percent: 95,
    message: 'Building ZIP package for download...',
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipUrl = URL.createObjectURL(zipBlob);
  const savings = calculateSavings(originalTotal, compressedTotal);

  onProgress({
    status: 'completed',
    percent: 100,
    message: 'All files compressed successfully!',
  });

  const zipFileName = resolveOutputFileName(options.customOutputName, 'compressed-pdfs.zip', '.zip');

  return {
    isMerged: false,
    fileName: zipFileName,
    originalTotalSize: originalTotal,
    compressedTotalSize: compressedTotal,
    savedBytes: savings.savedBytes,
    savedPercentage: savings.savedPercentage,
    totalPages: totalAllPages,
    blob: zipBlob,
    downloadUrl: zipUrl,
    individualResults,
  };
}
