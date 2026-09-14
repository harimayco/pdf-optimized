import React, { useState } from 'react';
import { 
  Minimize2, 
  Layers, 
  Scaling, 
  Grid, 
  Check, 
  SlidersHorizontal,
  Info,
  FilePenLine,
  RotateCcw,
  ChevronDown,
  Zap,
  Sparkles
} from 'lucide-react';
import { CompressionLevel, PageMergeMode, ProcessingOptions } from '../types';
import { formatBytes } from '../utils/formatters';

interface CompressionOptionsProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
  fileCount: number;
  defaultOutputName: string;
  totalOriginalSize: number;
  onProcess: () => void;
}

export const CompressionOptions: React.FC<CompressionOptionsProps> = ({
  options,
  onChange,
  fileCount,
  defaultOutputName,
  totalOriginalSize,
  onProcess,
}) => {
  // Advanced options are hidden (collapsed) by default as requested
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      description: 'Maximum size reduction',
      clayColor: '#FB7185',
    },
    {
      id: 'recommended',
      title: 'Recommended',
      description: 'Balanced size & sharp text',
      badge: 'Default',
      clayColor: '#34D399',
    },
    {
      id: 'less',
      title: 'Less',
      description: 'High fidelity with light compression',
      clayColor: '#60A5FA',
    },
    {
      id: 'none',
      title: 'None',
      description: 'Lossless vector & image streams',
      clayColor: '#A78BFA',
    },
  ];

  return (
    <div id="floating-settings-panel" className="clay-card-white p-5 sm:p-6 space-y-5 shadow-xl border border-white/80">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 60%), #60A5FA',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 3px 0 0 #1D4ED8, 0 6px 12px rgba(29, 78, 216, 0.2)',
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 id="settings-heading" className="text-lg font-black text-[#1E1B4B] leading-snug">
              Compression & Merge
            </h3>
            <p className="text-xs font-semibold text-[#64748B]">
              {fileCount} {fileCount === 1 ? 'file' : 'files'} selected • {formatBytes(totalOriginalSize)}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Output Filename */}
      <div id="output-filename-section" className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="custom-output-name" className="text-xs font-black text-[#1E1B4B] flex items-center gap-1.5">
            <FilePenLine className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Output Filename</span>
          </label>
          {options.customOutputName && options.customOutputName !== defaultOutputName && (
            <button
              type="button"
              id="reset-name-btn"
              onClick={handleResetName}
              className="text-[11px] font-black text-[#1D4ED8] hover:text-[#1E1B4B] flex items-center gap-1 bg-[#EFF6FF] px-2 py-0.5 rounded-lg transition-colors"
              title="Reset to default filename"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="relative flex items-center">
          <input
            id="custom-output-name"
            type="text"
            value={options.customOutputName ?? defaultOutputName}
            onChange={(e) => updateOption('customOutputName', e.target.value)}
            placeholder={defaultOutputName}
            className="w-full px-3.5 py-2.5 pr-16 rounded-xl bg-white border border-[#CBD5E1] text-[#1E1B4B] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all shadow-xs"
          />
          <span className="absolute right-3 text-xs font-black text-[#94A3B8] pointer-events-none select-none">
            {options.mergeFiles ? '.pdf' : '.zip'}
          </span>
        </div>
      </div>

      {/* 2. Compression Level */}
      <div id="compression-level-section" className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-[#1E1B4B] flex items-center gap-1.5">
            <Minimize2 className="w-3.5 h-3.5 text-[#60A5FA]" />
            <span>Compression Level</span>
          </label>
          <span className="text-[11px] font-bold text-[#64748B]">
            <span className="capitalize font-black text-[#1E1B4B]">{options.compressionLevel}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {compressionLevels.map((lvl) => {
            const isSelected = options.compressionLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                id={`compression-level-${lvl.id}`}
                onClick={() => updateOption('compressionLevel', lvl.id)}
                className={`p-2.5 rounded-xl text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-[#1E1B4B] bg-[#F8FAFC]'
                    : 'bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0]'
                }`}
                style={{
                  boxShadow: isSelected
                    ? 'inset 0 1px 2px rgba(0,0,0,0.05), 0 2px 0 0 #CBD5E1'
                    : '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <div className="flex items-center justify-between gap-1 w-full mb-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: lvl.clayColor }}
                    />
                    <span className="font-extrabold text-xs text-[#1E1B4B]">{lvl.title}</span>
                  </div>
                  {lvl.badge ? (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                      {lvl.badge}
                    </span>
                  ) : isSelected ? (
                    <Check className="w-3 h-3 text-[#1E1B4B]" />
                  ) : null}
                </div>
                <p className="text-[10px] text-[#64748B] font-medium leading-tight line-clamp-2">
                  {lvl.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Advanced Options (Default Hidden) */}
      <div id="advanced-options-accordion" className="pt-2 border-t border-[#E2E8F0]">
        <button
          type="button"
          id="toggle-advanced-options-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full py-2 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-between text-xs font-black text-[#1E1B4B] transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Advanced Options</span>
            <span className="text-[10px] font-bold text-[#94A3B8]">
              {showAdvanced ? '(Click to collapse)' : '(Optional)'}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${
              showAdvanced ? 'rotate-180 text-[#1E1B4B]' : ''
            }`}
          />
        </button>

        {showAdvanced && (
          <div className="mt-3.5 space-y-4 p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Merge into single document */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#1E1B4B] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Merge into single PDF</span>
                </label>
                <span className="text-[10px] font-black text-[#64748B]">
                  {options.mergeFiles ? 'Merge (Yes)' : 'Separate'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="toggle-merge-yes"
                  type="button"
                  onClick={() => updateOption('mergeFiles', true)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all ${
                    options.mergeFiles ? 'clay-btn-blue text-white' : 'clay-btn-white text-[#64748B]'
                  }`}
                >
                  Merge (Yes)
                </button>
                <button
                  id="toggle-merge-no"
                  type="button"
                  onClick={() => updateOption('mergeFiles', false)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all ${
                    !options.mergeFiles ? 'clay-btn-coral text-white' : 'clay-btn-white text-[#64748B]'
                  }`}
                >
                  Separate (No)
                </button>
              </div>
            </div>

            {/* Same sheet layout (N-Up) */}
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
              <label className="text-xs font-black text-[#1E1B4B] flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Multi-Page Layout (Per Sheet)</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'sequential', label: '1-in-1' },
                  { id: 'two-up', label: '2-in-1' },
                  { id: 'four-up', label: '4-in-1' },
                ].map((layout) => {
                  const isActive =
                    (options.samePageMerge && options.samePageLayout === layout.id) ||
                    (!options.samePageMerge && layout.id === 'sequential');
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
                      className={`py-1.5 px-2 rounded-xl text-xs font-black text-center transition-all ${
                        isActive ? 'clay-pill-active' : 'clay-pill-inactive'
                      }`}
                    >
                      {layout.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sizing & Ratio Controls */}
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
              <label className="text-xs font-black text-[#1E1B4B] flex items-center gap-1.5">
                <Scaling className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Page Dimensions & Ratio</span>
              </label>
              <div className="space-y-2">
                <label 
                  id="option-keep-ratio" 
                  className="flex items-center gap-2 text-xs font-bold text-[#1E1B4B] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={options.keepOriginalRatio}
                    onChange={() => updateOption('keepOriginalRatio', !options.keepOriginalRatio)}
                    className="w-4 h-4 rounded text-[#34D399] accent-[#34D399] cursor-pointer"
                  />
                  <span>Keep original aspect ratio</span>
                </label>

                <label 
                  id="option-resize-same-size" 
                  className="flex items-center gap-2 text-xs font-bold text-[#1E1B4B] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={options.resizeSameSize}
                    onChange={() => updateOption('resizeSameSize', !options.resizeSameSize)}
                    className="w-4 h-4 rounded text-[#60A5FA] accent-[#60A5FA] cursor-pointer"
                  />
                  <span>Resize all pages to same size</span>
                </label>

                {options.resizeSameSize && (
                  <div className="pt-1.5 flex items-center justify-between gap-1.5">
                    <span className="text-[11px] font-bold text-[#64748B]">Size:</span>
                    <div className="flex items-center gap-1">
                      {[
                        { id: 'A4', label: 'A4' },
                        { id: 'Letter', label: 'Letter' },
                        { id: 'FirstFile', label: '1st File' },
                      ].map((std) => (
                        <button
                          key={std.id}
                          id={`target-standard-${std.id}`}
                          type="button"
                          onClick={() => updateOption('targetPageStandard', std.id as any)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
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
          </div>
        )}
      </div>

      {/* 4. Prominent Compress & Merge Button */}
      <div className="pt-2">
        <button
          id="start-process-btn"
          type="button"
          onClick={onProcess}
          className="clay-btn-coral w-full py-4 px-6 text-base sm:text-lg font-black flex items-center justify-center gap-2.5 shadow-lg"
        >
          <Zap className="w-5 h-5 fill-current shrink-0" />
          <span>
            {fileCount === 1 
              ? 'Compress PDF' 
              : options.mergeFiles 
                ? 'Compress & Merge' 
                : 'Compress PDFs'}
          </span>
        </button>

        <p className="text-[11px] font-semibold text-center text-[#64748B] mt-2.5">
          Fast in-browser processing • No uploads to servers
        </p>
      </div>
    </div>
  );
};
