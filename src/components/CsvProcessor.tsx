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
import { Button } from "./Button";
import {
  MetricOperations,
  Operation,
  type MetricConfig,
} from "./MetricOperations";

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
      alert("Please select a file and column to group by");
      return;
    }

    if (metrics.length === 0) {
      alert("Please add at least one metric operation");
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare form data for submission
      const formData = new FormData();
      formData.append("file", file);
      formData.append("column", selectedColumn);
      formData.append("delimiter", delimiter);
      formData.append("metricsConfig", JSON.stringify(metrics));

      // Process the CSV file
      const result = await processCsv(formData);

      if (result.success) {
        setDownloadUrl(result.url as string);
      } else {
        alert("Error processing CSV: " + result.error);
      }
    } catch (error) {
      console.error("Error during processing:", error);
      alert("An unexpected error occurred. Please try again.");
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

  return (
    <div className="bg-white rounded-lg p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        CSV Deduper 🪄
      </h1>

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
        {!downloadUrl && (
          <Button
            className="mx-auto block"
            disabled={
              isProcessing || !file || !selectedColumn || metrics.length === 0
            }
          >
            {getButtonText()}
          </Button>
        )}
      </form>

      {/* Download button appears after processing */}
      {downloadUrl && (
        <a href={downloadUrl} download="processed.csv">
          <Button variant="success" className="mt-2 mx-auto block">
            Download Processed CSV
          </Button>
        </a>
      )}
    </div>
  );
}
