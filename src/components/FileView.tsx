// components/FileView.tsx
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { parse } from "csv-parse/sync";
import { Key } from "react";

interface FileViewProps {
  csvData: string;
  filename: string;
  onDownload: () => void;
}

export function FileView({ csvData, filename, onDownload }: FileViewProps) {
  // We parse the CSV string into structured data that we can display in our table
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  });

  // We extract column headers from the first record for our table
  const columns = Object.keys(records[0] || {});

  // This helper function formats our numeric values for better readability
  const formatValue = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>
          View Results <Eye />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-7xl">
          <DrawerHeader>
            <DrawerTitle>Processed Results</DrawerTitle>
            <DrawerDescription>
              Showing processed data from {filename}
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-6">
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column} className="whitespace-nowrap">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map(
                    (
                      record: { [x: string]: string },
                      index: Key | null | undefined
                    ) => (
                      <TableRow key={index}>
                        {columns.map((column) => (
                          <TableCell key={column}>
                            {formatValue(record[column])}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            <Button
              onClick={onDownload}
              className="mt-6 bg-[#138A36] hover:bg-[#138A36] hover:brightness-90"
            >
              Download CSV <Download className="ml-2" />
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
