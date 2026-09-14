import React from 'react';
import { RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { ProcessingProgress } from '../types';

interface ProcessingProgressModalProps {
  progress: ProcessingProgress;
}

export const ProcessingProgressModal: React.FC<ProcessingProgressModalProps> = ({
  progress,
}) => {
  return (
    <div 
      id="processing-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1B4B]/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        id="processing-card"
        className="clay-card-white max-w-md w-full p-8 text-center space-y-6 animate-in zoom-in-95 duration-200"
      >
        {/* Clay Animated Icon */}
        <div 
          className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%), #60A5FA',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 0 0 #1D4ED8, 0 16px 28px rgba(29, 78, 216, 0.28)',
          }}
        >
          {progress.percent === 100 ? (
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          ) : (
            <RefreshCw className="w-10 h-10 animate-spin" />
          )}
        </div>

        {/* Status Text */}
        <div>
          <h3 id="processing-title" className="text-2xl font-black text-[#1E1B4B] mb-2">
            {progress.percent === 100 ? 'Finishing Up...' : 'Compressing Your PDF'}
          </h3>
          <p id="processing-message" className="text-sm font-bold text-[#64748B]">
            {progress.message || 'Processing pages in browser level...'}
          </p>
        </div>

        {/* Progress bar following DESIGN.md formula */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-[#1E1B4B] px-1">
            <span>Progress</span>
            <span className="text-[#1D4ED8]">{progress.percent}%</span>
          </div>

          <div className="clay-track w-full">
            <div 
              className="clay-fill"
              style={{ width: `${Math.max(5, progress.percent)}%` }}
            />
          </div>

          {progress.currentPage && progress.totalPages && (
            <p className="text-xs font-bold text-[#64748B] pt-1">
              Page {progress.currentPage} of {progress.totalPages}
            </p>
          )}
        </div>

        <p className="text-xs font-medium text-[#94A3B8] italic">
          All processing runs in your browser. No files are uploaded to any server.
        </p>
      </div>
    </div>
  );
};
