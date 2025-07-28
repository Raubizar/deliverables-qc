/**
 * Legacy Naming Validator - Exact copy of legacy analyzeFileName function
 */

export interface LegacyNamingResult {
  fileName: string;
  folderPath: string;
  isValid: boolean;
  details: string;
  compliance: string;
}

export interface LegacyNamingSummary {
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  compliancePercentage: number;
  errors: LegacyNamingResult[];
  allResults: LegacyNamingResult[];
}

export class LegacyNamingValidator {
  private namingConvention: { Sheets: any[][]; Models: any[][] } | null = null;

  /**
   * Load naming rules exactly like legacy
   */
  public loadRules(namingConvention: { Sheets: any[][]; Models: any[][] }): void {
    console.log('[LegacyNamingValidator] Loading rules:', namingConvention);
    this.namingConvention = namingConvention;
  }

  /**
   * Validate multiple files
   */
  public validateFiles(files: Array<{ name: string; path: string }>): LegacyNamingSummary {
    const allResults: LegacyNamingResult[] = [];
    const errors: LegacyNamingResult[] = [];
    
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
   * Validate single file - wrapper around legacy analyzeFileName
   */
  public validateFileName(fileName: string, folderPath: string = ''): LegacyNamingResult {
    const analysis = this.analyzeFileName(fileName);
    
    return {
      fileName,
      folderPath,
      isValid: analysis.compliance === 'Ok',
      details: analysis.details || 'Delimiter correct. Number of parts correct.',
      compliance: analysis.compliance
    };
  }

  /**
   * EXACT COPY of legacy analyzeFileName function
   */
  private analyzeFileName(fileName: string): { compliance: string; details: string; nonCompliantParts?: string[] } {
    console.log(`[LegacyNamingValidator] Analyzing file: ${fileName}`);
    
    if (!this.namingConvention) {
      console.log('[LegacyNamingValidator] No naming convention loaded');
      return { compliance: 'No naming convention uploaded', details: 'Please upload a naming convention file' };
    }

    let partsCompliance = 'Ok';
    let details = '';

    // Extract file extension
    const dotPosition = fileName.lastIndexOf('.');
    const extension = fileName.slice(dotPosition + 1).toLowerCase();
    const isModel = ['rvt', 'nwd', 'nwf', 'ifc', 'nwc'].includes(extension);

    console.log(`[LegacyNamingValidator] File extension: ${extension}, isModel: ${isModel}`);

    // Select the appropriate tab
    const namingTab = isModel ? this.namingConvention.Models : this.namingConvention.Sheets;
    console.log(`[LegacyNamingValidator] Using naming tab: ${isModel ? 'Models' : 'Sheets'}, length: ${namingTab?.length || 0}`);
    
    if (!namingTab || namingTab.length === 0) {
      console.log(`[LegacyNamingValidator] No naming convention data available for ${isModel ? 'Models' : 'Sheets'} tab`);
      return {
        compliance: 'Wrong',
        details: `No naming convention data available for file type: ${extension}.`,
      };
    }

    // Fetch delimiter from line 1, column D
    const delimiter = namingTab[0]?.[3]; // Delimiter is always in column D
    console.log(`[LegacyNamingValidator] Delimiter from row 1, col D: "${delimiter}"`);
    
    if (!delimiter || typeof delimiter !== 'string') {
      console.log('[LegacyNamingValidator] Invalid or missing delimiter');
      return {
        compliance: 'Wrong',
        details: `Invalid or missing delimiter in naming convention.`,
      };
    }

    console.log(`[LegacyNamingValidator] Using delimiter: "${delimiter}"`);

    // Remove extension from file name
    let fileNameWithoutExtension = fileName;
    if (dotPosition > 0) {
      fileNameWithoutExtension = fileName.substring(0, dotPosition);
    }
    
    console.log(`[LegacyNamingValidator] File name without extension: "${fileNameWithoutExtension}"`);

    // Split file name into parts using the delimiter
    const nameParts = fileNameWithoutExtension.split(delimiter);
    console.log(`[LegacyNamingValidator] Split parts:`, nameParts);

    // Debug: Log the naming tab structure
    console.log(`[LegacyNamingValidator] Full naming tab structure:`, namingTab);
    console.log(`[LegacyNamingValidator] Row 0 (delimiter row):`, namingTab[0]);
    console.log(`[LegacyNamingValidator] Row 1 (headers):`, namingTab[1]);
    console.log(`[LegacyNamingValidator] Row 2 (first data):`, namingTab[2]);
    
    // Debug the specific rows and columns we're trying to access
    console.log(`[LegacyNamingValidator] First 5 data rows detailed:`);
    for (let debugRow = 2; debugRow < Math.min(7, namingTab.length); debugRow++) {
      console.log(`  Row ${debugRow}:`, namingTab[debugRow]);
      for (let debugCol = 0; debugCol < 10; debugCol++) {
        console.log(`    [${debugRow}][${debugCol}] = "${namingTab[debugRow]?.[debugCol]}" (${typeof namingTab[debugRow]?.[debugCol]})`);
      }
    }

    // Validate each part
    let nonCompliantParts: string[] = [];
    for (let i = 0; i < nameParts.length; i++) {
      const allowedParts = namingTab.slice(2).map(row => row?.[i + 1]); // Skip header rows - EXACT copy of legacy logic
      console.log(`[LegacyNamingValidator] For part ${i + 1}, getting column ${i + 1} from rows 3+`);
      console.log(`[LegacyNamingValidator] Raw rows being mapped:`, namingTab.slice(2));
      console.log(`[LegacyNamingValidator] Validating part ${i + 1}: "${nameParts[i]}", allowed:`, allowedParts);

      let partAllowed = false;

      allowedParts.forEach(allowed => {
        console.log(`[LegacyNamingValidator] Checking allowed value: "${allowed}" (type: ${typeof allowed}) against part: "${nameParts[i]}"`);
        if (allowed && allowed.includes('+N')) {
          const prefix = allowed.split('+')[0];
          console.log(`[LegacyNamingValidator] Checking +N pattern: "${allowed}", prefix: "${prefix}"`);
          if (nameParts[i].startsWith(prefix)) {
            console.log(`[LegacyNamingValidator] Part "${nameParts[i]}" matches +N pattern "${allowed}"`);
            partAllowed = true;
          }
        } else if (allowed === 'Var') {
          console.log(`[LegacyNamingValidator] Part "${nameParts[i]}" allowed as variable`);
          partAllowed = true;
        } else if (allowed === nameParts[i]) {
          console.log(`[LegacyNamingValidator] Part "${nameParts[i]}" matches exactly with "${allowed}"`);
          partAllowed = true;
        }
      });

      if (!partAllowed) {
        console.log(`[LegacyNamingValidator] Part ${i + 1} (${nameParts[i]}) is NOT VALID`);
        details += `Part ${i + 1} (${nameParts[i]}) is not valid; `;
        nonCompliantParts.push(nameParts[i]);
      } else {
        console.log(`[LegacyNamingValidator] Part ${i + 1} (${nameParts[i]}) is VALID`);
      }
    }

    // Determine overall compliance
    if (nonCompliantParts.length > 0) {
      partsCompliance = 'Wrong';
    }

    const compliance = partsCompliance === 'Wrong' ? 'Wrong' : 'Ok';
    const cleanDetails = details.trim().replace(/; $/, '');
    
    console.log(`[LegacyNamingValidator] Final result - compliance: ${compliance}, details: "${cleanDetails}"`);
    
    return { compliance, details: cleanDetails, nonCompliantParts };
  }
}
