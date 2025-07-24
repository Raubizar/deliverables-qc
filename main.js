// Mock Results Data
const mockResults = {
    summary: {
        compliance: 87,
        drawingsScanned: 245,
        missing: 8,
        expectedFiles: 253,
        namingCompliance: 94,
        titleBlockCompliance: 89
    },
    tables: {
        missing: [
            { expectedFile: "DWG-001-Rev-A.pdf", found: false, registerRow: 15 },
            { expectedFile: "DWG-002-Rev-B.pdf", found: false, registerRow: 32 },
            { expectedFile: "DWG-045-Rev-C.pdf", found: false, registerRow: 87 },
            { expectedFile: "ARCH-101-Rev-A.pdf", found: false, registerRow: 124 },
            { expectedFile: "STRUCT-201-Rev-B.pdf", found: false, registerRow: 156 }
        ],
        naming: [
            { 
                folderPath: "/project/structural", 
                fileName: "beam_detail.pdf", 
                errorType: "Invalid Format", 
                details: "Missing revision code",
                status: "fail"
            },
            { 
                folderPath: "/project/mechanical", 
                fileName: "hvac-layout.pdf", 
                errorType: "Case Mismatch", 
                details: "Should be uppercase",
                status: "fail"
            },
            { 
                folderPath: "/project/electrical", 
                fileName: "power_dist.pdf", 
                errorType: "Special Characters", 
                details: "Underscore not allowed",
                status: "fail"
            },
            { 
                folderPath: "/project/civil", 
                fileName: "site-plan.pdf", 
                errorType: "Hyphen Usage", 
                details: "Use dash instead of hyphen",
                status: "warn"
            }
        ],
        titleblock: [
            { 
                sheetNo: "S-001", 
                sheetName: "Foundation Plan", 
                fileName: "foundation.pdf", 
                detectedRevCode: "A", 
                revDate: "2024-01-15", 
                revDesc: "Initial Issue", 
                suitabilityCode: "S3", 
                stageDesc: "Construction", 
                status: "pass" 
            },
            { 
                sheetNo: "A-101", 
                sheetName: "Floor Plan Level 1", 
                fileName: "floor-plan-l1.pdf", 
                detectedRevCode: "B", 
                revDate: "2024-02-10", 
                revDesc: "Design Updates", 
                suitabilityCode: "S2", 
                stageDesc: "Design Development", 
                status: "pass" 
            },
            { 
                sheetNo: "M-201", 
                sheetName: "HVAC Layout", 
                fileName: "hvac-plan.pdf", 
                detectedRevCode: "C", 
                revDate: "2024-03-05", 
                revDesc: "Equipment Changes", 
                suitabilityCode: "S4", 
                stageDesc: "As Built", 
                status: "fail" 
            },
            { 
                sheetNo: "E-301", 
                sheetName: "Power Distribution", 
                fileName: "power-dist.pdf", 
                detectedRevCode: "-", 
                revDate: "", 
                revDesc: "Missing title block", 
                suitabilityCode: "", 
                stageDesc: "", 
                status: "fail" 
            }
        ],
        all: [
            { 
                checkType: "Missing Files", 
                fileName: "DWG-001-Rev-A.pdf", 
                status: "fail", 
                comment: "File not found in directory" 
            },
            { 
                checkType: "Naming", 
                fileName: "beam_detail.pdf", 
                status: "fail", 
                comment: "Missing revision code in filename" 
            },
            { 
                checkType: "Title Block", 
                fileName: "hvac-plan.pdf", 
                status: "fail", 
                comment: "Incorrect suitability code" 
            },
            { 
                checkType: "Naming", 
                fileName: "site-plan.pdf", 
                status: "warn", 
                comment: "Use dash instead of hyphen" 
            },
            { 
                checkType: "Title Block", 
                fileName: "foundation.pdf", 
                status: "pass", 
                comment: "All checks passed" 
            }
        ]
    }
};

// DOM Elements
const elements = {
    progressBar: document.getElementById('progress-bar'),
    progressFill: document.querySelector('.progress-fill'),
    folderBtn: document.getElementById('folder-btn'),
    registerFile: document.getElementById('register-file'),
    namingFile: document.getElementById('naming-file'),
    titleblockFile: document.getElementById('titleblock-file'),
    runChecksBtn: document.getElementById('run-checks'),
    summaryCard: document.getElementById('summary-card'),
    resultsViewer: document.getElementById('results-viewer'),
    searchInput: document.getElementById('search-input'),
    downloadBtn: document.getElementById('download-btn'),
    segmentButtons: document.querySelectorAll('.segment'),
    tabPanes: document.querySelectorAll('.tab-pane')
};

// State
let currentData = null;
let currentTab = 'missing';
let searchTerm = '';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkFormValidity();
});

// Event Listeners
function setupEventListeners() {
    // File inputs
    elements.folderBtn.addEventListener('click', handleFolderSelect);
    elements.registerFile.addEventListener('change', checkFormValidity);
    elements.namingFile.addEventListener('change', checkFormValidity);
    elements.titleblockFile.addEventListener('change', checkFormValidity);
    
    // Run checks button
    elements.runChecksBtn.addEventListener('click', handleRunChecks);
    
    // Search input
    elements.searchInput.addEventListener('input', handleSearch);
    
    // Download button
    elements.downloadBtn.addEventListener('click', handleDownload);
    
    // Segmented control
    elements.segmentButtons.forEach(button => {
        button.addEventListener('click', () => handleTabChange(button.dataset.tab));
    });
}

// Handlers
function handleFolderSelect() {
    // Simulate folder selection
    elements.folderBtn.textContent = '/example/project/drawings';
    elements.folderBtn.style.color = 'hsl(var(--accent))';
    checkFormValidity();
}

function checkFormValidity() {
    const hasFolder = elements.folderBtn.textContent !== 'Choose Folder';
    const hasRegister = elements.registerFile.files.length > 0;
    const hasNaming = elements.namingFile.files.length > 0;
    const hasTitleblock = elements.titleblockFile.files.length > 0;
    
    elements.runChecksBtn.disabled = !(hasFolder && hasRegister && hasNaming && hasTitleblock);
}

async function handleRunChecks() {
    // Show progress bar
    elements.progressBar.classList.remove('hidden');
    elements.progressFill.style.width = '0%';
    
    // Disable button
    elements.runChecksBtn.disabled = true;
    elements.runChecksBtn.textContent = 'Processing...';
    
    // Animate progress bar
    setTimeout(() => {
        elements.progressFill.style.width = '100%';
    }, 100);
    
    // Wait for progress animation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Hide progress bar
    setTimeout(() => {
        elements.progressBar.classList.add('hidden');
    }, 500);
    
    // Show results
    currentData = mockResults;
    displaySummary();
    displayResults();
    
    // Reset button
    elements.runChecksBtn.disabled = false;
    elements.runChecksBtn.textContent = 'Run Checks';
}

function displaySummary() {
    // Update gauge
    const gauge = document.querySelector('.gauge-progress');
    const percentage = currentData.summary.compliance;
    const circumference = 2 * Math.PI * 52; // radius = 52
    const offset = circumference - (percentage / 100) * circumference;
    gauge.style.strokeDashoffset = offset;
    
    // Update gauge text
    document.querySelector('.gauge-percentage').textContent = `${percentage}%`;
    
    // Update metrics
    const metrics = document.querySelectorAll('.metric-value');
    metrics[0].textContent = currentData.summary.drawingsScanned;
    metrics[1].textContent = `${currentData.summary.missing} missing`;
    metrics[2].textContent = `${currentData.summary.namingCompliance}% OK`;
    metrics[3].textContent = `${currentData.summary.titleBlockCompliance}% OK`;
    
    // Update mini charts
    const barFill = document.querySelector('.bar-fill');
    const missingPercentage = (currentData.summary.missing / currentData.summary.expectedFiles) * 100;
    barFill.style.width = `${missingPercentage}%`;
    
    const doughnuts = document.querySelectorAll('.mini-doughnut-progress');
    const namingOffset = 91.11 - (currentData.summary.namingCompliance / 100) * 91.11;
    const titleBlockOffset = 91.11 - (currentData.summary.titleBlockCompliance / 100) * 91.11;
    doughnuts[0].style.strokeDashoffset = namingOffset;
    doughnuts[1].style.strokeDashoffset = titleBlockOffset;
    
    // Show summary card
    elements.summaryCard.classList.remove('hidden');
}

function displayResults() {
    populateTable('missing', currentData.tables.missing);
    populateTable('naming', currentData.tables.naming);
    populateTable('titleblock', currentData.tables.titleblock);
    populateTable('all', currentData.tables.all);
    
    // Show results viewer
    elements.resultsViewer.classList.remove('hidden');
}

function populateTable(tableName, data) {
    const tbody = document.getElementById(`${tableName}-tbody`);
    tbody.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        
        // Add row class based on status
        if (row.status === 'fail' || row.found === false) {
            tr.classList.add('row-fail');
        } else if (row.status === 'warn') {
            tr.classList.add('row-warn');
        } else if (row.status === 'pass') {
            tr.classList.add('row-pass');
        }
        
        let cells = '';
        
        switch (tableName) {
            case 'missing':
                cells = `
                    <td>${row.expectedFile}</td>
                    <td>
                        <div class="status-icon">
                            ${getStatusIcon(row.found ? 'pass' : 'fail')}
                        </div>
                    </td>
                    <td>${row.registerRow}</td>
                `;
                break;
                
            case 'naming':
                cells = `
                    <td>${row.folderPath}</td>
                    <td style="font-weight: 500;">${row.fileName}</td>
                    <td>${row.errorType}</td>
                    <td>${row.details}</td>
                `;
                break;
                
            case 'titleblock':
                cells = `
                    <td>${row.sheetNo}</td>
                    <td style="font-weight: 500;">${row.sheetName}</td>
                    <td>${row.fileName}</td>
                    <td>${row.detectedRevCode}</td>
                    <td>${row.revDate}</td>
                    <td>
                        <div class="status-icon">
                            ${getStatusIcon(row.status)}
                            <span>${capitalizeFirst(row.status)}</span>
                        </div>
                    </td>
                `;
                break;
                
            case 'all':
                cells = `
                    <td>${row.checkType}</td>
                    <td style="font-weight: 500;">${row.fileName}</td>
                    <td>
                        <div class="status-icon">
                            ${getStatusIcon(row.status)}
                            <span>${capitalizeFirst(row.status)}</span>
                        </div>
                    </td>
                    <td>${row.comment}</td>
                `;
                break;
        }
        
        tr.innerHTML = cells;
        tbody.appendChild(tr);
    });
}

function getStatusIcon(status) {
    switch (status) {
        case 'pass':
            return `<svg class="icon-sm status-pass" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>`;
        case 'fail':
            return `<svg class="icon-sm status-fail" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>`;
        case 'warn':
            return `<svg class="icon-sm status-warn" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <circle cx="12" cy="17" r="1"/>
                    </svg>`;
        default:
            return '';
    }
}

function handleTabChange(tab) {
    if (tab === currentTab) return;
    
    // Update buttons
    elements.segmentButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update tab panes
    elements.tabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `${tab}-tab`);
    });
    
    currentTab = tab;
    
    // Apply current search filter
    if (searchTerm) {
        filterTable(tab, searchTerm);
    }
}

function handleSearch(event) {
    searchTerm = event.target.value.toLowerCase();
    filterTable(currentTab, searchTerm);
}

function filterTable(tableName, term) {
    const tbody = document.getElementById(`${tableName}-tbody`);
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}

async function handleDownload() {
    // Show loading state
    elements.downloadBtn.disabled = true;
    elements.downloadBtn.textContent = 'Generating...';
    
    try {
        // Create workbook
        const wb = XLSX.utils.book_new();
        
        // Add summary sheet
        const summaryData = [
            ['Metric', 'Value'],
            ['Overall Compliance', `${currentData.summary.compliance}%`],
            ['Drawings Scanned', currentData.summary.drawingsScanned],
            ['Missing Files', currentData.summary.missing],
            ['Expected Files', currentData.summary.expectedFiles],
            ['Naming Compliance', `${currentData.summary.namingCompliance}%`],
            ['Title Block Compliance', `${currentData.summary.titleBlockCompliance}%`]
        ];
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
        
        // Add missing files sheet
        const missingData = [
            ['Expected File', 'Found', 'Register Row'],
            ...currentData.tables.missing.map(row => [
                row.expectedFile,
                row.found ? 'Yes' : 'No',
                row.registerRow
            ])
        ];
        const missingWs = XLSX.utils.aoa_to_sheet(missingData);
        XLSX.utils.book_append_sheet(wb, missingWs, 'Missing Files');
        
        // Add naming errors sheet
        const namingData = [
            ['Folder Path', 'File Name', 'Error Type', 'Details'],
            ...currentData.tables.naming.map(row => [
                row.folderPath,
                row.fileName,
                row.errorType,
                row.details
            ])
        ];
        const namingWs = XLSX.utils.aoa_to_sheet(namingData);
        XLSX.utils.book_append_sheet(wb, namingWs, 'Naming Errors');
        
        // Add title block errors sheet
        const titleBlockData = [
            ['Sheet No', 'Sheet Name', 'File Name', 'Rev Code', 'Rev Date', 'Status'],
            ...currentData.tables.titleblock.map(row => [
                row.sheetNo,
                row.sheetName,
                row.fileName,
                row.detectedRevCode,
                row.revDate,
                capitalizeFirst(row.status)
            ])
        ];
        const titleBlockWs = XLSX.utils.aoa_to_sheet(titleBlockData);
        XLSX.utils.book_append_sheet(wb, titleBlockWs, 'Title Block Errors');
        
        // Generate and download file
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `Drawing-QC-Report-${timestamp}.xlsx`;
        XLSX.writeFile(wb, filename);
        
    } catch (error) {
        console.error('Error generating XLSX:', error);
        alert('Error generating report. Please try again.');
    } finally {
        // Reset button
        elements.downloadBtn.disabled = false;
        elements.downloadBtn.innerHTML = `
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download XLSX Report
        `;
    }
}

// Utility functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}