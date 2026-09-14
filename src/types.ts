export type CompressionLevel = 'extreme' | 'recommended' | 'less' | 'none';

export type PageMergeMode = 'sequential' | 'two-up' | 'four-up';

export interface UploadedPdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  thumbnailUrl: string;
  firstPageWidth: number;
  firstPageHeight: number;
  rotation: number; // 0, 90, 180, 270
}

export interface ProcessingOptions {
  mergeFiles: boolean; // default: true
  samePageMerge: boolean; // default: false or toggleable (combine pages on same sheet)
  samePageLayout: PageMergeMode; // 'sequential' | 'two-up' | 'four-up'
  compressionLevel: CompressionLevel; // default: 'recommended'
  keepOriginalRatio: boolean; // default: true
  resizeSameSize: boolean; // default: true (unify widths)
  targetPageStandard: 'A4' | 'Letter' | 'FirstFile' | 'Auto';
  customOutputName: string; // custom filename with default value
}

export interface ProcessingProgress {
  status: 'idle' | 'preparing' | 'rendering' | 'compressing' | 'assembling' | 'completed' | 'error';
  percent: number;
  message: string;
  currentFileIndex?: number;
  totalFiles?: number;
  currentPage?: number;
  totalPages?: number;
  error?: string;
}

export interface IndividualResult {
  fileName: string;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercentage: number;
  blob: Blob;
  downloadUrl: string;
  pageCount: number;
}

export interface CompressionResult {
  isMerged: boolean;
  fileName: string;
  originalTotalSize: number;
  compressedTotalSize: number;
  savedBytes: number;
  savedPercentage: number;
  totalPages: number;
  blob: Blob;
  downloadUrl: string;
  individualResults?: IndividualResult[];
}
