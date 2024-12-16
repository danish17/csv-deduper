"use client";

import { useState } from "react";
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
import { Loader2, SendHorizonal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "./ui/toaster";
import { AnimatePresence, motion } from "framer-motion";
import { FileView } from "./FileView";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export default function CsvProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string | undefined>(
    undefined
  );
  const [processedData, setProcessedData] = useState<{
    data: BlobPart;
    filename: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState<MetricConfig[]>([]);

  const { toast } = useToast();

  const handleFileChange = async (files: File[]) => {
    const selectedFile = files[0];
    if (!selectedFile) return;

    try {
      setFile(selectedFile);
      const text = await selectedFile.text();
      const lines = text.split("\n");
      const headerLine = lines.find((line) => !line.trim().startsWith("#"));

      if (headerLine) {
        const headers = headerLine.split(",");
        setColumns(headers.map((header) => header.trim()));
        setSelectedColumn("");
        setMetrics([]);
        setProcessedData(null);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error reading file",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !selectedColumn) {
      toast({
        title: "Missing fields",
        description: "Please select a file and column to group by",
        variant: "destructive",
      });
      return;
    }

    if (metrics.length === 0) {
      toast({
        title: "Missing metrics",
        description: "Please configure metric operations",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dimensionColumn", selectedColumn);
      formData.append("metricsConfig", JSON.stringify(metrics));

      const result = await processCsv(formData);

      if (result.success) {
        setProcessedData({
          data: result.data as BlobPart,
          filename: result.filename as string,
        });

        toast({
          title: "File processed successfully!",
          variant: "default",
        });
      } else {
        toast({
          title: "Processing failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error occurred",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedData) return;

    const blob = new Blob([processedData.data], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", processedData.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

  return (
    <div className="bg-white rounded-lg p-8">
      <Toaster />
      <form onSubmit={handleSubmit} className="space-y-6">
        <FileUpload
          onChange={handleFileChange as unknown as (files: File[]) => void}
        />

        <AnimatePresence mode="wait">
          {columns.length > 0 && (
            <motion.div {...fadeInUp}>
              <div className="space-y-6">
                <div>
                  <Label className="text-gray-700">Select dimension</Label>
                  <Select
                    onValueChange={handleColumnSelect}
                    value={selectedColumn}
                  >
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

                <AnimatePresence>
                  {selectedColumn && (
                    <motion.div {...fadeInUp}>
                      <MetricOperations
                        columns={columns}
                        dimensionColumn={selectedColumn}
                        metrics={metrics}
                        onMetricsChange={setMetrics}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {file && (
            <motion.div {...fadeInUp} className="flex justify-center">
              <Button
                disabled={
                  isProcessing ||
                  !!processedData ||
                  !file ||
                  !selectedColumn ||
                  metrics.length === 0
                }
              >
                {isProcessing ? "Processing... " : "Process File "}
                {isProcessing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <SendHorizonal />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {processedData && (
          <div className="flex justify-center mt-4">
            <FileView
              csvData={processedData.data.toString()}
              filename={processedData.filename}
              onDownload={handleDownload}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
