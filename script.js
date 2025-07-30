// Drawing QC Application JavaScript

class DrawingQC {
    constructor() {
        this.files = {
            folder: null,
            register: null,
            namingRules: null,
            titleBlocks: null
        };
        this.results = [];
        this.currentTab = 'validation';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateSampleData();
    }

    setupEventListeners() {
        // File input listeners
        document.getElementById('selectFolder').addEventListener('change', (e) => {
            this.handleFolderSelect(e);
        });

        document.getElementById('registerFile').addEventListener('change', (e) => {
            this.handleFileSelect(e, 'register');
        });

        document.getElementById('namingRulesFile').addEventListener('change', (e) => {
            this.handleFileSelect(e, 'namingRules');
        });

        document.getElementById('titleBlocksFile').addEventListener('change', (e) => {
            this.handleFileSelect(e, 'titleBlocks');
        });

        // Run checks button
        document.getElementById('runChecks').addEventListener('click', () => {
            this.runChecks();
        });

        // Tab navigation
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Search functionality
        document.querySelector('.search-input').addEventListener('input', (e) => {
            this.filterResults(e.target.value);
        });

        // Download button
        document.querySelector('.download-btn').addEventListener('click', () => {
            this.downloadReport();
        });
    }

    handleFolderSelect(event) {
        const files = Array.from(event.target.files);
        this.files.folder = files;
        
        // Update UI to show folder selected
        const statusElement = document.querySelector('.file-status .status-text');
        statusElement.textContent = `Selected: ${files.length} files`;
        
        console.log('Folder selected:', files.length, 'files');
    }

    handleFileSelect(event, fileType) {
        const file = event.target.files[0];
        if (file) {
            this.files[fileType] = file;
            console.log(`${fileType} file selected:`, file.name);
        }
    }

    runChecks() {
        console.log('Running checks...');
        
        // Simulate processing
        this.showProcessingState();
        
        setTimeout(() => {
            this.updateSummary();
            this.populateResults();
            this.hideProcessingState();
        }, 2000);
    }

    showProcessingState() {
        const button = document.getElementById('runChecks');
        button.textContent = 'Processing...';
        button.disabled = true;
    }

    hideProcessingState() {
        const button = document.getElementById('runChecks');
        button.textContent = 'Run Checks';
        button.disabled = false;
    }

    updateSummary() {
        // Simulate updated statistics
        const stats = {
            drawingsScanned: 95,
            drawingsInRegister: '33 missing',
            namingCompliance: '85% OK',
            titleBlockCompliance: '92% OK',
            overallCompliance: '78% OK'
        };

        document.getElementById('drawingsScanned').textContent = stats.drawingsScanned;
        document.getElementById('drawingsInRegister').textContent = stats.drawingsInRegister;
        document.getElementById('namingCompliance').textContent = stats.namingCompliance;
        document.getElementById('titleBlockCompliance').textContent = stats.titleBlockCompliance;
        document.getElementById('overallCompliance').textContent = stats.overallCompliance;

        // Update progress bars
        this.updateProgressBar('.summary-item:nth-child(3) .progress-fill', 85, 'green');
        this.updateProgressBar('.summary-item:nth-child(4) .progress-fill', 92, 'green');
        this.updateProgressBar('.summary-item:nth-child(5) .progress-fill', 78, 'yellow');
    }

    updateProgressBar(selector, percentage, colorClass) {
        const progressFill = document.querySelector(selector);
        if (progressFill) {
            progressFill.style.width = percentage + '%';
            progressFill.className = `progress-fill ${colorClass}`;
        }
    }

    populateSampleData() {
        // Sample data for demonstration
        this.results = [
            {
                sheetNumber: 'A-001',
                sheetName: 'Site Plan',
                fileName: 'A-001_Site_Plan_P01.pdf',
                revisionCode: 'P01',
                revisionDate: '15.07.2025',
                revisionDescription: 'For Planning',
                suitabilityCode: 'S2',
                stageDescription: 'Suitable for Information',
                status: 'OK'
            },
            {
                sheetNumber: 'A-002',
                sheetName: 'Ground Floor Plan',
                fileName: 'A-002_Ground_Floor_Plan_P02.pdf',
                revisionCode: 'P02',
                revisionDate: '20.07.2025',
                revisionDescription: 'For Planning - Revised',
                suitabilityCode: 'S2',
                stageDescription: 'Suitable for Information',
                status: 'Warning'
            },
            {
                sheetNumber: 'A-003',
                sheetName: 'First Floor Plan',
                fileName: 'A-003_First_Floor_Plan_P01.pdf',
                revisionCode: 'P01',
                revisionDate: '15.07.2025',
                revisionDescription: 'For Planning',
                suitabilityCode: 'S3',
                stageDescription: 'Suitable for Construction',
                status: 'Error'
            }
        ];

        this.populateResults();
    }

    populateResults() {
        const tbody = document.querySelector('#resultsTable tbody');
        tbody.innerHTML = '';

        this.results.forEach(result => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.sheetNumber}</td>
                <td>${result.sheetName}</td>
                <td>${result.fileName}</td>
                <td>${result.revisionCode}</td>
                <td>${result.revisionDate}</td>
                <td>${result.revisionDescription}</td>
                <td>${result.suitabilityCode}</td>
                <td>${result.stageDescription}</td>
                <td><span class="status-badge status-${result.status.toLowerCase()}">${result.status}</span></td>
            `;
            tbody.appendChild(row);
        });

        // Add status badge styles
        this.addStatusBadgeStyles();
    }

    addStatusBadgeStyles() {
        if (!document.getElementById('status-styles')) {
            const style = document.createElement('style');
            style.id = 'status-styles';
            style.textContent = `
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .status-ok {
                    background: #d4edda;
                    color: #155724;
                }
                .status-warning {
                    background: #fff3cd;
                    color: #856404;
                }
                .status-error {
                    background: #f8d7da;
                    color: #721c24;
                }
            `;
            document.head.appendChild(style);
        }
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Update table content based on tab
        this.updateTableForTab(tabName);
    }

    updateTableForTab(tabName) {
        const thead = document.querySelector('#resultsTable thead tr');
        
        switch(tabName) {
            case 'validation':
                thead.innerHTML = `
                    <th>Sheet Number</th>
                    <th>Sheet Name</th>
                    <th>File Name</th>
                    <th>Revision Code</th>
                    <th>Revision Date</th>
                    <th>Revision Description</th>
                    <th>Suitability Code</th>
                    <th>Stage Description</th>
                    <th>Status</th>
                `;
                break;
            case 'drawing-list':
                thead.innerHTML = `
                    <th>Sheet Number</th>
                    <th>Sheet Name</th>
                    <th>In Register</th>
                    <th>File Found</th>
                    <th>Status</th>
                `;
                break;
            case 'naming':
                thead.innerHTML = `
                    <th>File Name</th>
                    <th>Expected Pattern</th>
                    <th>Naming Compliance</th>
                    <th>Issues</th>
                    <th>Status</th>
                `;
                break;
            case 'title-block':
                thead.innerHTML = `
                    <th>Sheet Number</th>
                    <th>Title Block Field</th>
                    <th>Expected Value</th>
                    <th>Actual Value</th>
                    <th>Status</th>
                `;
                break;
        }
        
        // Repopulate table with appropriate data
        this.populateResults();
    }

    filterResults(searchTerm) {
        const rows = document.querySelectorAll('#resultsTable tbody tr');
        const term = searchTerm.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    downloadReport() {
        console.log('Downloading report...');
        
        // Create CSV content
        const headers = Array.from(document.querySelectorAll('#resultsTable thead th')).map(th => th.textContent);
        const rows = Array.from(document.querySelectorAll('#resultsTable tbody tr:not([style*="display: none"])')).map(row => 
            Array.from(row.cells).map(cell => cell.textContent)
        );

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drawing-qc-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DrawingQC();
});
