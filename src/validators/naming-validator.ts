/**
 * File naming convention validator
 * Validates file names against Excel-defined naming rules
 */

export interface NamingRule {
  sheets: string[];
  models: string[];
  delimiter: string;
  pattern: string;
  variableParts: string[]; // +N patterns
}

export interface NamingValidationResult {
  fileName: string;
  folderPath: string;
  isValid: boolean;
  errorType?: 'INVALID_PATTERN' | 'INVALID_DELIMITER' | 'INVALID_PART' | 'UNKNOWN_EXTENSION';
  details?: string;
  expectedPattern?: string;
}

export interface NamingValidationSummary {
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  compliancePercentage: number;
  errors: NamingValidationResult[];
  allResults: NamingValidationResult[]; // All files, both valid and invalid
}

export class NamingValidator {
  private namingConvention: { Sheets: any[][]; Models: any[][] } | null = null;

  /**
   * Load naming rules from Excel data (expects Sheets and Models tabs)
   */
  public loadRules(sheetsData: any[][], modelsData: any[][]): void {
    console.log('[NamingValidator] Loading rules:');
    console.log('- Sheets data:', sheetsData);
    console.log('- Models data:', modelsData);
    
    this.namingConvention = {
      Sheets: sheetsData,
      Models: modelsData
    };
    
    // Log the delimiter that will be used
    if (sheetsData.length > 0 && sheetsData[0].length > 3) {
      console.log('- Sheets delimiter (column D):', sheetsData[0][3]);
    }
    if (modelsData.length > 0 && modelsData[0].length > 3) {
      console.log('- Models delimiter (column D):', modelsData[0][3]);
    }
  }

  /**
   * Validate a single file name against the naming rules
   */
  public validateFileName(fileName: string, folderPath: string = ''): NamingValidationResult {
    console.log(`[NamingValidator] Validating file: ${fileName}, path: ${folderPath}`);
    const result = this.analyzeFileName(fileName);
    console.log(`[NamingValidator] Analysis result:`, result);
    
    // For valid files, set standard details message
    const details = result.compliance === 'Ok' && !result.details 
      ? 'Delimiter correct. Number of parts correct.'
      : result.details;
    
    const validationResult = {
      fileName,
      folderPath,
      isValid: result.compliance === 'Ok',
      errorType: this.getErrorType(result),
      details,
      expectedPattern: this.getExpectedPattern(fileName)
    };
    
    console.log(`[NamingValidator] Final result:`, validationResult);
    return validationResult;
  }

  /**
   * Validate multiple files
   */
  public validateFiles(files: Array<{ name: string; path: string }>): NamingValidationSummary {
    const allResults: NamingValidationResult[] = [];
    const errors: NamingValidationResult[] = [];
    
    for (const file of files) {
      const result = this.validateFileName(file.name, file.path);
      allResults.push(result);
      
      if (!result.isValid) {
        errors.push(result);
      }
    }

    const validFiles = files.length - errors.length;
    const invalidFiles = errors.length;
    const compliancePercentage = files.length > 0 ? (validFiles / files.length) * 100 : 0;

    return {
      totalFiles: files.length,
      validFiles,
      invalidFiles,
      compliancePercentage: Math.round(compliancePercentage * 100) / 100,
      errors,
      allResults
    };
  }

  /**
   * Analyze file name components (ported from legacy)
   */
  private analyzeFileName(fileName: string): { compliance: string; details: string; nonCompliantParts?: string[] } {
    if (!this.namingConvention) {
      return { compliance: 'Wrong', details: 'No naming convention uploaded. Please upload a naming convention file.' };
    }

    let partsCompliance = 'Ok';
    let details = '';

    // Extract file extension
    const dotPosition = fileName.lastIndexOf('.');
    const extension = fileName.slice(dotPosition + 1).toLowerCase();
    const isModel = ['rvt', 'nwd', 'nwf', 'ifc', 'nwc'].includes(extension);

    // Select the appropriate tab
    const namingTab = isModel ? this.namingConvention.Models : this.namingConvention.Sheets;
    if (!namingTab || namingTab.length === 0) {
      return {
        compliance: 'Wrong',
        details: `No naming convention data available for file type: ${extension}.`,
      };
    }

    // Fetch delimiter from line 1, column D (index 3)
    const delimiter = namingTab[0][3];
    if (!delimiter || typeof delimiter !== 'string') {
      return {
        compliance: 'Wrong',
        details: 'Invalid or missing delimiter in naming convention.',
      };
    }

    // Remove extension from file name
    let nameWithoutExt = fileName;
    if (dotPosition > 0) {
      nameWithoutExt = fileName.substring(0, dotPosition);
    }

    // Split file name into parts using the delimiter
    const nameParts = nameWithoutExt.split(delimiter);

    // Validate each part
    const nonCompliantParts: string[] = [];
    for (let i = 0; i < nameParts.length; i++) {
      const allowedParts = namingTab.slice(2).map(row => row[i + 1]).filter(Boolean); // Skip header rows and filter out empty values
      
      let partAllowed = false;

      for (const allowed of allowedParts) {
        if (allowed && typeof allowed === 'string') {
          if (allowed.includes('+N')) {
            const prefix = allowed.split('+')[0];
            if (nameParts[i].startsWith(prefix)) {
              partAllowed = true;
              break;
            }
          } else if (allowed === 'Var') {
            partAllowed = true;
            break;
          } else if (allowed === nameParts[i]) {
            partAllowed = true;
            break;
          }
        }
      }

      if (!partAllowed) {
        details += `Part ${i + 1} (${nameParts[i]}) is not valid; `;
        nonCompliantParts.push(nameParts[i]);
      }
    }

    // Determine overall compliance
    if (nonCompliantParts.length > 0) {
      partsCompliance = 'Wrong';
    }

    const compliance = partsCompliance === 'Wrong' ? 'Wrong' : 'Ok';
    const cleanDetails = details.trim().replace(/; $/, '');
    
    return { compliance, details: cleanDetails, nonCompliantParts };
  }

  /**
   * Convert legacy compliance result to error type
   */
  private getErrorType(result: { compliance: string; details: string }): NamingValidationResult['errorType'] {
    if (result.compliance === 'Ok') return undefined;
    
    if (result.details.includes('delimiter')) return 'INVALID_DELIMITER';
    if (result.details.includes('file type')) return 'UNKNOWN_EXTENSION';
    if (result.details.includes('Part')) return 'INVALID_PART';
    return 'INVALID_PATTERN';
  }

  /**
   * Get expected pattern for file type
   */
  private getExpectedPattern(fileName: string): string {
    if (!this.namingConvention) return 'Unknown';
    
    const dotPosition = fileName.lastIndexOf('.');
    const extension = fileName.slice(dotPosition + 1).toLowerCase();
    const isModel = ['rvt', 'nwd', 'nwf', 'ifc', 'nwc'].includes(extension);
    
    const namingTab = isModel ? this.namingConvention.Models : this.namingConvention.Sheets;
    if (namingTab && namingTab.length > 0 && namingTab[0][3]) {
      const delimiter = namingTab[0][3];
      const headers = namingTab[1] || [];
      return headers.slice(1).join(delimiter) || 'Pattern not available';
    }
    
    return 'Pattern not available';
  }
}
