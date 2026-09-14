import * as pdfjsLib from 'pdfjs-dist';

let workerConfigured = false;

export function configurePdfWorker() {
  if (workerConfigured) return;
  try {
    if (typeof window !== 'undefined') {
      // Setup worker URL from CDN or fallback
      const version = pdfjsLib.version || '4.10.38';
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
      workerConfigured = true;
    }
  } catch (err) {
    console.warn('Could not auto-configure PDF worker from CDN, fallback enabled', err);
  }
}

export { pdfjsLib };
