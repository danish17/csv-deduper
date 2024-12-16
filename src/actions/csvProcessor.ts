'use server'

import { writeFile, unlink } from 'fs/promises'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import path from 'path'

// Define supported aggregation operations
type Operation = 'sum' | 'average' | 'max' | 'min' | 'count'

// Helper function to perform aggregation operations
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
  // Get all required parameters from form data
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

  // Read and parse the CSV file
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

  // Group the records by the specified column
  const groupedData = records.reduce((acc: any, record: any) => {
    // Split the group by column value if it contains multiple values
    const groups = record[dimensionColumn].split(',').map((g: string) => g.trim())
    
    // Process each group value
    groups.forEach((group: string) => {
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(record)
    })
    
    return acc
  }, {})

  // Perform aggregations for each group
  const aggregatedData = Object.entries(groupedData).map(([group, records]: [string, any]) => {
    const result: any = {
      [dimensionColumn]: group
    }

    // Calculate aggregations for each metric
    metricsConfig.forEach(({ column, operation }) => {
      const values = records.map((record: { [x: string]: string }) => parseFloat(record[column])).filter((val: number) => !isNaN(val))
      result[`${column}_${operation}`] = aggregateValues(values, operation)
    })

    return result
  })

  // Generate CSV output
  const output = stringify(aggregatedData, { 
    header: true, 
    delimiter 
  })

  // Save the file
  const fileName = `aggregated_${Date.now()}.csv`
  const filePath = path.join(process.cwd(), 'public', fileName)

  await writeFile(filePath, output)

  // Schedule file deletion after 5 minutes
  setTimeout(() => {
    unlink(filePath).catch(console.error)
  }, 5 * 60 * 1000)

  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cleanup`);
  
  return { success: true, url: `/${fileName}` }
}