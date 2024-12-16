"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./Button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";

const OPERATIONS = ["sum", "average", "max", "min", "count"] as const;
export type Operation = (typeof OPERATIONS)[number];

export interface MetricConfig {
  column: string;
  operation: Operation;
}

interface MetricOperationsProps {
  columns: string[];
  dimensionColumn: string;
  metrics: MetricConfig[];
  onMetricsChange: (metrics: MetricConfig[]) => void;
}

export function MetricOperations({
  metrics,
  onMetricsChange,
}: MetricOperationsProps) {
  const [open, setOpen] = useState(false);

  const updateMetric = (
    index: number,
    field: keyof MetricConfig,
    value: string
  ) => {
    const newMetrics = metrics.map((metric, i) => {
      if (i === index) {
        return { ...metric, [field]: value };
      }
      return metric;
    });
    onMetricsChange(newMetrics);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm">
          Configure Metric Operations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Operations</DialogTitle>
          <DialogDescription>
            You can configure the operations to be performed on each metric
            after deduplication
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="w-[150px]">Operation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{metric.column}</TableCell>
                <TableCell>
                  <Select
                    value={metric.operation}
                    onValueChange={(value) =>
                      updateMetric(index, "operation", value as Operation)
                    }
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Operation" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATIONS.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          className="text-sm w-fit mx-auto"
          onClick={() => setOpen(false)}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
