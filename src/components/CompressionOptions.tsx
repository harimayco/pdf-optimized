import React from 'react';
import { 
  Minimize2, 
  Layers, 
  Scaling, 
  Ratio, 
  Grid, 
  Sparkles, 
  Check, 
  SlidersHorizontal,
  Info,
  FilePenLine,
  RotateCcw
} from 'lucide-react';
import { CompressionLevel, PageMergeMode, ProcessingOptions } from '../types';

interface CompressionOptionsProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
  fileCount: number;
  defaultOutputName: string;
}

export const CompressionOptions: React.FC<CompressionOptionsProps> = ({
  options,
  onChange,
  fileCount,
  defaultOutputName,
}) => {
  const updateOption = <K extends keyof ProcessingOptions>(key: K, value: ProcessingOptions[K]) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  const handleResetName = () => {
    updateOption('customOutputName', defaultOutputName);
  };

  const compressionLevels: {
    id: CompressionLevel;
    title: string;
    description: string;
    badge?: string;
    clayColor: string;
  }[] = [
    {
      id: 'extreme',
      title: 'Extreme',
      description: 'Maximum reduction, lower resolution. Best for email size limits.',
      clayColor: '#FB7185',
    },
    {
      id: 'recommended',
      title: 'Recommended',
      description: 'Optimal balance of high compression & crisp visual quality.',
      badge: 'Default',
      clayColor: '#34D399',
    },
    {
      id: 'less',
      title: 'Less',
      description: 'High resolution preserved with light compression.',
      clayColor: '#60A5FA',
    },
    {
      id: 'none',
      title: 'None',
      description: 'Zero lossy compression. Preserves 100% original vector & image streams.',
      clayColor: '#A78BFA',
    },
  ];

  return (
    <div id="options-panel" className="clay-card-white p-6 sm:p-8 space-y-8">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 60%), #60A5FA',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 4px 0 0 #1D4ED8, 0 8px 16px rgba(29, 78, 216, 0.2)',
            }}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 id="options-heading" className="text-xl sm:text-2xl font-black text-[#1E1B4B]">
              Compression & Merge Settings
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-[#64748B]">
              Customize compression levels, page sizing, and merge layout
            </p>
          </div>
        </div>
      </div>

      {/* 0. Custom Output File Name Section */}
      <div id="output-filename-section" className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <label htmlFor="custom-output-name" className="text-sm font-extrabold text-[#1E1B4B] flex items-center gap-2">
            <FilePenLine className="w-4 h-4 text-[#60A5FA]" />
            <span>Output File Name</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#64748B]">
              Default: <code className="text-[#1E1B4B] bg-[#EFF6FF] px-1.5 py-0.5 rounded text-[11px]">{defaultOutputName}</code>
            </span>
            {options.customOutputName && options.customOutputName !== defaultOutputName && (
              <button
                type="button"
                id="reset-name-btn"
                onClick={handleResetName}
                className="text-xs font-black text-[#1D4ED8] hover:text-[#1E1B4B] flex items-center gap-1 bg-[#EFF6FF] px-2 py-0.5 rounded-lg transition-colors"
                title="Reset to default filename"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="relative flex items-center">
          <input
            id="custom-output-name"
            type="text"
            value={options.customOutputName ?? defaultOutputName}
            onChange={(e) => updateOption('customOutputName', e.target.value)}
            placeholder={defaultOutputName}
            className="w-full px-4 py-2.5 pr-20 rounded-xl bg-white border border-[#CBD5E1] text-[#1E1B4B] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all shadow-xs"
          />
          <span className="absolute right-3 text-xs font-black text-[#94A3B8] pointer-events-none select-none">
            {options.mergeFiles ? '.pdf' : '.zip'}
          </span>
        </div>
        <p className="text-[11px] text-[#64748B] font-medium mt-1.5">
          Specify a custom download name or leave blank to use the default generated name.
        </p>
      </div>

      {/* 1. Compression Levels Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-base font-extrabold text-[#1E1B4B] flex items-center gap-2">
            <Minimize2 className="w-4 h-4 text-[#60A5FA]" />
            <span>Compression Level</span>
          </label>
          <span className="text-xs font-bold text-[#64748B]">
            Selected: <span className="text-[#1E1B4B] uppercase font-black">{options.compressionLevel}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {compressionLevels.map((lvl) => {
            const isSelected = options.compressionLevel === lvl.id;
            return (
              <div
                key={lvl.id}
                id={`compression-level-${lvl.id}`}
                onClick={() => updateOption('compressionLevel', lvl.id)}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-150 flex flex-col justify-between relative ${
                  isSelected
                    ? 'ring-3 ring-[#1E1B4B] bg-[#F8FAFC]'
                    : 'bg-white hover:bg-[#F8FAFC]'
                }`}
                style={{
                  boxShadow: isSelected
                    ? 'inset 0 2px 4px rgba(0, 0, 0, 0.06), 0 4px 0 0 #CBD5E1, 0 8px 16px rgba(0, 0, 0, 0.06)'
                    : 'inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 0 0 #E2E8F0, 0 8px 16px rgba(0, 0, 0, 0.04)',
                }}
              >
                {/* Header inside card */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: lvl.clayColor }}
                      />
                      <span className="font-black text-sm text-[#1E1B4B]">{lvl.title}</span>
                    </div>

                    {lvl.badge && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                        {lvl.badge}
                      </span>
                    )}

                    {isSelected && !lvl.badge && (
                      <span className="w-5 h-5 rounded-full bg-[#1E1B4B] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
                    {lvl.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#F1F5F9] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#94A3B8]">
                    {lvl.id === 'none' ? 'Pass-Through' : lvl.id === 'extreme' ? 'Max Saved' : 'Smart DPI'}
                  </span>
                  {isSelected && (
                    <span className="text-[11px] font-black text-[#1E1B4B]">Active</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Merge Documents Option (Default Yes) */}
      <div className="pt-2 border-t border-[#F1F5F9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8FAFC]">
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 60%), #A78BFA',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 4px 0 0 #6D28D9',
              }}
            >
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#1E1B4B]">
                  Merge PDF files into a single document
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                  Default: Yes
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5">
                {options.mergeFiles
                  ? `Combines all ${fileCount} uploaded file${fileCount > 1 ? 's' : ''} sequentially into one unified PDF.`
                  : 'Compress each file independently and download separately or as a ZIP archive.'}
              </p>
            </div>
          </div>

          {/* Clay Toggle Button */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              id="toggle-merge-yes"
              type="button"
              onClick={() => updateOption('mergeFiles', true)}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                options.mergeFiles ? 'clay-btn-blue text-white' : 'clay-btn-white text-[#64748B]'
              }`}
            >
              Merge (Yes)
            </button>
            <button
              id="toggle-merge-no"
              type="button"
              onClick={() => updateOption('mergeFiles', false)}
              className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
                !options.mergeFiles ? 'clay-btn-coral text-white' : 'clay-btn-white text-[#64748B]'
              }`}
            >
              Separate (No)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Merge in Same Page (N-Up layout) */}
      <div className="pt-2 border-t border-[#F1F5F9]">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-base font-extrabold text-[#1E1B4B] flex items-center gap-2">
              <Grid className="w-4 h-4 text-[#A78BFA]" />
              <span>Merge Pages on Same Sheet (N-Up)</span>
            </label>
            <span className="text-xs font-bold text-[#64748B]">
              Place multiple pages onto a single sheet
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'sequential',
                title: 'Standard (1 Page/Sheet)',
                desc: 'Standard 1-to-1 page merging',
              },
              {
                id: 'two-up',
                title: '2-in-1 (Same Sheet)',
                desc: '2 pages side-by-side on single sheet',
              },
              {
                id: 'four-up',
                title: '4-in-1 (Grid Sheet)',
                desc: '4 pages 2×2 grid on single sheet',
              },
            ].map((layout) => {
              const isActive = options.samePageMerge && options.samePageLayout === layout.id
                || (!options.samePageMerge && layout.id === 'sequential');
              return (
                <button
                  key={layout.id}
                  id={`layout-btn-${layout.id}`}
                  type="button"
                  onClick={() => {
                    if (layout.id === 'sequential') {
                      updateOption('samePageMerge', false);
                      updateOption('samePageLayout', 'sequential');
                    } else {
                      updateOption('samePageMerge', true);
                      updateOption('samePageLayout', layout.id as PageMergeMode);
                    }
                  }}
                  className={`p-3.5 rounded-2xl text-left transition-all ${
                    isActive ? 'clay-card-blue' : 'clay-card-white hover:bg-slate-50'
                  }`}
                >
                  <p className={`font-black text-sm mb-1 ${isActive ? 'text-white' : 'text-[#1E1B4B]'}`}>
                    {layout.title}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-[#64748B]'}`}>
                    {layout.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Sizing & Aspect Ratio Options */}
      <div className="pt-2 border-t border-[#F1F5F9] space-y-4">
        <h4 className="text-base font-extrabold text-[#1E1B4B] flex items-center gap-2">
          <Scaling className="w-4 h-4 text-[#34D399]" />
          <span>Page Dimension & Ratio Controls</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Keep original page ratio (default yes) */}
          <div 
            id="option-keep-ratio"
            onClick={() => updateOption('keepOriginalRatio', !options.keepOriginalRatio)}
            className="cursor-pointer p-4 rounded-2xl bg-[#F8FAFC] flex items-start gap-3 border border-[#E2E8F0] hover:border-[#60A5FA] transition-colors"
          >
            <div className="pt-0.5">
              <input
                type="checkbox"
                id="keepOriginalRatio"
                checked={options.keepOriginalRatio}
                onChange={() => {}}
                className="w-5 h-5 rounded text-[#34D399] accent-[#34D399] cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#1E1B4B]">
                  Keep original page ratio
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#059669]">
                  Default: Yes
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-1">
                Preserves exact proportional aspect ratio so text and images are never stretched or distorted.
              </p>
            </div>
          </div>

          {/* Resize PDF with same size (default yes) */}
          <div 
            id="option-resize-same-size"
            onClick={() => updateOption('resizeSameSize', !options.resizeSameSize)}
            className="cursor-pointer p-4 rounded-2xl bg-[#F8FAFC] flex items-start gap-3 border border-[#E2E8F0] hover:border-[#60A5FA] transition-colors"
          >
            <div className="pt-0.5">
              <input
                type="checkbox"
                id="resizeSameSize"
                checked={options.resizeSameSize}
                onChange={() => {}}
                className="w-5 h-5 rounded text-[#60A5FA] accent-[#60A5FA] cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#1E1B4B]">
                  Resize PDF with same size
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8]">
                  Default: Yes
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium mt-1">
                Harmonizes all pages to uniform width (great when merging documents of mixed paper sizes).
              </p>
            </div>
          </div>
        </div>

        {/* Standard Page Size Selector if Resize Same Size is checked */}
        {options.resizeSameSize && (
          <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1D4ED8]" />
              <span className="text-xs sm:text-sm font-bold text-[#1E1B4B]">
                Target Standard Page Dimensions:
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[
                { id: 'A4', label: 'A4 (595 pt)' },
                { id: 'Letter', label: 'Letter (612 pt)' },
                { id: 'FirstFile', label: "Match 1st File" },
              ].map((std) => (
                <button
                  key={std.id}
                  id={`target-standard-${std.id}`}
                  type="button"
                  onClick={() => updateOption('targetPageStandard', std.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    options.targetPageStandard === std.id
                      ? 'clay-pill-active'
                      : 'clay-pill-inactive'
                  }`}
                >
                  {std.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
