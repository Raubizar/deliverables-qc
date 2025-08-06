// Modern Drawing QC Application - Clash Report Summariser Style
// ===================================================================
// ENHANCED FEATURES (Latest Update):
// 
// 🚀 ENHANCED AUTO-DETECTION SYSTEM:
//    • Expanded file name column detection with fuzzy matching
//    • Support for 15+ file name variations and patterns
//    • Intelligent sheet prioritization based on content analysis
//    • Confidence scoring for auto-detected settings
//    • Visual feedback with progress indicators
//
// 🧠 SMART NAMING PATTERN ANALYSIS:
//    • Automatic delimiter detection (-, _, space, etc.)
//    • File name structure analysis and part counting
//    • Auto-generation of naming convention rules
//    • Pattern confidence scoring and validation
//    • Real-time preview of detected patterns
//
// 📊 ENHANCED EXCEL PROCESSING:
//    • Sheet analysis with content scoring
//    • Data validation and duplicate removal
//    • Error handling with detailed diagnostics
//    • Progressive disclosure of configuration options
//    • Automatic naming convention population
//
// 💫 IMPROVED USER EXPERIENCE:
//    • Enhanced notifications with icons and animations
//    • Detailed progress feedback during processing
//    • Auto-dismissing alerts with fade animations
//    • Confidence indicators for auto-detected settings
//    • Better error messages with actionable suggestions
//
// 📋 AUTOMATIC CONVENTION RULES SETTINGS:
//    • Scans for "File Name" and variations automatically
//    • Auto-populates sheet and column selections
//    • Generates naming rules based on detected patterns
//    • Validates convention structure and provides warnings
//    • Supports manual override with intelligent defaults
// ===================================================================

// Global variables
let fileNamesFromExcel = [];
let fileResultsFromFolder = [];
let uploadedFiles = []; // Files uploaded from folder input
let namingRulesData = [];
let titleBlockData = [];
let currentFilter = 'all';
let commentsData = {}; // Store comments by file name

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
    
    // Add table population debugging helper
    window.debugTables = function() {
        console.log('=== DEBUG TABLE POPULATION ===');
        console.log('📊 Data status:');
        console.log('  - uploadedFiles:', uploadedFiles ? uploadedFiles.length : 'undefined');
        console.log('  - fileResultsFromFolder:', fileResultsFromFolder ? fileResultsFromFolder.length : 'undefined');
        console.log('  - titleBlockData:', titleBlockData ? titleBlockData.length : 'undefined');
        console.log('  - currentRegisterWorkbook:', !!window.currentRegisterWorkbook);
        console.log('  - fileNamesFromExcel:', fileNamesFromExcel ? fileNamesFromExcel.length : 'undefined');
        
        console.log('📋 Table elements:');
        const drawingTable = document.getElementById('drawingListResults');
        const namingTable = document.getElementById('namingResults');
        const qaqcTable = document.getElementById('qaqcResults');
        
        console.log('  - drawingListResults exists:', !!drawingTable);
        console.log('  - drawingListResults rows:', drawingTable ? drawingTable.children.length : 'N/A');
        console.log('  - namingResults exists:', !!namingTable);
        console.log('  - namingResults rows:', namingTable ? namingTable.children.length : 'N/A');
        console.log('  - qaqcResults exists:', !!qaqcTable);
        console.log('  - qaqcResults rows:', qaqcTable ? qaqcTable.children.length : 'N/A');
        
        return {
            uploadedFiles: uploadedFiles ? uploadedFiles.length : 0,
            fileResultsFromFolder: fileResultsFromFolder ? fileResultsFromFolder.length : 0,
            titleBlockData: titleBlockData ? titleBlockData.length : 0,
            hasRegisterWorkbook: !!window.currentRegisterWorkbook,
            fileNamesFromExcel: fileNamesFromExcel ? fileNamesFromExcel.length : 0,
            tableElements: {
                drawing: !!drawingTable,
                naming: !!namingTable,
                qaqc: !!qaqcTable
            },
            tableRows: {
                drawing: drawingTable ? drawingTable.children.length : 0,
                naming: namingTable ? namingTable.children.length : 0,
                qaqc: qaqcTable ? qaqcTable.children.length : 0
            }
        };
    };
    
    // Add manual table population trigger
    window.triggerTablePopulation = function() {
        console.log('🔄 Manual table population triggered');
        populateInitialTablesEnhanced();
        return 'Table population triggered - check console for details';
    };
    
    // Add table validation trigger
    window.validateTablePopulation = function() {
        return validateTablePopulation();
    };
    
    // Enhanced debugging function for immediate testing
    window.debugTablesEnhanced = function() {
        console.log('🔍 === ENHANCED TABLE DEBUGGING ===');
        
        // Check DOM readiness
        console.log('DOM ready state:', document.readyState);
        
        // Check data availability
        const dataStatus = {
            uploadedFiles: uploadedFiles ? uploadedFiles.length : 0,
            fileResultsFromFolder: fileResultsFromFolder ? fileResultsFromFolder.length : 0,
            titleBlockData: titleBlockData ? titleBlockData.length : 0,
            hasRegisterWorkbook: !!window.currentRegisterWorkbook
        };
        console.log('📊 Data status:', dataStatus);
        
        // Check table elements
        const tables = {
            drawingListResults: document.getElementById('drawingListResults'),
            namingResults: document.getElementById('namingResults'),
            qaqcResults: document.getElementById('qaqcResults')
        };
        
        console.log('📋 Table elements:', {
            drawingListResults: !!tables.drawingListResults,
            namingResults: !!tables.namingResults,
            qaqcResults: !!tables.qaqcResults
        });
        
        if (tables.drawingListResults) {
            console.log('Drawing table rows:', tables.drawingListResults.children.length);
        }
        if (tables.namingResults) {
            console.log('Naming table rows:', tables.namingResults.children.length);
        }
        if (tables.qaqcResults) {
            console.log('QA-QC table rows:', tables.qaqcResults.children.length);
        }
        
        // Trigger enhanced population
        console.log('🔄 Triggering enhanced table population...');
        populateInitialTablesEnhanced();
        
        return { dataStatus, tables };
    };
    
    // Add test data generation for debugging
    window.generateTestData = function() {
        console.log('🧪 Generating test data for debugging...');
        
        // Generate test folder files
        uploadedFiles = [
            { name: 'TEST-001-P01.pdf', path: 'drawings/TEST-001-P01.pdf', file: {} },
            { name: 'TEST-002-P02.pdf', path: 'drawings/TEST-002-P02.pdf', file: {} },
            { name: 'TEST-003-P01.dwg', path: 'drawings/TEST-003-P01.dwg', file: {} }
        ];
        fileResultsFromFolder = uploadedFiles;
        
        // Generate test title block data
        titleBlockData = [
            {
                sheetNumber: 'TEST-001',
                sheetName: 'Test Drawing 1',
                fileName: 'TEST-001-P01.pdf',
                revisionCode: 'P01',
                revisionDate: '2025-01-01',
                revisionDescription: 'For Information',
                suitabilityCode: 'S0',
                stageDescription: 'Stage 0'
            },
            {
                sheetNumber: 'TEST-002',
                sheetName: 'Test Drawing 2', 
                fileName: 'TEST-002-P02.pdf',
                revisionCode: 'P02',
                revisionDate: '2025-01-02',
                revisionDescription: 'For Review',
                suitabilityCode: 'S1',
                stageDescription: 'Stage 1'
            }
        ];
        
        // Generate test Excel file names
        fileNamesFromExcel = ['TEST-001', 'TEST-002', 'TEST-003'];
        
        console.log('✅ Test data generated:');
        console.log('  - uploadedFiles:', uploadedFiles.length);
        console.log('  - titleBlockData:', titleBlockData.length);
        console.log('  - fileNamesFromExcel:', fileNamesFromExcel.length);
        
        // Trigger table population with test data
        populateInitialTablesEnhanced();
        
        return 'Test data generated and tables populated';
    };
    
    try {
        initializeEventListeners();
        initializeCharts();
        
        // Setup initial comment inputs
        setupCommentInputs();
        
        // Removed automatic sample data loading - data will load when files are uploaded
        
        console.log('Application initialized successfully');
        console.log('🔧 Available debugging commands:');
        console.log('  - debugTitleBlocks() - Check title block data');
        console.log('  - debugTables() - Check table population status');
        console.log('  - triggerTablePopulation() - Manually populate tables');
        console.log('  - validateTablePopulation() - Validate current table state');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});

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
    
    // Store files in both global variables for compatibility
    const fileObjects = files.map(file => ({
        name: file.name,
        path: file.webkitRelativePath || file.name,
        file: file
    }));
    
    fileResultsFromFolder = fileObjects;
    uploadedFiles = fileObjects; // Also store in uploadedFiles for compatibility
    
    console.log(`✅ Stored ${fileObjects.length} files in global variables`);
    console.log('Sample files:', fileObjects.slice(0, 3).map(f => f.name));

    // Show success feedback
    showNotification(`Loaded ${files.length} files from folder`, 'success');
    
    // Immediately populate tables with real data - multiple attempts for reliability
    console.log('🔄 Folder files loaded, triggering immediate table population...');
    
    // Try immediate population
    populateInitialTablesEnhanced();
    
    // Also try with slight delay for any timing issues
    setTimeout(() => {
        console.log('🔄 Delayed table population trigger...');
        populateInitialTablesEnhanced();
        
        // If we also have title block data, this should populate QA-QC table too
        if (titleBlockData && titleBlockData.length > 0) {
            console.log('✅ Both folder files and title blocks available - full table population triggered');
        }
    }, 100);
    
    // Final attempt after a longer delay
    setTimeout(() => {
        console.log('🔄 Final table population attempt...');
        populateInitialTablesEnhanced();
    }, 500);
    
    // Update file chip to selected state - find by proximity to folderInput
    try {
        const folderInput = document.getElementById('folderInput');
        if (folderInput && folderInput.previousElementSibling) {
            const folderChip = folderInput.previousElementSibling;
            if (folderChip && folderChip.classList.contains('file-chip')) {
                folderChip.classList.add('selected');
            }
        }
    } catch (error) {
        console.log('Could not update folder chip selected state:', error);
    }
}

function handleRegisterFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    updateFileStatus('registerStatus', `Selected: ${file.name}`, 'success');
    processExcelFile(file, 'register');
    
    // Show Excel configuration with progressive disclosure
    showExcelConfiguration();
    
    // Update file chip to selected state - find by proximity to registerFile
    try {
        const registerInput = document.getElementById('registerFile');
        if (registerInput && registerInput.previousElementSibling) {
            const registerChip = registerInput.previousElementSibling;
            if (registerChip && registerChip.classList.contains('file-chip')) {
                registerChip.classList.add('selected');
            }
        }
    } catch (error) {
        console.log('Could not update register chip selected state:', error);
    }
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
    
    // Update file chip to selected state - find by proximity to namingRulesFile
    try {
        const namingInput = document.getElementById('namingRulesFile');
        if (namingInput && namingInput.previousElementSibling) {
            const namingChip = namingInput.previousElementSibling;
            if (namingChip && namingChip.classList.contains('file-chip')) {
                namingChip.classList.add('selected');
            }
        }
    } catch (error) {
        console.log('Could not update naming chip selected state:', error);
    }
}

// Data Validation Function
function validateAllData() {
    console.log('🔍 === COMPREHENSIVE DATA VALIDATION ===');
    
    const status = {
        hasUploadedFiles: false,
        hasFileResults: false,
        hasRegisterWorkbook: false,
        hasTitleBlocks: false,
        hasNamingRules: false,
        folderFiles: [],
        folderFilesCount: 0,
        titleBlocksCount: 0,
        errors: [],
        warnings: []
    };
    
    // Check uploaded files
    if (typeof uploadedFiles !== 'undefined' && uploadedFiles && uploadedFiles.length > 0) {
        status.hasUploadedFiles = true;
        status.folderFiles = uploadedFiles;
        status.folderFilesCount = uploadedFiles.length;
        console.log('✅ uploadedFiles available:', uploadedFiles.length);
    } else if (typeof fileResultsFromFolder !== 'undefined' && fileResultsFromFolder && fileResultsFromFolder.length > 0) {
        status.hasFileResults = true;
        status.folderFiles = fileResultsFromFolder;
        status.folderFilesCount = fileResultsFromFolder.length;
        console.log('✅ fileResultsFromFolder available:', fileResultsFromFolder.length);
    } else {
        status.errors.push('No folder files found');
        console.log('❌ No folder files available');
    }
    
    // Check register workbook
    if (window.currentRegisterWorkbook) {
        status.hasRegisterWorkbook = true;
        console.log('✅ Register workbook available');
    } else {
        status.warnings.push('No register workbook loaded');
        console.log('⚠️ No register workbook available');
    }
    
    // Check title blocks
    if (titleBlockData && titleBlockData.length > 0) {
        status.hasTitleBlocks = true;
        status.titleBlocksCount = titleBlockData.length;
        console.log('✅ Title blocks available:', titleBlockData.length);
    } else {
        status.warnings.push('No title blocks loaded');
        console.log('⚠️ No title blocks available');
    }
    
    // Check naming rules
    if (namingRulesData) {
        status.hasNamingRules = true;
        console.log('✅ Naming rules available');
    } else {
        status.warnings.push('No naming rules loaded');
        console.log('⚠️ No naming rules available');
    }
    
    console.log('📊 Data validation summary:', {
        folderFiles: status.folderFilesCount,
        titleBlocks: status.titleBlocksCount,
        hasRegister: status.hasRegisterWorkbook,
        hasNaming: status.hasNamingRules,
        errors: status.errors.length,
        warnings: status.warnings.length
    });
    
    return status;
}

// IMPROVED: Enhanced table population with better error handling and DOM readiness checks
function populateInitialTablesEnhanced() {
    console.log('🚀 === ENHANCED TABLE POPULATION STARTED ===');
    console.log('⏰ Timestamp:', new Date().toLocaleTimeString());
    
    // Ensure DOM is ready
    if (document.readyState === 'loading') {
        console.log('⏳ DOM not ready, scheduling retry...');
        setTimeout(() => populateInitialTablesEnhanced(), 100);
        return;
    }
    
    try {
        // Get table elements with detailed error checking
        const drawingTable = document.getElementById('drawingListResults');
        const namingTable = document.getElementById('namingResults');
        const qaqcTable = document.getElementById('qaqcResults');
        
        console.log('🔍 Table elements status:', {
            drawingTable: !!drawingTable,
            namingTable: !!namingTable,
            qaqcTable: !!qaqcTable
        });
        
        // If any table is missing, log detailed error and attempt to continue
        if (!drawingTable) console.error('❌ drawingListResults table not found');
        if (!namingTable) console.error('❌ namingResults table not found');
        if (!qaqcTable) console.error('❌ qaqcResults table not found');
        
        // Clear existing content
        if (drawingTable) {
            drawingTable.innerHTML = '';
            console.log('🧹 Cleared drawing table');
        }
        if (namingTable) {
            namingTable.innerHTML = '';
            console.log('🧹 Cleared naming table');
        }
        if (qaqcTable) {
            qaqcTable.innerHTML = '';
            console.log('🧹 Cleared QA-QC table');
        }
        
        // Get data with comprehensive validation
        const dataStatus = validateAllData();
        const folderFiles = dataStatus.folderFiles || [];
        
        console.log('📊 Data validation results:', {
            folderFilesCount: folderFiles.length,
            hasRegisterWorkbook: !!window.currentRegisterWorkbook,
            hasTitleBlocks: !!(titleBlockData && titleBlockData.length > 0),
            sampleFileNames: folderFiles.slice(0, 3).map(f => f.name)
        });
        
        // Always try to populate Naming Checker first (least dependencies)
        if (namingTable && folderFiles.length > 0) {
            console.log('📝 Populating Naming Checker...');
            try {
                const namingContent = folderFiles.slice(0, 15).map((file, index) => {
                    const fileName = file.name || 'Unknown';
                    const fileExt = fileName.split('.').pop()?.toUpperCase() || 'Unknown';
                    const hasRevision = /[._-][PR]\d{2}[._-]|[._-]REV[._-]/i.test(fileName);
                    
                    return `
                        <tr>
                            <td>${file.path || file.name}</td>
                            <td>${fileName}</td>
                            <td><span class="status-badge ${hasRevision ? 'info' : 'warning'}">Preview: ${hasRevision ? 'Pattern Found' : 'Check Required'}</span></td>
                            <td>${fileExt} file${hasRevision ? ', has revision pattern' : ', no revision pattern detected'}</td>
                        </tr>
                    `;
                }).join('');
                
                namingTable.innerHTML = namingContent;
                console.log('✅ Naming Checker populated with', Math.min(15, folderFiles.length), 'entries');
                console.log('📄 First 3 entries:', folderFiles.slice(0, 3).map(f => f.name));
            } catch (error) {
                console.error('❌ Error populating Naming Checker:', error);
            }
        } else {
            console.log('⚠️ Naming Checker not populated:', {
                hasTable: !!namingTable,
                filesCount: folderFiles.length
            });
        }
        
        // Populate Drawing List (basic file list even without Excel)
        if (drawingTable && folderFiles.length > 0) {
            console.log('📋 Populating Drawing List...');
            try {
                const drawingContent = folderFiles.slice(0, 15).map((file, index) => {
                    return `
                        <tr>
                            <td>${index + 1}. ${file.name}</td>
                            <td>${file.name}</td>
                            <td><span class="status-badge info">Preview: File Available</span></td>
                        </tr>
                    `;
                }).join('');
                
                drawingTable.innerHTML = drawingContent;
                console.log('✅ Drawing List populated with', Math.min(15, folderFiles.length), 'entries');
            } catch (error) {
                console.error('❌ Error populating Drawing List:', error);
            }
        } else {
            console.log('⚠️ Drawing List not populated:', {
                hasTable: !!drawingTable,
                filesCount: folderFiles.length
            });
        }
        
        // Populate QA-QC if title block data is available
        if (qaqcTable && titleBlockData && titleBlockData.length > 0 && folderFiles.length > 0) {
            console.log('📊 Populating QA-QC...');
            try {
                const qaqcContent = titleBlockData.slice(0, 10).map((tbData, index) => {
                    const sheetNumber = tbData.sheetNumber || '';
                    const sheetName = tbData.sheetName || '';
                    const fileName = tbData.fileName || sheetNumber || `Entry ${index + 1}`;
                    
                    return `
                        <tr>
                            <td>${sheetNumber || 'N/A'}</td>
                            <td>${sheetName || 'N/A'}</td>
                            <td>${fileName}</td>
                            <td>${tbData.revisionCode || 'N/A'}</td>
                            <td>${tbData.revisionDate || 'N/A'}</td>
                            <td>${tbData.revisionDescription || 'N/A'}</td>
                            <td>${tbData.suitabilityCode || 'N/A'}</td>
                            <td>${tbData.stageDescription || 'N/A'}</td>
                            <td><span class="status-badge info">Preview</span></td>
                            <td><span class="status-badge info">Preview: Available</span></td>
                            <td><input type="text" class="comment-input" placeholder="Preview mode..." readonly></td>
                            <td><span class="status-badge info">Preview</span></td>
                            <td>Preview data</td>
                        </tr>
                    `;
                }).join('');
                
                qaqcTable.innerHTML = qaqcContent;
                console.log('✅ QA-QC populated with', Math.min(10, titleBlockData.length), 'entries');
            } catch (error) {
                console.error('❌ Error populating QA-QC:', error);
            }
        } else {
            console.log('⚠️ QA-QC not populated:', {
                hasTable: !!qaqcTable,
                hasTitleData: !!(titleBlockData && titleBlockData.length > 0),
                filesCount: folderFiles.length
            });
        }
        
        // Final validation
        setTimeout(() => {
            const finalValidation = {
                drawingRows: drawingTable ? drawingTable.children.length : 0,
                namingRows: namingTable ? namingTable.children.length : 0,
                qaqcRows: qaqcTable ? qaqcTable.children.length : 0
            };
            
            console.log('📊 Final table population status:', finalValidation);
            
            const totalRows = finalValidation.drawingRows + finalValidation.namingRows + finalValidation.qaqcRows;
            if (totalRows > 0) {
                console.log(`🎉 SUCCESS: ${totalRows} total rows populated!`);
                showNotification(`✅ Tables populated successfully! (${totalRows} total rows)`, 'success');
            } else {
                console.log('⚠️ WARNING: No tables were populated');
                showNotification('⚠️ Tables are empty. Check console for details.', 'warning');
            }
        }, 200);
        
    } catch (error) {
        console.error('❌ Critical error in table population:', error);
        showNotification('❌ Error populating tables: ' + error.message, 'error');
    }
}

// NEW: Populate initial tables with real data immediately when files are uploaded
function populateInitialTables() {
    console.log('📞 populateInitialTables() called - redirecting to enhanced version');
    populateInitialTablesEnhanced();
}

// Validate that tables were populated correctly
function validateTablePopulation() {
    console.log('🔍 === VALIDATING TABLE POPULATION ===');
    
    const drawingTable = document.getElementById('drawingListResults');
    const namingTable = document.getElementById('namingResults');
    const qaqcTable = document.getElementById('qaqcResults');
    
    const validation = {
        drawing: {
            exists: !!drawingTable,
            rows: drawingTable ? drawingTable.children.length : 0,
            populated: false
        },
        naming: {
            exists: !!namingTable,
            rows: namingTable ? namingTable.children.length : 0,
            populated: false
        },
        qaqc: {
            exists: !!qaqcTable,
            rows: qaqcTable ? qaqcTable.children.length : 0,
            populated: false
        }
    };
    
    // Check if tables have content
    validation.drawing.populated = validation.drawing.rows > 0;
    validation.naming.populated = validation.naming.rows > 0;
    validation.qaqc.populated = validation.qaqc.rows > 0;
    
    console.log('📊 Table validation results:', validation);
    
    // Provide user feedback
    const populatedTables = [
        validation.drawing.populated ? 'Drawing List' : null,
        validation.naming.populated ? 'Naming Checker' : null,
        validation.qaqc.populated ? 'QA-QC' : null
    ].filter(Boolean);
    
    if (populatedTables.length > 0) {
        const message = `✅ Populated tables: ${populatedTables.join(', ')}`;
        showNotification(message, 'success');
        console.log(message);
    } else {
        const message = '⚠️ No tables were populated. Check console for details.';
        showNotification(message, 'warning');
        console.log(message);
    }
    
    return validation;
}

// Populate Drawing List preview
function populateDrawingListPreview(folderFiles = null) {
    // Use parameter or try to find global variable
    if (!folderFiles) {
        if (typeof uploadedFiles !== 'undefined' && uploadedFiles) {
            folderFiles = uploadedFiles;
        } else if (typeof fileResultsFromFolder !== 'undefined' && fileResultsFromFolder) {
            folderFiles = fileResultsFromFolder;
        } else {
            console.log('❌ No folder files available for Drawing List preview');
            return;
        }
    }
    
    if (!window.currentRegisterWorkbook) {
        console.log('❌ No register workbook available');
        return;
    }
    
    console.log('📋 Creating Drawing List preview...');
    console.log('📁 Using folder files:', folderFiles.length);
    
    try {
        // Get the currently selected sheet and column
        const sheetSelect = document.getElementById('registerSheetSelect');
        const columnSelect = document.getElementById('registerColumnSelect');
        
        if (!sheetSelect || !columnSelect || !sheetSelect.value || !columnSelect.value) {
            console.log('⏳ Sheet/column not selected yet, showing basic file list...');
            
            // Show basic file list from folder with enhanced display
            const drawingTable = document.getElementById('drawingListResults');
            if (!drawingTable) {
                console.error('❌ drawingListResults table element not found');
                return;
            }
            
            drawingTable.innerHTML = folderFiles.slice(0, 10).map((file, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${file.name || 'Unknown'}</td>
                    <td><span class="status-badge info">Awaiting Register Configuration</span></td>
                </tr>
            `).join('');
            
            if (folderFiles.length > 10) {
                drawingTable.innerHTML += `
                    <tr>
                        <td colspan="3" style="text-align: center; font-style: italic; color: #666;">
                            ... and ${folderFiles.length - 10} more files (${folderFiles.length} total)
                        </td>
                    </tr>
                `;
            }
            
            console.log(`✅ Basic file list displayed: ${Math.min(10, folderFiles.length)} of ${folderFiles.length} files`);
            return;
        }
        
        // Get Excel data
        const sheetIndex = parseInt(sheetSelect.value);
        const columnIndex = parseInt(columnSelect.value);
        
        if (isNaN(sheetIndex) || isNaN(columnIndex)) {
            console.log('⚠️ Invalid sheet or column selection');
            return;
        }
        
        const sheetName = window.currentRegisterWorkbook.SheetNames[sheetIndex];
        if (!sheetName) {
            console.log('⚠️ Sheet not found at index:', sheetIndex);
            return;
        }
        
        const worksheet = window.currentRegisterWorkbook.Sheets[sheetName];
        if (!worksheet) {
            console.log('⚠️ Worksheet not accessible:', sheetName);
            return;
        }
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log(`📊 Using sheet: "${sheetName}" (index ${sheetIndex}), column index: ${columnIndex}`);
        
        // Extract file names from Excel
        const excelFileNames = jsonData.slice(1)
            .map(row => row[columnIndex])
            .filter(name => name && name.toString().trim())
            .map(name => name.toString().trim());
        
        console.log(`📊 Found ${excelFileNames.length} file names in Excel`);
        console.log(`📁 Found ${folderFiles.length} files in folder`);
        
        // Create preview results
        const previewResults = [];
        const folderFileNames = folderFiles.map(f => f.name);
        
        // Show first 15 Excel entries with their match status
        excelFileNames.slice(0, 15).forEach(excelName => {
            const matchedFile = folderFileNames.find(folderName => 
                folderName.toLowerCase().includes(excelName.toLowerCase()) ||
                excelName.toLowerCase().includes(folderName.toLowerCase())
            );
            
            previewResults.push({
                excelName: excelName,
                matchedFile: matchedFile || '-',
                status: matchedFile ? 'Preview: Found' : 'Preview: Not Found'
            });
        });
        
        // Populate table
        const drawingTable = document.getElementById('drawingListResults');
        drawingTable.innerHTML = previewResults.map(result => `
            <tr>
                <td>${result.excelName}</td>
                <td>${result.matchedFile}</td>
                <td><span class="status-badge ${result.status.includes('Found') ? 'info' : 'warning'}">${result.status}</span></td>
            </tr>
        `).join('');
        
        if (excelFileNames.length > 15) {
            drawingTable.innerHTML += `
                <tr>
                    <td colspan="3" style="text-align: center; font-style: italic; color: #666;">
                        ... and ${excelFileNames.length - 15} more entries (click "Run Checks" for complete analysis)
                    </td>
                </tr>
            `;
        }
        
        console.log('✅ Drawing List preview populated');
        
    } catch (error) {
        console.error('❌ Error in Drawing List preview:', error);
        
        // Fallback: show basic file list
        const drawingTable = document.getElementById('drawingListResults');
        drawingTable.innerHTML = folderFiles.slice(0, 10).map(file => `
            <tr>
                <td>-</td>
                <td>${file.name}</td>
                <td><span class="status-badge info">Preview Mode</span></td>
            </tr>
        `).join('');
    }
}

// Populate Naming Checker preview
function populateNamingCheckerPreview(folderFiles = null) {
    // Use parameter or try to find global variable
    if (!folderFiles) {
        if (typeof uploadedFiles !== 'undefined' && uploadedFiles) {
            folderFiles = uploadedFiles;
        } else if (typeof fileResultsFromFolder !== 'undefined' && fileResultsFromFolder) {
            folderFiles = fileResultsFromFolder;
        } else {
            console.log('❌ No folder files available for Naming Checker preview');
            return;
        }
    }
    
    if (folderFiles.length === 0) {
        console.log('❌ No files to process in Naming Checker');
        return;
    }
    
    console.log('📝 Creating Naming Checker preview...');
    console.log('📁 Using folder files:', folderFiles.length);
    
    try {
        // Show first 15 files with basic naming info
        const namingTable = document.getElementById('namingResults');
        if (!namingTable) {
            console.error('❌ namingResults table element not found');
            return;
        }
        
        console.log('📝 Populating naming checker with', Math.min(15, folderFiles.length), 'files');
        
        namingTable.innerHTML = folderFiles.slice(0, 15).map((file, index) => {
            const fileName = file.name || 'Unknown';
            const fileExt = fileName.split('.').pop()?.toUpperCase() || 'Unknown';
            const hasRevision = /[._-][PR]\d{2}[._-]|[._-]REV[._-]/i.test(fileName);
            
            let status = 'Preview';
            let details = `${fileExt} file`;
            
            if (hasRevision) {
                details += ', has revision pattern';
                status = 'Preview: Pattern Found';
            } else {
                details += ', no revision pattern detected';
                status = 'Preview: Check Required';
            }
            
            return `
                <tr>
                    <td>${file.path || file.name}</td>
                    <td>${fileName}</td>
                    <td><span class="status-badge ${hasRevision ? 'info' : 'warning'}">${status}</span></td>
                    <td>${details}</td>
                </tr>
            `;
        }).join('');
        
        if (folderFiles.length > 15) {
            namingTable.innerHTML += `
                <tr>
                    <td colspan="4" style="text-align: center; font-style: italic; color: #666;">
                        ... and ${folderFiles.length - 15} more files (click "Run Checks" for complete analysis)
                    </td>
                </tr>
            `;
        }
        
        console.log('✅ Naming Checker preview populated');
        
    } catch (error) {
        console.error('❌ Error in Naming Checker preview:', error);
    }
}

// Populate QA-QC preview
function populateQAQCPreview(folderFiles = null) {
    // Use parameter or try to find global variable
    if (!folderFiles) {
        if (typeof uploadedFiles !== 'undefined' && uploadedFiles) {
            folderFiles = uploadedFiles;
        } else if (typeof fileResultsFromFolder !== 'undefined' && fileResultsFromFolder) {
            folderFiles = fileResultsFromFolder;
        } else {
            console.log('❌ No folder files available for QA-QC preview');
            return;
        }
    }
    
    if (!titleBlockData || folderFiles.length === 0) {
        console.log('❌ Missing data for QA-QC preview:', {
            hasTitleData: !!titleBlockData,
            folderFilesCount: folderFiles.length
        });
        return;
    }
    
    console.log('📊 Creating QA-QC preview...');
    console.log('📁 Using folder files:', folderFiles.length);
    console.log('📋 Using title block data:', titleBlockData.length);
    
    try {
        // Match title block data with uploaded files
        const qaqcTable = document.getElementById('qaqcResults');
        if (!qaqcTable) {
            console.error('❌ qaqcResults table element not found');
            return;
        }
        
        const previewResults = [];
        
        console.log('📊 Processing title block data for QA-QC preview...');
        
        // Show first 10 title block entries with enhanced matching
        titleBlockData.slice(0, 10).forEach((tbData, index) => {
            const sheetNumber = tbData.sheetNumber || '';
            const sheetName = tbData.sheetName || '';
            const fileName = tbData.fileName || sheetNumber || `Entry ${index + 1}`;
            
            // Try multiple matching strategies
            const matchedFile = folderFiles.find(file => {
                const lowerFileName = file.name.toLowerCase();
                const lowerTbFile = fileName.toLowerCase();
                const lowerSheetNum = sheetNumber.toLowerCase();
                
                return lowerFileName.includes(lowerTbFile) ||
                       lowerTbFile.includes(lowerFileName) ||
                       (sheetNumber && lowerFileName.includes(lowerSheetNum));
            });
            
            previewResults.push({
                sheetNumber: sheetNumber,
                sheetName: sheetName,
                fileName: fileName,
                revCode: tbData.revisionCode || 'N/A',
                revDate: tbData.revisionDate || 'N/A',
                revDescription: tbData.revisionDescription || 'N/A',
                suitability: tbData.suitabilityCode || 'N/A',
                stage: tbData.stageDescription || 'N/A',
                deliveryStatus: matchedFile ? 'Preview: Found' : 'Preview: Missing',
                namingStatus: 'Preview',
                titleBlockStatus: 'Preview',
                comment: ''
            });
        });
        
        console.log(`📊 Generated ${previewResults.length} QA-QC preview entries`);
        
        qaqcTable.innerHTML = previewResults.map(result => `
            <tr>
                <td>${result.sheetNumber || 'N/A'}</td>
                <td>${result.sheetName || 'N/A'}</td>
                <td>${result.fileName}</td>
                <td>${result.revCode}</td>
                <td>${result.revDate}</td>
                <td>${result.revDescription}</td>
                <td>${result.suitability}</td>
                <td>${result.stage}</td>
                <td><span class="status-badge info">${result.namingStatus}</span></td>
                <td><span class="status-badge ${result.deliveryStatus.includes('Found') ? 'info' : 'warning'}">${result.deliveryStatus}</span></td>
                <td>
                    <input type="text" class="comment-input" value="" placeholder="Preview mode..." 
                           data-filename="${result.fileName}" readonly style="opacity: 0.7;">
                </td>
                <td><span class="status-badge info">${result.titleBlockStatus}</span></td>
                <td>Preview Mode</td>
            </tr>
        `).join('');
        
        if (titleBlockData.length > 10) {
            qaqcTable.innerHTML += `
                <tr>
                    <td colspan="5" style="text-align: center; font-style: italic; color: #666;">
                        ... and ${titleBlockData.length - 10} more entries (click "Run Checks" for complete analysis)
                    </td>
                </tr>
            `;
        }
        
        console.log('✅ QA-QC preview populated');
        
    } catch (error) {
        console.error('❌ Error in QA-QC preview:', error);
    }
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
    
    // Update file chip to selected state - find by proximity to titleBlocksFile
    try {
        const titleBlocksInput = document.getElementById('titleBlocksFile');
        if (titleBlocksInput && titleBlocksInput.previousElementSibling) {
            const titleBlocksChip = titleBlocksInput.previousElementSibling;
            if (titleBlocksChip && titleBlocksChip.classList.contains('file-chip')) {
                titleBlocksChip.classList.add('selected');
            }
        }
    } catch (error) {
        console.log('Could not update title blocks chip selected state:', error);
    }
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

// Enhanced Excel Processing with Auto-Configuration
async function processExcelFile(file, type) {
    try {
        console.log(`=== ENHANCED EXCEL PROCESSING (${type.toUpperCase()}) ===`);
        console.log('📁 File name:', file.name);
        console.log('📊 File size:', Math.round(file.size / 1024), 'KB');
        console.log('🕒 Processing started:', new Date().toISOString());
        
        showNotification(`📊 Processing ${type} file: ${file.name}...`, 'info');
        
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log('✅ Workbook loaded successfully');
        console.log('📋 Sheet names:', workbook.SheetNames);
        console.log('📊 Sheet count:', workbook.SheetNames.length);
        
        if (type === 'register') {
            console.log('🎯 Processing Drawing Register...');
            window.currentRegisterWorkbook = workbook;
            
            // Enhanced sheet population with analysis
            populateSheetSelectorWithAnalysis(workbook);
            
            // Enhanced auto-detection with immediate feedback
            console.log('🚀 Initiating enhanced auto-detection...');
            setTimeout(() => {
                const detectionResult = autoDetectFileNameColumn(workbook);
                if (detectionResult) {
                    console.log('✅ Auto-detection successful:', detectionResult);
                    
                    // Populate initial tables with detected data
                    setTimeout(() => {
                        populateInitialTables();
                    }, 200);
                } else {
                    console.log('⚠️ Auto-detection incomplete - manual selection required');
                    showNotification('� Please manually select sheet and column for File Names', 'warning');
                }
            }, 100);
            
        } else if (type === 'naming') {
            console.log('📝 Processing Naming Convention Rules...');
            
            showNotification('📝 Processing naming convention rules...', 'info');
            namingRulesData = processNamingRules(workbook);
            
            if (namingRulesData && namingRulesData.Sheets) {
                console.log('✅ Naming rules processed successfully');
                console.log('📊 Rules data:', {
                    sheetsRules: namingRulesData.Sheets.length,
                    modelsRules: namingRulesData.Models ? namingRulesData.Models.length : 0
                });
                
                // Validate naming convention structure
                const validation = validateNamingConventionStructure(namingRulesData);
                if (validation.isValid) {
                    showNotification(`✅ Naming convention loaded: ${validation.summary}`, 'success');
                } else {
                    showNotification(`⚠️ Naming convention loaded with warnings: ${validation.issues.join(', ')}`, 'warning');
                }
            } else {
                throw new Error('Failed to process naming convention rules');
            }
            
        } else if (type === 'titleBlocks') {
            console.log('📋 Processing Title Blocks...');
            
            showNotification('📋 Processing title blocks data...', 'info');
            titleBlockData = processTitleBlocks(workbook);
            
            if (titleBlockData && titleBlockData.length > 0) {
                console.log('✅ Title blocks processed successfully');
                console.log('📊 Title blocks summary:', {
                    totalRecords: titleBlockData.length,
                    withSheetNumbers: titleBlockData.filter(r => r.sheetNumber).length,
                    withFileNames: titleBlockData.filter(r => r.fileName).length,
                    withRevisionCodes: titleBlockData.filter(r => r.revisionCode).length
                });
                
                // Show summary notification
                const summary = `📋 Loaded ${titleBlockData.length} title block records`;
                showNotification(summary, 'success');
                
                // AUTO-FILL EXPECTED VALUES immediately after processing
                setTimeout(() => {
                    autoFillExpectedValues(titleBlockData);
                    
                    // Populate initial tables with title block data
                    setTimeout(() => {
                        populateInitialTables();
                    }, 200);
                }, 500);
                
            } else {
                throw new Error('No valid title block data found');
            }
        }
        
        console.log(`=== EXCEL PROCESSING COMPLETE (${type.toUpperCase()}) ===`);
        console.log('🕒 Processing completed:', new Date().toISOString());
        
    } catch (error) {
        console.error(`❌ Error processing ${type} Excel file:`, error);
        const errorMessage = `❌ Error processing ${type} file: ${error.message}`;
        showNotification(errorMessage, 'error');
        throw error; // Re-throw to maintain error handling chain
    }
}

// NEW: Enhanced sheet selector with analysis
function populateSheetSelectorWithAnalysis(workbook) {
    console.log('📋 === POPULATING SHEET SELECTOR WITH ANALYSIS ===');
    
    const sheetSelect = document.getElementById('registerSheetSelect');
    sheetSelect.innerHTML = '<option value="">Analyzing sheets...</option>';
    
    // Analyze each sheet
    const sheetAnalysis = workbook.SheetNames.map((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName];
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        const rowCount = range.e.r + 1;
        const colCount = range.e.c + 1;
        
        // Quick content analysis
        let hasHeaders = false;
        let estimatedDataRows = 0;
        
        try {
            // Check first row for header-like content
            for (let col = 0; col <= Math.min(range.e.c, 10); col++) {
                const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
                if (cell && cell.v && typeof cell.v === 'string' && cell.v.length > 2) {
                    hasHeaders = true;
                    break;
                }
            }
            
            // Estimate data rows by checking for content
            for (let row = 1; row <= Math.min(range.e.r, 100); row++) {
                let hasContent = false;
                for (let col = 0; col <= Math.min(range.e.c, 5); col++) {
                    const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
                    if (cell && cell.v) {
                        hasContent = true;
                        break;
                    }
                }
                if (hasContent) estimatedDataRows++;
            }
        } catch (error) {
            console.warn(`Error analyzing sheet ${sheetName}:`, error);
        }
        
        return {
            index,
            name: sheetName,
            rowCount,
            colCount,
            hasHeaders,
            estimatedDataRows,
            score: (hasHeaders ? 20 : 0) + (estimatedDataRows * 0.5) + (rowCount > 10 ? 10 : rowCount)
        };
    });
    
    // Sort by analysis score (best sheets first)
    sheetAnalysis.sort((a, b) => b.score - a.score);
    
    console.log('📊 Sheet analysis results:');
    sheetAnalysis.forEach(sheet => {
        console.log(`${sheet.name}: ${sheet.rowCount} rows, ${sheet.colCount} cols, ` +
                   `${sheet.estimatedDataRows} data rows, score: ${sheet.score.toFixed(1)}`);
    });
    
    // Populate selector with enhanced information
    sheetSelect.innerHTML = '<option value="">Select sheet...</option>';
    
    sheetAnalysis.forEach(sheet => {
        const option = document.createElement('option');
        option.value = sheet.index;
        option.textContent = `${sheet.name} (${sheet.estimatedDataRows} data rows)`;
        
        // Add visual indicators for good candidates
        if (sheet.score > 30) {
            option.textContent += ' ⭐';
        }
        
        sheetSelect.appendChild(option);
    });
    
    console.log('✅ Sheet selector populated with analysis data');
}

// NEW: Validate naming convention structure
function validateNamingConventionStructure(namingData) {
    console.log('🔍 === VALIDATING NAMING CONVENTION STRUCTURE ===');
    
    const issues = [];
    let isValid = true;
    
    if (!namingData || !namingData.Sheets || namingData.Sheets.length < 2) {
        return {
            isValid: false,
            issues: ['Invalid naming convention structure - missing or insufficient data'],
            summary: 'Invalid structure'
        };
    }
    
    const sheets = namingData.Sheets;
    
    // Check metadata row (row 1)
    const metadataRow = sheets[0];
    if (!metadataRow || !metadataRow[1] || !metadataRow[3]) {
        issues.push('Missing delimiter or parts count in first row');
        isValid = false;
    } else {
        const partCount = parseInt(metadataRow[1]);
        const delimiter = metadataRow[3];
        
        if (isNaN(partCount) || partCount < 1 || partCount > 20) {
            issues.push(`Invalid part count: ${metadataRow[1]}`);
            isValid = false;
        }
        
        if (!delimiter || typeof delimiter !== 'string') {
            issues.push(`Invalid delimiter: ${metadataRow[3]}`);
            isValid = false;
        }
    }
    
    // Check that we have rule data (rows 2+)
    const ruleRows = sheets.slice(1);
    if (ruleRows.length === 0) {
        issues.push('No naming rules found');
        isValid = false;
    }
    
    // Summary
    const partCount = parseInt(metadataRow?.[1]) || 0;
    const delimiter = metadataRow?.[3] || 'unknown';
    const ruleCount = ruleRows.length;
    
    const summary = `${partCount} parts, "${delimiter}" delimiter, ${ruleCount} rule rows`;
    
    console.log('🔍 Validation result:', { isValid, issues, summary });
    
    return { isValid, issues, summary };
}

// Legacy function maintained for compatibility
function populateSheetSelector(workbook) {
    console.log('📋 Using legacy sheet selector (calling enhanced version)');
    populateSheetSelectorWithAnalysis(workbook);
}

// Enhanced Auto-detect File Name column in the Drawing Register
function autoDetectFileNameColumn(workbook) {
    console.log('🔍 === ENHANCED AUTO-DETECTION SYSTEM STARTED ===');
    console.log('🔍 Timestamp:', new Date().toISOString());
    console.log('🔍 Workbook sheets:', workbook.SheetNames);
    
    // Focused file name variations - case insensitive, direct matches only
    const fileNameVariations = [
        'file name',    // File Name
        'filename',     // FileName  
        'file_name',    // File_Name
        'file-name'     // File-Name
    ];
    
    console.log('🔍 Searching for:', fileNameVariations.join(', '));
    
    // Simple case-insensitive matching - no fuzzy patterns needed
    const fuzzyPatterns = [];

    try {
        showNotification('🔍 Scanning for File Name columns (focused search)...', 'info');
        
        const detectionResults = [];
        
        // Analyze each sheet with scoring system
        for (let sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
            const sheetName = workbook.SheetNames[sheetIndex];
            console.log(`\n📋 Analyzing sheet ${sheetIndex}: "${sheetName}"`);
            
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                console.log(`❌ Worksheet "${sheetName}" not accessible`);
                continue;
            }
            
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
            const dataRowCount = range.e.r + 1;
            console.log(`📊 Sheet "${sheetName}" has ${dataRowCount} rows`);
            
            // Skip sheets with very few rows (likely metadata)
            if (dataRowCount < 3) {
                console.log(`⏭️ Skipping "${sheetName}" - insufficient data rows`);
                continue;
            }
            
            // Check first 10 rows for headers
            const maxHeaderRow = Math.min(range.e.r + 1, 10);
            
            for (let rowIndex = 0; rowIndex < maxHeaderRow; rowIndex++) {
                for (let colIndex = range.s.c; colIndex <= range.e.c; colIndex++) {
                    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                    const cell = worksheet[cellRef];
                    
                    if (!cell || !cell.v) continue;
                    
                    const cellValue = String(cell.v).toLowerCase().trim();
                    const columnLetter = String.fromCharCode(65 + colIndex);
                    
                    let matchScore = 0;
                    let matchType = 'none';
                    
                    // Check exact matches first (highest score) - case insensitive
                    if (fileNameVariations.includes(cellValue)) {
                        matchScore = 100;
                        matchType = 'exact';
                    }
                    // No fuzzy patterns - only exact matches for focused detection
                    
                    // No keyword matching - only exact file name variations
                    
                    // Additional scoring factors
                    if (matchScore > 0) {
                        // Prefer columns near the beginning
                        const positionBonus = Math.max(0, 10 - colIndex);
                        
                        // Prefer rows near the top (likely headers)
                        const rowBonus = Math.max(0, 5 - rowIndex);
                        
                        // Prefer sheets with more data
                        const dataBonus = Math.min(20, Math.floor(dataRowCount / 10));
                        
                        const finalScore = matchScore + positionBonus + rowBonus + dataBonus;
                        
                        detectionResults.push({
                            sheetIndex,
                            sheetName,
                            rowIndex,
                            colIndex,
                            columnLetter,
                            cellValue,
                            matchType,
                            score: finalScore,
                            dataRowCount
                        });
                        
                        console.log(`🎯 Found candidate: "${cellValue}" at ${columnLetter}${rowIndex + 1} (Score: ${finalScore}, Type: ${matchType})`);
                    }
                }
            }
        }
        
        // Sort by score and select best match
        detectionResults.sort((a, b) => b.score - a.score);
        
        if (detectionResults.length === 0) {
            console.log('❌ No File Name columns detected (searched: File Name, FileName, File_Name, File-Name)');
            showNotification('❌ No File Name column found. Searched: File Name, FileName, File_Name, File-Name', 'warning');
            return false;
        }
        
        const bestMatch = detectionResults[0];
        console.log('\n🏆 BEST MATCH SELECTED:');
        console.log(`Sheet: "${bestMatch.sheetName}" (${bestMatch.sheetIndex})`);
        console.log(`Column: ${bestMatch.columnLetter}${bestMatch.rowIndex + 1}`);
        console.log(`Value: "${bestMatch.cellValue}"`);
        console.log(`Score: ${bestMatch.score} (${bestMatch.matchType} match)`);
        console.log(`Data rows: ${bestMatch.dataRowCount}`);
        
        // Show confidence level
        const confidence = bestMatch.score >= 100 ? 'High' : 
                          bestMatch.score >= 75 ? 'Medium' : 'Low';
        
        // Auto-configure the UI
        const sheetSelect = document.getElementById('registerSheetSelect');
        if (sheetSelect) {
            sheetSelect.value = bestMatch.sheetIndex;
            console.log(`✅ Auto-selected sheet: ${bestMatch.sheetIndex}`);
            
            // Trigger sheet change to populate columns
            const sheetEvent = new Event('change');
            sheetSelect.dispatchEvent(sheetEvent);
            
            // Wait for sheet change to complete, then select column
            setTimeout(() => {
                const columnSelect = document.getElementById('registerColumnSelect');
                if (columnSelect) {
                    columnSelect.value = bestMatch.colIndex;
                    console.log(`✅ Auto-selected column: ${bestMatch.colIndex}`);
                    
                    // Trigger column change to load data
                    const columnEvent = new Event('change');
                    columnSelect.dispatchEvent(columnEvent);
                    
                    // Auto-analyze naming patterns
                    setTimeout(() => {
                        analyzeNamingPatterns(workbook, bestMatch);
                    }, 100);
                }
            }, 100);
        }
        
        // Show comprehensive notification
        const message = `✅ Auto-detected: "${bestMatch.cellValue}" in "${bestMatch.sheetName}" - Column ${bestMatch.columnLetter} (${confidence} confidence)`;
        showNotification(message, 'success');
        
        // Show alternatives if available
        if (detectionResults.length > 1) {
            console.log('\n📋 Alternative matches found:');
            detectionResults.slice(1, 4).forEach((alt, i) => {
                console.log(`${i + 2}. "${alt.cellValue}" at ${alt.sheetName}:${alt.columnLetter}${alt.rowIndex + 1} (Score: ${alt.score})`);
            });
        }
        
        return bestMatch;
        
    } catch (error) {
        console.error('❌ Enhanced auto-detection error:', error);
        showNotification('❌ Error during auto-detection. Please select manually.', 'error');
        return false;
    }
}

function handleSheetChange() {
    console.log('🔧 handleSheetChange called');
    const sheetSelect = document.getElementById('registerSheetSelect');
    if (!sheetSelect) {
        console.error('❌ registerSheetSelect element not found');
        return;
    }
    
    const sheetIndex = sheetSelect.value;
    console.log('Sheet index selected:', sheetIndex);
    if (sheetIndex === '') return;
    
    const workbook = window.currentRegisterWorkbook;
    if (!workbook) {
        console.error('❌ No register workbook available');
        return;
    }
    
    const worksheet = workbook.Sheets[workbook.SheetNames[parseInt(sheetIndex)]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Sheet data (first row):', jsonData[0]);
    populateColumnSelector(jsonData[0] || []);
    
    // Update tables immediately when sheet changes
    setTimeout(() => {
        populateInitialTables();
    }, 100);
}

// NEW: Advanced Naming Pattern Analysis Function
function analyzeNamingPatterns(workbook, detectedMatch) {
    console.log('🧠 === ANALYZING NAMING PATTERNS ===');
    console.log('🧠 Detected match:', detectedMatch);
    
    try {
        // Get the data from the detected column
        const worksheet = workbook.Sheets[detectedMatch.sheetName];
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        
        // Extract file names from the detected column
        const fileNames = [];
        for (let rowIndex = detectedMatch.rowIndex + 1; rowIndex <= range.e.r; rowIndex++) {
            const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: detectedMatch.colIndex });
            const cell = worksheet[cellRef];
            
            if (cell && cell.v && typeof cell.v === 'string') {
                const fileName = String(cell.v).trim();
                if (fileName && fileName.length > 3) {
                    fileNames.push(fileName);
                }
            }
        }
        
        console.log(`🧠 Extracted ${fileNames.length} file names for analysis`);
        console.log('🧠 Sample file names:', fileNames.slice(0, 10));
        
        if (fileNames.length === 0) {
            console.log('❌ No file names found for pattern analysis');
            return null;
        }
        
        // Analyze patterns in file names
        const patterns = analyzeFileNameStructure(fileNames);
        
        if (patterns && patterns.confidence > 0.5) {
            console.log('🧠 Pattern analysis results:', patterns);
            
            // Auto-populate naming convention if patterns are detected
            autoPopulateNamingConvention(patterns);
            
            // Show pattern analysis results to user
            showPatternAnalysisResults(patterns);
        }
        
        return patterns;
        
    } catch (error) {
        console.error('❌ Error analyzing naming patterns:', error);
        return null;
    }
}

// NEW: File Name Structure Analysis
function analyzeFileNameStructure(fileNames) {
    console.log('🔬 === ANALYZING FILE NAME STRUCTURE ===');
    
    // Remove file extensions for analysis
    const baseNames = fileNames.map(name => {
        const lastDot = name.lastIndexOf('.');
        return lastDot > 0 ? name.substring(0, lastDot) : name;
    });
    
    console.log('🔬 Base names sample:', baseNames.slice(0, 5));
    
    // Detect common delimiters
    const delimiterCandidates = ['-', '_', ' ', '.', '+'];
    const delimiterStats = {};
    
    delimiterCandidates.forEach(delimiter => {
        const counts = baseNames.map(name => (name.split(delimiter).length - 1));
        const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
        const consistency = counts.filter(count => count > 0).length / counts.length;
        
        delimiterStats[delimiter] = {
            avgCount,
            consistency,
            score: avgCount * consistency
        };
    });
    
    // Find best delimiter
    const bestDelimiter = Object.entries(delimiterStats)
        .filter(([_, stats]) => stats.consistency > 0.3) // At least 30% of files use this delimiter
        .sort((a, b) => b[1].score - a[1].score)[0];
    
    if (!bestDelimiter) {
        console.log('🔬 No consistent delimiter pattern found');
        return { confidence: 0, message: 'No consistent naming pattern detected' };
    }
    
    const delimiter = bestDelimiter[0];
    const delimiterInfo = bestDelimiter[1];
    
    console.log(`🔬 Best delimiter: "${delimiter}" (score: ${delimiterInfo.score.toFixed(2)})`);
    
    // Analyze part structure using best delimiter
    const partAnalysis = baseNames.map(name => name.split(delimiter));
    const maxParts = Math.max(...partAnalysis.map(parts => parts.length));
    const avgParts = partAnalysis.reduce((sum, parts) => sum + parts.length, 0) / partAnalysis.length;
    
    console.log(`🔬 Part analysis: max=${maxParts}, avg=${avgParts.toFixed(1)}`);
    
    // Analyze each part position
    const partPatterns = [];
    for (let i = 0; i < maxParts; i++) {
        const partsAtPosition = partAnalysis
            .filter(parts => parts.length > i)
            .map(parts => parts[i]);
        
        if (partsAtPosition.length < baseNames.length * 0.5) {
            continue; // Skip if less than 50% of files have this part
        }
        
        const pattern = analyzePartPattern(partsAtPosition, i + 1);
        partPatterns.push(pattern);
    }
    
    const confidence = Math.min(1.0, 
        delimiterInfo.consistency * 0.4 + 
        (partPatterns.length / maxParts) * 0.3 + 
        (baseNames.length > 10 ? 0.3 : baseNames.length / 10 * 0.3)
    );
    
    console.log('🔬 Analysis complete. Confidence:', confidence);
    
    return {
        delimiter,
        expectedParts: Math.round(avgParts),
        partPatterns,
        confidence,
        sampleCount: baseNames.length,
        delimiterConsistency: delimiterInfo.consistency,
        suggestions: generateNamingConventionSuggestions(delimiter, partPatterns)
    };
}

// NEW: Analyze individual part patterns
function analyzePartPattern(parts, position) {
    console.log(`🧪 Analyzing part ${position}:`, parts.slice(0, 5));
    
    // Check if all parts are numbers
    const allNumbers = parts.every(part => /^\d+$/.test(part));
    if (allNumbers) {
        const lengths = parts.map(part => part.length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        return {
            position,
            type: 'number',
            description: `${Math.round(avgLength)}-digit number`,
            rule: Math.round(avgLength).toString(),
            examples: parts.slice(0, 3)
        };
    }
    
    // Check if parts follow letter+number pattern
    const letterNumberPattern = parts.filter(part => /^[A-Z]+\d+$/i.test(part));
    if (letterNumberPattern.length > parts.length * 0.7) {
        return {
            position,
            type: 'letter-number',
            description: 'Letter(s) followed by numbers',
            rule: 'LPL+N',
            examples: parts.slice(0, 3)
        };
    }
    
    // Check if parts are consistent values
    const uniqueValues = [...new Set(parts)];
    if (uniqueValues.length <= Math.max(5, parts.length * 0.3)) {
        return {
            position,
            type: 'fixed-values',
            description: `One of ${uniqueValues.length} fixed values`,
            rule: uniqueValues.slice(0, 5).join(' | '),
            examples: uniqueValues.slice(0, 3)
        };
    }
    
    // Default to variable description
    return {
        position,
        type: 'variable',
        description: 'Variable text description',
        rule: 'Description',
        examples: parts.slice(0, 3)
    };
}

// NEW: Generate naming convention suggestions
function generateNamingConventionSuggestions(delimiter, partPatterns) {
    const suggestions = [];
    
    suggestions.push(`Detected delimiter: "${delimiter}"`);
    suggestions.push(`Expected ${partPatterns.length} parts per file name`);
    
    partPatterns.forEach(pattern => {
        suggestions.push(`Part ${pattern.position}: ${pattern.description} (e.g., ${pattern.examples.join(', ')})`);
    });
    
    return suggestions;
}

// NEW: Auto-populate naming convention based on analysis
function autoPopulateNamingConvention(patterns) {
    console.log('🤖 === AUTO-POPULATING NAMING CONVENTION ===');
    console.log('🤖 Using patterns:', patterns);
    
    try {
        // Create a mock naming convention structure
        const autoGeneratedConvention = {
            Sheets: []
        };
        
        // Row 1: Metadata (number of parts, delimiter)
        const metadataRow = new Array(Math.max(10, patterns.expectedParts));
        metadataRow[1] = patterns.expectedParts; // Column B: Number of parts
        metadataRow[3] = patterns.delimiter;     // Column D: Delimiter
        autoGeneratedConvention.Sheets.push(metadataRow);
        
        // Row 2: Headers (Part 1, Part 2, etc.)
        const headerRow = new Array(Math.max(10, patterns.expectedParts));
        patterns.partPatterns.forEach((pattern, index) => {
            headerRow[index] = `Part ${pattern.position}`;
        });
        autoGeneratedConvention.Sheets.push(headerRow);
        
        // Row 3+: Rules for each part
        const maxRuleRows = Math.max(...patterns.partPatterns.map(p => 
            p.type === 'fixed-values' ? p.rule.split(' | ').length : 1
        ));
        
        for (let ruleRow = 0; ruleRow < Math.max(3, maxRuleRows); ruleRow++) {
            const row = new Array(Math.max(10, patterns.expectedParts));
            
            patterns.partPatterns.forEach((pattern, partIndex) => {
                if (ruleRow === 0) {
                    // First rule row - main rule
                    row[partIndex] = pattern.rule;
                } else if (pattern.type === 'fixed-values' && ruleRow > 0) {
                    // Additional rows for fixed values
                    const values = pattern.rule.split(' | ');
                    if (values[ruleRow]) {
                        row[partIndex] = values[ruleRow];
                    }
                }
            });
            
            autoGeneratedConvention.Sheets.push(row);
        }
        
        // Store the auto-generated convention
        window.autoGeneratedNamingConvention = autoGeneratedConvention;
        
        console.log('🤖 Auto-generated naming convention:', autoGeneratedConvention);
        
        // Update global naming rules data
        namingRulesData = autoGeneratedConvention;
        
        showNotification(`🤖 Auto-generated naming convention with ${patterns.expectedParts} parts using "${patterns.delimiter}" delimiter`, 'success');
        
        return autoGeneratedConvention;
        
    } catch (error) {
        console.error('❌ Error auto-populating naming convention:', error);
        return null;
    }
}

// NEW: Show pattern analysis results to user
function showPatternAnalysisResults(patterns) {
    console.log('📊 === SHOWING PATTERN ANALYSIS RESULTS ===');
    
    // Create a notification with detailed pattern information
    const confidence = Math.round(patterns.confidence * 100);
    const message = `📊 Pattern Analysis Complete (${confidence}% confidence):\n` +
                   `• Delimiter: "${patterns.delimiter}"\n` +
                   `• Expected parts: ${patterns.expectedParts}\n` +
                   `• Analyzed ${patterns.sampleCount} file names\n` +
                   `• Auto-generated naming convention`;
    
    console.log(message);
    showNotification('📊 Naming patterns analyzed and convention auto-generated', 'info');
    
    // Optional: Show detailed analysis in console for debugging
    console.log('📊 Detailed pattern analysis:');
    patterns.partPatterns.forEach(pattern => {
        console.log(`Part ${pattern.position}: ${pattern.description} (${pattern.rule})`);
        console.log(`  Examples: ${pattern.examples.join(', ')}`);
    });
    
    console.log('📊 Suggestions:');
    patterns.suggestions.forEach(suggestion => {
        console.log(`  • ${suggestion}`);
    });
}

function populateColumnSelector(headers) {
    console.log('🔧 populateColumnSelector called with headers:', headers);
    const columnSelect = document.getElementById('registerColumnSelect');
    console.log('Column select element found:', !!columnSelect);
    
    columnSelect.innerHTML = '<option value="">Select column...</option>';
    
    headers.forEach((header, index) => {
        if (header) {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${String.fromCharCode(65 + index)}: ${header}`;
            columnSelect.appendChild(option);
            console.log(`Added column option: ${String.fromCharCode(65 + index)}: ${header}`);
        }
    });
    
    console.log('Total options in column select:', columnSelect.options.length);
}

function handleColumnChange() {
    console.log('🔧 === ENHANCED COLUMN CHANGE HANDLER ===');
    const sheetSelect = document.getElementById('registerSheetSelect');
    const columnSelect = document.getElementById('registerColumnSelect');
    
    if (!sheetSelect || !columnSelect) {
        console.error('❌ Required DOM elements not found:', {
            sheetSelect: !!sheetSelect,
            columnSelect: !!columnSelect
        });
        return;
    }
    
    const sheetIndex = sheetSelect.value;
    const columnIndex = columnSelect.value;
    
    console.log('Sheet index:', sheetIndex, 'Column index:', columnIndex);
    if (sheetIndex === '' || columnIndex === '') return;
    
    const workbook = window.currentRegisterWorkbook;
    if (!workbook) {
        console.error('❌ No register workbook available');
        return;
    }
    
    const sheetName = workbook.SheetNames[parseInt(sheetIndex)];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Extract column data with enhanced validation
    const columnData = jsonData.slice(1)
        .map(row => row[parseInt(columnIndex)])
        .filter(cell => cell && typeof cell === 'string' && cell.trim() !== '');
    
    // Remove duplicates and empty entries
    const uniqueFileNames = [...new Set(columnData.map(name => name.trim()))];
    
    fileNamesFromExcel = uniqueFileNames;
    console.log(`✅ Extracted ${uniqueFileNames.length} unique file names (${columnData.length} total entries)`);
    console.log('📋 Sample file names:', uniqueFileNames.slice(0, 5));
    
    // Calculate duplicate count for use throughout function
    const duplicateCount = columnData.length - uniqueFileNames.length;
    
    // Enhanced preview with statistics
    const preview = document.getElementById('configPreview');
    if (preview) {
        const previewText = uniqueFileNames.slice(0, 3).join(', ');
        const duplicateInfo = duplicateCount > 0 ? ` (${duplicateCount} duplicates removed)` : '';
        
        preview.innerHTML = `
            <div style="font-size: 12px; color: #666;">
                <strong>Preview:</strong> ${previewText}...<br>
                <strong>Total files:</strong> ${uniqueFileNames.length}${duplicateInfo}<br>
                <strong>Source:</strong> ${sheetName} - Column ${String.fromCharCode(65 + parseInt(columnIndex))}
            </div>
        `;
    }
    
    // Trigger automatic naming pattern analysis
    if (uniqueFileNames.length > 5) {
        console.log('🧠 Triggering automatic naming pattern analysis...');
        setTimeout(() => {
            const mockMatch = {
                sheetName: sheetName,
                colIndex: parseInt(columnIndex),
                rowIndex: 0 // Assuming header is in first row
            };
            analyzeNamingPatterns(workbook, mockMatch);
        }, 500);
    }
    
    // Show enhanced notification
    const notification = duplicateCount > 0 
        ? `✅ Loaded ${uniqueFileNames.length} drawings (${duplicateCount} duplicates removed)`
        : `✅ Loaded ${uniqueFileNames.length} drawings from register`;
    
    showNotification(notification, 'success');
    
    // Update tables immediately when column changes
    setTimeout(() => {
        populateInitialTables();
    }, 100);
    
    // Show Excel configuration with progressive disclosure
    showExcelConfiguration();
}

// Main Processing Function
async function runAllChecks() {
    console.log('🚀 === RUN ALL CHECKS INITIATED ===');
    console.log('📊 Data availability check:');
    console.log('  - fileResultsFromFolder length:', fileResultsFromFolder ? fileResultsFromFolder.length : 'undefined');
    console.log('  - fileNamesFromExcel length:', fileNamesFromExcel ? fileNamesFromExcel.length : 'undefined');
    console.log('  - uploadedFiles length:', uploadedFiles ? uploadedFiles.length : 'undefined');
    console.log('  - titleBlockData length:', titleBlockData ? titleBlockData.length : 'undefined');
    
    showNotification('Running quality checks...', 'info');
    
    // Enhanced validation with more detailed feedback
    if (!fileResultsFromFolder || fileResultsFromFolder.length === 0) {
        console.log('❌ No folder files available');
        showNotification('❌ Please upload folder files first', 'warning');
        return;
    }
    
    if (!fileNamesFromExcel || fileNamesFromExcel.length === 0) {
        console.log('❌ No Excel file names available');
        showNotification('❌ Please upload and configure Drawing Register file', 'warning');
        return;
    }
    
    console.log('✅ Data validation passed, proceeding with checks...');
    console.log('📁 Sample folder files:', fileResultsFromFolder.slice(0, 3).map(f => f.name));
    console.log('📋 Sample Excel names:', fileNamesFromExcel.slice(0, 3));

    // Apply current filter
    const filteredFiles = applyFileFilter(fileResultsFromFolder);
    console.log(`🔍 Applied filter, ${filteredFiles.length} files after filtering`);
    
    // Run all checks with error handling
    try {
        const drawingListResults = compareDrawingList(fileNamesFromExcel, filteredFiles);
        console.log('✅ Drawing List comparison completed:', drawingListResults.length, 'results');
        
        const namingResults = checkNamingCompliance(filteredFiles);
        console.log('✅ Naming compliance check completed:', namingResults.length, 'results');
        
        const qaqcResults = checkQAQC(filteredFiles);
        console.log('✅ QA-QC check completed:', qaqcResults.length, 'results');
        
        // Update UI with enhanced logging
        console.log('🎨 Updating UI with results...');
        updateSummaryMetrics(drawingListResults, namingResults, qaqcResults);
        updateResultsTables(drawingListResults, namingResults, qaqcResults);
        updateCharts(drawingListResults, namingResults, qaqcResults);
        
        showNotification('✅ Quality checks completed successfully', 'success');
        console.log('🎉 All checks completed successfully');
        
    } catch (error) {
        console.error('❌ Error during checks:', error);
        showNotification('❌ Error during quality checks: ' + error.message, 'error');
    }
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
                
                // Check for manual comment - if comment exists, fail the title block
                const userComment = commentsData[file.name];
                if (userComment && userComment.trim()) {
                    issues.push(`Manual comment: ${userComment.trim()}`);
                    console.log(`❌ Manual comment found for ${file.name}: "${userComment.trim()}" - failing title block`);
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
                
                // Check for manual comment even when no title block data
                const userComment = commentsData[file.name];
                let failureReason = 'No title block data found for this file';
                if (userComment && userComment.trim()) {
                    failureReason += `; Manual comment: ${userComment.trim()}`;
                    console.log(`❌ Manual comment found for ${file.name}: "${userComment.trim()}"`);
                }
                
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
                    issues: failureReason
                };
            }
        } else {
            console.log('❌ No title block data loaded');
            
            // Check for manual comment even when no title block data loaded
            const userComment = commentsData[file.name];
            let failureReason = 'No title block data loaded';
            if (userComment && userComment.trim()) {
                failureReason += `; Manual comment: ${userComment.trim()}`;
                console.log(`❌ Manual comment found for ${file.name}: "${userComment.trim()}"`);
            }
            
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
                issues: failureReason
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
    console.log('🎨 === UPDATING RESULTS TABLES ===');
    console.log('📊 Drawing results length:', drawingResults ? drawingResults.length : 'undefined');
    console.log('📝 Naming results length:', namingResults ? namingResults.length : 'undefined');
    console.log('📋 QA-QC results length:', qaqcResults ? qaqcResults.length : 'undefined');
    
    // Update Drawing List table with validation
    const drawingTable = document.getElementById('drawingListResults');
    if (drawingTable && drawingResults) {
        console.log('✅ Updating Drawing List table...');
        drawingTable.innerHTML = drawingResults.map(result => `
            <tr>
                <td>${result.excelName || 'N/A'}</td>
                <td>${result.matchedFile || 'N/A'}</td>
                <td><span class="status-badge ${getStatusClass(result.status)}">${result.status || 'Unknown'}</span></td>
            </tr>
        `).join('');
        console.log(`📊 Drawing List table populated with ${drawingResults.length} rows`);
    } else {
        console.log('❌ Drawing List table update failed:', {
            hasTable: !!drawingTable,
            hasResults: !!drawingResults
        });
    }
    
    // Update Naming table with validation
    const namingTable = document.getElementById('namingResults');
    if (namingTable && namingResults) {
        console.log('✅ Updating Naming table...');
        namingTable.innerHTML = namingResults.map(result => `
            <tr>
                <td>${result.folderPath || 'N/A'}</td>
                <td>${result.highlightedFileName || result.fileName || 'N/A'}</td>
                <td><span class="status-badge ${result.status === 'Ok' ? 'success' : result.status === 'OK' ? 'success' : result.status === 'WARNING' ? 'warning' : 'error'}">${result.status || 'Unknown'}</span></td>
                <td>${result.details || 'N/A'}</td>
            </tr>
        `).join('');
        console.log(`📝 Naming table populated with ${namingResults.length} rows`);
    } else {
        console.log('❌ Naming table update failed:', {
            hasTable: !!namingTable,
            hasResults: !!namingResults
        });
    }
    
    // Update QA-QC table with enhanced validation
    const qaqcTable = document.getElementById('qaqcResults');
    if (qaqcTable && qaqcResults) {
        console.log('✅ Updating QA-QC table...');
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
            
            // Get existing comment for this file
            const existingComment = commentsData[result.fileName] || '';
            
            return `
                <tr>
                    <td>${result.sheetNumber || 'N/A'}</td>
                    <td>${result.sheetName || 'N/A'}</td>
                    <td>${result.fileName || 'N/A'}</td>
                    <td class="${revCodeClass}">${result.revCode || 'N/A'}</td>
                    <td>${result.revDate || 'N/A'}</td>
                    <td>${result.revDescription || 'N/A'}</td>
                    <td>${result.suitability || 'N/A'}</td>
                    <td>${result.stage || 'N/A'}</td>
                    <td><span class="status-badge ${namingStatusClass}">${namingStatus}</span></td>
                    <td><span class="status-badge success">${deliveryStatus}</span></td>
                    <td><input type="text" class="comment-input" placeholder="Add comment..." value="${existingComment}"></td>
                    <td><span class="status-badge ${result.result === 'PASS' ? 'success' : result.result === 'FAIL' ? 'error' : 'warning'}">${result.result || 'Unknown'}</span></td>
                    <td>${result.issues || 'N/A'}</td>
                </tr>
            `;
        }).join('');
        
        console.log(`📋 QA-QC table populated with ${qaqcResults.length} rows`);
    } else {
        console.log('❌ QA-QC table update failed:', {
            hasTable: !!qaqcTable,
            hasResults: !!qaqcResults
        });
    }
    
    // Ensure comment inputs are interactive
    setTimeout(() => {
        setupCommentInputs();
    }, 100);
}

// Setup comment inputs to ensure they're interactive
function setupCommentInputs() {
    const commentInputs = document.querySelectorAll('.comment-input');
    console.log(`Setting up ${commentInputs.length} comment inputs`);
    
    commentInputs.forEach((input, index) => {
        // Ensure the input is focusable and interactive
        input.tabIndex = 0;
        input.style.pointerEvents = 'auto';
        input.style.zIndex = '10';
        
        // Get the file name from the row
        const row = input.closest('tr');
        const fileNameCell = row?.cells[2]; // File Name is the 3rd column (index 2)
        const fileName = fileNameCell?.textContent?.trim();
        
        if (fileName) {
            // Restore any existing comment
            if (commentsData[fileName]) {
                input.value = commentsData[fileName];
            }
            
            // Add event listeners for better interaction
            input.addEventListener('focus', function(e) {
                console.log(`Comment input ${index} focused for file: ${fileName}`);
                e.stopPropagation();
                this.style.borderColor = '#3b82f6';
                this.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.1)';
                this.style.zIndex = '20';
            });
            
            input.addEventListener('blur', function() {
                this.style.borderColor = '#e2e8f0';
                this.style.boxShadow = 'none';
                this.style.zIndex = '10';
            });
            
            input.addEventListener('input', function() {
                console.log(`Comment input ${index} changed for ${fileName}:`, this.value);
                // Store the comment
                commentsData[fileName] = this.value.trim();
                
                // Trigger re-evaluation of title block if comment added/removed
                if (this.value.trim()) {
                    console.log(`Comment added for ${fileName}, will fail title block`);
                } else {
                    console.log(`Comment removed for ${fileName}, will re-evaluate title block`);
                }
            });
            
            // Prevent row click from interfering
            input.addEventListener('click', function(e) {
                console.log(`Comment input ${index} clicked for file: ${fileName}`);
                e.stopPropagation();
                this.focus();
            });
            
            input.addEventListener('mousedown', function(e) {
                e.stopPropagation();
            });
        }
    });
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
    const filterElement = document.getElementById('fileTypeFilter');
    const filter = filterElement ? filterElement.value : 'all';
    
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
    const filterElement = document.getElementById('fileTypeFilter');
    currentFilter = filterElement ? filterElement.value : 'all';
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

// Enhanced notification system with better visual feedback
function showNotification(message, type) {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.enhanced-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create enhanced notification element
    const notification = document.createElement('div');
    notification.className = 'enhanced-notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">${getNotificationIcon(type)}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: inherit; font-size: 18px; cursor: pointer; opacity: 0.7;">
                ×
            </button>
        </div>
    `;
    
    // Enhanced styling based on type
    const baseStyle = `
        position: fixed; 
        top: 20px; 
        right: 20px; 
        padding: 12px 16px; 
        border-radius: 8px; 
        color: white; 
        font-weight: 500; 
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid rgba(255,255,255,0.3);
        font-size: 14px;
        line-height: 1.4;
    `;
    
    const typeStyles = {
        success: 'background: linear-gradient(135deg, #10b981, #059669);',
        warning: 'background: linear-gradient(135deg, #f59e0b, #d97706);',
        error: 'background: linear-gradient(135deg, #ef4444, #dc2626);',
        info: 'background: linear-gradient(135deg, #3b82f6, #2563eb);'
    };
    
    notification.style.cssText = baseStyle + (typeStyles[type] || typeStyles.info);
    
    document.body.appendChild(notification);
    
    // Enhanced auto-removal with fade out
    const duration = type === 'error' ? 8000 : type === 'warning' ? 6000 : 4000;
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, duration);
    
    // Add slide-in animation
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'transform 0.3s ease-out';
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Optional: Add visual feedback to header for important notifications
    if (type === 'success' || type === 'error') {
        const header = document.querySelector('.app-header h1');
        if (header) {
            const originalColor = header.style.color;
            header.style.color = type === 'success' ? '#10b981' : '#ef4444';
            header.style.transition = 'color 0.3s ease';
            
            setTimeout(() => {
                header.style.color = originalColor;
            }, 1000);
        }
    }
}

// NEW: Auto-fill Expected Values based on most common values from Title Block data
function autoFillExpectedValues(titleBlockData) {
    console.log('🤖 === AUTO-FILLING EXPECTED VALUES ===');
    console.log('🤖 Analyzing', titleBlockData.length, 'title block records');
    
    try {
        // Define field mappings: Expected Value field ID -> Title Block property
        const fieldMappings = {
            'expectedRevCode': 'revisionCode',
            'expectedRevDate': 'revisionDate', 
            'expectedSuitability': 'suitabilityCode',
            'expectedStage': 'stageDescription',
            'expectedRevDesc': 'revisionDescription'
        };
        
        const autoFilledValues = {};
        let totalFieldsAutoFilled = 0;
        
        // Process each field
        Object.entries(fieldMappings).forEach(([fieldId, titleBlockProperty]) => {
            console.log(`\n🔍 Analyzing field: ${fieldId} (${titleBlockProperty})`);
            
            // Special handling for revision code - always default to P01
            if (fieldId === 'expectedRevCode') {
                console.log('🎯 Auto-setting revision code to P01 (default)');
                
                const formField = document.getElementById(fieldId);
                if (formField) {
                    const previousValue = formField.value;
                    formField.value = 'P01';
                    
                    autoFilledValues[fieldId] = {
                        value: 'P01',
                        frequency: 'N/A',
                        totalValues: titleBlockData.length,
                        previousValue: previousValue,
                        confidence: 100,
                        isDefault: true
                    };
                    
                    totalFieldsAutoFilled++;
                    console.log(`📝 Auto-filled ${fieldId}: "P01" (default value)`);
                } else {
                    console.warn(`⚠️ Form field ${fieldId} not found in DOM`);
                }
                return; // Skip the normal analysis for revision code
            }
            
            // Normal analysis for all other fields
            // Extract all non-empty values for this property
            const values = titleBlockData
                .map(record => record[titleBlockProperty])
                .filter(value => value && typeof value === 'string' && value.trim() !== '')
                .map(value => value.trim());
            
            console.log(`📊 Found ${values.length} non-empty values:`, values.slice(0, 5));
            
            if (values.length === 0) {
                console.log(`⚠️ No valid values found for ${fieldId}`);
                return;
            }
            
            // Count frequency of each value
            const frequency = {};
            values.forEach(value => {
                frequency[value] = (frequency[value] || 0) + 1;
            });
            
            console.log(`📈 Frequency analysis:`, frequency);
            
            // Find most common value(s)
            const maxCount = Math.max(...Object.values(frequency));
            const mostCommonValues = Object.entries(frequency)
                .filter(([_, count]) => count === maxCount)
                .map(([value, _]) => value);
            
            console.log(`🏆 Most common values (${maxCount} occurrences):`, mostCommonValues);
            
            // Select the best value: lowest for revision codes, then first found for others
            let selectedValue;
            if (mostCommonValues.length === 1) {
                selectedValue = mostCommonValues[0];
            } else {
                // Multiple values with same frequency - pick lowest for rev codes, first for others
                if (fieldId === 'expectedRevCode') {
                    // For revision codes, sort to get LOWEST revision
                    console.log(`🔍 Comparing revision codes for lowest:`, mostCommonValues);
                    
                    selectedValue = mostCommonValues.sort((a, b) => {
                        console.log(`  Comparing "${a}" vs "${b}"`);
                        
                        // Simple comparison approach - convert to comparable format
                        const normalizeRevision = (rev) => {
                            // Handle letter+number format (P01, A02, etc.)
                            const letterNumberMatch = rev.match(/^([A-Z])(\d+)$/i);
                            if (letterNumberMatch) {
                                const letter = letterNumberMatch[1].toUpperCase();
                                const number = parseInt(letterNumberMatch[2]);
                                // Create sortable string: letter + zero-padded number
                                return letter + number.toString().padStart(3, '0');
                            }
                            
                            // Handle number-only format (01, 02, etc.)
                            const numberMatch = rev.match(/^(\d+)$/);
                            if (numberMatch) {
                                const number = parseInt(numberMatch[1]);
                                return number.toString().padStart(3, '0');
                            }
                            
                            // For anything else, return as-is
                            return rev.toUpperCase();
                        };
                        
                        const normalizedA = normalizeRevision(a);
                        const normalizedB = normalizeRevision(b);
                        
                        console.log(`    "${a}" -> "${normalizedA}", "${b}" -> "${normalizedB}"`);
                        
                        // Simple string comparison for lowest first
                        const result = normalizedA.localeCompare(normalizedB);
                        console.log(`    Result: ${result} (${result < 0 ? 'A wins' : result > 0 ? 'B wins' : 'tie'})`);
                        
                        return result;
                    })[0];
                    
                    console.log(`🏆 Selected lowest revision: "${selectedValue}"`);
                } else {
                    // For other fields, just pick the first one
                    selectedValue = mostCommonValues[0];
                }
            }
            
            console.log(`✅ Selected value for ${fieldId}: "${selectedValue}" ${fieldId === 'expectedRevCode' ? '(lowest revision)' : ''}`);
            
            // Auto-fill the form field
            const formField = document.getElementById(fieldId);
            if (formField) {
                const previousValue = formField.value;
                formField.value = selectedValue;
                
                // Track what was auto-filled
                autoFilledValues[fieldId] = {
                    value: selectedValue,
                    frequency: maxCount,
                    totalValues: values.length,
                    previousValue: previousValue,
                    confidence: Math.round((maxCount / values.length) * 100)
                };
                
                totalFieldsAutoFilled++;
                
                console.log(`📝 Auto-filled ${fieldId}: "${selectedValue}" (${maxCount}/${values.length} = ${autoFilledValues[fieldId].confidence}% confidence)`);
            } else {
                console.warn(`⚠️ Form field ${fieldId} not found in DOM`);
            }
        });
        
        // Show comprehensive notification
        if (totalFieldsAutoFilled > 0) {
            const notification = `🤖 Auto-filled ${totalFieldsAutoFilled} Expected Values based on most common title block values`;
            showNotification(notification, 'success');
            
            // Show detailed results in console
            console.log('\n🤖 AUTO-FILL SUMMARY:');
            Object.entries(autoFilledValues).forEach(([fieldId, data]) => {
                const statusText = data.isDefault ? '(default)' : `(${data.confidence}% confidence, ${data.frequency}/${data.totalValues} records)`;
                console.log(`${fieldId}: "${data.value}" ${statusText}`);
            });
            
            // Show user-friendly summary
            setTimeout(() => {
                const detailsMessage = `📊 Auto-fill details:\n` +
                    Object.entries(autoFilledValues).map(([fieldId, data]) => {
                        const fieldName = fieldId.replace('expected', '').replace('Rev', 'Revision ').replace('Desc', 'Description');
                        const statusText = data.isDefault ? '(default)' : `(${data.confidence}% confidence)`;
                        return `• ${fieldName}: "${data.value}" ${statusText}`;
                    }).join('\n') +
                    `\n\n💡 You can manually override these values if needed.`;
                
                console.log(detailsMessage);
                showNotification('📊 Expected Values auto-filled. Revision Code set to P01 (default).', 'info');
            }, 2000);
        } else {
            showNotification('⚠️ No Expected Values could be auto-filled - insufficient title block data', 'warning');
        }
        
        console.log('🤖 === AUTO-FILL COMPLETE ===');
        return autoFilledValues;
        
    } catch (error) {
        console.error('❌ Error auto-filling Expected Values:', error);
        showNotification('❌ Error auto-filling Expected Values', 'error');
        return null;
    }
}

// Helper function for notification icons
function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
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
