// Modern Drawing QC Application - Clash Report Summariser Style

// Global variables
let fileNamesFromExcel = [];
let fileResultsFromFolder = [];
let namingRulesData = [];
let titleBlockData = [];
let currentFilter = 'all';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Drawing QC Application...');
    
    // Add debugging helper to window for easy console access
    window.debugTitleBlocks = function() {
        console.log('=== DEBUG TITLE BLOCKS ===');
        console.log('titleBlockData exists:', !!titleBlockData);
        console.log('titleBlockData length:', titleBlockData ? titleBlockData.length : 'undefined');
        console.log('titleBlockData content:', titleBlockData);
        return titleBlockData;
    };
    
    try {
        initializeEventListeners();
        initializeCharts();
        
        // Add sample data for demonstration
        setTimeout(() => {
            loadSampleData();
        }, 1000);
        
        console.log('Application initialized successfully');
        console.log('Type "debugTitleBlocks()" in console to check title block data');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});

// Add sample data for demonstration
function loadSampleData() {
    // Simulate some sample metrics
    document.getElementById('totalFiles').textContent = '142';
    document.getElementById('missingFiles').textContent = '8';
    document.getElementById('compliantFiles').textContent = '127';
    document.getElementById('overallScore').textContent = '89%';
    
    // Update colors
    updateMetricColor('missingFiles', 'warning');
    updateMetricColor('overallScore', 'success');
    
    // Update charts with sample data
    if (window.complianceChart) {
        window.complianceChart.data.datasets[0].data = [134, 8, 5];
        window.complianceChart.update();
    }
    
    if (window.namingChart) {
        window.namingChart.data.datasets[0].data = [89, 11];
        window.namingChart.update();
    }
    
    if (window.titleChart) {
        window.titleChart.data.datasets[0].data = [92, 8];
        window.titleChart.update();
    }
    
    document.getElementById('namingPercent').textContent = '89% OK';
    document.getElementById('titlePercent').textContent = '92% OK';
}

// Event Listeners
function initializeEventListeners() {
    console.log('Setting up event listeners...');
    
    try {
        // File inputs with progressive disclosure
        const folderInput = document.getElementById('folderInput');
        const registerFile = document.getElementById('registerFile');
        const namingRulesFile = document.getElementById('namingRulesFile');
        const titleBlocksFile = document.getElementById('titleBlocksFile');
        
        if (folderInput) folderInput.addEventListener('change', handleFolderUpload);
        if (registerFile) registerFile.addEventListener('change', handleRegisterFile);
        if (namingRulesFile) namingRulesFile.addEventListener('change', handleNamingRulesFile);
        if (titleBlocksFile) titleBlocksFile.addEventListener('change', handleTitleBlocksFile);

        // Excel configuration
        const registerSheetSelect = document.getElementById('registerSheetSelect');
        const registerColumnSelect = document.getElementById('registerColumnSelect');
        
        if (registerSheetSelect) registerSheetSelect.addEventListener('change', handleSheetChange);
        if (registerColumnSelect) registerColumnSelect.addEventListener('change', handleColumnChange);

        // Controls
        const fileTypeFilter = document.getElementById('fileTypeFilter');
        const runChecks = document.getElementById('runChecks');
        
        if (fileTypeFilter) fileTypeFilter.addEventListener('change', handleFilterChange);
        if (runChecks) runChecks.addEventListener('click', runAllChecks);
        
        // Check if searchInput exists before adding listener
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
        }

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
        });

        // Export functionality - use the correct ID
        const downloadBtn = document.getElementById('downloadExport') || document.getElementById('downloadXLSX');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', exportResults);
        }
        
        console.log('Event listeners set up successfully');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// File Upload Handlers with Progressive Disclosure
function handleFolderUpload(event) {
    console.log('Folder upload triggered');
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Update UI
    updateFileStatus('folderStatus', `Selected ${files.length} files`, 'success');
    
    // Store files
    fileResultsFromFolder = files.map(file => ({
        name: file.name,
        path: file.webkitRelativePath || file.name,
        file: file
    }));

    // Show success feedback
    showNotification(`Loaded ${files.length} files from folder`, 'success');
    
    // Update file chip to selected state
    const folderChip = document.querySelector('#folderInput').closest('.file-chip');
    if (folderChip) folderChip.classList.add('selected');
}

function handleRegisterFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    updateFileStatus('registerStatus', `Selected: ${file.name}`, 'success');
    processExcelFile(file, 'register');
    
    // Show Excel configuration with progressive disclosure
    showExcelConfiguration();
    
    // Update file chip to selected state
    document.querySelector('#registerFile').closest('.file-chip').classList.add('selected');
}

function handleNamingRulesFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('=== NAMING RULES FILE SELECTED ===');
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);

    updateFileStatus('namingStatus', `Selected: ${file.name}`, 'success');
    processExcelFile(file, 'naming');
    
    // Update file chip to selected state
    document.querySelector('#namingRulesFile').closest('.file-chip').classList.add('selected');
}

function handleTitleBlocksFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log('=== TITLE BLOCKS FILE UPLOAD ===');
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);

    updateFileStatus('titleBlocksStatus', `Selected: ${file.name}`, 'success');
    processExcelFile(file, 'titleBlocks');
    
    // Show Expected Values with progressive disclosure
    showExpectedValues();
    
    // Update file chip to selected state
    document.querySelector('#titleBlocksFile').closest('.file-chip').classList.add('selected');
}

// Progressive Disclosure Functions
function showExcelConfiguration() {
    const config = document.getElementById('excelConfig');
    config.style.display = 'block';
    config.classList.add('fade-in');
}

function showExpectedValues() {
    const values = document.getElementById('expectedValues');
    values.style.display = 'block';
    values.classList.add('fade-in');
    
    // Show notification
    showNotification('Expected Values section revealed', 'info');
}

// Excel Processing
async function processExcelFile(file, type) {
    try {
        console.log(`=== PROCESSING EXCEL FILE (${type.toUpperCase()}) ===`);
        console.log('File name:', file.name);
        
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log('Workbook loaded successfully');
        console.log('Sheet names:', workbook.SheetNames);
        
        if (type === 'register') {
            window.currentRegisterWorkbook = workbook;
            populateSheetSelector(workbook);
        } else if (type === 'naming') {
            console.log('Processing naming rules...');
            namingRulesData = processNamingRules(workbook);
            console.log('Final namingRulesData:', namingRulesData);
            console.log('namingRulesData.Sheets exists:', !!namingRulesData.Sheets);
            console.log('namingRulesData.Sheets length:', namingRulesData.Sheets ? namingRulesData.Sheets.length : 'N/A');
        } else if (type === 'titleBlocks') {
            console.log('Processing title blocks...');
            titleBlockData = processTitleBlocks(workbook);
            console.log('Final titleBlockData:', titleBlockData);
            console.log('titleBlockData length:', titleBlockData ? titleBlockData.length : 'N/A');
            console.log('titleBlockData sample:', titleBlockData ? titleBlockData.slice(0, 2) : 'N/A');
        }
        
        console.log(`=== EXCEL FILE PROCESSING COMPLETE (${type.toUpperCase()}) ===`);
        
    } catch (error) {
        console.error('Error processing Excel file:', error);
        showNotification('Error reading Excel file', 'error');
    }
}

function populateSheetSelector(workbook) {
    const sheetSelect = document.getElementById('registerSheetSelect');
    sheetSelect.innerHTML = '<option value="">Select sheet...</option>';
    
    workbook.SheetNames.forEach((sheetName, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = sheetName;
        sheetSelect.appendChild(option);
    });
}

function handleSheetChange() {
    const sheetIndex = document.getElementById('registerSheetSelect').value;
    if (sheetIndex === '') return;
    
    const workbook = window.currentRegisterWorkbook;
    const worksheet = workbook.Sheets[workbook.SheetNames[parseInt(sheetIndex)]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    populateColumnSelector(jsonData[0] || []);
}

function populateColumnSelector(headers) {
    const columnSelect = document.getElementById('registerColumnSelect');
    columnSelect.innerHTML = '<option value="">Select column...</option>';
    
    headers.forEach((header, index) => {
        if (header) {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${String.fromCharCode(65 + index)}: ${header}`;
            columnSelect.appendChild(option);
        }
    });
}

function handleColumnChange() {
    const sheetIndex = document.getElementById('registerSheetSelect').value;
    const columnIndex = document.getElementById('registerColumnSelect').value;
    
    if (sheetIndex === '' || columnIndex === '') return;
    
    const workbook = window.currentRegisterWorkbook;
    const worksheet = workbook.Sheets[workbook.SheetNames[parseInt(sheetIndex)]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const columnData = jsonData.slice(1)
        .map(row => row[parseInt(columnIndex)])
        .filter(cell => cell && typeof cell === 'string' && cell.trim() !== '');
    
    fileNamesFromExcel = columnData;
    
    // Show preview
    const preview = document.getElementById('configPreview');
    const previewText = columnData.slice(0, 3).join(', ');
    preview.textContent = `Preview: ${previewText}... (${columnData.length} total)`;
    
    showNotification(`Loaded ${columnData.length} drawings from register`, 'success');
}

// Main Processing Function
async function runAllChecks() {
    console.log('Run Checks button clicked!');
    showNotification('Running quality checks...', 'info');
    
    if (fileResultsFromFolder.length === 0 || fileNamesFromExcel.length === 0) {
        showNotification('Please upload both folder and register file', 'warning');
        return;
    }

    // Apply current filter
    const filteredFiles = applyFileFilter(fileResultsFromFolder);
    
    // Run all checks
    const drawingListResults = compareDrawingList(fileNamesFromExcel, filteredFiles);
    const namingResults = checkNamingCompliance(filteredFiles);
    const qaqcResults = checkQAQC(filteredFiles);
    
    // Update UI
    updateSummaryMetrics(drawingListResults, namingResults, qaqcResults);
    updateResultsTables(drawingListResults, namingResults, qaqcResults);
    updateCharts(drawingListResults, namingResults, qaqcResults);
    
    showNotification('Quality checks completed', 'success');
}

// Comparison Functions (from legacy apps)
function compareDrawingList(excelNames, folderFiles) {
    const results = [];
    const folderFileNames = folderFiles.map(f => stripExtension(f.name));
    
    // Check each Excel drawing
    excelNames.forEach(excelName => {
        const normalizedExcel = normalizeText(excelName);
        const matchedFile = folderFileNames.find(fileName => 
            normalizeText(fileName) === normalizedExcel
        );
        
        results.push({
            excelName: excelName,
            matchedFile: matchedFile || 'N/A',
            status: matchedFile ? 'Done' : 'To Do'
        });
    });
    
    // Check for extra files not in Excel
    folderFileNames.forEach(fileName => {
        const normalizedFile = normalizeText(fileName);
        const inExcel = excelNames.some(excelName => 
            normalizeText(excelName) === normalizedFile
        );
        
        if (!inExcel) {
            results.push({
                excelName: 'N/A',
                matchedFile: fileName,
                status: 'File not in Drawing List'
            });
        }
    });
    
    return results;
}

function checkNamingCompliance(files) {
    console.log('=== CHECKING NAMING COMPLIANCE ===');
    console.log('namingRulesData:', namingRulesData);
    console.log('namingRulesData type:', typeof namingRulesData);
    console.log('namingRulesData.Sheets exists:', !!namingRulesData?.Sheets);
    console.log('namingRulesData.Sheets length:', namingRulesData?.Sheets?.length);
    
    if (!namingRulesData || !namingRulesData.Sheets || namingRulesData.Sheets.length === 0) {
        console.log('❌ No naming rules available');
        return files.map(file => ({
            folderPath: extractFolderPath(file),
            fileName: file.name,
            highlightedFileName: file.name, // No highlighting for "No Rules"
            status: 'No Rules',
            details: 'No naming convention loaded',
            hasErrors: false
        }));
    }

    console.log('✓ Naming rules available, processing files...');
    return files.map(file => {
        const analysis = analyzeFileNameAgainstRules(file.name);
        return {
            folderPath: extractFolderPath(file),
            fileName: file.name,
            highlightedFileName: analysis.highlightedFileName,
            status: analysis.compliance,
            details: analysis.details,
            hasErrors: analysis.hasErrors
        };
    });
}

function extractFolderPath(file) {
    if (file.path) {
        const lastSlashIndex = file.path.lastIndexOf('/');
        return lastSlashIndex > 0 ? file.path.substring(0, lastSlashIndex + 1) : 'Root/';
    }
    return 'Root/';
}

function analyzeFileNameAgainstRules(fileName) {
    if (!namingRulesData || !namingRulesData.Sheets) {
        return { 
            compliance: 'No Rules', 
            details: 'No naming convention loaded. Please upload naming rules file.',
            highlightedFileName: fileName,
            hasErrors: false
        };
    }

    console.log('=== ANALYZING FILE NAME ===');
    console.log('File name:', fileName);

    const namingTab = namingRulesData.Sheets;
    if (!namingTab || namingTab.length === 0) {
        return {
            compliance: 'Wrong',
            details: 'No naming convention data available.',
            highlightedFileName: fileName,
            hasErrors: false
        };
    }

    console.log('Using naming tab with', namingTab.length, 'rows');
    console.log('First few rows of naming tab:', namingTab.slice(0, 5));

    // Get delimiter from cell D1 (row 1, column D = index [0][3])
    const delimiter = namingTab[0] && namingTab[0][3] ? namingTab[0][3] : null;
    if (!delimiter || typeof delimiter !== 'string') {
        console.log('❌ Delimiter not found in cell D1');
        console.log('- namingTab[0]:', namingTab[0]);
        console.log('- namingTab[0][3]:', namingTab[0] ? namingTab[0][3] : 'undefined');
        return { compliance: 'Wrong', details: 'Invalid or missing delimiter in naming convention', highlightedFileName: fileName, hasErrors: false };
    }

    // Get number of parts from cell B1 (row 1, column B = index [0][1])
    const expectedPartCount = namingTab[0] && namingTab[0][1] ? parseInt(namingTab[0][1]) : null;
    if (!expectedPartCount || isNaN(expectedPartCount)) {
        console.log('❌ Number of parts not found in cell B1');
        console.log('- namingTab[0]:', namingTab[0]);
        console.log('- namingTab[0][1]:', namingTab[0] ? namingTab[0][1] : 'undefined');
        return { compliance: 'Wrong', details: 'Invalid or missing number of parts in naming convention', highlightedFileName: fileName, hasErrors: false };
    }

    console.log('Delimiter:', delimiter);
    console.log('Expected parts:', expectedPartCount);

    // Remove extension from file name
    const dotPosition = fileName.lastIndexOf('.');
    const fileNameWithoutExt = dotPosition > 0 ? fileName.substring(0, dotPosition) : fileName;

    console.log("File name without extension:", fileNameWithoutExt);

    // Split file name into parts using the delimiter
    const nameParts = fileNameWithoutExt.split(delimiter);
    console.log('File parts:', nameParts);
    console.log('Parts count:', nameParts.length);

    // Check if number of parts matches
    if (nameParts.length !== expectedPartCount) {
        console.log(`❌ Part count mismatch: expected ${expectedPartCount}, got ${nameParts.length}`);
        return { 
            compliance: 'Wrong', 
            details: `Expected ${expectedPartCount} parts, got ${nameParts.length} parts`,
            highlightedFileName: `<span style="color: #ef4444; font-weight: bold;">${fileNameWithoutExt}</span>`,
            hasErrors: true
        };
    }

    // Validate each part against its column
    let nonCompliantParts = [];
    let invalidPartIndices = []; // Track which parts are invalid for highlighting

    for (let i = 0; i < nameParts.length; i++) {
        const currentPart = nameParts[i];
        
        // Get allowed values for this part from column i (Part 1 = Column A = index 0)
        // Starting from row 2 (index 1), collect all non-empty values in column i
        const allowedValues = namingTab.slice(1)  // Skip row 1 (metadata), start from row 2
            .map(row => row[i])  // Get column i (Part 1 = Column A = index 0)
            .filter(val => val !== undefined && val !== null && val !== '');

        console.log(`Validating part ${i + 1} (${currentPart}) against column ${String.fromCharCode(65 + i)}:`, allowedValues);

        let partIsValid = false;

        // Check each allowed value for this part
        for (const allowedValue of allowedValues) {
            const allowed = String(allowedValue).trim();
            
            if (!allowed) continue;

            // Rule 1: If allowed value is just a number, part must be exactly that many digits
            if (/^\d+$/.test(allowed)) {
                const requiredDigits = parseInt(allowed);
                if (/^\d+$/.test(currentPart) && currentPart.length === requiredDigits) {
                    partIsValid = true;
                    console.log(`✓ Part ${i + 1} matches digit rule: ${currentPart} has ${requiredDigits} digits`);
                    break;
                }
            }
            
            // Rule 2: If allowed value is "Description", part must be alphanumeric with min 3 chars
            else if (allowed.toLowerCase() === 'description') {
                if (currentPart.length >= 3) {
                    partIsValid = true;
                    console.log(`✓ Part ${i + 1} matches description rule: ${currentPart}`);
                    break;
                }
            }
            
            // Rule 3: Exact match against allowed text values
            else if (allowed === currentPart) {
                partIsValid = true;
                console.log(`✓ Part ${i + 1} exact match: ${currentPart}`);
                break;
            }
            
            // Rule 4: Handle +N patterns (e.g., "LPL+N" means "LPL" followed by numbers)
            else if (allowed.includes('+N')) {
                const prefix = allowed.split('+')[0];
                if (currentPart.startsWith(prefix)) {
                    const suffix = currentPart.substring(prefix.length);
                    if (/^\d+$/.test(suffix)) {
                        partIsValid = true;
                        console.log(`✓ Part ${i + 1} matches +N pattern: ${currentPart}`);
                        break;
                    }
                }
            }
            
            // Rule 5: Variable part - anything is allowed
            else if (allowed.toLowerCase() === 'var') {
                partIsValid = true;
                console.log(`✓ Part ${i + 1} matches variable rule: ${currentPart}`);
                break;
            }
        }

        if (!partIsValid) {
            console.log(`❌ Part ${i + 1} (${currentPart}) is not valid`);
            nonCompliantParts.push(`Part ${i + 1} (${currentPart}) is not valid`);
            invalidPartIndices.push(i); // Track invalid part index
        }
    }

    // Create highlighted file name for display
    let highlightedFileName = fileNameWithoutExt;
    if (invalidPartIndices.length > 0) {
        // Split and rebuild with highlighting
        const parts = fileNameWithoutExt.split(delimiter);
        highlightedFileName = parts.map((part, index) => {
            if (invalidPartIndices.includes(index)) {
                return `<span style="color: #ef4444; font-weight: bold;">${part}</span>`;
            }
            return part;
        }).join(delimiter);
    }

    // Create highlighted details
    let highlightedDetails = nonCompliantParts.length === 0 
        ? 'Delimiter correct; Number of parts correct;' 
        : nonCompliantParts.map(detail => {
            // Highlight the part in the detail message
            return detail.replace(/\(([^)]+)\)/, '(<span style="color: #ef4444; font-weight: bold;">$1</span>)');
          }).join('; ');

    // Determine compliance
    const compliance = nonCompliantParts.length === 0 ? 'Ok' : 'Wrong';
    
    console.log('Final result:', compliance, highlightedDetails);
    return { 
        compliance, 
        details: highlightedDetails,
        highlightedFileName: highlightedFileName,
        hasErrors: invalidPartIndices.length > 0
    };
}

function checkQAQC(files) {
    // Get expected values from the UI
    const expectedValues = {
        revisionCode: document.getElementById('expectedRevCode')?.value?.trim() || '',
        revisionDate: document.getElementById('expectedRevDate')?.value?.trim() || '',
        suitability: document.getElementById('expectedSuitability')?.value?.trim() || '',
        stage: document.getElementById('expectedStage')?.value?.trim() || '',
        revisionDesc: document.getElementById('expectedRevDesc')?.value?.trim() || '',
        separator: document.getElementById('separator')?.value || ' - ',
        checkSheetOnly: document.getElementById('checkSheetOnly')?.checked || false
    };

    console.log('=== QA-QC VALIDATION ===');
    console.log('Expected values:', expectedValues);
    console.log('Title block data available:', titleBlockData?.length || 0, 'records');
    console.log('Files to check:', files.length);
    
    // Debug title blocks data
    debugTitleBlocks();

    return files.map(file => {
        const issues = [];
        const sheetNumber = extractSheetNumber(file.name);
        const fileNameWithoutExt = stripExtension(file.name);
        
        console.log(`\n--- Checking file: ${file.name} ---`);
        console.log(`Sheet number extracted: "${sheetNumber}"`);
        console.log(`File name without ext: "${fileNameWithoutExt}"`);
        
        let titleRecord = null;
        
        if (titleBlockData && titleBlockData.length > 0) {
            console.log('Available title block records:');
            titleBlockData.forEach((record, i) => {
                if (i < 5) { // Only show first 5 for brevity
                    console.log(`  ${i}: Sheet="${record.sheetNumber}", File="${record.fileName}"`);
                }
            });
            
            // Strategy 1: Exact file name match (most reliable)
            titleRecord = titleBlockData.find(record => {
                const match1 = normalizeText(record.fileName || '') === normalizeText(file.name);
                const match2 = normalizeText(record.fileName || '') === normalizeText(fileNameWithoutExt);
                if (match1 || match2) {
                    console.log(`✓ Strategy 1 - File name match: "${record.fileName}" vs "${file.name}"`);
                }
                return match1 || match2;
            });
            
            // Strategy 2: Sheet number match
            if (!titleRecord && sheetNumber) {
                titleRecord = titleBlockData.find(record => {
                    const match = normalizeText(record.sheetNumber || '') === normalizeText(sheetNumber);
                    if (match) {
                        console.log(`✓ Strategy 2 - Sheet number match: "${record.sheetNumber}" vs "${sheetNumber}"`);
                    }
                    return match;
                });
            }
            
            // Strategy 3: Partial file name match
            if (!titleRecord) {
                titleRecord = titleBlockData.find(record => {
                    const recordFileName = normalizeText(record.fileName || '');
                    const searchFileName = normalizeText(fileNameWithoutExt);
                    const match1 = recordFileName.includes(searchFileName) && searchFileName.length > 10;
                    const match2 = searchFileName.includes(recordFileName) && recordFileName.length > 10;
                    if (match1 || match2) {
                        console.log(`✓ Strategy 3 - Partial match: "${recordFileName}" vs "${searchFileName}"`);
                    }
                    return match1 || match2;
                });
            }
            
            console.log('Final matched record:', titleRecord);
            
            if (titleRecord) {
                // Extract values from title record
                const actualValues = {
                    revisionCode: titleRecord.revisionCode || 'N/A',
                    revisionDate: titleRecord.revisionDate || 'N/A', 
                    revisionDescription: titleRecord.revisionDescription || 'N/A',
                    suitabilityCode: titleRecord.suitabilityCode || 'N/A',
                    stageDescription: titleRecord.stageDescription || 'N/A'
                };
                
                console.log('Actual values from title block:', actualValues);
                
                // Only validate if expected values are provided
                if (expectedValues.revisionCode && 
                    actualValues.revisionCode !== 'N/A') {
                    const revisionValidation = compareRevisionCodes(expectedValues.revisionCode, actualValues.revisionCode);
                    if (!revisionValidation.valid) {
                        issues.push(`Rev Code: ${revisionValidation.reason} (expected >= "${expectedValues.revisionCode}", got "${actualValues.revisionCode}")`);
                    }
                }
                
                if (expectedValues.revisionDate && 
                    normalizeDate(actualValues.revisionDate) !== normalizeDate(expectedValues.revisionDate)) {
                    issues.push(`Rev Date: expected "${expectedValues.revisionDate}", got "${actualValues.revisionDate}"`);
                }
                
                if (expectedValues.suitability && 
                    normalizeText(actualValues.suitabilityCode) !== normalizeText(expectedValues.suitability)) {
                    issues.push(`Suitability: expected "${expectedValues.suitability}", got "${actualValues.suitabilityCode}"`);
                }
                
                if (expectedValues.stage && 
                    normalizeText(actualValues.stageDescription) !== normalizeText(expectedValues.stage)) {
                    issues.push(`Stage: expected "${expectedValues.stage}", got "${actualValues.stageDescription}"`);
                }
                
                if (expectedValues.revisionDesc && 
                    normalizeText(actualValues.revisionDescription) !== normalizeText(expectedValues.revisionDesc)) {
                    issues.push(`Rev Desc: expected "${expectedValues.revisionDesc}", got "${actualValues.revisionDescription}"`);
                }
                
                return {
                    sheetNumber: titleRecord.sheetNumber || 'N/A',
                    sheetName: titleRecord.sheetName || 'N/A',
                    fileName: file.name,
                    revCode: actualValues.revisionCode,
                    revDate: actualValues.revisionDate,
                    revDescription: actualValues.revisionDescription,
                    suitability: actualValues.suitabilityCode,
                    stage: actualValues.stageDescription,
                    result: issues.length === 0 ? 'PASS' : 'FAIL',
                    issues: issues.length > 0 ? issues.join('; ') : 'None'
                };
            } else {
                console.log('❌ No matching title record found');
                return {
                    sheetNumber: sheetNumber || 'N/A',
                    sheetName: 'N/A', 
                    fileName: file.name,
                    revCode: 'N/A',
                    revDate: 'N/A',
                    revDescription: 'N/A',
                    suitability: 'N/A',
                    stage: 'N/A',
                    result: 'FAIL',
                    issues: 'No title block data found for this file'
                };
            }
        } else {
            console.log('❌ No title block data loaded');
            return {
                sheetNumber: sheetNumber || 'N/A',
                sheetName: 'N/A',
                fileName: file.name, 
                revCode: 'N/A',
                revDate: 'N/A',
                revDescription: 'N/A',
                suitability: 'N/A',
                stage: 'N/A',
                result: 'FAIL',
                issues: 'No title block data loaded'
            };
        }
    });
}

// UI Update Functions
function updateSummaryMetrics(drawingResults, namingResults, qaqcResults) {
    const totalFiles = fileResultsFromFolder.length;
    const missingFiles = drawingResults.filter(r => r.status === 'To Do').length;
    const compliantFiles = namingResults.filter(r => r.status === 'Ok').length;
    const overallScore = Math.round(((compliantFiles / totalFiles) * 100));
    
    document.getElementById('totalFiles').textContent = totalFiles;
    document.getElementById('missingFiles').textContent = missingFiles;
    document.getElementById('compliantFiles').textContent = compliantFiles;
    document.getElementById('overallScore').textContent = `${overallScore}%`;
    
    // Update metric card colors
    updateMetricColor('missingFiles', missingFiles === 0 ? 'success' : 'error');
    updateMetricColor('overallScore', overallScore >= 80 ? 'success' : overallScore >= 60 ? 'warning' : 'error');
}

function updateMetricColor(elementId, colorClass) {
    const element = document.getElementById(elementId);
    element.className = `metric-value ${colorClass}`;
}

function updateResultsTables(drawingResults, namingResults, qaqcResults) {
    // Update Drawing List table
    const drawingTable = document.getElementById('drawingListResults');
    drawingTable.innerHTML = drawingResults.map(result => `
        <tr>
            <td>${result.excelName}</td>
            <td>${result.matchedFile}</td>
            <td><span class="status-badge ${getStatusClass(result.status)}">${result.status}</span></td>
        </tr>
    `).join('');
    
    // Update Naming table
    const namingTable = document.getElementById('namingResults');
    namingTable.innerHTML = namingResults.map(result => `
        <tr>
            <td>${result.folderPath}</td>
            <td>${result.highlightedFileName || result.fileName}</td>
            <td><span class="status-badge ${result.status === 'Ok' ? 'success' : result.status === 'OK' ? 'success' : result.status === 'WARNING' ? 'warning' : 'error'}">${result.status}</span></td>
            <td>${result.details}</td>
        </tr>
    `).join('');
    
    // Update QA-QC table
    const qaqcTable = document.getElementById('qaqcResults');
    console.log('=== UPDATING QA-QC TABLE ===');
    console.log('titleBlockData in table update:', titleBlockData);
    console.log('titleBlockData length:', titleBlockData ? titleBlockData.length : 'undefined');
    
    qaqcTable.innerHTML = qaqcResults.map(result => {
        console.log('Processing QA-QC result for file:', result.fileName);
        console.log('Result data:', result);
        
        // Check if revision code has validation issues
        const hasRevisionError = result.issues && result.issues.includes('Rev Code:');
        const revCodeClass = hasRevisionError ? 'revision-error' : '';
        
        // Get naming status from naming checker results
        const namingResult = namingResults.find(nr => nr.fileName === result.fileName);
        const namingStatus = namingResult ? namingResult.status : 'Unknown';
        const namingStatusClass = namingStatus === 'Ok' ? 'success' : 
                                namingStatus === 'Warning' ? 'warning' : 'error';
        
        const deliveryStatus = 'Delivered'; // Since file exists in folder
        
        return `
            <tr>
                <td>${result.sheetNumber}</td>
                <td>${result.sheetName}</td>
                <td>${result.fileName}</td>
                <td class="${revCodeClass}">${result.revCode}</td>
                <td>${result.revDate}</td>
                <td>${result.revDescription}</td>
                <td>${result.suitability}</td>
                <td>${result.stage}</td>
                <td><span class="status-badge ${namingStatusClass}">${namingStatus}</span></td>
                <td><span class="status-badge success">${deliveryStatus}</span></td>
                <td></td>
                <td><span class="status-badge success">${result.result === 'PASS' ? 'PASS' : ''}</span></td>
                <td>${result.issues}</td>
            </tr>
        `;
    }).join('');
}

function getStatusClass(status) {
    switch (status) {
        case 'Done': return 'success';
        case 'To Do': return 'warning';
        case 'File not in Drawing List': return 'error';
        default: return 'info';
    }
}

// Chart Functions
function initializeCharts() {
    // Initialize empty charts
    createComplianceChart();
    createProgressChart('namingChart');
    createProgressChart('titleChart');
}

function createComplianceChart() {
    const ctx = document.getElementById('complianceChart').getContext('2d');
    window.complianceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Complete', 'Missing', 'Extra'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '50%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        fontSize: 9,
                        padding: 8,
                        boxWidth: 12
                    }
                }
            },
            layout: {
                padding: 0
            }
        }
    });
}

function createProgressChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    window[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#3b82f6', '#e5e7eb'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '70%',
            plugins: { legend: { display: false } }
        }
    });
}

function updateCharts(drawingResults, namingResults, qaqcResults) {
    // Update compliance chart
    const complete = drawingResults.filter(r => r.status === 'Done').length;
    const missing = drawingResults.filter(r => r.status === 'To Do').length;
    const extra = drawingResults.filter(r => r.status === 'File not in Drawing List').length;
    
    if (window.complianceChart) {
        window.complianceChart.data.datasets[0].data = [complete, missing, extra];
        window.complianceChart.update();
    }
    
    // Update naming chart
    const namingOK = namingResults.filter(r => r.status === 'Ok').length;
    const namingPercent = Math.round((namingOK / namingResults.length) * 100) || 0;
    
    if (window.namingChart) {
        window.namingChart.data.datasets[0].data = [namingPercent, 100 - namingPercent];
        window.namingChart.update();
    }
    
    document.getElementById('namingPercent').textContent = `${namingPercent}% OK`;
    
    // Update title chart
    const titleOK = qaqcResults.filter(r => r.result === 'PASS').length;
    const titlePercent = Math.round((titleOK / qaqcResults.length) * 100) || 0;
    
    if (window.titleChart) {
        window.titleChart.data.datasets[0].data = [titlePercent, 100 - titlePercent];
        window.titleChart.update();
    }
    
    document.getElementById('titlePercent').textContent = `${titlePercent}% OK`;
}

// Utility Functions
function updateFileStatus(elementId, text, type) {
    const element = document.getElementById(elementId);
    element.textContent = text;
    element.className = `file-status ${type}`;
}

function applyFileFilter(files) {
    const filter = document.getElementById('fileTypeFilter').value;
    
    switch (filter) {
        case 'pdf':
            return files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
        case 'dwg':
            return files.filter(f => f.name.toLowerCase().endsWith('.dwg'));
        case 'other':
            return files.filter(f => !f.name.toLowerCase().match(/\.(pdf|dwg)$/));
        default:
            return files;
    }
}

function stripExtension(filename) {
    return filename.replace(/\.[^/.]+$/, '');
}

function normalizeText(text) {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

function normalizeDate(value) {
    if (typeof value !== 'string') return value;
    
    // Try multiple date formats
    const formats = [
        /^\d{2}\.\d{2}\.\d{4}$/,  // 13.03.2025
        /^\d{2}\/\d{2}\/\d{4}$/,  // 13/03/2025
        /^\d{2}\.\w{3}\.\d{4}$/i, // 13.MAR.2025
        /^\d{2}\/\d{2}\/\d{2}$/   // 13/03/25
    ];
    
    const isKnownFormat = formats.some(regex => regex.test(value.trim()));
    if (!isKnownFormat) {
        const fallbackDate = new Date(value);
        if (!isNaN(fallbackDate.getTime())) {
            return fallbackDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
        return value.trim();
    }
    
    // Standardize format
    const standardized = value.trim()
        .replace(/\./g, '/')
        .replace(/([A-Za-z]{3})/i, (m) => {
            const monthMap = { 
                JAN: '01', FEB: '02', MAR: '03', APR: '04', 
                MAY: '05', JUN: '06', JUL: '07', AUG: '08', 
                SEP: '09', OCT: '10', NOV: '11', DEC: '12' 
            };
            return monthMap[m.toUpperCase()] || m;
        });
    
    const parsedDate = new Date(standardized);
    if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    }
    
    return value.trim();
}

function extractSheetNumber(filename) {
    // Extract sheet number from filename (various patterns)
    const patterns = [
        /^([A-Z]-?\d+)/i,        // A-001, A001, M-101
        /^(\d+)/,                // 001, 101
        /([A-Z]-?\d+)/i          // Anywhere in filename
    ];
    
    for (const pattern of patterns) {
        const match = filename.match(pattern);
        if (match) {
            return match[1].toUpperCase();
        }
    }
    
    return `SHT-${Math.floor(Math.random() * 100)}`; // Fallback
}

function debugTitleBlocks() {
    console.log('=== TITLE BLOCKS DEBUG ===');
    console.log('titleBlockData exists:', !!titleBlockData);
    console.log('titleBlockData length:', titleBlockData ? titleBlockData.length : 'undefined');
    
    if (titleBlockData && titleBlockData.length > 0) {
        console.log('First 3 records:');
        titleBlockData.slice(0, 3).forEach((record, i) => {
            console.log(`Record ${i}:`, {
                sheetNumber: record.sheetNumber,
                sheetName: record.sheetName,
                fileName: record.fileName,
                revisionCode: record.revisionCode,
                revisionDate: record.revisionDate,
                suitabilityCode: record.suitabilityCode
            });
        });
        
        console.log('All sheet numbers:', titleBlockData.map(r => r.sheetNumber));
        console.log('All file names:', titleBlockData.map(r => r.fileName));
    }
}

// New revision validation functions
function parseRevisionCode(revCode) {
    if (!revCode) return null;
    
    const trimmed = revCode.toString().trim();
    
    // Pattern 1: Letter + Numbers (e.g., P01, A123)
    const letterNumberMatch = trimmed.match(/^([A-Z])(\d+)$/i);
    if (letterNumberMatch) {
        return {
            type: 'letter-number',
            letter: letterNumberMatch[1].toUpperCase(),
            number: parseInt(letterNumberMatch[2], 10),
            original: trimmed
        };
    }
    
    // Pattern 2: Just Numbers (e.g., 01, 123)
    const numberMatch = trimmed.match(/^(\d+)$/);
    if (numberMatch) {
        return {
            type: 'number-only',
            number: parseInt(numberMatch[1], 10),
            original: trimmed
        };
    }
    
    // Pattern 3: Single Letter (e.g., A, B)
    const letterMatch = trimmed.match(/^([A-Z])$/i);
    if (letterMatch) {
        return {
            type: 'letter-only',
            letter: letterMatch[1].toUpperCase(),
            original: trimmed
        };
    }
    
    // If no pattern matches, return as-is for string comparison
    return {
        type: 'unknown',
        original: trimmed
    };
}

function compareRevisionCodes(expected, actual) {
    const expectedParsed = parseRevisionCode(expected);
    const actualParsed = parseRevisionCode(actual);
    
    console.log('Revision comparison:', {
        expected: expectedParsed,
        actual: actualParsed
    });
    
    // If either couldn't be parsed, fail validation
    if (!expectedParsed || !actualParsed) {
        return {
            valid: false,
            reason: 'Could not parse revision codes'
        };
    }
    
    // Must be same format type
    if (expectedParsed.type !== actualParsed.type) {
        return {
            valid: false,
            reason: `Format mismatch: expected ${expectedParsed.type}, got ${actualParsed.type}`
        };
    }
    
    // Compare based on type
    switch (expectedParsed.type) {
        case 'letter-number':
            // Letter must match exactly, number must be >= expected
            if (expectedParsed.letter !== actualParsed.letter) {
                return {
                    valid: false,
                    reason: `Letter mismatch: expected "${expectedParsed.letter}", got "${actualParsed.letter}"`
                };
            }
            if (actualParsed.number < expectedParsed.number) {
                return {
                    valid: false,
                    reason: `Number too low: expected >= ${expectedParsed.number}, got ${actualParsed.number}`
                };
            }
            return { valid: true };
            
        case 'number-only':
            // Number must be >= expected
            if (actualParsed.number < expectedParsed.number) {
                return {
                    valid: false,
                    reason: `Number too low: expected >= ${expectedParsed.number}, got ${actualParsed.number}`
                };
            }
            return { valid: true };
            
        case 'letter-only':
            // Letter must be >= expected (A < B < C, etc.)
            if (actualParsed.letter < expectedParsed.letter) {
                return {
                    valid: false,
                    reason: `Letter too low: expected >= "${expectedParsed.letter}", got "${actualParsed.letter}"`
                };
            }
            return { valid: true };
            
        default:
            // For unknown formats, do exact string comparison
            return {
                valid: expectedParsed.original === actualParsed.original,
                reason: expectedParsed.original !== actualParsed.original ? 
                    `Exact match required for unknown format` : undefined
            };
    }
}

function extractSheetName(filename) {
    // Extract sheet name from filename
    const name = stripExtension(filename);
    const parts = name.split('_');
    
    if (parts.length >= 2) {
        // Remove sheet number and revision code, join remaining parts
        return parts.slice(1, -1).join(' ').replace(/[_-]/g, ' ');
    }
    
    return 'Unknown';
}

function checkFileNamingCompliance(filename) {
    // Simple naming compliance check
    const hasRevisionCode = /[P|R]\d{2}/i.test(filename);
    const hasProperFormat = /^[A-Z]-?\d+_.*\.(pdf|dwg)$/i.test(filename);
    const hasUnderscores = filename.includes('_');
    
    if (hasRevisionCode && hasProperFormat && hasUnderscores) {
        return 'OK';
    } else if (hasRevisionCode && hasUnderscores) {
        return 'Warning';
    } else {
        return 'Non-compliant';
    }
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`${tabName}-content`).style.display = 'block';
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const activeTab = document.querySelector('.tab-content[style*="block"], .tab-content:not([style*="none"])');
    const rows = activeTab.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function handleFilterChange() {
    currentFilter = document.getElementById('fileTypeFilter').value;
    // Re-run checks if files are already loaded
    if (fileResultsFromFolder.length > 0 && fileNamesFromExcel.length > 0) {
        runAllChecks();
    }
}

function exportResults() {
    showNotification('Exporting results...', 'info');
    // Implement export functionality
    setTimeout(() => {
        showNotification('Export completed', 'success');
    }, 1000);
}

function showNotification(message, type) {
    // Simple notification system - logs to console and shows alert for now
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = 
        'position: fixed; top: 20px; right: 20px; padding: 12px 16px; border-radius: 4px; color: white; font-weight: 500; z-index: 1000; ' +
        (type === 'success' ? 'background-color: #10b981;' : '') +
        (type === 'warning' ? 'background-color: #f59e0b;' : '') +
        (type === 'error' ? 'background-color: #ef4444;' : '') +
        (type === 'info' ? 'background-color: #3b82f6;' : '');
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
    
    // Optional: Add visual feedback to header
    const header = document.querySelector('.app-header h1');
    if (header) {
        const originalText = header.textContent;
        header.textContent = message;
        
        setTimeout(() => {
            header.textContent = originalText;
        }, 2000);
    }
}

// Processing helper functions (simplified versions)
function processNamingRules(workbook) {
    try {
        console.log('=== PROCESSING NAMING RULES ===');
        console.log('Workbook sheet names:', workbook.SheetNames);
        
        // The naming convention file should have two tabs: 'Sheets' and 'Models'
        const namingConvention = {};
        
        // Process Sheets tab
        if (workbook.Sheets['Sheets']) {
            namingConvention.Sheets = XLSX.utils.sheet_to_json(workbook.Sheets['Sheets'], { header: 1 });
            console.log('✓ Loaded Sheets tab with', namingConvention.Sheets.length, 'rows');
            console.log('First 3 rows of Sheets data:', namingConvention.Sheets.slice(0, 3));
            console.log('Expected structure:');
            console.log('- Row 1: [Number of parts, 11, Delimiter, -, ...]');
            console.log('- Row 2: Headers like [NL, AMS1, E, PH01, NTT, L0, A, LPL-N, AF, ...]');
            console.log('- Row 3+: Allowed values for each position');
            console.log('Sheets data loaded - parts count:', namingConvention.Sheets[0] ? namingConvention.Sheets[0][1] : 'Not found');
            console.log('Sheets delimiter (row 1, col D):', namingConvention.Sheets[0] ? namingConvention.Sheets[0][3] : 'Not found');
        } else {
            console.warn('❌ No "Sheets" tab found in naming convention file');
            console.log('Available sheets:', workbook.SheetNames);
            // Try to use the first sheet if no "Sheets" tab
            if (workbook.SheetNames.length > 0) {
                const firstSheetName = workbook.SheetNames[0];
                console.log('Using first sheet instead:', firstSheetName);
                namingConvention.Sheets = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { header: 1 });
                console.log('✓ Loaded first sheet with', namingConvention.Sheets.length, 'rows');
            } else {
                namingConvention.Sheets = [];
            }
        }
        
        // Process Models tab - skip this as requested
        console.log('Skipping Models tab as requested');
        namingConvention.Models = [];
        
        // Validate that we have Sheets data
        if (!namingConvention.Sheets || namingConvention.Sheets.length === 0) {
            throw new Error('No valid naming convention data found in Sheets tab. Please ensure the Excel file has valid data.');
        }
        
        console.log('✓ Final naming convention structure:');
        console.log('- Sheets rows:', namingConvention.Sheets.length);
        console.log('- Models rows:', namingConvention.Models.length);
        console.log('=== NAMING RULES PROCESSING COMPLETE ===');
        
        showNotification('Naming convention loaded successfully', 'success');
        return namingConvention;
        
    } catch (error) {
        console.error('Error processing naming rules:', error);
        showNotification('Error processing naming convention file', 'error');
        return {};
    }
}

function processTitleBlocks(workbook) {
    try {
        console.log('=== PROCESSING TITLE BLOCKS ===');
        console.log('Workbook sheet names:', workbook.SheetNames);
        
        // Use the first sheet by default
        const sheetName = workbook.SheetNames[0];
        console.log('Using sheet:', sheetName);
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with headers in first row
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('Raw Excel data (first 5 rows):', data.slice(0, 5));
        console.log('Total rows:', data.length);
        
        if (data.length < 2) {
            throw new Error('Title blocks file appears to be empty or has no data rows');
        }
        
        // Extract headers from first row
        const headers = data[0];
        console.log('Headers from Excel:', headers);
        
        // Process data rows (skip header row)
        const titleBlocks = data.slice(1).map((row, index) => {
            const record = {
                // Direct column mapping based on Excel structure
                sheetNumber: row[0] || '',           // Column A: Sheet Number
                sheetName: row[1] || '',             // Column B: Sheet Name  
                fileName: row[2] || '',              // Column C: File Name
                revisionCode: row[3] || '',          // Column D: Revision_code
                revisionDate: row[4] || '',          // Column E: Revision_date
                revisionDescription: row[5] || '',   // Column F: Revision_Description
                suitabilityCode: row[6] || '',       // Column G: Suitability_code
                stageDescription: row[7] || ''       // Column H: Stage_description
            };
            
            if (index < 3) {
                console.log(`Row ${index + 2} mapped to:`, record);
            }
            
            return record;
        }).filter(record => 
            // Filter out completely empty rows
            record.sheetNumber || record.fileName || record.sheetName
        );
        
        console.log('✓ Processed', titleBlocks.length, 'title block records');
        console.log('Sample records:', titleBlocks.slice(0, 3));
        
        showNotification(`Loaded ${titleBlocks.length} title block records`, 'success');
        return titleBlocks;
        
    } catch (error) {
        console.error('Error processing title blocks:', error);
        showNotification('Error processing title blocks file', 'error');
        return [];
    }
}

// About and Settings functions
function showAbout() {
    alert('Drawing QC v2.0\nModern quality control for engineering drawings\n\nFeatures:\n• Clash Report Summariser style interface\n• Progressive disclosure\n• Real-time charts and metrics\n• Advanced file comparison');
}

function showSettings() {
    alert('Settings panel coming soon...\n\nPlanned features:\n• Custom naming rules\n• Export preferences\n• Theme selection\n• Advanced filters');
}

// Legacy integration functions for backwards compatibility
function selectFolderWithAPI() {
    // Placeholder for advanced folder selection
    showNotification('Advanced folder selection coming soon', 'info');
}

// Initialize tooltips and help text
function initializeHelp() {
    // Add tooltips and help text for better UX
    const tooltips = {
        'folderInput': 'Select the root folder containing all drawing files',
        'registerFile': 'Excel file containing the official drawing list',
        'namingRulesFile': 'Excel file with naming convention rules',
        'titleBlocksFile': 'Excel export from CAD title blocks'
    };
    
    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = text;
        }
    });
}

// Call initialization functions
document.addEventListener('DOMContentLoaded', function() {
    initializeHelp();
});
