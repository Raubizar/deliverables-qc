/**
 * Title block validator
 * Validates title block information against register data
 */

import { DataNormalizer } from '../utils/data-normalizer';

export interface TitleBlockData {
  sheetNo: string;
  sheetName: string;
  fileName: string;
  revCode: string;
  revDate: string;
  suitabilityCode?: string;
  [key: string]: any; // Additional fields
}

export interface TitleBlockValidationResult {
  sheetNo: string;
  sheetName: string;
  fileName: string;
  revCode: string;
  revDate: string;
  status: 'VALID' | 'MISMATCH' | 'MISSING' | 'ERROR';
  mismatches: Array<{
    field: string;
    expected: string;
    actual: string;
  }>;
}

export interface TitleBlockValidationSummary {
  totalSheets: number;
  validSheets: number;
  invalidSheets: number;
  compliancePercentage: number;
  results: TitleBlockValidationResult[];
}

export class TitleBlockValidator {
  private registerData: TitleBlockData[] = [];
  private titleBlockData: TitleBlockData[] = [];

  /**
   * Load register data from Excel
   */
  public loadRegisterData(excelData: any[][], columnMapping?: { [key: string]: number }): void {
    this.registerData = [];
    
    // Default column mapping if not provided
    const defaultMapping = {
      sheetNo: 0,
      sheetName: 1,
      fileName: 2,
      revCode: 3,
      revDate: 4,
      suitabilityCode: 5
    };
    
    const mapping = columnMapping || defaultMapping;
    
    // Skip header row
    for (let i = 1; i < excelData.length; i++) {
      const row = excelData[i];
      if (row && row.length > 0) {
        this.registerData.push({
          sheetNo: DataNormalizer.normalizeText(row[mapping.sheetNo]),
          sheetName: DataNormalizer.normalizeText(row[mapping.sheetName]),
          fileName: DataNormalizer.normalizeText(row[mapping.fileName]),
          revCode: DataNormalizer.normalizeText(row[mapping.revCode]),
          revDate: DataNormalizer.normalizeDate(row[mapping.revDate]),
          suitabilityCode: DataNormalizer.normalizeText(row[mapping.suitabilityCode])
        });
      }
    }
  }

  /**
   * Load title block data from Excel
   */
  public loadTitleBlockData(excelData: any[][], columnMapping?: { [key: string]: number }): void {
    this.titleBlockData = [];
    
    // Default column mapping if not provided
    const defaultMapping = {
      sheetNo: 0,
      sheetName: 1,
      fileName: 2,
      revCode: 3,
      revDate: 4,
      suitabilityCode: 5
    };
    
    const mapping = columnMapping || defaultMapping;
    
    // Skip header row
    for (let i = 1; i < excelData.length; i++) {
      const row = excelData[i];
      if (row && row.length > 0) {
        this.titleBlockData.push({
          sheetNo: DataNormalizer.normalizeText(row[mapping.sheetNo]),
          sheetName: DataNormalizer.normalizeText(row[mapping.sheetName]),
          fileName: DataNormalizer.normalizeText(row[mapping.fileName]),
          revCode: DataNormalizer.normalizeText(row[mapping.revCode]),
          revDate: DataNormalizer.normalizeDate(row[mapping.revDate]),
          suitabilityCode: DataNormalizer.normalizeText(row[mapping.suitabilityCode])
        });
      }
    }
  }

  /**
   * Perform title block validation
   */
  public validate(): TitleBlockValidationSummary {
    const results: TitleBlockValidationResult[] = [];
    
    // For each register entry, find corresponding title block data
    for (const registerEntry of this.registerData) {
      const titleBlockEntry = this.findMatchingTitleBlock(registerEntry);
      
      if (!titleBlockEntry) {
        results.push({
          sheetNo: registerEntry.sheetNo,
          sheetName: registerEntry.sheetName,
          fileName: registerEntry.fileName,
          revCode: registerEntry.revCode,
          revDate: registerEntry.revDate,
          status: 'MISSING',
          mismatches: [{ field: 'titleBlock', expected: 'Present', actual: 'Missing' }]
        });
      } else {
        const comparison = this.compareRecords(registerEntry, titleBlockEntry);
        results.push(comparison);
      }
    }

    const validSheets = results.filter(r => r.status === 'VALID').length;
    const invalidSheets = results.filter(r => r.status !== 'VALID').length;
    const compliancePercentage = results.length > 0 ? (validSheets / results.length) * 100 : 0;

    return {
      totalSheets: results.length,
      validSheets,
      invalidSheets,
      compliancePercentage: Math.round(compliancePercentage * 100) / 100,
      results
    };
  }

  /**
   * Find matching title block entry
   */
  private findMatchingTitleBlock(registerEntry: TitleBlockData): TitleBlockData | undefined {
    // Try to match by sheet number first, then by file name
    return this.titleBlockData.find(tb => 
      tb.sheetNo === registerEntry.sheetNo || 
      tb.fileName === registerEntry.fileName
    );
  }

  /**
   * Compare two title block records
   */
  private compareRecords(register: TitleBlockData, titleBlock: TitleBlockData): TitleBlockValidationResult {
    const mismatches: Array<{ field: string; expected: string; actual: string }> = [];

    // Compare each field
    const fieldsToCompare: Array<keyof TitleBlockData> = [
      'sheetName', 'fileName', 'revCode', 'revDate', 'suitabilityCode'
    ];

    for (const field of fieldsToCompare) {
      const expectedValue = register[field] || '';
      const actualValue = titleBlock[field] || '';
      
      if (expectedValue !== actualValue) {
        mismatches.push({
          field: String(field),
          expected: String(expectedValue),
          actual: String(actualValue)
        });
      }
    }

    const status: TitleBlockValidationResult['status'] = mismatches.length === 0 ? 'VALID' : 'MISMATCH';

    return {
      sheetNo: register.sheetNo,
      sheetName: register.sheetName,
      fileName: register.fileName,
      revCode: register.revCode,
      revDate: register.revDate,
      status,
      mismatches
    };
  }
}
