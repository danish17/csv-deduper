"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { processCsv } from "@/actions/csvProcessor";
import { FileUpload } from "./ui/file-upload";

import {
  MetricOperations,
  Operation,
  type MetricConfig,
} from "./MetricOperations";
import { Button } from "./ui/button";
import { Download, Loader2, SendHorizonal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "./ui/toaster";

// Define the main CsvProcessor component that handles all CSV processing operations
export default function CsvProcessor() {
  // State management for file handling and processing
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string | undefined>(
    undefined
  );
  const [delimiter, setDelimiter] = useState(",");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState<MetricConfig[]>([]);

  const { toast } = useToast();

  // Handle file selection and extract column headers
  const handleFileChange = async (files: File[]) => {
    const selectedFile = files[0];
    if (!selectedFile) return;

    try {
      setFile(selectedFile);
      // Read the file content to extract headers
      const text = await selectedFile.text();
      const lines = text.split("\n");

      // Find the first non-commented line (actual header row)
      const headerLine = lines.find((line) => !line.trim().startsWith("#"));

      if (headerLine) {
        // Split the header line by delimiter and clean up the headers
        const headers = headerLine.split(delimiter);
        setColumns(headers.map((header) => header.trim()));

        // Reset any previous selections when a new file is loaded
        setSelectedColumn("");
        setMetrics([]);
        setDownloadUrl(null);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error reading file. Please try again.");
    }
  };

  // Handle form submission and CSV processing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!file || !selectedColumn) {
      toast({
        title: "Uh oh! Something went wrong...",
        description: "Please select a file and column to group by",
        variant: "destructive",
      });
      return;
    }

    if (metrics.length === 0) {
      toast({
        title: "Uh oh! Something went wrong...",
        description: "Please select valid metric operations",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare form data for submission
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dimensionColumn", selectedColumn);
      formData.append("delimiter", delimiter);
      formData.append("metricsConfig", JSON.stringify(metrics));

      // Log values
      const values = {
        file: formData.get("file"),
        dimensionColumn: formData.get("dimensionColumn"),
        delimiter: formData.get("delimiter"),
        metricsConfig: formData.get("metricsConfig"),
      };
      console.log("Form data values:", values);

      // Process the CSV file
      const result = await processCsv(formData);

      if (result.success) {
        setDownloadUrl(result.url as string);
        toast({
          title: "File deduped successfully!",
          variant: "default",
          duration: 5000,
        });
      } else {
        toast({
          title: "Uh oh! Something went wrong...",
          description: "There was an error while processing the CSV.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error during processing:", error);
      toast({
        title: "Uh oh! Something went wrong...",
        description: "An unexpected error occured, please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleColumnSelect = (column: string) => {
    setSelectedColumn(column);
    const metricsColumns = columns.filter((col) => col !== column);
    const initialMetrics = metricsColumns.map((column) => ({
      column,
      operation: "sum" as Operation,
    }));
    setMetrics(initialMetrics);
  };

  // Calculate the appropriate button text based on current state
  const getButtonText = () => {
    if (isProcessing) return "Processing...";
    return "Process File";
  };

  // Calculate the appropriate button icon based on the current state
  const getButtonIcon = () => {
    if (isProcessing) return <Loader2 />;

    return <SendHorizonal />;
  };

  return (
    <div className="bg-white rounded-lg p-8">
      <Toaster />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File upload section */}
        <FileUpload
          onChange={handleFileChange as unknown as (files: File[]) => void}
        />

        {/* Show additional options only when a file is loaded */}
        {columns.length > 0 && (
          <>
            {/* Group by column selection */}
            <div>
              <Label htmlFor="column-select" className="text-gray-700">
                Select dimension
              </Label>
              <Select onValueChange={handleColumnSelect} value={selectedColumn}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column, index) => (
                    <SelectItem key={index} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Metric operations configuration */}
            {selectedColumn && (
              <MetricOperations
                columns={columns}
                dimensionColumn={selectedColumn}
                metrics={metrics}
                onMetricsChange={setMetrics}
              />
            )}

            {/* Delimiter configuration */}
            <div>
              <Label htmlFor="delimiter" className="text-gray-700">
                Delimiter
              </Label>
              <Input
                id="delimiter"
                type="text"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                maxLength={1}
                className="mt-1 cursor-pointer"
              />
            </div>
          </>
        )}

        {/* Show process button only when no download is available */}
        {!downloadUrl && file && (
          <Button
            className="mx-auto"
            disabled={
              isProcessing || !file || !selectedColumn || metrics.length === 0
            }
          >
            {getButtonText()} {getButtonIcon()}
          </Button>
        )}
      </form>

      {/* Download button appears after processing */}
      {downloadUrl && (
        <a href={downloadUrl} download="processed.csv">
          <Button className="mt-4 mx-auto bg-[#138A36] hover:bg-[#138A36] hover:brightness-90">
            Download Processed CSV <Download />
          </Button>
        </a>
      )}
    </div>
  );
}
