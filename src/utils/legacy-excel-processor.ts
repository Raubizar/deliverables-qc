/**
 * Legacy Excel Processor - Exact copy of legacy functionality
 * Uses XLSX library exactly like the legacy system
 */

import * as XLSX from 'xlsx';

export class LegacyExcelProcessor {
  /**
   * Read Excel file exactly like legacy system
   */
  public static async readExcelFile(file: File): Promise<{
    Sheets: any[][];
    Models: any[][];
  }> {
    try {
      console.log('[LegacyExcelProcessor] Reading file:', file.name);
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      console.log('[LegacyExcelProcessor] Available sheet names:', workbook.SheetNames);
      
      // Check if required sheets exist - MUST be named exactly "Sheets" and "Models"
      if (!workbook.Sheets['Sheets']) {
        console.error('[LegacyExcelProcessor] ERROR: "Sheets" tab not found in Excel file');
        console.error('[LegacyExcelProcessor] Available tabs:', workbook.SheetNames);
        console.error('[LegacyExcelProcessor] The Excel file must have a tab named exactly "Sheets"');
      }
      if (!workbook.Sheets['Models']) {
        console.warn('[LegacyExcelProcessor] WARNING: "Models" tab not found in Excel file');
        console.warn('[LegacyExcelProcessor] Available tabs:', workbook.SheetNames);
        console.warn('[LegacyExcelProcessor] Model files (.rvt, .nwd, etc.) will not be validated');
      }
      
      const namingConvention = {
        Sheets: workbook.Sheets['Sheets'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Sheets'], { header: 1 }) as any[][] : [],
        Models: workbook.Sheets['Models'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Models'], { header: 1 }) as any[][] : [],
      };
      
      console.log('[LegacyExcelProcessor] Loaded Sheets tab:', namingConvention.Sheets);
      console.log('[LegacyExcelProcessor] Loaded Models tab:', namingConvention.Models);
      
      // Verify structure
      if (namingConvention.Sheets.length > 0) {
        console.log('[LegacyExcelProcessor] Sheets delimiter (row 1, col D):', namingConvention.Sheets[0]?.[3]);
        console.log('[LegacyExcelProcessor] Sheets headers (row 2):', namingConvention.Sheets[1]);
        console.log('[LegacyExcelProcessor] Sheets first data row (row 3):', namingConvention.Sheets[2]);
        console.log('[LegacyExcelProcessor] Sheets structure preview (first 5 rows):');
        for (let i = 0; i < Math.min(5, namingConvention.Sheets.length); i++) {
          console.log(`  Row ${i + 1}:`, namingConvention.Sheets[i]);
        }
      }
      if (namingConvention.Models.length > 0) {
        console.log('[LegacyExcelProcessor] Models delimiter (row 1, col D):', namingConvention.Models[0]?.[3]);
        console.log('[LegacyExcelProcessor] Models headers (row 2):', namingConvention.Models[1]);
        console.log('[LegacyExcelProcessor] Models first data row (row 3):', namingConvention.Models[2]);
      }
      
      return namingConvention;
    } catch (error) {
      console.error('[LegacyExcelProcessor] Error reading file:', error);
      throw error;
    }
  }
}
