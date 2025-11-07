/**
 * Constructs the full URL for a file stored on the server
 * @param filePath - The file path from the database (e.g., "uploads/image.jpg")
 * @param fileType - The type of file ('image' | 'pdf')
 * @returns Full URL to access the file
 */
export function getFileUrl(filePath: string, fileType?: 'image' | 'pdf'): string {
  if (!filePath) return '';
  
  // If it's a PDF with external URL (Google Drive, etc.), return as is
  if (fileType === 'pdf' && (filePath.startsWith('http://') || filePath.startsWith('https://'))) {
    return filePath;
  }
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // If it's a blob URL (for preview), return as is
  if (filePath.startsWith('blob:')) {
    return filePath;
  }
  
  // If it's a server path (uploads/...), construct full URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Checks if a file path is from the server's uploads folder
 * @param filePath - The file path to check
 * @returns true if it's a server upload path
 */
export function isServerUpload(filePath: string): boolean {
  return filePath.startsWith('uploads/') || filePath.startsWith('/uploads/');
}
