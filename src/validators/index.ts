/**
 * Validators entry point
 * Exports all validators and their types
 */

export { NamingValidator } from './naming-validator';
export type { 
  NamingRule, 
  NamingValidationResult, 
  NamingValidationSummary 
} from './naming-validator';

export { MissingFilesValidator } from './missing-files-validator';
export type { 
  FileInfo, 
  MissingFileResult, 
  MissingFilesValidationSummary 
} from './missing-files-validator';

export { TitleBlockValidator } from './titleblock-validator';
export type { 
  TitleBlockData, 
  TitleBlockValidationResult, 
  TitleBlockValidationSummary 
} from './titleblock-validator';

// Import types for internal use
import type { NamingValidationSummary } from './naming-validator';
import type { MissingFilesValidationSummary } from './missing-files-validator';
import type { TitleBlockValidationSummary } from './titleblock-validator';

/**
 * Combined validation results
 */
export interface ValidationResults {
  naming: NamingValidationSummary;
  missingFiles: MissingFilesValidationSummary;
  titleBlock: TitleBlockValidationSummary;
  overallCompliance: number;
  totalFiles: number;
}

/**
 * Validation progress callback
 */
export type ProgressCallback = (progress: number, message: string) => void;
