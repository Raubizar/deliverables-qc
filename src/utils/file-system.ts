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

export interface FileSystemDirectoryHandle {
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  getDirectoryHandle(name: string): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string): Promise<FileSystemFileHandle>;
  kind: 'directory';
  name: string;
}

export interface FileSystemFileHandle {
  getFile(): Promise<File>;
  kind: 'file';
  name: string;
}

export type FileSystemHandle = FileSystemDirectoryHandle | FileSystemFileHandle;

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
    
    // Check browser support
    if (!this.isFileSystemAccessSupported()) {
      console.error('[FileSystemUtil] File System Access API is not supported.');
      const userAgent = navigator.userAgent;
      const isChrome = /Chrome/.test(userAgent);
      const isEdge = /Edge/.test(userAgent);
      const isSecure = window.isSecureContext;
      
      console.log('Browser info:', { userAgent, isChrome, isEdge, isSecure });
      
      let message = 'File System Access API is not available in your browser.\n\n';
      if (!isSecure) {
        message += 'Reason: This page is not served over HTTPS. The File System Access API requires a secure context.\n';
        message += 'Please access this page via HTTPS or localhost.\n\n';
      }
      if (!isChrome && !isEdge) {
        message += 'Reason: Your browser does not support the File System Access API.\n';
        message += 'Please use Chrome (version 86+) or Edge (version 86+).\n\n';
      }
      message += 'Currently detected: ' + userAgent;
      
      alert(message);
      return null;
    }

    try {
      console.log('[FileSystemUtil] Calling window.showDirectoryPicker...');
      console.log('Browser support check passed');
      console.log('Window.showDirectoryPicker exists:', 'showDirectoryPicker' in window);
      
      const directoryHandle = await window.showDirectoryPicker({ mode: 'read' });
      console.log('[FileSystemUtil] Successfully received directory handle:', directoryHandle);
      console.log('Directory name:', directoryHandle.name);
      console.log('Directory kind:', directoryHandle.kind);
      
      // Test if we can actually read from the directory
      try {
        console.log('[FileSystemUtil] Testing directory access...');
        const entries = directoryHandle.entries();
        const firstEntry = await entries.next();
        console.log('[FileSystemUtil] Directory access test successful, first entry:', firstEntry.value);
      } catch (accessError) {
        console.warn('[FileSystemUtil] Directory access test failed:', accessError);
      }
      
      return directoryHandle;
    } catch (error) {
      console.error('[FileSystemUtil] Error during showDirectoryPicker:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('[FileSystemUtil] User cancelled the folder selection dialog.');
          return null;
        } else if (error.name === 'NotAllowedError') {
          console.error('[FileSystemUtil] Permission denied or user dismissed the prompt.');
          alert('Permission denied. Please grant permission to access the folder or try again.');
        } else if (error.name === 'SecurityError') {
          console.error('[FileSystemUtil] Security error - possibly not in secure context.');
          alert('Security error: This feature requires a secure context (HTTPS or localhost).');
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
    console.log('[FileSystemUtil] Starting directory traversal...');
    console.log('Directory:', directory.name);
    console.log('Options:', options);
    
    const files: FileEntry[] = [];
    let processedCount = 0;

    async function traverseRecursive(
      dirHandle: FileSystemDirectoryHandle,
      currentPath: string = ''
    ): Promise<void> {
      console.log(`[FileSystemUtil] Traversing directory: ${currentPath || 'root'}`);
      
      try {
        for await (const [name, handle] of dirHandle.entries()) {
          const fullPath = currentPath ? `${currentPath}/${name}` : name;
          console.log(`[FileSystemUtil] Processing: ${fullPath} (${handle.kind})`);

          if (handle.kind === 'file') {
            try {
              const file = await (handle as FileSystemFileHandle).getFile();
              
              // Check file extension filter
              if (options.fileExtensions && options.fileExtensions.length > 0) {
                const extension = FileSystemUtil.getFileExtension(file.name);
                const normalizedExtensions = options.fileExtensions.map(ext =>
                  ext.toLowerCase().startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`
                );
                
                if (!normalizedExtensions.includes(extension.toLowerCase())) {
                  console.log(`[FileSystemUtil] Skipping file ${file.name} - extension ${extension} not in filter`);
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
              console.log(`[FileSystemUtil] Added file: ${file.name} (${file.size} bytes)`);
              
              // Report progress if callback provided
              if (options.progressCallback) {
                // Estimate total based on processed files (rough approximation)
                const estimatedTotal = Math.max(processedCount * 2, 100);
                options.progressCallback(processedCount, estimatedTotal);
              }
            } catch (fileError) {
              console.error(`[FileSystemUtil] Error reading file ${name}:`, fileError);
            }
          } else if (handle.kind === 'directory' && options.includeSubfolders) {
            console.log(`[FileSystemUtil] Entering subdirectory: ${fullPath}`);
            // Recursively traverse subdirectories
            await traverseRecursive(handle as FileSystemDirectoryHandle, fullPath);
          } else if (handle.kind === 'directory') {
            console.log(`[FileSystemUtil] Skipping subdirectory ${fullPath} (includeSubfolders=false)`);
          }
        }
      } catch (error) {
        console.error(`[FileSystemUtil] Error traversing directory ${currentPath}:`, error);
        throw error;
      }
    }

    try {
      await traverseRecursive(directory);
      
      // Final progress update
      if (options.progressCallback) {
        options.progressCallback(files.length, files.length);
      }

      console.log(`[FileSystemUtil] Directory traversal complete. Found ${files.length} files.`);
      console.log('Files found:', files.map(f => f.name));
      
      return files;
    } catch (error) {
      console.error('[FileSystemUtil] Error during directory traversal:', error);
      throw error;
    }
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
