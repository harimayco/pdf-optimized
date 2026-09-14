import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Download, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  ArrowDownRight, 
  FileText, 
  HardDrive, 
  Sparkles,
  Layers,
  FolderArchive,
  SlidersHorizontal,
  FilePenLine
} from 'lucide-react';
import { CompressionResult } from '../types';
import { formatBytes } from '../utils/formatters';

interface ResultViewProps {
  result: CompressionResult;
  onReset: () => void;
  onPreview: (url: string, name: string) => void;
  onBackToEdit: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onReset,
  onPreview,
  onBackToEdit,
}) => {
  const [downloadFileName, setDownloadFileName] = useState(result.fileName);

  // Sync if result changes
  useEffect(() => {
    setDownloadFileName(result.fileName);
  }, [result.fileName]);
  // Fire confetti on completion if savings are positive!
  useEffect(() => {
    if (result.savedPercentage > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#34D399', '#60A5FA', '#FB7185', '#FCD34D', '#A78BFA'],
        });
      } catch (e) {
        // ignore if confetti fails
      }
    }
  }, [result]);

  const handleDownload = (blobUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div id="result-view-container" className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Hero Card */}
      <div 
        id="result-hero-card"
        className="clay-card-white p-6 sm:p-10 text-center relative overflow-hidden"
      >
        {/* Success Clay Icon */}
        <div 
          className="w-20 h-20 mx-auto rounded-3xl mb-4 flex items-center justify-center text-white"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%), #34D399',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 0 0 #059669, 0 16px 28px rgba(5, 150, 105, 0.25)',
          }}
        >
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 id="result-success-title" className="text-3xl sm:text-4xl font-black text-[#1E1B4B] mb-2 tracking-tight">
          PDF Successfully Compressed!
        </h2>
        <p id="result-filename-label" className="text-base sm:text-lg font-bold text-[#64748B] mb-6">
          {result.fileName} • {result.totalPages} {result.totalPages === 1 ? 'Page' : 'Total Pages'}
        </p>

        {/* STAT NUMBER CARDS (Following DESIGN.md formula exactly) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 my-8 max-w-4xl mx-auto">
          {/* Before Size */}
          <div id="stat-before-size" className="stat-card flex flex-col items-center justify-center">
            <span className="text-xs sm:text-sm font-black text-[#64748B] uppercase tracking-wider mb-2">
              Before Compression
            </span>
            <span className="stat-num text-[#475569]">
              {formatBytes(result.originalTotalSize)}
            </span>
            <span className="text-xs font-semibold text-[#94A3B8] mt-1">
              Original Total Size
            </span>
          </div>

          {/* After Size */}
          <div id="stat-after-size" className="stat-card flex flex-col items-center justify-center ring-2 ring-[#60A5FA]">
            <span className="text-xs sm:text-sm font-black text-[#1D4ED8] uppercase tracking-wider mb-2">
              After Compression
            </span>
            <span className="stat-num text-[#1E1B4B]">
              {formatBytes(result.compressedTotalSize)}
            </span>
            <span className="text-xs font-semibold text-[#64748B] mt-1">
              New File Size
            </span>
          </div>

          {/* Reduced / Saved Size */}
          <div 
            id="stat-saved-size" 
            className="stat-card flex flex-col items-center justify-center bg-gradient-to-b from-[#ECFDF5] to-white ring-2 ring-[#34D399]"
          >
            <span className="text-xs sm:text-sm font-black text-[#059669] uppercase tracking-wider mb-2 flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" />
              <span>Reduced Size</span>
            </span>
            <span className="stat-num text-[#059669]">
              {formatBytes(result.savedBytes)}
            </span>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-[#34D399] text-white shadow-sm mt-2">
              {result.savedPercentage > 0 ? `-${result.savedPercentage}% Smaller` : '100% Retained'}
            </span>
          </div>
        </div>

        {/* Editable Filename Bar */}
        <div className="max-w-md mx-auto mb-6 p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#60A5FA]/20 text-[#1D4ED8] flex items-center justify-center shrink-0">
            <FilePenLine className="w-4 h-4" />
          </div>
          <div className="flex-1 text-left">
            <label htmlFor="result-filename-input" className="block text-[10px] font-extrabold uppercase text-[#64748B]">
              Download Filename
            </label>
            <input
              id="result-filename-input"
              type="text"
              value={downloadFileName}
              onChange={(e) => setDownloadFileName(e.target.value)}
              className="w-full text-xs font-bold text-[#1E1B4B] bg-transparent focus:outline-none border-b border-transparent focus:border-[#60A5FA]"
            />
          </div>
        </div>

        {/* Big Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            id="download-result-btn"
            type="button"
            onClick={() => handleDownload(result.downloadUrl, downloadFileName || result.fileName)}
            className="clay-btn-green px-8 py-4 text-lg font-bold flex items-center gap-3 shadow-lg"
          >
            <Download className="w-6 h-6" />
            <span>
              {result.isMerged ? 'Download Compressed PDF' : 'Download All as ZIP'}
            </span>
          </button>

          <button
            id="back-to-edit-btn"
            type="button"
            onClick={onBackToEdit}
            className="clay-btn-purple px-6 py-4 text-base font-bold flex items-center gap-2.5 text-white"
            title="Return to uploaded files and options to modify and regenerate"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Back to Edit & Regenerate</span>
          </button>

          {result.isMerged && (
            <button
              id="preview-result-btn"
              type="button"
              onClick={() => onPreview(result.downloadUrl, downloadFileName || result.fileName)}
              className="clay-btn-blue px-6 py-4 text-base font-bold flex items-center gap-2.5"
            >
              <Eye className="w-5 h-5" />
              <span>Preview in Browser</span>
            </button>
          )}

          <button
            id="compress-another-btn"
            type="button"
            onClick={onReset}
            className="clay-btn-white px-6 py-4 text-base font-bold flex items-center gap-2 text-[#475569]"
          >
            <RefreshCw className="w-5 h-5 text-[#64748B]" />
            <span>Start Fresh</span>
          </button>
        </div>
      </div>

      {/* If processed separately, list individual files */}
      {result.individualResults && result.individualResults.length > 0 && (
        <div id="individual-results-list" className="clay-card-white p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-xl font-black text-[#1E1B4B]">
                Individual File Results ({result.individualResults.length})
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-[#64748B]">
                Files were compressed separately per your settings
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleDownload(result.downloadUrl, result.fileName)}
              className="clay-btn-blue px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Download ZIP Archive</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {result.individualResults.map((ind, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#60A5FA]/20 text-[#1D4ED8] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1E1B4B] truncate max-w-[200px]" title={ind.fileName}>
                        {ind.fileName}
                      </p>
                      <p className="text-xs font-semibold text-[#64748B]">
                        {ind.pageCount} {ind.pageCount === 1 ? 'page' : 'pages'}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">
                    -{ind.savedPercentage}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-[#475569] pt-2 border-t border-[#E2E8F0]">
                  <div>
                    <span className="text-[#94A3B8] font-normal">Before: </span>
                    <span>{formatBytes(ind.originalSize)}</span>
                  </div>
                  <div>
                    <span className="text-[#94A3B8] font-normal">After: </span>
                    <span className="text-[#059669]">{formatBytes(ind.compressedSize)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDownload(ind.downloadUrl, ind.fileName)}
                    className="flex-1 py-2 rounded-xl bg-[#60A5FA] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#3B82F6] active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPreview(ind.downloadUrl, ind.fileName)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#475569] text-xs font-bold flex items-center justify-center hover:bg-slate-50 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
