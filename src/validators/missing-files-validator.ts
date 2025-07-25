/**
 * Missing files validator
 * Compares expected files from register against actual files found
 */

import { DataNormalizer } from '../utils/data-normalizer';

export interface FileInfo {
  name: string;
  path: string;
  extension: string;
  found: boolean;
  registerRow?: number;
}

export interface MissingFileResult {
  expectedFile: string;
  found: boolean;
  registerRow: number;
  actualPath?: string;
}

export interface MissingFilesValidationSummary {
  totalExpected: number;
  totalFound: number;
  missingCount: number;
  missingPercentage: number;
  missingFiles: MissingFileResult[];
  extraFiles: FileInfo[]; // Files found but not in register
}

export class MissingFilesValidator {
  private expectedFiles: string[] = [];
  private actualFiles: FileInfo[] = [];

  /**
   * Load expected files from register Excel data
   */
  public loadExpectedFiles(registerData: any[][], columnIndex: number = 0): void {
    this.expectedFiles = [];
    
    // Skip header row and extract file names from specified column
    for (let i = 1; i < registerData.length; i++) {
      const row = registerData[i];
      if (row && row[columnIndex] && typeof row[columnIndex] === 'string') {
        const fileName = row[columnIndex].trim();
        if (fileName) {
          this.expectedFiles.push(fileName);
        }
      }
    }
  }

  /**
   * Load actual files from directory traversal
   */
  public loadActualFiles(files: Array<{ name: string; path: string }>): void {
    this.actualFiles = files.map(file => ({
      name: file.name,
      path: file.path,
      extension: this.getFileExtension(file.name),
      found: true,
      registerRow: -1
    }));
  }

  /**
   * Perform missing files validation
   */
  public validate(): MissingFilesValidationSummary {
    const missingFiles: MissingFileResult[] = [];
    const extraFiles: FileInfo[] = [];
    let foundCount = 0;

    // Check each expected file
    this.expectedFiles.forEach((expectedFile, index) => {
      const matched = this.findMatchingFile(expectedFile);
      
      if (matched) {
        foundCount++;
        missingFiles.push({
          expectedFile,
          found: true,
          registerRow: index + 2, // +2 because we skip header and arrays are 0-indexed
          actualPath: matched.path
        });
      } else {
        missingFiles.push({
          expectedFile,
          found: false,
          registerRow: index + 2
        });
      }
    });

    // Find extra files (files found but not in register)
    this.actualFiles.forEach(actualFile => {
      const expectedMatch = this.expectedFiles.find(expected => 
        this.normalizeFileName(expected) === this.normalizeFileName(actualFile.name)
      );
      
      if (!expectedMatch) {
        extraFiles.push({
          ...actualFile,
          found: true,
          registerRow: -1
        });
      }
    });

    const missingCount = this.expectedFiles.length - foundCount;
    const missingPercentage = this.expectedFiles.length > 0 
      ? (missingCount / this.expectedFiles.length) * 100 
      : 0;

    return {
      totalExpected: this.expectedFiles.length,
      totalFound: foundCount,
      missingCount,
      missingPercentage: Math.round(missingPercentage * 100) / 100,
      missingFiles,
      extraFiles
    };
  }

  /**
   * Find matching file using normalized comparison (ported from legacy)
   */
  private findMatchingFile(expectedFileName: string): FileInfo | undefined {
    return this.actualFiles.find(file => 
      this.normalizeFileName(file.name) === this.normalizeFileName(expectedFileName)
    );
  }

  /**
   * Normalize file name for comparison (ported from legacy)
   */
  private normalizeFileName(fileName: string): string {
    return DataNormalizer.normalizeForComparison(fileName);
  }

  /**
   * Strip file extension (ported from legacy)
   */
  private stripExtension(fileName: string): string {
    return DataNormalizer.stripExtension(fileName);
  }

  /**
   * Get file extension
   */
  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot === -1 ? '' : fileName.substring(lastDot + 1).toLowerCase();
  }
}
