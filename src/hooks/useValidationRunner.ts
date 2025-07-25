/**
 * Validation orchestrator hook
 * Coordinates all validators and manages processing state
 */

import { useState, useCallback } from 'react';
import {
  NamingValidator,
  MissingFilesValidator,
  TitleBlockValidator,
  type ValidationResults
} from '../validators';
import {
  ExcelProcessor,
  FileSystemUtil,
  ReportBuilder
} from '../utils';

export interface ValidationInputs {
  folder: FileSystemDirectoryHandle | null;
  includeSubfolders: boolean;
  registerFile: File | null;
  namingFile: File | null;
  titleBlockFile: File | null;
}

export interface ValidationState {
  isRunning: boolean;
  progress: number;
  currentStep: string;
  results: ValidationResults | null;
  error: string | null;
}

export interface UseValidationRunnerReturn {
  state: ValidationState;
  runValidation: (inputs: ValidationInputs) => Promise<void>;
  downloadReport: () => Promise<void>;
  reset: () => void;
}

export function useValidationRunner(): UseValidationRunnerReturn {
  const [state, setState] = useState<ValidationState>({
    isRunning: false,
    progress: 0,
    currentStep: '',
    results: null,
    error: null
  });

  const updateProgress = useCallback((progress: number, step: string) => {
    setState(prev => ({
      ...prev,
      progress,
      currentStep: step
    }));
  }, []);

  const runMockValidation = useCallback(async () => {
    updateProgress(10, 'Generating mock data...');
    await new Promise(resolve => setTimeout(resolve, 500));

    updateProgress(30, 'Mock validation in progress...');
    await new Promise(resolve => setTimeout(resolve, 800));

    updateProgress(60, 'Creating mock results...');
    await new Promise(resolve => setTimeout(resolve, 600));

    updateProgress(90, 'Finalizing mock results...');
    await new Promise(resolve => setTimeout(resolve, 400));

    // Create mock validation results
    const mockResults: ValidationResults = {
      overallCompliance: 87,
      totalFiles: 245,
      naming: {
        totalFiles: 245,
        validFiles: 230,
        invalidFiles: 15,
        compliancePercentage: 94,
        errors: [
          {
            fileName: 'beam_detail.pdf',
            folderPath: '/project/structural',
            isValid: false,
            errorType: 'INVALID_PATTERN',
            details: 'Missing revision code, case mismatch',
            expectedPattern: 'STR-XXX-Rev-X.pdf'
          },
          {
            fileName: 'hvac-layout.pdf',
            folderPath: '/project/mechanical',
            isValid: false,
            errorType: 'INVALID_PATTERN',
            details: 'Should be uppercase',
            expectedPattern: 'MEP-XXX-Rev-X.pdf'
          }
        ]
      },
      missingFiles: {
        totalExpected: 253,
        totalFound: 245,
        missingCount: 8,
        missingPercentage: 3.2,
        missingFiles: [
          {
            expectedFile: 'DWG-001-Rev-A.pdf',
            found: false,
            registerRow: 15,
            actualPath: undefined
          },
          {
            expectedFile: 'DWG-002-Rev-B.pdf',
            found: false,
            registerRow: 32,
            actualPath: undefined
          }
        ],
        extraFiles: []
      },
      titleBlock: {
        totalSheets: 245,
        validSheets: 218,
        invalidSheets: 27,
        compliancePercentage: 89,
        results: [
          {
            sheetNo: 'S-001',
            sheetName: 'Foundation Plan',
            fileName: 'foundation.pdf',
            revCode: 'A',
            revDate: '2024-01-15',
            status: 'VALID',
            mismatches: []
          }
        ]
      }
    };

    setState({
      isRunning: false,
      progress: 100,
      currentStep: 'Mock validation complete!',
      results: mockResults,
      error: null
    });
  }, [updateProgress]);

  const runValidation = useCallback(async (inputs: ValidationInputs) => {
    try {
      setState({
        isRunning: true,
        progress: 0,
        currentStep: 'Initializing validation...',
        results: null,
        error: null
      });

      // Check if we're in test mode (no real files provided)
      const isTestMode = !inputs.folder || !inputs.registerFile || !inputs.namingFile || !inputs.titleBlockFile;
      
      if (isTestMode) {
        console.log('Running in test mode with mock data...');
        await runMockValidation();
        return;
      }

      updateProgress(10, 'Reading Excel files...');
      const [registerExcel, namingExcel, titleBlockExcel] = await Promise.all([
        ExcelProcessor.readFile(inputs.registerFile!),
        ExcelProcessor.readFile(inputs.namingFile!),
        ExcelProcessor.readFile(inputs.titleBlockFile!)
      ]);

      const registerSheet = registerExcel.sheets[0]?.data || [];
      const namingSheets = {
        Sheets: namingExcel.sheets.find(s => s.name === 'Sheets')?.data || [],
        Models: namingExcel.sheets.find(s => s.name === 'Models')?.data || []
      };
      const titleBlockSheet = titleBlockExcel.sheets[0]?.data || [];

      updateProgress(30, 'Scanning directory...');
      const files = await FileSystemUtil.traverseDirectory(inputs.folder!, {
        includeSubfolders: inputs.includeSubfolders,
        progressCallback: (processed, total) => {
          const pct = 30 + Math.round((processed / total) * 20);
          updateProgress(pct, 'Scanning directory...');
        }
      });

      updateProgress(55, 'Running validators...');
      const namingValidator = new NamingValidator();
      namingValidator.loadRules(namingSheets.Sheets, namingSheets.Models);
      const namingResults = namingValidator.validateFiles(
        files.map(f => ({ name: f.name, path: f.path }))
      );

      const missingFilesValidator = new MissingFilesValidator();
      missingFilesValidator.loadExpectedFiles(registerSheet);
      missingFilesValidator.loadActualFiles(
        files.map(f => ({ name: f.name, path: f.path }))
      );
      const missingResults = missingFilesValidator.validate();

      const titleBlockValidator = new TitleBlockValidator();
      titleBlockValidator.loadRegisterData(registerSheet);
      titleBlockValidator.loadTitleBlockData(titleBlockSheet);
      const titleBlockResults = titleBlockValidator.validate();

      updateProgress(90, 'Aggregating results...');
      const filePresenceCompliance = 100 - missingResults.missingPercentage;
      const overallCompliance = calculateOverallCompliance(
        namingResults.compliancePercentage,
        filePresenceCompliance,
        titleBlockResults.compliancePercentage
      );

      const results: ValidationResults = {
        naming: namingResults,
        missingFiles: missingResults,
        titleBlock: titleBlockResults,
        overallCompliance,
        totalFiles: files.length
      };

      setState({
        isRunning: false,
        progress: 100,
        currentStep: 'Validation complete',
        results,
        error: null
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState({
        isRunning: false,
        progress: 0,
        currentStep: '',
        results: null,
        error: errorMessage
      });
    }
  }, [runMockValidation]);

  const downloadReport = useCallback(async () => {
    if (!state.results) {
      throw new Error('No validation results available for download');
    }

    try {
      const reportBlob = await ReportBuilder.generateReport(state.results);
      const url = URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QC-Report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, [state.results]);

  const reset = useCallback(() => {
    setState({
      isRunning: false,
      progress: 0,
      currentStep: '',
      results: null,
      error: null
    });
  }, []);

  return {
    state,
    runValidation,
    downloadReport,
    reset
  };
}

/**
 * Calculate overall compliance score
 */
function calculateOverallCompliance(
  namingCompliance: number,
  filePresenceCompliance: number,
  titleBlockCompliance: number
): number {
  return Math.round((namingCompliance + filePresenceCompliance + titleBlockCompliance) / 3);
}
