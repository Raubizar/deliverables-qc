/**
 * Report builder utility
 * Creates XLSX reports from validation results
 */

import * as XLSX from 'xlsx';
import type { ValidationResults } from '../validators';

export interface ReportOptions {
  includeTimestamp: boolean;
  sheetNames: {
    summary: string;
    missingFiles: string;
    namingErrors: string;
    titleBlockErrors: string;
    allFindings: string;
  };
}

export interface ReportData {
  summary: any[];
  missingFiles: any[];
  namingErrors: any[];
  titleBlockErrors: any[];
  allFindings: any[];
}

export class ReportBuilder {
  private static defaultOptions: ReportOptions = {
    includeTimestamp: true,
    sheetNames: {
      summary: 'Summary',
      missingFiles: 'Missing Files',
      namingErrors: 'Naming Errors', 
      titleBlockErrors: 'Title-Block Errors',
      allFindings: 'All Findings'
    }
  };

  /**
   * Generate XLSX report from validation results
   */
  public static async generateReport(
    results: ValidationResults,
    options: Partial<ReportOptions> = {}
  ): Promise<Blob> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Generate data for each sheet
    const reportData: ReportData = {
      summary: this.createSummaryData(results),
      missingFiles: this.createMissingFilesData(results),
      namingErrors: this.createNamingErrorsData(results),
      titleBlockErrors: this.createTitleBlockErrorsData(results),
      allFindings: this.createAllFindingsData(results)
    };

    // Add summary sheet
    const summaryWS = XLSX.utils.aoa_to_sheet(reportData.summary);
    this.formatSummarySheet(summaryWS);
    XLSX.utils.book_append_sheet(workbook, summaryWS, mergedOptions.sheetNames.summary);

    // Add missing files sheet
    if (reportData.missingFiles.length > 0) {
      const missingWS = XLSX.utils.aoa_to_sheet(reportData.missingFiles);
      this.formatDataSheet(missingWS);
      XLSX.utils.book_append_sheet(workbook, missingWS, mergedOptions.sheetNames.missingFiles);
    }

    // Add naming errors sheet
    if (reportData.namingErrors.length > 0) {
      const namingWS = XLSX.utils.aoa_to_sheet(reportData.namingErrors);
      this.formatDataSheet(namingWS);
      XLSX.utils.book_append_sheet(workbook, namingWS, mergedOptions.sheetNames.namingErrors);
    }

    // Add title block errors sheet
    if (reportData.titleBlockErrors.length > 0) {
      const titleBlockWS = XLSX.utils.aoa_to_sheet(reportData.titleBlockErrors);
      this.formatDataSheet(titleBlockWS);
      XLSX.utils.book_append_sheet(workbook, titleBlockWS, mergedOptions.sheetNames.titleBlockErrors);
    }

    // Add all findings sheet
    if (reportData.allFindings.length > 0) {
      const allFindingsWS = XLSX.utils.aoa_to_sheet(reportData.allFindings);
      this.formatDataSheet(allFindingsWS);
      XLSX.utils.book_append_sheet(workbook, allFindingsWS, mergedOptions.sheetNames.allFindings);
    }

    // Generate Excel file as blob
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      compression: true 
    });
    
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  /**
   * Create summary sheet data
   */
  private static createSummaryData(results: ValidationResults): any[] {
    const timestamp = new Date().toLocaleString();
    
    return [
      ['Deliverables QC Report'],
      ['Generated:', timestamp],
      [''],
      ['Overall Summary'],
      ['Total Files Processed:', results.totalFiles],
      ['Overall Compliance:', `${results.overallCompliance.toFixed(2)}%`],
      [''],
      ['Missing Files Analysis'],
      ['Total Expected:', results.missingFiles.totalExpected],
      ['Total Found:', results.missingFiles.totalFound],
      ['Missing Count:', results.missingFiles.missingCount],
      ['Missing Percentage:', `${results.missingFiles.missingPercentage.toFixed(2)}%`],
      [''],
      ['Naming Convention Analysis'],
      ['Total Files Checked:', results.naming.totalFiles],
      ['Valid Files:', results.naming.validFiles],
      ['Invalid Files:', results.naming.invalidFiles],
      ['Naming Compliance:', `${results.naming.compliancePercentage.toFixed(2)}%`],
      [''],
      ['Title Block Analysis'],
      ['Total Sheets Checked:', results.titleBlock.totalSheets],
      ['Valid Sheets:', results.titleBlock.validSheets],
      ['Invalid Sheets:', results.titleBlock.invalidSheets],
      ['Title Block Compliance:', `${results.titleBlock.compliancePercentage.toFixed(2)}%`]
    ];
  }

  /**
   * Create missing files sheet data
   */
  private static createMissingFilesData(results: ValidationResults): any[] {
    const data = [
      ['Expected File', 'Found', 'Register Row', 'Actual Path']
    ];

    results.missingFiles.missingFiles.forEach(item => {
      data.push([
        item.expectedFile,
        item.found ? 'Yes' : 'No',
        String(item.registerRow),
        item.actualPath || 'N/A'
      ]);
    });

    // Add extra files if any
    if (results.missingFiles.extraFiles.length > 0) {
      data.push([''], ['Extra Files (not in register)']);
      data.push(['File Name', 'Path', 'Extension', '']);
      
      results.missingFiles.extraFiles.forEach(file => {
        data.push([
          file.name,
          file.path,
          file.extension,
          ''
        ]);
      });
    }

    return data;
  }

  /**
   * Create naming errors sheet data
   */
  private static createNamingErrorsData(results: ValidationResults): any[] {
    const data = [
      ['File Name', 'Folder Path', 'Error Type', 'Details', 'Expected Pattern']
    ];

    results.naming.errors.forEach(error => {
      data.push([
        error.fileName,
        error.folderPath,
        error.errorType || 'Unknown',
        error.details || '',
        error.expectedPattern || ''
      ]);
    });

    return data;
  }

  /**
   * Create title block errors sheet data
   */
  private static createTitleBlockErrorsData(results: ValidationResults): any[] {
    const data = [
      ['Sheet No', 'Sheet Name', 'File Name', 'Rev Code', 'Rev Date', 'Status', 'Mismatches']
    ];

    results.titleBlock.results
      .filter(result => result.status !== 'VALID')
      .forEach(result => {
        const mismatchDetails = result.mismatches
          .map(m => `${m.field}: expected '${m.expected}', got '${m.actual}'`)
          .join('; ');

        data.push([
          result.sheetNo,
          result.sheetName,
          result.fileName,
          result.revCode,
          result.revDate,
          result.status,
          mismatchDetails
        ]);
      });

    return data;
  }

  /**
   * Create all findings sheet data
   */
  private static createAllFindingsData(results: ValidationResults): any[] {
    const data = [
      ['Check Type', 'File Name', 'Status', 'Comment']
    ];

    // Add missing files
    results.missingFiles.missingFiles
      .filter(item => !item.found)
      .forEach(item => {
        data.push([
          'Missing File',
          item.expectedFile,
          'Missing',
          `Expected in register row ${item.registerRow}`
        ]);
      });

    // Add naming errors
    results.naming.errors.forEach(error => {
      data.push([
        'Naming Error',
        error.fileName,
        'Invalid',
        error.details || 'Naming convention violation'
      ]);
    });

    // Add title block errors
    results.titleBlock.results
      .filter(result => result.status !== 'VALID')
      .forEach(result => {
        const comment = result.mismatches.length > 0
          ? `${result.mismatches.length} field(s) mismatch`
          : result.status;
        
        data.push([
          'Title Block Error',
          result.fileName,
          result.status,
          comment
        ]);
      });

    return data;
  }

  /**
   * Format summary sheet with styling
   */
  private static formatSummarySheet(worksheet: XLSX.WorkSheet): void {
    // Set column widths
    worksheet['!cols'] = [
      { width: 25 },
      { width: 20 }
    ];

    // Add basic formatting (SheetJS free version has limited styling)
    if (worksheet['A1']) {
      worksheet['A1'].s = { font: { bold: true, size: 14 } };
    }
  }

  /**
   * Format data sheet with basic styling
   */
  private static formatDataSheet(worksheet: XLSX.WorkSheet): void {
    // Set reasonable column widths
    worksheet['!cols'] = [
      { width: 30 }, // File names
      { width: 40 }, // Paths
      { width: 15 }, // Types/Status
      { width: 50 }, // Details/Comments
      { width: 25 }  // Additional info
    ];

    // Auto-filter for the header row
    if (worksheet['!ref']) {
      worksheet['!autofilter'] = { ref: worksheet['!ref'] };
    }
  }

  /**
   * Download blob as file
   */
  public static downloadReport(blob: Blob, fileName: string = 'deliverables-qc-report.xlsx'): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generate timestamped filename
   */
  public static generateFileName(prefix: string = 'deliverables-qc-report'): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${prefix}-${timestamp}.xlsx`;
  }

  /**
   * Create CSV export as fallback
   */
  public static createCSVExport(data: any[][], fileName: string): void {
    const csvContent = data
      .map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadReport(blob, fileName.replace('.xlsx', '.csv'));
  }
}
