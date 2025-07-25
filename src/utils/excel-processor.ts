/**
 * Excel processor utility
 * Wrapper around SheetJS for consistent Excel reading
 */

import * as XLSX from 'xlsx';

export interface ExcelSheet {
  name: string;
  data: any[][];
  headers: string[];
}

export interface ExcelFile {
  sheets: ExcelSheet[];
  sheetNames: string[];
}

export interface ColumnMapping {
  [key: string]: number; // fieldName -> columnIndex
}

export class ExcelProcessor {
  /**
   * Read Excel file from File object
   */
  public static async readFile(file: File): Promise<ExcelFile> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const sheets: ExcelSheet[] = [];
      
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        const headers = data.length > 0 ? data[0].map(h => String(h || '')) : [];
        
        sheets.push({
          name: sheetName,
          data,
          headers
        });
      }
      
      return {
        sheets,
        sheetNames: workbook.SheetNames
      };
    } catch (error) {
      throw new Error(`Failed to read Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Read specific sheet by name
   */
  public static async readSheet(file: File, sheetName: string): Promise<ExcelSheet> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      if (!workbook.SheetNames.includes(sheetName)) {
        throw new Error(`Sheet '${sheetName}' not found in Excel file`);
      }
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      const headers = data.length > 0 ? data[0].map(h => String(h || '')) : [];
      
      return {
        name: sheetName,
        data,
        headers
      };
    } catch (error) {
      throw new Error(`Failed to read sheet '${sheetName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get column mapping from headers
   */
  public static createColumnMapping(headers: string[]): ColumnMapping {
    const mapping: ColumnMapping = {};
    
    headers.forEach((header, index) => {
      if (header && typeof header === 'string') {
        // Normalize header name for mapping
        const normalizedKey = header.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^\w]/g, '');
        mapping[normalizedKey] = index;
        
        // Also add original header as key
        mapping[header] = index;
      }
    });
    
    return mapping;
  }

  /**
   * Extract data with column mapping
   */
  public static extractMappedData(sheet: ExcelSheet, mapping: ColumnMapping): any[] {
    const result: any[] = [];
    
    // Skip header row (index 0)
    for (let i = 1; i < sheet.data.length; i++) {
      const row = sheet.data[i];
      const mappedRow: any = {};
      
      Object.keys(mapping).forEach(fieldName => {
        const columnIndex = mapping[fieldName];
        mappedRow[fieldName] = row[columnIndex] || '';
      });
      
      result.push(mappedRow);
    }
    
    return result;
  }

  /**
   * Validate Excel file format
   */
  public static validateFile(file: File): boolean {
    const validExtensions = ['.xlsx', '.xls'];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    return validExtensions.includes(extension);
  }

  /**
   * Get sheet selection options for UI
   */
  public static async getSheetOptions(file: File): Promise<Array<{ value: string; label: string }>> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      return workbook.SheetNames.map(sheetName => ({
        value: sheetName,
        label: sheetName
      }));
    } catch (error) {
      throw new Error(`Failed to get sheet options: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get column headers from a sheet
   */
  public static async getColumnHeaders(file: File, sheetName: string): Promise<string[]> {
    const sheet = await this.readSheet(file, sheetName);
    return sheet.headers;
  }

  /**
   * Read specific columns from sheet
   */
  public static async readColumns(file: File, sheetName: string, columnIndices: number[]): Promise<any[][]> {
    const sheet = await this.readSheet(file, sheetName);
    
    return sheet.data.map(row => 
      columnIndices.map(index => row[index] || '')
    );
  }

  /**
   * Check if file has required sheets (for naming convention files)
   */
  public static async validateNamingConventionFile(file: File): Promise<{ isValid: boolean; missingSheets: string[] }> {
    try {
      const excelFile = await this.readFile(file);
      const requiredSheets = ['Sheets', 'Models'];
      const missingSheets = requiredSheets.filter(required => 
        !excelFile.sheetNames.includes(required)
      );
      
      return {
        isValid: missingSheets.length === 0,
        missingSheets
      };
    } catch (error) {
      return {
        isValid: false,
        missingSheets: ['Sheets', 'Models']
      };
    }
  }
}
