import React, { useRef, useState } from 'react';
import { Upload, FileUp, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onLoadSamples: () => void;
  isLoadingSamples: boolean;
  isCompact?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  onLoadSamples,
  isLoadingSamples,
  isCompact = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      ) as File[];
      if (droppedFiles.length > 0) {
        onFilesSelected(droppedFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files).filter(
        (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      ) as File[];
      if (selected.length > 0) {
        onFilesSelected(selected);
      }
      // reset input so same file can be re-added
      e.target.value = '';
    }
  };

  if (isCompact) {
    return (
      <div
        id="compact-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`clay-inset p-4 cursor-pointer transition-all border-2 border-dashed flex items-center justify-center gap-3 ${
          isDragOver
            ? 'border-[#60A5FA] bg-[#EFF6FF] scale-[1.01]'
            : 'border-[#CBD5E1] hover:border-[#60A5FA] bg-[#F8FAFC]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
        <div className="w-10 h-10 rounded-xl bg-[#60A5FA] flex items-center justify-center text-white shadow-sm">
          <Upload className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold text-[#1E1B4B]">Add More PDF Files</p>
          <p className="text-xs text-[#64748B]">Drop PDFs here or click to browse</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="main-dropzone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`clay-card-white p-8 sm:p-12 text-center transition-all duration-200 relative overflow-hidden ${
        isDragOver
          ? 'scale-[1.02] ring-4 ring-[#60A5FA]/40 bg-[#F0F7FF]'
          : 'clay-card-hover'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* Tactile Icon Box */}
        <div
          id="dropzone-icon-box"
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer w-24 h-24 rounded-3xl mb-6 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%), #FB7185',
            boxShadow:
              'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 0 0 #BE123C, 0 16px 28px rgba(190, 18, 60, 0.28)',
          }}
        >
          <FileUp className="w-12 h-12" />
        </div>

        {/* Heading */}
        <h2 id="dropzone-title" className="text-3xl sm:text-4xl font-black text-[#1E1B4B] mb-3 tracking-tight">
          Select or Drop PDF files
        </h2>
        <p id="dropzone-subtitle" className="text-base sm:text-lg text-[#475569] font-medium mb-8 max-w-md">
          Compress PDF with chosen quality, unify page sizes, or merge documents directly in your browser.
        </p>

        {/* Big Clay Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <button
            id="choose-files-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="clay-btn-coral px-8 py-4 text-lg flex items-center gap-3 font-bold"
          >
            <Upload className="w-6 h-6" />
            <span>Select PDF Files</span>
          </button>

          <button
            id="try-demo-files-btn"
            type="button"
            onClick={onLoadSamples}
            disabled={isLoadingSamples}
            className="clay-btn-white px-6 py-4 text-base font-bold flex items-center gap-2.5 text-[#312E81]"
          >
            <Sparkles className="w-5 h-5 text-[#A78BFA]" />
            <span>{isLoadingSamples ? 'Generating...' : 'Try With Sample PDFs'}</span>
          </button>
        </div>

        {/* Feature Highlights with paired clay icons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 border-t border-[#E2E8F0]">
          <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold text-[#334155]">
            <div className="w-7 h-7 rounded-lg bg-[#34D399]/20 text-[#059669] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span>100% Client-Side Privacy</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold text-[#334155]">
            <div className="w-7 h-7 rounded-lg bg-[#60A5FA]/20 text-[#1D4ED8] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <span>Smart Browser Compression</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm font-bold text-[#334155]">
            <div className="w-7 h-7 rounded-lg bg-[#A78BFA]/20 text-[#6D28D9] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Merge, Reorder & Resize</span>
          </div>
        </div>
      </div>
    </div>
  );
};
