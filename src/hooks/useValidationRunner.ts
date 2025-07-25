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
  ReportBuilder,
  type FileSystemDirectoryHandle
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

  const runValidation = useCallback(async (inputs: ValidationInputs) => {
    try {
      setState({
        isRunning: true,
        progress: 0,
        currentStep: 'Initializing validation...',
        results: null,
        error: null
      });

      // Require minimum inputs for validation
      console.log('=== VALIDATION RUNNER START ===');
      console.log('Validation inputs received:', {
        hasFolder: !!inputs.folder,
        hasRegisterFile: !!inputs.registerFile,
        hasNamingFile: !!inputs.namingFile,
        hasTitleBlockFile: !!inputs.titleBlockFile,
        folderName: inputs.folder?.name,
        registerFileName: inputs.registerFile?.name,
        namingFileName: inputs.namingFile?.name,
        titleBlockFileName: inputs.titleBlockFile?.name
      });

      // Require folder and at least one file for real validation
      if (!inputs.folder || !inputs.registerFile) {
        throw new Error('Folder and register file are required for validation. Please select both to proceed.');
      }

      console.log('✅ Running real validation...');

      updateProgress(10, 'Reading Excel files...');
      const excelPromises = [];
      
      // Only read files that are provided
      if (inputs.registerFile) {
        excelPromises.push(ExcelProcessor.readFile(inputs.registerFile));
      }
      if (inputs.namingFile) {
        excelPromises.push(ExcelProcessor.readFile(inputs.namingFile));
      }
      if (inputs.titleBlockFile) {
        excelPromises.push(ExcelProcessor.readFile(inputs.titleBlockFile));
      }

      const excelResults = await Promise.all(excelPromises);
      
      // Map results to appropriate variables
      let registerExcel, namingExcel, titleBlockExcel;
      let resultIndex = 0;
      
      if (inputs.registerFile) {
        registerExcel = excelResults[resultIndex++];
      }
      if (inputs.namingFile) {
        namingExcel = excelResults[resultIndex++];
      }
      if (inputs.titleBlockFile) {
        titleBlockExcel = excelResults[resultIndex++];
      }

      // Extract sheet data safely
      const registerSheet = registerExcel?.sheets[0]?.data || [];
      const namingSheets = namingExcel ? {
        Sheets: namingExcel.sheets.find(s => s.name === 'Sheets')?.data || [],
        Models: namingExcel.sheets.find(s => s.name === 'Models')?.data || []
      } : { Sheets: [], Models: [] };
      
      console.log('[ValidationRunner] Naming sheets loaded:');
      console.log('- Sheets tab:', namingSheets.Sheets);
      console.log('- Models tab:', namingSheets.Models);
      const titleBlockSheet = titleBlockExcel?.sheets[0]?.data || [];

      updateProgress(30, 'Scanning directory...');
      console.log('📁 Starting directory scan...');
      const files = await FileSystemUtil.traverseDirectory(inputs.folder, {
        includeSubfolders: inputs.includeSubfolders,
        progressCallback: (processed, total) => {
          const pct = 30 + Math.round((processed / total) * 20);
          updateProgress(pct, `Scanning directory... (${processed}/${total})`);
        }
      });
      console.log(`✅ Directory scan complete. Found ${files.length} files`);

      updateProgress(55, 'Running validators...');
      
      // Initialize results with default values
      let namingResults = {
        totalFiles: files.length,
        validFiles: files.length,
        invalidFiles: 0,
        compliancePercentage: 100,
        errors: [],
        allResults: [] // Add missing property
      };
      
      let missingResults = {
        totalExpected: files.length,
        totalFound: files.length,
        missingCount: 0,
        missingPercentage: 0,
        missingFiles: [],
        extraFiles: []
      };
      
      let titleBlockResults = {
        totalSheets: files.length,
        validSheets: files.length,
        invalidSheets: 0,
        compliancePercentage: 100,
        results: []
      };

      // Run naming validation if naming rules file is provided
      if (inputs.namingFile && (namingSheets.Sheets.length > 0 || namingSheets.Models.length > 0)) {
        console.log('Running naming validation...');
        const namingValidator = new NamingValidator();
        namingValidator.loadRules(namingSheets.Sheets, namingSheets.Models);
        namingResults = namingValidator.validateFiles(
          files.map(f => ({ name: f.name, path: f.path }))
        );
      } else {
        console.log('Skipping naming validation - no naming rules file provided');
      }

      // Run missing files validation if register file is provided
      if (inputs.registerFile && registerSheet.length > 0) {
        console.log('Running missing files validation...');
        const missingFilesValidator = new MissingFilesValidator();
        missingFilesValidator.loadExpectedFiles(registerSheet);
        missingFilesValidator.loadActualFiles(
          files.map(f => ({ name: f.name, path: f.path }))
        );
        missingResults = missingFilesValidator.validate();
      } else {
        console.log('Skipping missing files validation - no register file provided');
      }

      // Run title block validation if both register and title block files are provided
      if (inputs.registerFile && inputs.titleBlockFile && registerSheet.length > 0 && titleBlockSheet.length > 0) {
        console.log('Running title block validation...');
        const titleBlockValidator = new TitleBlockValidator();
        titleBlockValidator.loadRegisterData(registerSheet);
        titleBlockValidator.loadTitleBlockData(titleBlockSheet);
        titleBlockResults = titleBlockValidator.validate();
      } else {
        console.log('Skipping title block validation - missing required files');
      }

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
  }, [updateProgress]);

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
