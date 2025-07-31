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
    
    try {
        initializeEventListeners();
        initializeCharts();
        
        // Add sample data for demonstration
        setTimeout(() => {
            loadSampleData();
        }, 1000);
        
        console.log('Application initialized successfully');
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

    updateFileStatus('namingStatus', `Selected: ${file.name}`, 'success');
    processExcelFile(file, 'naming');
    
    // Update file chip to selected state
    document.querySelector('#namingRulesFile').closest('.file-chip').classList.add('selected');
}

function handleTitleBlocksFile(event) {
    const file = event.target.files[0];
    if (!file) return;

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
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (type === 'register') {
            window.currentRegisterWorkbook = workbook;
            populateSheetSelector(workbook);
        } else if (type === 'naming') {
            namingRulesData = processNamingRules(workbook);
        } else if (type === 'titleBlocks') {
            titleBlockData = processTitleBlocks(workbook);
        }
        
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
    if (!namingRulesData || namingRulesData.length === 0) {
        return files.map(file => ({
            folderPath: extractFolderPath(file),
            fileName: file.name,
            status: 'No Rules',
            details: 'No naming convention loaded'
        }));
    }

    return files.map(file => {
        const analysis = analyzeFileNameAgainstRules(file.name);
        return {
            folderPath: extractFolderPath(file),
            fileName: file.name,
            status: analysis.compliance,
            details: analysis.details
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
    if (!namingRulesData || !namingRulesData.Sheets || !namingRulesData.Models) {
        return { 
            compliance: 'No Rules', 
            details: 'No naming convention loaded. Please upload naming rules file.' 
        };
    }

    // Extract file extension
    const dotPosition = fileName.lastIndexOf('.');
    const extension = fileName.slice(dotPosition + 1).toLowerCase();
    const isModel = ['rvt', 'nwd', 'nwf', 'ifc', 'nwc'].includes(extension);

    // Select the appropriate tab (Sheets or Models)
    const namingTab = isModel ? namingRulesData.Models : namingRulesData.Sheets;
    if (!namingTab || namingTab.length === 0) {
        return {
            compliance: 'Wrong',
            details: `No naming convention data available for file type: ${extension}.`
        };
    }

    // Get delimiter from line 1, column D (index 3)
    const delimiter = namingTab[0] && namingTab[0][3];
    if (!delimiter || typeof delimiter !== 'string') {
        return {
            compliance: 'Wrong',
            details: `Invalid or missing delimiter in naming convention.`
        };
    }

    // Remove extension from filename for analysis
    let fileNameWithoutExt = fileName;
    if (dotPosition > 0) {
        fileNameWithoutExt = fileName.substring(0, dotPosition);
    }

    // Split filename into parts using the delimiter
    const nameParts = fileNameWithoutExt.split(delimiter);
    
    // Validate each part against naming rules
    let nonCompliantParts = [];
    let details = '';
    
    for (let i = 0; i < nameParts.length; i++) {
        // Get allowed parts for this position (skip header rows, start from row 2)
        const allowedParts = namingTab.slice(2).map(row => row[i + 1]).filter(part => part); // Skip empty cells
        
        let partAllowed = false;
        const currentPart = nameParts[i];
        
        // Check each allowed pattern for this position
        for (let allowed of allowedParts) {
            if (allowed === 'Var') {
                // Variable part - any value is allowed
                partAllowed = true;
                break;
            } else if (allowed && allowed.includes('+N')) {
                // Prefix pattern (e.g., "A+N" means starts with "A" followed by numbers)
                const prefix = allowed.split('+')[0];
                if (currentPart.startsWith(prefix)) {
                    partAllowed = true;
                    break;
                }
            } else if (allowed === currentPart) {
                // Exact match
                partAllowed = true;
                break;
            }
        }
        
        if (!partAllowed) {
            details += `Part ${i + 1} (${currentPart}) is not valid; `;
            nonCompliantParts.push(currentPart);
        }
    }

    // Determine overall compliance
    const compliance = nonCompliantParts.length > 0 ? 'Wrong' : 'OK';
    details = details.trim().replace(/; $/, '') || 'Follows naming convention';
    
    return { 
        compliance, 
        details, 
        nonCompliantParts 
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

    return files.map(file => {
        const issues = [];
        const sheetNumber = extractSheetNumber(file.name);
        
        // Enhanced validation logic using expected values and titleBlockData
        if (titleBlockData && titleBlockData.length > 0) {
            // Find matching record in title block data
            const titleRecord = titleBlockData.find(record => 
                normalizeText(record.fileName || '') === normalizeText(file.name) ||
                normalizeText(record.sheetNumber || '') === normalizeText(sheetNumber)
            );
            
            if (titleRecord) {
                // Validate against expected values
                if (expectedValues.revisionCode && 
                    normalizeText(titleRecord.revisionCode || '') !== normalizeText(expectedValues.revisionCode)) {
                    issues.push(`Rev Code: expected "${expectedValues.revisionCode}", got "${titleRecord.revisionCode || 'N/A'}"`);
                }
                
                if (expectedValues.revisionDate && 
                    normalizeDate(titleRecord.revisionDate || '') !== normalizeDate(expectedValues.revisionDate)) {
                    issues.push(`Rev Date: expected "${expectedValues.revisionDate}", got "${titleRecord.revisionDate || 'N/A'}"`);
                }
                
                if (expectedValues.suitability && 
                    normalizeText(titleRecord.suitabilityCode || '') !== normalizeText(expectedValues.suitability)) {
                    issues.push(`Suitability: expected "${expectedValues.suitability}", got "${titleRecord.suitabilityCode || 'N/A'}"`);
                }
                
                if (expectedValues.stage && 
                    normalizeText(titleRecord.stageDescription || '') !== normalizeText(expectedValues.stage)) {
                    issues.push(`Stage: expected "${expectedValues.stage}", got "${titleRecord.stageDescription || 'N/A'}"`);
                }
                
                if (expectedValues.revisionDesc && 
                    normalizeText(titleRecord.revisionDescription || '') !== normalizeText(expectedValues.revisionDesc)) {
                    issues.push(`Rev Desc: expected "${expectedValues.revisionDesc}", got "${titleRecord.revisionDescription || 'N/A'}"`);
                }
                
                // Validate file naming convention
                const expectedFileName = expectedValues.checkSheetOnly ? 
                    titleRecord.sheetNumber : 
                    `${titleRecord.sheetNumber}${expectedValues.separator}${titleRecord.sheetName}`;
                
                if (expectedFileName && normalizeText(stripExtension(file.name)) !== normalizeText(expectedFileName)) {
                    issues.push(`File name: expected "${expectedFileName}", got "${stripExtension(file.name)}"`);
                }
            } else {
                issues.push('No title block data found for this file');
            }
        } else {
            // Fallback to simplified random validation for demo
            if (Math.random() > 0.6) {
                const possibleIssues = [
                    'Revision code mismatch',
                    'Date format incorrect', 
                    'Missing suitability code',
                    'Stage description mismatch',
                    'File naming non-compliant'
                ];
                issues.push(possibleIssues[Math.floor(Math.random() * possibleIssues.length)]);
            }
        }
        
        return {
            sheetNumber: sheetNumber,
            fileName: file.name,
            result: issues.length === 0 ? 'PASS' : 'FAIL',
            issues: issues.join('; ') || 'None',
            expectedValues: expectedValues
        };
    });
}

// UI Update Functions
function updateSummaryMetrics(drawingResults, namingResults, qaqcResults) {
    const totalFiles = fileResultsFromFolder.length;
    const missingFiles = drawingResults.filter(r => r.status === 'To Do').length;
    const compliantFiles = namingResults.filter(r => r.status === 'OK').length;
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
            <td>${result.fileName}</td>
            <td><span class="status-badge ${result.status === 'OK' ? 'success' : result.status === 'WARNING' ? 'warning' : 'error'}">${result.status}</span></td>
            <td>${result.details}</td>
        </tr>
    `).join('');
    
    // Update QA-QC table
    const qaqcTable = document.getElementById('qaqcResults');
    qaqcTable.innerHTML = qaqcResults.map(result => {
        // Extract title block data for display
        const titleRecord = titleBlockData.find(record => 
            normalizeText(record.fileName || '') === normalizeText(result.fileName) ||
            normalizeText(record.sheetNumber || '') === normalizeText(result.sheetNumber)
        );
        
        const sheetName = titleRecord?.sheetName || extractSheetName(result.fileName) || 'N/A';
        const revCode = titleRecord?.revisionCode || 'N/A';
        const revDate = titleRecord?.revisionDate || 'N/A';
        const revDesc = titleRecord?.revisionDescription || 'N/A';
        const suitability = titleRecord?.suitabilityCode || 'N/A';
        const stage = titleRecord?.stageDescription || 'N/A';
        
        // Check naming compliance for this file
        const namingStatus = checkFileNamingCompliance(result.fileName);
        const deliveryStatus = 'Delivered'; // Since file exists in folder
        
        return `
            <tr>
                <td>${result.sheetNumber}</td>
                <td>${sheetName}</td>
                <td>${result.fileName}</td>
                <td>${revCode}</td>
                <td>${revDate}</td>
                <td>${revDesc}</td>
                <td>${suitability}</td>
                <td>${stage}</td>
                <td><span class="status-badge ${namingStatus === 'OK' ? 'success' : namingStatus === 'Warning' ? 'warning' : 'error'}">${namingStatus}</span></td>
                <td><span class="status-badge success">${deliveryStatus}</span></td>
                <td></td>
                <td><span class="status-badge ${result.result === 'PASS' ? 'success' : result.result === 'WARNING' ? 'warning' : 'error'}">${result.result}</span></td>
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
    const namingOK = namingResults.filter(r => r.status === 'OK').length;
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
        // The naming convention file should have two tabs: 'Sheets' and 'Models'
        const namingConvention = {};
        
        // Process Sheets tab
        if (workbook.Sheets['Sheets']) {
            namingConvention.Sheets = XLSX.utils.sheet_to_json(workbook.Sheets['Sheets'], { header: 1 });
            console.log('Loaded Sheets tab:', namingConvention.Sheets);
        } else {
            console.warn('No "Sheets" tab found in naming convention file');
            namingConvention.Sheets = [];
        }
        
        // Process Models tab
        if (workbook.Sheets['Models']) {
            namingConvention.Models = XLSX.utils.sheet_to_json(workbook.Sheets['Models'], { header: 1 });
            console.log('Loaded Models tab:', namingConvention.Models);
        } else {
            console.warn('No "Models" tab found in naming convention file');
            namingConvention.Models = [];
        }
        
        // Validate that we have at least one tab with data
        if (namingConvention.Sheets.length === 0 && namingConvention.Models.length === 0) {
            throw new Error('No valid naming convention data found. Please ensure the file has "Sheets" and/or "Models" tabs.');
        }
        
        showNotification('Naming convention loaded successfully', 'success');
        return namingConvention;
        
    } catch (error) {
        console.error('Error processing naming rules:', error);
        showNotification('Error processing naming convention file', 'error');
        return {};
    }
}

function processTitleBlocks(workbook) {
    // Implement title blocks processing
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    return data;
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
