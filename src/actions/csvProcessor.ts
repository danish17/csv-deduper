'use server'

import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

// We keep our type definitions and helper function
type Operation = 'sum' | 'average' | 'max' | 'min' | 'count'

function aggregateValues(values: number[], operation: Operation): number {
  switch (operation) {
    case 'sum':
      return values.reduce((acc, val) => acc + val, 0);
    case 'average':
      return values.reduce((acc, val) => acc + val, 0) / values.length;
    case 'max':
      return Math.max(...values);
    case 'min':
      return Math.min(...values);
    case 'count':
      return values.length;
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

export async function processCsv(formData: FormData) {
  // Input validation remains the same
  const file = formData.get('file') as File
  const dimensionColumn = formData.get('dimensionColumn') as string
  const delimiter = ","
  const metricsConfig = JSON.parse(formData.get('metricsConfig') as string) as {
    column: string;
    operation: Operation;
  }[]

  if (!file || !dimensionColumn || !delimiter || !metricsConfig) {
    return { success: false, error: 'Missing required fields' }
  }

  // File processing remains the same
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileContent = buffer.toString()
  const lines = fileContent.split('\n')
  const dataLines = lines.filter(line => !line.trim().startsWith('#'))
  const cleanedCsv = dataLines.join('\n')

  const records = parse(cleanedCsv, { 
    columns: true, 
    delimiter,
    trim: true,
    skip_empty_lines: true
  })

  // Data processing remains the same
  const groupedData = records.reduce((acc: any, record: any) => {
    const groups = record[dimensionColumn].split(',').map((g: string) => g.trim())
    groups.forEach((group: string) => {
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(record)
    })
    return acc
  }, {})

  const aggregatedData = Object.entries(groupedData).map(([group, records]: [string, any]) => {
    const result: any = {
      [dimensionColumn]: group
    }
    metricsConfig.forEach(({ column, operation }) => {
      const values = records.map((record: { [x: string]: string }) => parseFloat(record[column])).filter((val: number) => !isNaN(val))
      result[`${column}_${operation}`] = aggregateValues(values, operation)
    })
    return result
  })

  // Instead of writing to a file, we generate the CSV string
  const csvContent = stringify(aggregatedData, { 
    header: true, 
    delimiter 
  })

  // Return the CSV content directly along with a suggested filename
  return { 
    success: true, 
    data: csvContent,
    filename: `aggregated_${Date.now()}.csv`
  }
}