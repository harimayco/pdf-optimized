/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Dropzone } from './components/Dropzone';
import { FileList } from './components/FileList';
import { CompressionOptions } from './components/CompressionOptions';
import { ProcessingProgressModal } from './components/ProcessingProgressModal';
import { ResultView } from './components/ResultView';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { 
  UploadedPdfFile, 
  ProcessingOptions, 
  ProcessingProgress, 
  CompressionResult 
} from './types';
import { extractPdfInfo, processPdfs } from './utils/pdfProcessor';
import { createSamplePdf } from './utils/samplePdf';
import { formatBytes } from './utils/formatters';
import { Zap, AlertCircle, ShieldCheck } from 'lucide-react';

const initialOptions: ProcessingOptions = {
  mergeFiles: true, // Default: yes
  samePageMerge: false,
  samePageLayout: 'sequential',
  compressionLevel: 'recommended', // Default: recommended
  keepOriginalRatio: true, // Default: yes
  resizeSameSize: true, // Default: yes
  targetPageStandard: 'A4',
  customOutputName: '',
};

const initialProgress: ProcessingProgress = {
  status: 'idle',
  percent: 0,
  message: '',
};

export default function App() {
  const [files, setFiles] = useState<UploadedPdfFile[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>(initialOptions);
  const [progress, setProgress] = useState<ProcessingProgress>(initialProgress);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    url: string;
    name: string;
  }>({
    isOpen: false,
    url: '',
    name: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add new files to the list
  const handleFilesSelected = async (newRawFiles: File[]) => {
    setErrorMessage(null);
    const newItems: UploadedPdfFile[] = [];

    for (const file of newRawFiles) {
      const info = await extractPdfInfo(file);
      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        pageCount: info.pageCount,
        thumbnailUrl: info.thumbnailUrl,
        firstPageWidth: info.firstPageWidth,
        firstPageHeight: info.firstPageHeight,
        rotation: 0,
      });
    }

    setFiles((prev) => [...prev, ...newItems]);
  };

  // Generate sample PDFs for instant testing
  const handleLoadSamples = async () => {
    try {
      setIsLoadingSamples(true);
      setErrorMessage(null);

      const [sample1, sample2, sample3] = await Promise.all([
        createSamplePdf('Annual Report 2026', [0.24, 0.49, 0.98], 2), // Clay Blue
        createSamplePdf('Design Portfolio', [0.98, 0.44, 0.52], 2), // Clay Coral
        createSamplePdf('Project Specifications', [0.20, 0.83, 0.60], 1), // Clay Green
      ]);

      await handleFilesSelected([sample1, sample2, sample3]);
    } catch (err: any) {
      console.error('Failed to create sample PDFs', err);
      setErrorMessage('Could not generate sample files. Please try uploading your own PDF.');
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const handleReorder = (newOrder: UploadedPdfFile[]) => {
    setFiles(newOrder);
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRotateFile = (id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, rotation: (f.rotation + 90) % 360 } : f
      )
    );
  };

  const handleReset = () => {
    // Revoke any created blob URLs
    if (result) {
      URL.revokeObjectURL(result.downloadUrl);
      result.individualResults?.forEach((ind) => URL.revokeObjectURL(ind.downloadUrl));
    }
    setFiles([]);
    setResult(null);
    setProgress(initialProgress);
    setErrorMessage(null);
  };

  const handleBackToEdit = () => {
    // Return to files and options to edit settings or reorder and regenerate
    setResult(null);
    setProgress(initialProgress);
    setErrorMessage(null);
  };

  // Run compression and merge
  const handleProcess = async () => {
    if (files.length === 0) return;
    setErrorMessage(null);

    try {
      setProgress({
        status: 'preparing',
        percent: 5,
        message: 'Initializing browser PDF compressor...',
      });

      const res = await processPdfs(files, options, (p) => {
        setProgress(p);
      });

      setResult(res);
      setProgress({ status: 'idle', percent: 0, message: '' });
      // Scroll to result
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Processing failed', err);
      setProgress({ status: 'error', percent: 0, message: '', error: err.message });
      setErrorMessage(err.message || 'An error occurred while compressing the PDF.');
    }
  };

  const totalOriginalSize = files.reduce((sum, f) => sum + f.size, 0);
  const defaultOutputName = files.length === 1 
    ? `compressed-${files[0].name}` 
    : (options.mergeFiles ? 'merged-compressed.pdf' : 'compressed-pdfs.zip');

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F5F3FF] text-[#1E1B4B]">
      {/* Background Blobs per DESIGN.md */}
      <div className="blob-1 -top-24 -left-24" />
      <div className="blob-2 top-1/3 -right-32" />
      <div className="blob-3 -bottom-24 left-1/4" />

      {/* Hidden file input for "Add more files" */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelected(Array.from(e.target.files) as File[]);
            e.target.value = '';
          }
        }}
      />

      {/* Header */}
      <Navbar
        onLoadSamples={handleLoadSamples}
        isLoadingSamples={isLoadingSamples}
        hasFiles={files.length > 0 || result !== null}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Error Alert if any */}
        {errorMessage && (
          <div 
            id="error-alert" 
            className="mb-6 p-4 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] flex items-center gap-3 text-[#BE123C] animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-xs font-black px-2 py-1 rounded bg-[#FECDD3] hover:bg-[#FDA4AF]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View 1: Results View (if compression is finished) */}
        {result ? (
          <ResultView
            result={result}
            onReset={handleReset}
            onBackToEdit={handleBackToEdit}
            onPreview={(url, name) =>
              setPreviewModal({ isOpen: true, url, name })
            }
          />
        ) : files.length === 0 ? (
          /* View 2: Empty State / Initial Dropzone */
          <div className="py-6 sm:py-12">
            <Dropzone
              onFilesSelected={handleFilesSelected}
              onLoadSamples={handleLoadSamples}
              isLoadingSamples={isLoadingSamples}
            />
          </div>
        ) : (
          /* View 3: Workspace with Uploaded Files, Reordering, and Options */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Reorderable File List */}
            <FileList
              files={files}
              onReorder={handleReorder}
              onRemove={handleRemoveFile}
              onRotate={handleRotateFile}
              onAddMoreClick={() => fileInputRef.current?.click()}
            />

            {/* Dropzone compact strip */}
            <Dropzone
              isCompact
              onFilesSelected={handleFilesSelected}
              onLoadSamples={handleLoadSamples}
              isLoadingSamples={isLoadingSamples}
            />

            {/* Options Panel */}
            <CompressionOptions
              options={options}
              onChange={setOptions}
              fileCount={files.length}
              defaultOutputName={defaultOutputName}
            />

            {/* Sticky/Prominent Action Bottom Bar */}
            <div 
              id="action-bar-container"
              className="clay-card-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-2xl border-2 border-white/80"
            >
              <div className="text-center sm:text-left">
                <p className="text-base font-black text-[#1E1B4B]">
                  Ready to process {files.length} {files.length === 1 ? 'document' : 'documents'}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#64748B]">
                  Total Input Size: <span className="font-bold text-[#1E1B4B]">{formatBytes(totalOriginalSize)}</span> • 
                  {' '}{options.mergeFiles ? 'Merge enabled' : 'Separate files'} • 
                  {' '}<span className="capitalize">{options.compressionLevel}</span> compression
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  id="start-process-btn"
                  type="button"
                  onClick={handleProcess}
                  className="clay-btn-coral flex-1 sm:flex-none px-8 py-4 text-lg font-black flex items-center justify-center gap-3"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span>
                    {options.mergeFiles ? 'Compress & Merge PDF' : 'Compress PDFs'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client side privacy note */}
        <div className="mt-12 text-center text-xs font-semibold text-[#94A3B8] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#34D399]" />
          <span>Client-Side Processing: Your PDF documents never leave your browser or computer.</span>
        </div>
      </main>

      {/* Live Processing Modal */}
      {progress.status !== 'idle' && (
        <ProcessingProgressModal progress={progress} />
      )}

      {/* PDF Browser Preview Modal */}
      {previewModal.isOpen && (
        <PdfPreviewModal
          previewUrl={previewModal.url}
          fileName={previewModal.name}
          onClose={() =>
            setPreviewModal({ isOpen: false, url: '', name: '' })
          }
        />
      )}
    </div>
  );
}
