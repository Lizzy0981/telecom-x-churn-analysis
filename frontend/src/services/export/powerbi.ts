// frontend/src/services/export/powerbi.ts
/**
 * Power BI Export Service
 * Export data to Power BI compatible format (JSON)
 */

export interface PowerBIDataset {
  name: string;
  tables: PowerBITable[];
}

export interface PowerBITable {
  name: string;
  columns: PowerBIColumn[];
  rows: any[][];
}

export interface PowerBIColumn {
  name: string;
  dataType: 'Int64' | 'Double' | 'Boolean' | 'String' | 'DateTime';
}

/**
 * Export data to Power BI JSON format
 */
export function exportToPowerBI(
  data: any[],
  options: {
    datasetName?: string;
    tableName?: string;
    fileName?: string;
  } = {}
): void {
  const {
    datasetName = 'Churn Analysis Dataset',
    tableName = 'Customers',
    fileName = 'powerbi_export.json'
  } = options;

  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Convert to Power BI format
  const powerBIData = convertToPowerBIFormat(data, datasetName, tableName);

  // Create JSON blob
  const jsonString = JSON.stringify(powerBIData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Trigger download
  downloadBlob(blob, fileName);
}

/**
 * Convert data to Power BI JSON format
 */
export function convertToPowerBIFormat(
  data: any[],
  datasetName: string,
  tableName: string
): PowerBIDataset {
  if (!data || data.length === 0) {
    return {
      name: datasetName,
      tables: []
    };
  }

  // Infer columns from first row
  const columns = inferColumns(data[0]);

  // Convert rows to array format
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.name];
      return formatValueForPowerBI(value, col.dataType);
    });
  });

  return {
    name: datasetName,
    tables: [
      {
        name: tableName,
        columns,
        rows
      }
    ]
  };
}

/**
 * Infer column types from data
 */
function inferColumns(sampleRow: any): PowerBIColumn[] {
  const columns: PowerBIColumn[] = [];

  Object.keys(sampleRow).forEach(key => {
    const value = sampleRow[key];
    const dataType = inferDataType(value);
    
    columns.push({
      name: key,
      dataType
    });
  });

  return columns;
}

/**
 * Infer Power BI data type from value
 */
function inferDataType(value: any): PowerBIColumn['dataType'] {
  if (value === null || value === undefined) {
    return 'String';
  }

  if (typeof value === 'boolean') {
    return 'Boolean';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'Int64' : 'Double';
  }

  if (value instanceof Date) {
    return 'DateTime';
  }

  // Check if it's a date string
  if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    const parsed = new Date(value);
    if (parsed.toString() !== 'Invalid Date') {
      return 'DateTime';
    }
  }

  return 'String';
}

/**
 * Format value for Power BI
 */
function formatValueForPowerBI(value: any, dataType: PowerBIColumn['dataType']): any {
  if (value === null || value === undefined) {
    return null;
  }

  switch (dataType) {
    case 'Int64':
    case 'Double':
      return Number(value);
    
    case 'Boolean':
      return Boolean(value);
    
    case 'DateTime':
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'string') {
        return new Date(value).toISOString();
      }
      return value;
    
    case 'String':
    default:
      return String(value);
  }
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get Power BI import instructions
 */
export function getPowerBIInstructions(): string[] {
  return [
    '1. Open Power BI Desktop',
    '2. Click "Get Data" → "JSON"',
    '3. Select the exported JSON file',
    '4. Click "Load" to import the dataset',
    '5. Use the data to create visualizations',
    '6. Publish to Power BI Service if needed'
  ];
}

/**
 * Validate data for Power BI export
 */
export function validateForPowerBI(data: any[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || !Array.isArray(data)) {
    errors.push('Data must be an array');
    return { valid: false, errors, warnings };
  }

  if (data.length === 0) {
    errors.push('Data array is empty');
    return { valid: false, errors, warnings };
  }

  // Check for consistent columns
  const firstRowKeys = Object.keys(data[0]);
  data.forEach((row, idx) => {
    const rowKeys = Object.keys(row);
    if (rowKeys.length !== firstRowKeys.length) {
      warnings.push(`Row ${idx} has different number of columns`);
    }
  });

  // Check for very large datasets
  if (data.length > 100000) {
    warnings.push('Dataset is very large (>100k rows). Consider splitting into multiple files.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  exportToPowerBI,
  convertToPowerBIFormat,
  getPowerBIInstructions,
  validateForPowerBI
};
