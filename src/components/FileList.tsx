import React, { useState } from 'react';
import { 
  GripVertical, 
  Trash2, 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  FileText,
  Layers,
  Plus
} from 'lucide-react';
import { UploadedPdfFile } from '../types';
import { formatBytes } from '../utils/formatters';

interface FileListProps {
  files: UploadedPdfFile[];
  onReorder: (newFiles: UploadedPdfFile[]) => void;
  onRemove: (id: string) => void;
  onRotate: (id: string) => void;
  onAddMoreClick: () => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onReorder,
  onRemove,
  onRotate,
  onAddMoreClick,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...files];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, movedItem);

    onReorder(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveLeft = (index: number) => {
    if (index <= 0) return;
    const updated = [...files];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onReorder(updated);
  };

  const moveRight = (index: number) => {
    if (index >= files.length - 1) return;
    const updated = [...files];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onReorder(updated);
  };

  return (
    <div id="file-list-container" className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
        <div>
          <h3 id="file-list-heading" className="text-xl sm:text-2xl font-black text-[#1E1B4B]">
            Uploaded Documents ({files.length})
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-[#64748B]">
            Drag cards or use arrow buttons to reorder merging sequence
          </p>
        </div>

        <button
          id="add-more-files-btn"
          type="button"
          onClick={onAddMoreClick}
          className="clay-btn-white px-3.5 py-2 text-sm font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#60A5FA]" />
          <span>Add More PDFs</span>
        </button>
      </div>

      {/* Grid of reorderable cards */}
      <div 
        id="pdf-cards-grid"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {files.map((file, index) => {
          const isBeingDragged = draggedIndex === index;
          const isTargeted = dragOverIndex === index;

          return (
            <div
              key={file.id}
              id={`pdf-card-${file.id}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(index)}
              className={`clay-card-white p-3.5 flex flex-col justify-between transition-all duration-150 relative select-none ${
                isBeingDragged ? 'opacity-40 scale-95' : ''
              } ${
                isTargeted ? 'ring-4 ring-[#60A5FA] bg-[#EFF6FF] scale-105' : 'hover:-translate-y-1'
              }`}
            >
              {/* Card Header: Order Badge & Delete */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span 
                    className="w-6 h-6 rounded-full bg-[#1E1B4B] text-white text-xs font-black flex items-center justify-center shadow-sm"
                    title={`Order position #${index + 1}`}
                  >
                    {index + 1}
                  </span>
                  <div className="cursor-grab active:cursor-grabbing text-[#94A3B8] hover:text-[#475569] p-1">
                    <GripVertical className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onRotate(file.id)}
                    title="Rotate document 90° clockwise"
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E1B4B] hover:bg-[#F1F5F9] transition-colors"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(file.id)}
                    title="Remove document"
                    className="p-1.5 rounded-lg text-[#FB7185] hover:text-[#BE123C] hover:bg-[#FFF1F2] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Preview Thumbnail Box */}
              <div className="clay-inset w-full h-44 mb-3 flex items-center justify-center overflow-hidden relative bg-[#F8FAFC]">
                {file.thumbnailUrl ? (
                  <img
                    src={file.thumbnailUrl}
                    alt={file.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-200"
                    style={{ transform: `rotate(${file.rotation}deg)` }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#94A3B8]">
                    <FileText className="w-10 h-10" />
                    <span className="text-xs font-bold">PDF Document</span>
                  </div>
                )}

                {/* Page count pill in corner */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#1E1B4B]/80 backdrop-blur-xs text-white text-[11px] font-black flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>{file.pageCount} {file.pageCount === 1 ? 'pg' : 'pgs'}</span>
                </div>

                {file.rotation > 0 && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#FCD34D] text-[#B45309] text-[10px] font-black">
                    {file.rotation}°
                  </div>
                )}
              </div>

              {/* Metadata Info */}
              <div className="mb-3">
                <p 
                  className="text-sm font-bold text-[#1E1B4B] truncate leading-tight mb-1"
                  title={file.name}
                >
                  {file.name}
                </p>
                <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                  <span>{formatBytes(file.size)}</span>
                  <span>{file.firstPageWidth}×{file.firstPageHeight} pt</span>
                </div>
              </div>

              {/* Position Reordering Quick Arrows */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveLeft(index)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    index === 0
                      ? 'text-[#CBD5E1] cursor-not-allowed bg-slate-50'
                      : 'text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] active:scale-95'
                  }`}
                  title="Move earlier in merge order"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Earlier</span>
                </button>

                <button
                  type="button"
                  disabled={index === files.length - 1}
                  onClick={() => moveRight(index)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    index === files.length - 1
                      ? 'text-[#CBD5E1] cursor-not-allowed bg-slate-50'
                      : 'text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] active:scale-95'
                  }`}
                  title="Move later in merge order"
                >
                  <span>Later</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
