import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface PdfPreviewModalProps {
  previewUrl: string;
  fileName: string;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  previewUrl,
  fileName,
  onClose,
}) => {
  return (
    <div
      id="pdf-preview-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1E1B4B]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="pdf-preview-dialog"
        className="clay-card-white w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-3 truncate">
            <h3 className="text-base sm:text-lg font-black text-[#1E1B4B] truncate">
              {fileName}
            </h3>
            <span className="hidden sm:inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
              In-Browser Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-[#475569] hover:bg-[#F1F5F9] transition-colors"
              title="Open in new window"
            >
              <ExternalLink className="w-5 h-5" />
            </a>

            <a
              href={previewUrl}
              download={fileName}
              className="p-2 rounded-xl text-[#059669] hover:bg-[#ECFDF5] transition-colors"
              title="Download file"
            >
              <Download className="w-5 h-5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#FB7185] hover:bg-[#FFF1F2] transition-colors"
              title="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* PDF viewer frame */}
        <div className="flex-1 bg-[#475569] p-1 sm:p-2 overflow-hidden flex items-center justify-center">
          <iframe
            src={previewUrl}
            title={fileName}
            className="w-full h-full rounded-xl bg-white border-0"
          />
        </div>
      </div>
    </div>
  );
};
