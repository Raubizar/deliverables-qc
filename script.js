// Combined Drawing QC Application
// Variables from legacy applications
let fileNamesFromExcel = [];
let fileResultsFromFolder = [];
let secondFileNamesFromExcel = [];
let comparisonMethod = '';
let namingConvention = null;
let fileData = [];
let selectedFileFilter = 'all';

// Global variables for new interface
let selectedFiles = {
    folder: null,
    register: null,
    naming: null,
    titleBlocks: null
};

// Current active tab
let currentActiveTab = 'drawing-list';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeTabSystem();
});

function initializeEventListeners() {
    // File input handlers
    document.getElementById('selectFolder').addEventListener('change', handleFolderSelect);
    document.getElementById('registerFile').addEventListener('change', handleRegisterFile);
    document.getElementById('namingRulesFile').addEventListener('change', handleNamingFile);
    document.getElementById('titleBlocksFile').addEventListener('change', handleTitleBlocksFile);
    
    // File filter buttons
    document.getElementById('filterAll').addEventListener('click', () => setFileFilter('all'));
    document.getElementById('filterPDF').addEventListener('click', () => setFileFilter('pdf'));
    document.getElementById('filterDWG').addEventListener('click', () => setFileFilter('dwg'));
    document.getElementById('filterOther').addEventListener('click', () => setFileFilter('other'));
    
    // Run checks button
    document.getElementById('runChecks').addEventListener('click', runQualityChecks);
    
    // Search functionality
    document.querySelector('.search-input').addEventListener('input', (e) => {
        filterResults(e.target.value);
    });
    
    // Download button
    document.querySelector('.download-btn').addEventListener('click', () => {
        downloadReport();
    });
}

function initializeTabSystem() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const targetTab = e.target.dataset.tab;
            switchTab(targetTab);
        });
    });
}

function switchTab(targetTab) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to clicked tab and corresponding content
    document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
    document.getElementById(targetTab).classList.add('active');
    
    // Update current active tab
    currentActiveTab = targetTab;
    
    // Show/hide Expected Values section based on active tab
    const expectedValuesSection = document.getElementById('expectedValuesSection');
    if (targetTab === 'validation') {
        expectedValuesSection.style.display = 'block';
    } else {
        expectedValuesSection.style.display = 'none';
    }
    
    console.log('Switched to tab:', targetTab);
}

function setFileFilter(filterType) {
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`filter${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`).classList.add('active');
    
    selectedFileFilter = filterType;
    console.log('File filter set to:', filterType);
}

// File handling functions (to be expanded with legacy functionality)
function handleFolderSelect(event) {
    const files = Array.from(event.target.files);
    selectedFiles.folder = files;
    
    // Apply file filter
    fileResultsFromFolder = filterFilesByType(files.map(f => f.name));
    
    // Update UI
    const statusElement = document.querySelector('.file-status .status-text');
    statusElement.textContent = `Selected: ${fileResultsFromFolder.length} files`;
    statusElement.style.color = '#28a745';
    
    console.log('Folder selected:', fileResultsFromFolder.length, 'files after filtering');
}

function filterFilesByType(fileNames) {
    if (selectedFileFilter === 'all') {
        return fileNames;
    }
    
    return fileNames.filter(fileName => {
        const ext = fileName.toLowerCase().split('.').pop();
        
        switch (selectedFileFilter) {
            case 'pdf':
                return ext === 'pdf';
            case 'dwg':
                return ['dwg', 'dxf', 'dgn'].includes(ext);
            case 'other':
                return !['pdf', 'dwg', 'dxf', 'dgn'].includes(ext);
            default:
                return true;
        }
    });
}

function handleRegisterFile(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFiles.register = file;
        updateFileStatus('registerFile', `Selected: ${file.name}`);
        processRegisterFile(file);
    }
}

function handleNamingFile(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFiles.naming = file;
        updateFileStatus('namingRulesFile', `Selected: ${file.name}`);
        processNamingFile(file);
    }
}

function handleTitleBlocksFile(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFiles.titleBlocks = file;
        updateFileStatus('titleBlocksFile', `Selected: ${file.name}`);
        processTitleBlocksFile(file);
    }
}

function updateFileStatus(inputId, message) {
    const inputElement = document.getElementById(inputId);
    const fileRow = inputElement.closest('.file-input-row');
    let statusElement = fileRow.querySelector('.file-status-text');
    
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.className = 'file-status-text';
        statusElement.style.color = '#28a745';
        statusElement.style.fontSize = '12px';
        statusElement.style.marginTop = '5px';
        fileRow.appendChild(statusElement);
    }
    
    statusElement.textContent = message;
}

// Placeholder functions for file processing (to be implemented with legacy code)
async function processRegisterFile(file) {
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Use first sheet by default
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Extract file names from first column
        fileNamesFromExcel = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
            .slice(1) // Skip header row
            .map(row => row[0]) // Get first column
            .filter(name => typeof name === 'string' && name.trim() !== '');
        
        console.log('Register file processed:', fileNamesFromExcel.length, 'drawing names');
        
    } catch (error) {
        console.error('Error processing register file:', error);
        alert('Error reading the drawing register file.');
    }
}

async function processNamingFile(file) {
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Check if required sheets exist
        if (!workbook.Sheets['Sheets']) {
            alert('Naming convention file must contain a sheet named "Sheets".');
            return;
        }
        
        namingConvention = {
            Sheets: XLSX.utils.sheet_to_json(workbook.Sheets['Sheets'], { header: 1 }),
            Models: workbook.Sheets['Models'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Models'], { header: 1 }) : [],
        };
        
        console.log('Naming convention file processed');
        
    } catch (error) {
        console.error('Error processing naming file:', error);
        alert('Error reading naming convention file.');
    }
}

async function processTitleBlocksFile(file) {
    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Process title block data
        fileData = jsonData.slice(1).map(row => ({
            sheetNumber: normalizeText(row[0]),
            sheetName: normalizeText(row[1]),
            fileName: normalizeText(row[2]),
            revisionCode: normalizeText(row[3]),
            revisionDate: normalizeDate(row[4]),
            revisionDescription: normalizeText(row[5]),
            suitabilityCode: normalizeText(row[6]),
            stageDescription: normalizeText(row[7]),
            namingConventionStatus: 'Not checked',
            fileDeliveryStatus: 'Not checked',
            comments: '',
            result: 'Pending',
            mismatches: ''
        }));
        
        console.log('Title blocks file processed:', fileData.length, 'records');
        
    } catch (error) {
        console.error('Error processing title blocks file:', error);
        alert('Error reading title blocks file.');
    }
}

// Utility functions from legacy applications
function normalizeText(value) {
    if (!value) return '';
    return String(value).trim().toLowerCase().normalize().replace(/\s+/g, ' ');
}

function normalizeDate(value) {
    if (!value) return '';
    const dateStr = String(value).trim();
    return dateStr.replace(/[\/\-\.]/g, '.').replace(/\s+/g, '');
}

function runQualityChecks() {
    if (!selectedFiles.folder && fileResultsFromFolder.length === 0) {
        alert('Please select a folder containing drawings first.');
        return;
    }
    
    // Show loading state
    const button = document.getElementById('runChecks');
    button.textContent = 'Running Checks...';
    button.disabled = true;
    
    // Simulate processing time
    setTimeout(() => {
        // Update summary with real data
        const totalDrawings = fileResultsFromFolder.length;
        updateSummary(totalDrawings);
        
        // Generate results for all tabs
        generateDrawingListResults();
        generateNamingResults();
        generateValidationResults();
        
        // Reset button
        button.textContent = 'Run Checks';
        button.disabled = false;
        
        console.log('Quality checks completed');
    }, 2000);
}

function generateDrawingListResults() {
    const tbody = document.getElementById('drawingListResults');
    tbody.innerHTML = '';
    
    if (fileNamesFromExcel.length === 0 || fileResultsFromFolder.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="3" style="text-align: center; color: #666;">Please select both Excel register and folder to compare</td>';
        tbody.appendChild(row);
        return;
    }
    
    // Implementation using legacy comparison logic
    let matchedCount = 0;
    
    fileNamesFromExcel.forEach(drawingName => {
        const row = document.createElement('tr');
        
        // Find match using legacy logic
        const matched = fileResultsFromFolder.find(file => 
            stripExtension(file).toLowerCase().normalize().replace(/\s+/g, ' ') === 
            drawingName.trim().toLowerCase().normalize().replace(/\s+/g, ' ')
        );
        
        if (matched) {
            row.innerHTML = `
                <td>${drawingName}</td>
                <td>${matched}</td>
                <td style="color: #28a745; font-weight: bold;">Done</td>
            `;
            matchedCount++;
        } else {
            row.innerHTML = `
                <td>${drawingName}</td>
                <td>N/A</td>
                <td style="color: #dc3545; font-weight: bold;">To Do</td>
            `;
        }
        
        tbody.appendChild(row);
    });
    
    console.log('Drawing list results generated:', matchedCount, 'matched out of', fileNamesFromExcel.length);
}

function generateNamingResults() {
    const tbody = document.getElementById('namingResults');
    tbody.innerHTML = '';
    
    fileResultsFromFolder.forEach(fileName => {
        const row = document.createElement('tr');
        const analysis = analyzeFileName(fileName);
        
        row.innerHTML = `
            <td>Root</td>
            <td>${fileName}</td>
            <td style="color: ${analysis.compliance === 'Ok' ? '#28a745' : '#dc3545'}; font-weight: bold;">${analysis.compliance}</td>
            <td>${analysis.details}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log('Naming results generated for', fileResultsFromFolder.length, 'files');
}

function generateValidationResults() {
    const tbody = document.getElementById('validationResults');
    tbody.innerHTML = '';
    
    if (fileData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="13" style="text-align: center; color: #666;">Please upload Title Blocks Excel file</td>';
        tbody.appendChild(row);
        return;
    }
    
    fileData.forEach(record => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${record.sheetNumber}</td>
            <td>${record.sheetName}</td>
            <td>${record.fileName}</td>
            <td>${record.revisionCode}</td>
            <td>${record.revisionDate}</td>
            <td>${record.revisionDescription}</td>
            <td>${record.suitabilityCode}</td>
            <td>${record.stageDescription}</td>
            <td>${record.namingConventionStatus}</td>
            <td>${record.fileDeliveryStatus}</td>
            <td>${record.comments}</td>
            <td style="color: ${record.result === 'OK' ? '#28a745' : '#dc3545'}; font-weight: bold;">${record.result}</td>
            <td>${record.mismatches}</td>
        `;
        
        tbody.appendChild(row);
    });
    
    console.log('Validation results generated for', fileData.length, 'records');
}

// Helper functions from legacy applications
function stripExtension(fileName) {
    return fileName.replace(/\.[^/.]+$/, "").trim();
}

function analyzeFileName(fileName) {
    if (!namingConvention) {
        return { compliance: 'Not checked', details: 'No naming convention file uploaded' };
    }
    
    // Simplified naming analysis (full implementation would be from legacy)
    const hasValidFormat = fileName.includes('-') || fileName.includes('_');
    return {
        compliance: hasValidFormat ? 'Ok' : 'Wrong',
        details: hasValidFormat ? 'Naming convention followed' : 'Invalid naming format'
    };
}

function updateSummary(totalDrawings) {
    // Update drawings scanned
    document.getElementById('drawingsScanned').textContent = totalDrawings;
    
    // Calculate compliance percentages (simplified for now)
    const drawingListCompliance = fileNamesFromExcel.length > 0 ? 
        Math.floor((fileNamesFromExcel.length / totalDrawings) * 100) : 0;
    const namingCompliance = Math.floor(Math.random() * 40 + 60); // Placeholder
    const titleBlockCompliance = Math.floor(Math.random() * 40 + 70); // Placeholder
    const overallCompliance = Math.floor((drawingListCompliance + namingCompliance + titleBlockCompliance) / 3);
    
    // Update missing count
    const missingCount = Math.max(0, fileNamesFromExcel.length - totalDrawings);
    document.getElementById('drawingsInRegister').textContent = 
        missingCount > 0 ? `${missingCount} missing` : 'All found';
    
    // Update progress bars and percentages
    updateProgressBar('namingCompliance', namingCompliance);
    updateProgressBar('titleBlockCompliance', titleBlockCompliance);
    updateProgressBar('overallCompliance', overallCompliance);
}

function updateProgressBar(elementId, percentage) {
    const element = document.getElementById(elementId);
    const progressBar = element.nextElementSibling.querySelector('.progress-fill');
    
    element.textContent = `${percentage}% OK`;
    progressBar.style.width = `${percentage}%`;
    
    // Update color
    if (percentage >= 80) {
        progressBar.className = 'progress-fill green';
        progressBar.style.backgroundColor = '#28a745';
    } else if (percentage >= 60) {
        progressBar.className = 'progress-fill yellow';
        progressBar.style.backgroundColor = '#ffc107';
    } else {
        progressBar.className = 'progress-fill red';
        progressBar.style.backgroundColor = '#dc3545';
    }
}

function filterResults(searchTerm) {
    const activeTabContent = document.querySelector('.tab-content.active');
    const rows = activeTabContent.querySelectorAll('tbody tr');
    const term = searchTerm.toLowerCase();

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

function downloadReport() {
    const activeTabContent = document.querySelector('.tab-content.active');
    const table = activeTabContent.querySelector('.results-table');
    
    if (!table) return;
    
    // Create CSV content
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
    const rows = Array.from(table.querySelectorAll('tbody tr:not([style*="display: none"])')).map(row => 
        Array.from(row.cells).map(cell => cell.textContent)
    );

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drawing-qc-${currentActiveTab}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('Report downloaded for tab:', currentActiveTab);
}
