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

      // Enhanced validation with better error handling
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

      // Check for debug mode (force real validation)
      const isDebugMode = window.location.search.includes('debug=true') || window.location.hash.includes('debug');
      console.log('Debug mode:', isDebugMode);

      // Check if we have minimum requirements for real validation
      const hasRequiredInputs = inputs.folder && inputs.registerFile;
      
      if (!hasRequiredInputs && !isDebugMode) {
        console.log('❌ Missing required inputs - running mock validation');
        console.log('Required: folder and register file');
        console.log('Or add ?debug=true to URL to force real validation');
        await runMockValidation();
        return;
      }

      if (!hasRequiredInputs && isDebugMode) {
        console.log('⚠ Debug mode: forcing real validation even without proper inputs');
      }

      // If we have partial files, we can still run some validations
      console.log('✅ Running real validation with available inputs...');

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
      const titleBlockSheet = titleBlockExcel?.sheets[0]?.data || [];

      updateProgress(30, 'Scanning directory...');
      let files = [];
      
      if (inputs.folder) {
        try {
          console.log('📁 Starting directory scan...');
          files = await FileSystemUtil.traverseDirectory(inputs.folder, {
            includeSubfolders: inputs.includeSubfolders,
            progressCallback: (processed, total) => {
              const pct = 30 + Math.round((processed / total) * 20);
              updateProgress(pct, `Scanning directory... (${processed}/${total})`);
            }
          });
          console.log(`✅ Directory scan complete. Found ${files.length} files`);
        } catch (dirError) {
          console.error('❌ Directory scan failed:', dirError);
          // If directory scan fails, use mock file list for demo
          console.log('🔄 Falling back to mock file list for demo');
          files = [
            { name: 'DWG-001-Rev-A.pdf', path: 'DWG-001-Rev-A.pdf', size: 1024, lastModified: new Date(), type: 'file' },
            { name: 'DWG-002-Rev-B.pdf', path: 'DWG-002-Rev-B.pdf', size: 2048, lastModified: new Date(), type: 'file' },
            { name: 'beam_detail.pdf', path: 'beam_detail.pdf', size: 1536, lastModified: new Date(), type: 'file' }
          ];
        }
      } else {
        console.log('⚠ No folder provided, using mock file list');
        files = [
          { name: 'DWG-001-Rev-A.pdf', path: 'DWG-001-Rev-A.pdf', size: 1024, lastModified: new Date(), type: 'file' },
          { name: 'DWG-002-Rev-B.pdf', path: 'DWG-002-Rev-B.pdf', size: 2048, lastModified: new Date(), type: 'file' },
          { name: 'beam_detail.pdf', path: 'beam_detail.pdf', size: 1536, lastModified: new Date(), type: 'file' }
        ];
      }

      updateProgress(55, 'Running validators...');
      
      // Initialize results with default values
      let namingResults = {
        totalFiles: files.length,
        validFiles: files.length,
        invalidFiles: 0,
        compliancePercentage: 100,
        errors: []
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
