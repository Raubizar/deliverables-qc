import { useState } from "react";
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

interface QCState {
  selectedFolder: string;
  includeSubfolders: boolean;
  registerFile: string;
  namingRulesFile: string;
  titleBlocksFile: string;
  isProcessing: boolean;
  hasResults: boolean;
  results: QCResults | null;
}

interface QCResults {
  compliance: number;
  drawingsScanned: number;
  missingFiles: number;
  expectedFiles: number;
  namingCompliance: number;
  titleBlockCompliance: number;
  missingFilesList: Array<{
    expectedFile: string;
    found: boolean;
    registerRow: number;
  }>;
  namingErrors: Array<{
    folderPath: string;
    fileName: string;
    errorType: string;
    details: string;
  }>;
  titleBlockErrors: Array<{
    sheetNo: string;
    sheetName: string;
    fileName: string;
    detectedRevCode: string;
    revDate: string;
    revDesc: string;
    suitabilityCode: string;
    stageDesc: string;
    namingConvStatus: string;
  }>;
}

export const DrawingQC = () => {
  const [state, setState] = useState<QCState>({
    selectedFolder: "",
    includeSubfolders: true,
    registerFile: "",
    namingRulesFile: "",
    titleBlocksFile: "",
    isProcessing: false,
    hasResults: false,
    results: null,
  });

  const [searchFilter, setSearchFilter] = useState("");

  const canRunChecks = state.selectedFolder && state.registerFile && state.namingRulesFile && state.titleBlocksFile;

  const handleRunChecks = async () => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock results
    const mockResults: QCResults = {
      compliance: 87,
      drawingsScanned: 245,
      missingFiles: 8,
      expectedFiles: 253,
      namingCompliance: 94,
      titleBlockCompliance: 89,
      missingFilesList: [
        { expectedFile: "DWG-001-Rev-A.pdf", found: false, registerRow: 15 },
        { expectedFile: "DWG-002-Rev-B.pdf", found: false, registerRow: 32 },
      ],
      namingErrors: [
        { folderPath: "/project/structural", fileName: "beam_detail.pdf", errorType: "Invalid Format", details: "Missing revision code" },
        { folderPath: "/project/mechanical", fileName: "hvac-layout.pdf", errorType: "Case Mismatch", details: "Should be uppercase" },
      ],
      titleBlockErrors: [
        { sheetNo: "S-001", sheetName: "Foundation Plan", fileName: "foundation.pdf", detectedRevCode: "A", revDate: "2024-01-15", revDesc: "Initial Issue", suitabilityCode: "S3", stageDesc: "Construction", namingConvStatus: "Pass" },
      ],
    };

    setState(prev => ({ 
      ...prev, 
      isProcessing: false, 
      hasResults: true, 
      results: mockResults 
    }));
  };

  const handleFileSelect = (field: keyof QCState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setState(prev => ({ ...prev, [field]: file.name }));
    }
  };

  const handleFolderSelect = () => {
    // In a real app, this would use the File System Access API
    setState(prev => ({ ...prev, selectedFolder: "/example/project/drawings" }));
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'fail': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with blur effect */}
      <header className="sticky top-0 z-50 bg-background/80 apple-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-center text-foreground">Drawing QC</h1>
          {state.isProcessing && (
            <div className="mt-3">
              <Progress value={66} className="h-1" />
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
                disabled={!canRunChecks || state.isProcessing}
                className="w-full apple-transition apple-hover"
                size="lg"
              >
                {state.isProcessing ? "Processing..." : "Run Checks"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Panel */}
        {state.hasResults && state.results && (
          <Card className="apple-shadow fade-slide-in">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-5">
                <div className="md:col-span-2 flex justify-center">
                  <CircularGauge percentage={state.results.compliance} />
                </div>
                <div className="md:col-span-3 grid gap-4 sm:grid-cols-2">
                  <MetricCard
                    title="Drawings scanned"
                    value={state.results.drawingsScanned}
                    tooltip="Count of files processed"
                  />
                  <MetricCard
                    title="Missing vs expected"
                    value={`${state.results.missingFiles} missing`}
                    chart={<MiniBarChart missing={state.results.missingFiles} total={state.results.expectedFiles} />}
                    tooltip="From Register.xlsx"
                  />
                  <MetricCard
                    title="Naming compliance"
                    value={`${state.results.namingCompliance}% OK`}
                    chart={<SparkBar data={[72, 78, 83, 87, 90, 94]} />}
                    tooltip="From Naming-Rules.xlsx"
                  />
                  <MetricCard
                    title="Title-block compliance"
                    value={`${state.results.titleBlockCompliance}% OK`}
                    chart={<SparkBar data={[65, 71, 76, 82, 85, 89]} />}
                    tooltip="From Title-Blocks.xlsx"
                  />
                  <MetricCard
                    title="Overall compliance"
                    value={`${state.results.compliance}% OK`}
                    chart={<SparkBar data={[78, 81, 84, 86, 87, 87]} />}
                    tooltip="Combined compliance score"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Viewer */}
        {state.hasResults && state.results && (
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
                <Button variant="outline" className="apple-transition apple-hover">
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
                        {state.results.missingFilesList.map((item, index) => (
                          <TableRow key={index} className={!item.found ? "bg-destructive/10" : ""}>
                            <TableCell className="font-medium">{item.expectedFile}</TableCell>
                            <TableCell>
                              {item.found ? 
                                <CheckCircle className="h-4 w-4 text-accent" /> : 
                                <XCircle className="h-4 w-4 text-destructive" />
                              }
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
                        {state.results.namingErrors.map((error, index) => (
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
                        {state.results.titleBlockErrors.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>{error.sheetNo}</TableCell>
                            <TableCell className="font-medium">{error.sheetName}</TableCell>
                            <TableCell>{error.fileName}</TableCell>
                            <TableCell>{error.detectedRevCode}</TableCell>
                            <TableCell>{error.revDate}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(error.namingConvStatus)}
                                <span>{error.namingConvStatus}</span>
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