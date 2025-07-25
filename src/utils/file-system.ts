/**
 * File system utility
 * Wrapper around File System Access API with fallbacks
 */

// Type declarations for File System Access API
declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
  }
}

interface FileSystemDirectoryHandle {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  kind: 'directory';
  name: string;
}

interface FileSystemFileHandle {
  getFile(): Promise<File>;
  kind: 'file';
  name: string;
}

type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;

export interface FileEntry {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  type: 'file' | 'directory';
}

export interface DirectoryTraversalOptions {
  includeSubfolders: boolean;
  fileExtensions?: string[];
  progressCallback?: (processed: number, total: number) => void;
}

export class FileSystemUtil {
  /**
   * Check if File System Access API is supported
   */
  public static isFileSystemAccessSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }

  /**
   * Open directory picker
   */
  public static async selectDirectory(): Promise<FileSystemDirectoryHandle | null> {
    console.log('[FileSystemUtil] selectDirectory called');
    if (!this.isFileSystemAccessSupported()) {
      console.error('[FileSystemUtil] File System Access API is not supported.');
      alert('Error: File System Access API is not available in your browser. Please use a modern browser like Chrome or Edge and ensure you are on a secure (HTTPS) page.');
      return null;
    }

    try {
      console.log('[FileSystemUtil] Calling window.showDirectoryPicker...');
      const directoryHandle = await window.showDirectoryPicker({ mode: 'read' });
      console.log('[FileSystemUtil] Successfully received directory handle:', directoryHandle);
      return directoryHandle;
    } catch (error) {
      console.error('[FileSystemUtil] Error during showDirectoryPicker:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('[FileSystemUtil] User cancelled the folder selection dialog.');
        } else {
          console.error(`[FileSystemUtil] Error details: Name: ${error.name}, Message: ${error.message}`);
          alert(`An error occurred while selecting the directory: ${error.message}`);
        }
      } else {
        console.error('[FileSystemUtil] An unknown error occurred:', error);
        alert('An unknown error occurred while selecting the directory.');
      }
      return null;
    }
  }

  /**
   * Traverse directory and collect files
   */
  public static async traverseDirectory(
    directory: FileSystemDirectoryHandle,
    options: DirectoryTraversalOptions
  ): Promise<FileEntry[]> {
    const files: FileEntry[] = [];
    let processedCount = 0;

    async function traverseRecursive(
      dirHandle: FileSystemDirectoryHandle,
      currentPath: string = ''
    ): Promise<void> {
      for await (const [name, handle] of dirHandle.entries()) {
        const fullPath = currentPath ? `${currentPath}/${name}` : name;

        if (handle.kind === 'file') {
          const file = await (handle as FileSystemFileHandle).getFile();
          
          // Check file extension filter
          if (options.fileExtensions && options.fileExtensions.length > 0) {
            const extension = FileSystemUtil.getFileExtension(file.name);
            const normalizedExtensions = options.fileExtensions.map(ext =>
              ext.toLowerCase().startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
            );
            
            if (!normalizedExtensions.includes(extension.toLowerCase())) {
              continue; // Skip files that don't match extension filter
            }
          }

          files.push({
            name: file.name,
            path: fullPath,
            size: file.size,
            lastModified: new Date(file.lastModified),
            type: 'file'
          });

          processedCount++;
          
          // Report progress if callback provided
          if (options.progressCallback) {
            // Estimate total based on processed files (rough approximation)
            const estimatedTotal = Math.max(processedCount * 2, 100);
            options.progressCallback(processedCount, estimatedTotal);
          }
        } else if (handle.kind === 'directory' && options.includeSubfolders) {
          // Recursively traverse subdirectories
          await traverseRecursive(handle as FileSystemDirectoryHandle, fullPath);
        }
      }
    }

    await traverseRecursive(directory);

    // Final progress update
    if (options.progressCallback) {
      options.progressCallback(files.length, files.length);
    }

    return files;
  }

  /**
   * Filter files by extension
   */
  public static filterFilesByExtension(files: FileEntry[], extensions: string[]): FileEntry[] {
    if (!extensions || extensions.length === 0) return files;
    
    const normalizedExtensions = extensions.map(ext => 
      ext.toLowerCase().startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
    );

    return files.filter(file => {
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return normalizedExtensions.includes(fileExtension);
    });
  }

  /**
   * Get file extension
   */
  public static getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex === -1 ? '' : fileName.substring(lastDotIndex);
  }

  /**
   * Get file name without extension
   */
  public static getFileNameWithoutExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);
  }

  /**
   * Normalize file path for cross-platform compatibility
   */
  public static normalizePath(path: string): string {
    return path.replace(/\\/g, '/');
  }

  /**
   * Group files by directory
   */
  public static groupFilesByDirectory(files: FileEntry[]): { [directory: string]: FileEntry[] } {
    const grouped: { [directory: string]: FileEntry[] } = {};

    files.forEach(file => {
      const directory = file.path.includes('/') 
        ? file.path.substring(0, file.path.lastIndexOf('/'))
        : 'root';
      
      if (!grouped[directory]) {
        grouped[directory] = [];
      }
      grouped[directory].push(file);
    });

    return grouped;
  }

  /**
   * Get file statistics
   */
  public static getFileStatistics(files: FileEntry[]): {
    totalFiles: number;
    totalSize: number;
    fileTypes: { [extension: string]: number };
    directories: string[];
  } {
    const fileTypes: { [extension: string]: number } = {};
    const directories = new Set<string>();
    let totalSize = 0;

    files.forEach(file => {
      totalSize += file.size;
      
      const extension = this.getFileExtension(file.name).toLowerCase() || 'no extension';
      fileTypes[extension] = (fileTypes[extension] || 0) + 1;
      
      const directory = file.path.includes('/') 
        ? file.path.substring(0, file.path.lastIndexOf('/'))
        : 'root';
      directories.add(directory);
    });

    return {
      totalFiles: files.length,
      totalSize,
      fileTypes,
      directories: Array.from(directories).sort()
    };
  }

  /**
   * Create fallback file input for browsers without File System Access API
   */
  public static createFallbackFileInput(accept: string = '*/*', multiple: boolean = true): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.style.display = 'none';
    
    return input;
  }

  /**
   * Convert FileList to FileEntry array (fallback for older browsers)
   */
  public static fileListToFileEntries(fileList: FileList): FileEntry[] {
    const files: FileEntry[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      files.push({
        name: file.name,
        path: file.name, // No path info available in fallback mode
        size: file.size,
        lastModified: new Date(file.lastModified),
        type: 'file'
      });
    }
    
    return files;
  }
}
