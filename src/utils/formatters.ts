export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  if (!Number.isFinite(bytes) || bytes < 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, sizes.length - 1);

  return parseFloat((bytes / Math.pow(k, idx)).toFixed(dm)) + ' ' + sizes[idx];
}

export function calculateSavings(originalSize: number, compressedSize: number) {
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercentage = originalSize > 0 
    ? Math.max(0, Math.min(100, Math.round(((originalSize - compressedSize) / originalSize) * 100))) 
    : 0;

  return {
    savedBytes,
    savedPercentage,
    isReduced: compressedSize < originalSize,
  };
}
