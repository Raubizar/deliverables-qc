import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CircularGauge } from "./CircularGauge";
import { MetricCard } from "./MetricCard";
import { MiniBarChart, MiniDoughnut, SparkBar } from "./MiniChart";
import { Folder, FileText, Edit3, PenTool, Download, Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useValidationRunner, type ValidationInputs } from "../hooks/useValidationRunner";
import { FileSystemUtil, type FileSystemDirectoryHandle } from "../utils";

interface QCState {
  selectedFolder: FileSystemDirectoryHandle | null;
  folderName: string;
  includeSubfolders: boolean;
  registerFile: File | null;
  namingRulesFile: File | null;
  titleBlocksFile: File | null;
}

export const DrawingQC = () => {
  const [state, setState] = useState<QCState>({
    selectedFolder: null,
    folderName: "",
    includeSubfolders: true,
    registerFile: null,
    namingRulesFile: null,
    titleBlocksFile: null,
  });

  const [searchFilter, setSearchFilter] = useState("");
  const { state: validationState, runValidation, downloadReport, reset } = useValidationRunner();

  // Debug: Log validation state changes
  React.useEffect(() => {
    console.log('Validation state updated:', validationState);
  }, [validationState]);

  // Allow running checks with minimum required inputs (folder + register file)
  const canRunChecks = state.selectedFolder && state.registerFile;

  const handleRunChecks = async () => {
    console.log('=== STARTING VALIDATION ===');
    console.log('handleRunChecks called');
    console.log('canRunChecks:', canRunChecks);
    console.log('Current state:', {
      hasFolder: !!state.selectedFolder,
      folderName: state.folderName,
      hasRegisterFile: !!state.registerFile,
      registerFileName: state.registerFile?.name,
      hasNamingFile: !!state.namingRulesFile,
      namingFileName: state.namingRulesFile?.name,
      hasTitleBlockFile: !!state.titleBlocksFile,
      titleBlockFileName: state.titleBlocksFile?.name,
      includeSubfolders: state.includeSubfolders
    });
    
    if (!canRunChecks) {
      console.log('Cannot run checks - missing required inputs');
      console.log('Required: folder + register file');
      console.log('Has folder:', !!state.selectedFolder);
      console.log('Has register file:', !!state.registerFile);
      return;
    }

    const inputs: ValidationInputs = {
      folder: state.selectedFolder,
      includeSubfolders: state.includeSubfolders,
      registerFile: state.registerFile,
      namingFile: state.namingRulesFile,
      titleBlockFile: state.titleBlocksFile,
    };

    console.log('Validation inputs prepared:', {
      folder: inputs.folder ? { name: inputs.folder.name, kind: inputs.folder.kind } : null,
      includeSubfolders: inputs.includeSubfolders,
      registerFile: inputs.registerFile ? { name: inputs.registerFile.name, size: inputs.registerFile.size } : null,
      namingFile: inputs.namingFile ? { name: inputs.namingFile.name, size: inputs.namingFile.size } : null,
      titleBlockFile: inputs.titleBlockFile ? { name: inputs.titleBlockFile.name, size: inputs.titleBlockFile.size } : null,
    });
    
    try {
      console.log('Starting validation...');
      await runValidation(inputs);
      console.log('Validation completed successfully');
    } catch (error) {
      console.error('Validation failed:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
    }
  };

  const handleFileSelect = (field: 'registerFile' | 'namingRulesFile' | 'titleBlocksFile') => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setState(prev => ({ ...prev, [field]: file }));
      }
    };

  const handleFolderSelect = async () => {
    try {
      console.log('=== FOLDER SELECTION START ===');
      console.log('Attempting to select folder...');
      console.log('Current URL:', window.location.href);
      console.log('User Agent:', navigator.userAgent);
      console.log('Is secure context:', window.isSecureContext);
      console.log('showDirectoryPicker in window:', 'showDirectoryPicker' in window);
      
      if (FileSystemUtil.isFileSystemAccessSupported()) {
        console.log('✓ File System Access API is supported');
        
        const directory = await FileSystemUtil.selectDirectory();
        console.log('Directory selection result:', directory);
        
        if (directory) {
          console.log('✓ Directory selected successfully');
          console.log('Directory name:', directory.name);
          console.log('Directory kind:', directory.kind);
          
          setState(prev => ({ 
            ...prev, 
            selectedFolder: directory, 
            folderName: directory.name 
          }));
          
          console.log('✓ State updated with folder:', directory.name);
          
          // Test directory access immediately
          try {
            console.log('Testing immediate directory access...');
            const entries = directory.entries();
            const firstEntry = await entries.next();
            console.log('✓ Directory access test successful:', firstEntry.value);
          } catch (accessError) {
            console.error('⚠ Directory access test failed:', accessError);
          }
        } else {
          console.log('⚠ User cancelled folder selection or selection failed');
        }
      } else {
        console.error('✗ File System Access API is NOT supported');
        const isChrome = /Chrome/.test(navigator.userAgent);
        const isEdge = /Edg/.test(navigator.userAgent);
        const isHttps = window.location.protocol === 'https:';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        console.log('Browser detection:', { isChrome, isEdge, isHttps, isLocalhost });
        
        alert(`File System Access API is not supported. 
Browser: ${isChrome ? 'Chrome' : isEdge ? 'Edge' : 'Other'}
Protocol: ${window.location.protocol}
Context: ${window.isSecureContext ? 'Secure' : 'Insecure'}

Please use Chrome/Edge with HTTPS or localhost.`);
      }
      console.log('=== FOLDER SELECTION END ===');
    } catch (error) {
      console.error('=== FOLDER SELECTION ERROR ===');
      console.error('Error selecting folder:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      alert(`Error selecting folder: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleDownloadReport = async () => {
    try {
      await downloadReport();
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'valid': return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'invalid': 
      case 'mismatch':
      case 'missing': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return null;
    }
  };

  // Filter function for search
  const filterResults = (items: any[], searchTerm: string) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with blur effect */}
      <header className="sticky top-0 z-50 bg-background/80 apple-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-center text-foreground">Drawing QC</h1>
          {validationState.isRunning && (
            <div className="mt-3">
              <Progress value={validationState.progress} className="h-1" />
              <p className="text-sm text-muted-foreground mt-1 text-center">
                {validationState.currentStep}
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Inputs Card */}
        <Card className="apple-shadow fade-slide-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Input Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {/* Folder Selection */}
              <div className="grid grid-cols-12 gap-4 items-center py-3 border-b border-border">
                <div className="col-span-1 flex justify-center">
                  <Folder className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="col-span-4">
                  <Label className="text-sm font-medium">Select Folder</Label>
                </div>
                <div className="col-span-4">
                  <span className="text-sm text-muted-foreground">Root folder of files</span>
                  {state.folderName && (
                    <div className="text-sm text-green-600 mt-1">
                      ✓ Selected: {state.folderName}
                    </div>
                  )}
                </div>
                <div className="col-span-3">
                  <Button 
                    variant="outline" 
                    onClick={handleFolderSelect}
                    className="w-full apple-transition apple-hover"
                  >
                    Choose Folder
                  </Button>
                </div>
              </div>

              {/* Include Subfolders */}
              <div className="grid grid-cols-12 gap-4 items-center py-3 border-b border-border">
                <div className="col-span-1 flex justify-center">
                  <div className="w-5 h-5 flex items-center justify-center text-muted-foreground">↳</div>
                </div>
                <div className="col-span-4">
                  <Label className="text-sm font-medium">Include sub-folders</Label>
                </div>
                <div className="col-span-4">
                  <span className="text-sm text-muted-foreground">Tick to recurse (default ON)</span>
                </div>
                <div className="col-span-3 flex justify-start">
                  <Checkbox 
                    checked={state.includeSubfolders}
                    onCheckedChange={(checked) => setState(prev => ({ ...prev, includeSubfolders: !!checked }))}
                  />
                </div>
              </div>

              {/* Register File */}
              <div className="grid grid-cols-12 gap-4 items-center py-3 border-b border-border">
                <div className="col-span-1 flex justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="col-span-4">
                  <Label className="text-sm font-medium">Register.xlsx</Label>
                </div>
                <div className="col-span-4">
                  <span className="text-sm text-muted-foreground">Drawing register</span>
                </div>
                <div className="col-span-3">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect('registerFile')}
                    className="apple-transition"
                  />
                </div>
              </div>

              {/* Naming Rules File */}
              <div className="grid grid-cols-12 gap-4 items-center py-3 border-b border-border">
                <div className="col-span-1 flex justify-center">
                  <Edit3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="col-span-4">
                  <Label className="text-sm font-medium">Naming-Rules.xlsx</Label>
                </div>
                <div className="col-span-4">
                  <span className="text-sm text-muted-foreground">Allowed file-name parameters</span>
                </div>
                <div className="col-span-3">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect('namingRulesFile')}
                    className="apple-transition"
                  />
                </div>
              </div>

              {/* Title Blocks File */}
              <div className="grid grid-cols-12 gap-4 items-center py-3">
                <div className="col-span-1 flex justify-center">
                  <PenTool className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="col-span-4">
                  <Label className="text-sm font-medium">Title-Blocks.xlsx</Label>
                </div>
                <div className="col-span-4">
                  <span className="text-sm text-muted-foreground">Title-block export</span>
                </div>
                <div className="col-span-3">
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect('titleBlocksFile')}
                    className="apple-transition"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleRunChecks}
                disabled={!canRunChecks || validationState.isRunning}
                className="w-full apple-transition apple-hover"
                size="lg"
              >
                {validationState.isRunning ? "Processing..." : "Run Checks"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Panel */}
        {validationState.results && (
          <Card className="apple-shadow fade-slide-in">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-5">
                <div className="md:col-span-2 flex justify-center">
                  <CircularGauge percentage={validationState.results.overallCompliance} />
                </div>
                <div className="md:col-span-3 grid gap-4 sm:grid-cols-2">
                  <MetricCard
                    title="Drawings scanned"
                    value={validationState.results.totalFiles}
                    tooltip="Count of files processed"
                  />
                  <MetricCard
                    title="Missing vs expected"
                    value={`${validationState.results.missingFiles.missingCount} missing`}
                    chart={<MiniBarChart missing={validationState.results.missingFiles.missingCount} total={validationState.results.missingFiles.totalExpected} />}
                    tooltip="From Register.xlsx"
                  />
                  <MetricCard
                    title="Naming compliance"
                    value={`${validationState.results.naming.compliancePercentage}% OK`}
                    chart={<SparkBar data={[72, 78, 83, 87, 90, 94]} />}
                    tooltip="From Naming-Rules.xlsx"
                  />
                  <MetricCard
                    title="Title-block compliance"
                    value={`${validationState.results.titleBlock.compliancePercentage}% OK`}
                    chart={<SparkBar data={[65, 71, 76, 82, 85, 89]} />}
                    tooltip="From Title-Blocks.xlsx"
                  />
                  <MetricCard
                    title="Overall compliance"
                    value={`${validationState.results.overallCompliance}% OK`}
                    chart={<SparkBar data={[78, 81, 84, 86, 87, 87]} />}
                    tooltip="Combined compliance score"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Viewer */}
        {validationState.results && (
          <Card className="apple-shadow fade-slide-in">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Results</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search results..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-9 w-64 apple-transition"
                  />
                </div>
                <Button variant="outline" className="apple-transition apple-hover" onClick={handleDownloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download XLSX Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Tabs */}
              <div className="mb-4 flex justify-between items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search results..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Validation Report</TabsTrigger>
                  <TabsTrigger value="missing">Check Drawing List</TabsTrigger>
                  <TabsTrigger value="naming">Naming Checker</TabsTrigger>
                  <TabsTrigger value="titleblock">Title-Block Errors</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-6">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background min-w-[100px]">Sheet Number</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[150px]">Sheet Name</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[200px]">File Name</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[100px]">Revision Code</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[120px]">Revision Date</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[150px]">Revision Description</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[120px]">Suitability Code</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[150px]">Stage Description</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[160px]">Naming Convention Status</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[140px]">File Delivery Status</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[150px]">Comments</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[100px]">Result</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[180px]">Mismatched Items</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterResults(validationState.results.titleBlock.results, searchFilter).map((result, index) => {
                          // Find if this file has naming issues
                          const namingError = validationState.results.naming.errors.find(
                            err => err.fileName === result.fileName
                          );
                          
                          // Check if this file is missing
                          const isMissing = validationState.results.missingFiles.missingFiles.some(
                            missing => missing.expectedFile === result.fileName
                          );
                          
                          // Determine overall result
                          const hasNamingIssue = namingError !== undefined;
                          const hasValidationIssue = result.status !== 'VALID';
                          const overallResult = isMissing ? 'Missing' : 
                                              hasNamingIssue || hasValidationIssue ? 'Issues Found' : 'OK';
                          
                          // Build mismatched items list
                          const mismatchedItems = [];
                          if (hasNamingIssue) mismatchedItems.push(`Naming: ${namingError.errorType}`);
                          if (hasValidationIssue) mismatchedItems.push('Title Block validation failed');
                          if (isMissing) mismatchedItems.push('File not found');
                          
                          return (
                            <TableRow key={index} className={isMissing ? 'bg-destructive/10' : hasNamingIssue || hasValidationIssue ? 'bg-orange-50' : ''}>
                              <TableCell className="text-sm">{result.sheetNo}</TableCell>
                              <TableCell className="font-medium text-sm">{result.sheetName}</TableCell>
                              <TableCell className="text-sm break-all">{result.fileName}</TableCell>
                              <TableCell className="text-sm">{result.revCode}</TableCell>
                              <TableCell className="text-sm">{result.revDate}</TableCell>
                              <TableCell className="text-sm">{result.revDescription || '-'}</TableCell>
                              <TableCell className="text-sm">{result.suitabilityCode || '-'}</TableCell>
                              <TableCell className="text-sm">{result.stageDescription || '-'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {hasNamingIssue ? (
                                    <>
                                      <XCircle className="h-4 w-4 text-destructive" />
                                      <span>Non-compliant</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span>Compliant</span>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {isMissing ? (
                                    <>
                                      <XCircle className="h-4 w-4 text-destructive" />
                                      <span>Not Found</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span>Found</span>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="text" 
                                  placeholder="Add comments..." 
                                  className="w-full text-xs"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(overallResult === 'OK' ? 'valid' : 'invalid')}
                                  <span>{overallResult}</span>
                                </div>
                              </TableCell>
                              <TableCell>{mismatchedItems.join(', ') || '-'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="missing" className="mt-6">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background w-1/2">Excel Drawing Name</TableHead>
                          <TableHead className="sticky top-0 bg-background w-1/3">Matched File Name</TableHead>
                          <TableHead className="sticky top-0 bg-background w-1/6">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Show all expected files from register with their match status */}
                        {filterResults(validationState.results.titleBlock.results, searchFilter).map((registerEntry, index) => {
                          // Find if this file was found in the folder
                          const isMissing = validationState.results.missingFiles.missingFiles.some(
                            missing => missing.expectedFile === registerEntry.fileName && !missing.found
                          );
                          
                          return (
                            <TableRow key={index} className={isMissing ? 'bg-orange-50' : 'bg-green-50'}>
                              <TableCell className="font-medium text-sm break-all">{registerEntry.fileName}</TableCell>
                              <TableCell className="text-sm break-all">
                                {isMissing ? 'N/A' : registerEntry.fileName}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {isMissing ? (
                                    <>
                                      <XCircle className="h-4 w-4 text-orange-500" />
                                      <span className="text-orange-700">To Do</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span className="text-green-700">Done</span>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        
                        {/* Show extra files found in folder but not in register */}
                        {filterResults(validationState.results.missingFiles.extraFiles, searchFilter).map((extraFile, index) => (
                          <TableRow key={`extra-${index}`} className="bg-blue-50">
                            <TableCell className="text-sm break-all">N/A</TableCell>
                            <TableCell className="font-medium text-sm break-all">{extraFile.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-blue-500" />
                                <span className="text-blue-700">File not in Drawing List</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="naming" className="mt-6">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background min-w-[200px]">Folder Path</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[250px]">File Name</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[150px]">Compliance Status</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[300px]">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Show all files with their naming compliance status, not just errors */}
                        {filterResults(validationState.results.naming.allResults, searchFilter).map((result, index) => {
                          // Extract folder path without filename
                          const folderPath = result.folderPath ? 
                            result.folderPath.split('/').slice(0, -1).join('/') || 'Root' : 
                            'Root';
                          
                          const isCompliant = result.isValid !== false && !result.errorType;
                          
                          return (
                            <TableRow key={index} className={isCompliant ? 'bg-green-50' : 'bg-destructive/10'}>
                              <TableCell className="text-sm">{folderPath}</TableCell>
                              <TableCell className="font-medium text-sm break-all">{result.fileName}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {isCompliant ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span className="text-green-700 text-sm">Ok</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 text-destructive" />
                                      <span className="text-destructive text-sm">Not Ok</span>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {result.details || (isCompliant ? 'Delimiter correct. Number of parts correct.' : result.errorType)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="titleblock" className="mt-6">
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background min-w-[100px]">Sheet No</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[200px]">Sheet Name</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[250px]">File Name</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[100px]">Rev Code</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[120px]">Rev Date</TableHead>
                          <TableHead className="sticky top-0 bg-background min-w-[100px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterResults(validationState.results.titleBlock.results, searchFilter).map((result, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-sm">{result.sheetNo}</TableCell>
                            <TableCell className="font-medium text-sm">{result.sheetName}</TableCell>
                            <TableCell className="text-sm break-all">{result.fileName}</TableCell>
                            <TableCell className="text-sm">{result.revCode}</TableCell>
                            <TableCell className="text-sm">{result.revDate}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result.status === 'VALID' ? 'valid' : 'invalid')}
                                <span className="text-sm">{result.status}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};