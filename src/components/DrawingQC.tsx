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

  const handleFilesFallback = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Files selected via fallback method:', Array.from(files).map(f => f.name));
      alert('File fallback method selected. Please use the folder selection for full functionality.');
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
        <div className="max-w-4xl mx-auto px-6 py-4">
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

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
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
                <div className="col-span-3 grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleFolderSelect}
                    className="w-full apple-transition apple-hover"
                  >
                    Choose Folder
                  </Button>
                  {!state.selectedFolder && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.dwg,.png,.jpg"
                        onChange={handleFilesFallback}
                        style={{ display: 'none' }}
                        id="files-fallback"
                      />
                      <label 
                        htmlFor="files-fallback" 
                        className="cursor-pointer text-blue-600 hover:underline"
                      >
                        Or select files
                      </label>
                    </div>
                  )}
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
              <Tabs defaultValue="missing" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="missing">Missing Files</TabsTrigger>
                  <TabsTrigger value="naming">Naming Errors</TabsTrigger>
                  <TabsTrigger value="titleblock">Title-Block Errors</TabsTrigger>
                  <TabsTrigger value="all">All Findings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="missing" className="mt-6">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background">Expected File</TableHead>
                          <TableHead className="sticky top-0 bg-background">Found?</TableHead>
                          <TableHead className="sticky top-0 bg-background">Register Row</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterResults(validationState.results.missingFiles.missingFiles, searchFilter).map((item, index) => (
                          <TableRow key={index} className="bg-destructive/10">
                            <TableCell className="font-medium">{item.expectedFile}</TableCell>
                            <TableCell>
                              <XCircle className="h-4 w-4 text-destructive" />
                            </TableCell>
                            <TableCell>{item.registerRow}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="naming" className="mt-6">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background">Folder Path</TableHead>
                          <TableHead className="sticky top-0 bg-background">File Name</TableHead>
                          <TableHead className="sticky top-0 bg-background">Error Type</TableHead>
                          <TableHead className="sticky top-0 bg-background">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterResults(validationState.results.naming.errors, searchFilter).map((error, index) => (
                          <TableRow key={index} className="bg-destructive/10">
                            <TableCell>{error.folderPath}</TableCell>
                            <TableCell className="font-medium">{error.fileName}</TableCell>
                            <TableCell>{error.errorType}</TableCell>
                            <TableCell>{error.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="titleblock" className="mt-6">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background">Sheet No</TableHead>
                          <TableHead className="sticky top-0 bg-background">Sheet Name</TableHead>
                          <TableHead className="sticky top-0 bg-background">File Name</TableHead>
                          <TableHead className="sticky top-0 bg-background">Rev Code</TableHead>
                          <TableHead className="sticky top-0 bg-background">Rev Date</TableHead>
                          <TableHead className="sticky top-0 bg-background">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterResults(validationState.results.titleBlock.results, searchFilter).map((result, index) => (
                          <TableRow key={index}>
                            <TableCell>{result.sheetNo}</TableCell>
                            <TableCell className="font-medium">{result.sheetName}</TableCell>
                            <TableCell>{result.fileName}</TableCell>
                            <TableCell>{result.revCode}</TableCell>
                            <TableCell>{result.revDate}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result.status === 'VALID' ? 'valid' : 'invalid')}
                                <span>{result.status}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background">Check Type</TableHead>
                          <TableHead className="sticky top-0 bg-background">File Name</TableHead>
                          <TableHead className="sticky top-0 bg-background">Status</TableHead>
                          <TableHead className="sticky top-0 bg-background">Comment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Real data will be populated dynamically */}
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