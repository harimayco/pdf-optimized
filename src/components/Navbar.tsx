import React from 'react';
import { FileDown, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface NavbarProps {
  onLoadSamples: () => void;
  isLoadingSamples: boolean;
  hasFiles: boolean;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadSamples,
  isLoadingSamples,
  hasFiles,
  onReset,
}) => {
  return (
    <header id="main-header" className="relative z-10 w-full max-w-6xl mx-auto pt-6 px-4 pb-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div 
          id="brand-logo-container" 
          onClick={onReset} 
          className="flex items-center gap-3 cursor-pointer group"
          title="Reset to home"
        >
          <div 
            id="clay-logo-icon"
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 60%), #60A5FA',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 6px 0 0 #1D4ED8, 0 12px 20px rgba(29, 78, 216, 0.22)',
            }}
          >
            <Layers className="w-8 h-8 transition-transform group-hover:scale-110 duration-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 id="app-title" className="text-2xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
                Compress<span className="text-[#60A5FA]">PDF</span>
              </h1>
              <span 
                id="browser-badge"
                className="text-xs font-bold px-2.5 py-0.5 rounded-full text-[#1D4ED8] bg-[#EFF6FF] border border-[#BFDBFE]"
              >
                In-Browser
              </span>
            </div>
            <p id="app-tagline" className="text-xs sm:text-sm font-semibold text-[#64748B]">
              Merge & Compress PDFs • 100% Private Client-Side
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div id="nav-actions" className="flex items-center gap-3">
          <button
            id="try-samples-btn"
            type="button"
            onClick={onLoadSamples}
            disabled={isLoadingSamples}
            className="clay-btn-purple px-4 py-2.5 text-sm sm:text-base flex items-center gap-2"
            title="Generate sample PDFs to test the compressor immediately"
          >
            {isLoadingSamples ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isLoadingSamples ? 'Generating...' : 'Try Sample PDFs'}</span>
          </button>

          {hasFiles && (
            <button
              id="nav-reset-btn"
              type="button"
              onClick={onReset}
              className="clay-btn-white px-3.5 py-2.5 text-sm flex items-center gap-1.5"
              title="Clear all uploaded documents"
            >
              <RefreshCw className="w-4 h-4 text-[#64748B]" />
              <span className="font-bold text-[#475569]">Start Over</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
