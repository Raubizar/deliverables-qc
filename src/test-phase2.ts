/**
 * Simple test to verify the validators are working
 * This is a temporary test file for Phase 2 verification
 */

import { NamingValidator, MissingFilesValidator, TitleBlockValidator } from './validators';

// Test data
const mockSheetsData = [
  ['Header1', 'Header2', 'Header3', '-', 'Header5'], // Row 0: delimiter in column D
  ['Part1', 'Part2', 'Part3', 'Part4', 'Part5'],    // Row 1: headers
  ['ABC', 'DEF', 'GHI', 'JKL', 'MNO'],             // Row 2: allowed values
  ['XYZ', 'Var', '+N', 'QRS', 'TUV']               // Row 3: more allowed values
];

const mockModelsData = [
  ['Header1', 'Header2', 'Header3', '_', 'Header5'], // Row 0: delimiter in column D
  ['Part1', 'Part2', 'Part3', 'Part4', 'Part5'],    // Row 1: headers
  ['ABC', 'DEF', 'GHI', 'JKL', 'MNO'],             // Row 2: allowed values
  ['XYZ', 'Var', '+N', 'QRS', 'TUV']               // Row 3: more allowed values
];

console.log('Testing Phase 2 Implementation...');

// Test NamingValidator
console.log('\n=== Testing NamingValidator ===');
const namingValidator = new NamingValidator();
namingValidator.loadRules(mockSheetsData, mockModelsData);

// Test valid file name
const validResult = namingValidator.validateFileName('ABC-DEF-GHI-JKL-MNO.pdf');
console.log('Valid file result:', validResult);

// Test invalid file name
const invalidResult = namingValidator.validateFileName('INVALID-FILE-NAME.pdf');
console.log('Invalid file result:', invalidResult);

// Test MissingFilesValidator
console.log('\n=== Testing MissingFilesValidator ===');
const missingFilesValidator = new MissingFilesValidator();

const registerData = [
  ['File Name'],
  ['file1.pdf'],
  ['file2.pdf'],
  ['file3.pdf']
];

const actualFiles = [
  { name: 'file1.pdf', path: '/test/file1.pdf' },
  { name: 'file2.pdf', path: '/test/file2.pdf' }
  // file3.pdf is missing
];

missingFilesValidator.loadExpectedFiles(registerData);
missingFilesValidator.loadActualFiles(actualFiles);
const missingResult = missingFilesValidator.validate();
console.log('Missing files result:', missingResult);

// Test TitleBlockValidator
console.log('\n=== Testing TitleBlockValidator ===');
const titleBlockValidator = new TitleBlockValidator();

const registerTitleData = [
  ['Sheet No', 'Sheet Name', 'File Name', 'Rev Code', 'Rev Date'],
  ['001', 'PLAN VIEW', 'plan-001.pdf', 'A', '01/01/2025'],
  ['002', 'ELEVATION', 'elevation-002.pdf', 'B', '02/01/2025']
];

const titleBlockExportData = [
  ['Sheet No', 'Sheet Name', 'File Name', 'Rev Code', 'Rev Date'],
  ['001', 'PLAN VIEW', 'plan-001.pdf', 'A', '01/01/2025'],
  ['002', 'ELEVATION', 'elevation-002.pdf', 'C', '03/01/2025'] // Mismatch in rev code
];

titleBlockValidator.loadRegisterData(registerTitleData);
titleBlockValidator.loadTitleBlockData(titleBlockExportData);
const titleBlockResult = titleBlockValidator.validate();
console.log('Title block result:', titleBlockResult);

console.log('\n✅ Phase 2 Implementation Test Complete!');
