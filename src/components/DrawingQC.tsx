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
import { FileSystemUtil } from "../utils";

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

  // For testing, allow running checks without all files (will use mock data)
  const canRunChecks = state.selectedFolder && state.registerFile && state.namingRulesFile && state.titleBlocksFile;

  const handleRunChecks = async () => {
    console.log('handleRunChecks called');
    console.log('canRunChecks:', canRunChecks);
    console.log('Current state:', state);
    
    if (!canRunChecks) {
      console.log('Cannot run checks - missing required inputs');
      return;
    }

    const inputs: ValidationInputs = {
      folder: state.selectedFolder,
      includeSubfolders: state.includeSubfolders,
      registerFile: state.registerFile,
      namingFile: state.namingRulesFile,
      titleBlockFile: state.titleBlocksFile,
    };

    console.log('Validation inputs:', inputs);
    
    try {
      await runValidation(inputs);
      console.log('Validation completed');
    } catch (error) {
      console.error('Validation failed:', error);
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
      console.log('Attempting to select folder...');
      console.log('Current URL:', window.location.href);
      console.log('User Agent:', navigator.userAgent);
      
      // Check if we're in a secure context
      console.log('Is secure context:', window.isSecureContext);
      
      if (FileSystemUtil.isFileSystemAccessSupported()) {
        console.log('File System Access API is supported');
        console.log('showDirectoryPicker available:', 'showDirectoryPicker' in window);
        
        const directory = await FileSystemUtil.selectDirectory();
        console.log('Directory selected:', directory);
        if (directory) {
          setState(prev => ({ 
            ...prev, 
            selectedFolder: directory as unknown as FileSystemDirectoryHandle, 
            folderName: directory.name 
          }));
          console.log('State updated with folder:', directory.name);
        } else {
          console.log('User cancelled folder selection');
        }
      } else {
        console.log('File System Access API is NOT supported');
        console.log('showDirectoryPicker in window:', 'showDirectoryPicker' in window);
        // Fallback for browsers without File System Access API
        alert('File System Access API is not supported in this browser. Please use a modern browser like Chrome or Edge.');
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      alert(`Error selecting folder: ${error.message}`);
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

  const testFileSystemAPI = () => {
    console.log('=== File System API Test ===');
    console.log('window object exists:', typeof window !== 'undefined');
    console.log('showDirectoryPicker exists:', 'showDirectoryPicker' in window);
    console.log('Is secure context:', window.isSecureContext);
    console.log('Protocol:', window.location.protocol);
    console.log('Host:', window.location.host);
    
    if ('showDirectoryPicker' in window) {
      console.log('showDirectoryPicker type:', typeof window.showDirectoryPicker);
      console.log('Attempting to call showDirectoryPicker...');
      
      window.showDirectoryPicker({ mode: 'read' })
        .then((handle) => {
          console.log('Success! Directory handle:', handle);
          alert(`Success! Selected folder: ${handle.name}`);
        })
        .catch((error) => {
          console.error('Error calling showDirectoryPicker:', error);
          alert(`Error: ${error.message}`);
        });
    } else {
      alert('showDirectoryPicker is not available in this browser');
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
                        <TableRow className="bg-destructive/10">
                          <TableCell>Missing Files</TableCell>
                          <TableCell className="font-medium">DWG-001-Rev-A.pdf</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span>Fail</span>
                            </div>
                          </TableCell>
                          <TableCell>File not found in directory</TableCell>
                        </TableRow>
                        <TableRow className="bg-destructive/10">
                          <TableCell>Naming</TableCell>
                          <TableCell className="font-medium">beam_detail.pdf</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-destructive" />
                              <span>Fail</span>
                            </div>
                          </TableCell>
                          <TableCell>Missing revision code in filename</TableCell>
                        </TableRow>
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