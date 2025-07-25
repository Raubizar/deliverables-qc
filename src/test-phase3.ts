/**
 * Phase 3 Test - Testing all utility implementations
 */

import { ExcelProcessor, FileSystemUtil, ReportBuilder, DataNormalizer } from './utils';
import { NamingValidator, MissingFilesValidator, TitleBlockValidator } from './validators';
import type { ValidationResults } from './validators';

console.log('🧪 Testing Phase 3 Implementation...\n');

// Test DataNormalizer
console.log('=== Testing DataNormalizer ===');
console.log('normalizeDate("13.03.2025"):', DataNormalizer.normalizeDate("13.03.2025"));
console.log('normalizeDate("13/MAR/2025"):', DataNormalizer.normalizeDate("13/MAR/2025"));
console.log('normalizeText("  Test   Text  "):', DataNormalizer.normalizeText("  Test   Text  "));
console.log('stripExtension("file.pdf"):', DataNormalizer.stripExtension("file.pdf"));
console.log('normalizeForComparison("File Name.PDF"):', DataNormalizer.normalizeForComparison("File Name.PDF"));

// Test ExcelProcessor validation
console.log('\n=== Testing ExcelProcessor ===');
console.log('validateFile("test.xlsx"):', ExcelProcessor.validateFile(new File([], "test.xlsx")));
console.log('validateFile("test.doc"):', ExcelProcessor.validateFile(new File([], "test.doc")));

// Test FileSystemUtil (Node.js compatible methods only)
console.log('\n=== Testing FileSystemUtil ===');
console.log('isFileSystemAccessSupported():', FileSystemUtil.isFileSystemAccessSupported());
console.log('getFileExtension("document.pdf"):', FileSystemUtil.getFileExtension("document.pdf"));
console.log('getFileNameWithoutExtension("document.pdf"):', FileSystemUtil.getFileNameWithoutExtension("document.pdf"));
console.log('normalizePath("folder\\subfolder\\file.txt"):', FileSystemUtil.normalizePath("folder\\subfolder\\file.txt"));

// Test file statistics
const mockFiles = [
  { name: 'file1.pdf', path: 'folder1/file1.pdf', size: 1024, lastModified: new Date(), type: 'file' as const },
  { name: 'file2.xlsx', path: 'folder1/file2.xlsx', size: 2048, lastModified: new Date(), type: 'file' as const },
  { name: 'file3.pdf', path: 'folder2/file3.pdf', size: 512, lastModified: new Date(), type: 'file' as const }
];

const stats = FileSystemUtil.getFileStatistics(mockFiles);
console.log('File statistics:', stats);

const grouped = FileSystemUtil.groupFilesByDirectory(mockFiles);
console.log('Grouped by directory:', grouped);

// Test filter by extension
const pdfFiles = FileSystemUtil.filterFilesByExtension(mockFiles, ['.pdf']);
console.log('PDF files only:', pdfFiles.length);

// Create mock validation results for report testing
console.log('\n=== Testing ReportBuilder ===');
const mockValidationResults: ValidationResults = {
  overallCompliance: 85.5,
  totalFiles: 100,
  naming: {
    totalFiles: 100,
    validFiles: 90,
    invalidFiles: 10,
    compliancePercentage: 90,
    errors: [
      {
        fileName: 'invalid-file.pdf',
        folderPath: '/test',
        isValid: false,
        errorType: 'INVALID_PATTERN',
        details: 'Invalid naming pattern',
        expectedPattern: 'ABC-DEF-GHI'
      }
    ]
  },
  missingFiles: {
    totalExpected: 50,
    totalFound: 45,
    missingCount: 5,
    missingPercentage: 10,
    missingFiles: [
      {
        expectedFile: 'missing-file.pdf',
        found: false,
        registerRow: 10
      }
    ],
    extraFiles: []
  },
  titleBlock: {
    totalSheets: 30,
    validSheets: 25,
    invalidSheets: 5,
    compliancePercentage: 83.33,
    results: [
      {
        sheetNo: '001',
        sheetName: 'Test Sheet',
        fileName: 'test-sheet.pdf',
        revCode: 'A',
        revDate: '01/01/2025',
        status: 'MISMATCH',
        mismatches: [
          { field: 'revCode', expected: 'B', actual: 'A' }
        ]
      }
    ]
  }
};

// Test report generation
async function testReportGeneration() {
  try {
    console.log('Generating XLSX report...');
    const reportBlob = await ReportBuilder.generateReport(mockValidationResults);
    console.log('Report generated successfully! Size:', reportBlob.size, 'bytes');
    console.log('Report type:', reportBlob.type);
    
    // Test filename generation
    const fileName = ReportBuilder.generateFileName('test-report');
    console.log('Generated filename:', fileName);
    
    return true;
  } catch (error) {
    console.error('Report generation failed:', error);
    return false;
  }
}

// Test complete validation workflow
async function testCompleteWorkflow() {
  console.log('\n=== Testing Complete Validation Workflow ===');
  
  // Create mock Excel data
  const mockNamingData = [
    ['Header1', 'Header2', 'Header3', '-', 'Header5'], // delimiter in column D
    ['Part1', 'Part2', 'Part3', 'Part4', 'Part5'],
    ['ABC', 'DEF', 'GHI', 'JKL', 'MNO'],
    ['XYZ', 'Var', '+N', 'QRS', 'TUV']
  ];
  
  const mockRegisterData = [
    ['File Name'],
    ['ABC-DEF-GHI-JKL-MNO.pdf'],
    ['XYZ-Var-test-QRS-TUV.pdf'],
    ['missing-file.pdf']
  ];
  
  const mockTitleBlockRegister = [
    ['Sheet No', 'Sheet Name', 'File Name', 'Rev Code', 'Rev Date'],
    ['001', 'PLAN VIEW', 'plan-001.pdf', 'A', '01/01/2025'],
    ['002', 'ELEVATION', 'elevation-002.pdf', 'B', '02/01/2025']
  ];
  
  const mockTitleBlockExport = [
    ['Sheet No', 'Sheet Name', 'File Name', 'Rev Code', 'Rev Date'],
    ['001', 'PLAN VIEW', 'plan-001.pdf', 'A', '01/01/2025'],
    ['002', 'ELEVATION', 'elevation-002.pdf', 'C', '03/01/2025'] // Mismatch
  ];
  
  const mockActualFiles = [
    { name: 'ABC-DEF-GHI-JKL-MNO.pdf', path: '/test/ABC-DEF-GHI-JKL-MNO.pdf' },
    { name: 'XYZ-Var-test-QRS-TUV.pdf', path: '/test/XYZ-Var-test-QRS-TUV.pdf' }
    // missing-file.pdf is not present
  ];
  
  // Test naming validator
  const namingValidator = new NamingValidator();
  namingValidator.loadRules(mockNamingData, mockNamingData);
  const namingResults = namingValidator.validateFiles(mockActualFiles);
  console.log('Naming validation results:', namingResults);
  
  // Test missing files validator
  const missingFilesValidator = new MissingFilesValidator();
  missingFilesValidator.loadExpectedFiles(mockRegisterData);
  missingFilesValidator.loadActualFiles(mockActualFiles);
  const missingResults = missingFilesValidator.validate();
  console.log('Missing files results:', missingResults);
  
  // Test title block validator
  const titleBlockValidator = new TitleBlockValidator();
  titleBlockValidator.loadRegisterData(mockTitleBlockRegister);
  titleBlockValidator.loadTitleBlockData(mockTitleBlockExport);
  const titleBlockResults = titleBlockValidator.validate();
  console.log('Title block results:', titleBlockResults);
  
  // Create combined results
  const combinedResults: ValidationResults = {
    overallCompliance: (namingResults.compliancePercentage + (100 - missingResults.missingPercentage) + titleBlockResults.compliancePercentage) / 3,
    totalFiles: mockActualFiles.length,
    naming: namingResults,
    missingFiles: missingResults,
    titleBlock: titleBlockResults
  };
  
  console.log('Combined validation results:', combinedResults);
  
  // Generate final report
  try {
    const finalReport = await ReportBuilder.generateReport(combinedResults);
    console.log('✅ Complete workflow test successful! Final report size:', finalReport.size, 'bytes');
    return true;
  } catch (error) {
    console.error('❌ Complete workflow test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  const reportTest = await testReportGeneration();
  const workflowTest = await testCompleteWorkflow();
  
  console.log('\n📊 Test Results Summary:');
  console.log('Report Generation:', reportTest ? '✅ PASS' : '❌ FAIL');
  console.log('Complete Workflow:', workflowTest ? '✅ PASS' : '❌ FAIL');
  
  if (reportTest && workflowTest) {
    console.log('\n🎉 All Phase 3 tests PASSED! Utilities are ready for integration.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
  }
}

runAllTests();
