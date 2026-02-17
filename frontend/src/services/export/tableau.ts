// frontend/src/services/export/tableau.ts
/**
 * Tableau Export Service
 * Export data to Tableau compatible format (CSV with metadata)
 */

export interface TableauExportOptions {
  fileName?: string;
  delimiter?: string;
  includeHeaders?: boolean;
  dateFormat?: 'ISO' | 'US' | 'EU';
  encoding?: 'UTF-8' | 'UTF-16';
}

/**
 * Export data to Tableau-compatible CSV
 */
export function exportToTableau(
  data: any[],
  options: TableauExportOptions = {}
): void {
  const {
    fileName = 'tableau_export.csv',
    delimiter = ',',
    includeHeaders = true,
    dateFormat = 'ISO',
    encoding = 'UTF-8'
  } = options;

  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Convert to CSV
  const csv = convertToTableauCSV(data, {
    delimiter,
    includeHeaders,
    dateFormat
  });

  // Create blob with BOM for UTF-8
  const bom = encoding === 'UTF-8' ? '\uFEFF' : '';
  const blob = new Blob([bom + csv], { 
    type: 'text/csv;charset=utf-8;' 
  });

  // Trigger download
  downloadBlob(blob, fileName);
}

/**
 * Convert data to Tableau-optimized CSV format
 */
export function convertToTableauCSV(
  data: any[],
  options: {
    delimiter?: string;
    includeHeaders?: boolean;
    dateFormat?: 'ISO' | 'US' | 'EU';
  } = {}
): string {
  const {
    delimiter = ',',
    includeHeaders = true,
    dateFormat = 'ISO'
  } = options;

  if (!data || data.length === 0) {
    return '';
  }

  const rows: string[] = [];

  // Add headers
  if (includeHeaders) {
    const headers = Object.keys(data[0]);
    rows.push(headers.map(h => escapeCSVValue(h, delimiter)).join(delimiter));
  }

  // Add data rows
  data.forEach(row => {
    const values = Object.keys(data[0]).map(key => {
      const value = row[key];
      return formatValueForTableau(value, dateFormat, delimiter);
    });
    rows.push(values.join(delimiter));
  });

  return rows.join('\n');
}

/**
 * Format value for Tableau
 */
function formatValueForTableau(
  value: any,
  dateFormat: 'ISO' | 'US' | 'EU',
  delimiter: string
): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle dates
  if (value instanceof Date) {
    return formatDate(value, dateFormat);
  }

  // Check if string is a date
  if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    const date = new Date(value);
    if (date.toString() !== 'Invalid Date') {
      return formatDate(date, dateFormat);
    }
  }

  // Handle numbers
  if (typeof value === 'number') {
    return String(value);
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  // Handle strings
  return escapeCSVValue(String(value), delimiter);
}

/**
 * Format date according to format preference
 */
function formatDate(date: Date, format: 'ISO' | 'US' | 'EU'): string {
  switch (format) {
    case 'ISO':
      return date.toISOString();
    
    case 'US':
      // MM/DD/YYYY HH:MM:SS
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    
    case 'EU':
      // DD/MM/YYYY HH:MM:SS
      const euDay = String(date.getDate()).padStart(2, '0');
      const euMonth = String(date.getMonth() + 1).padStart(2, '0');
      const euYear = date.getFullYear();
      const euHours = String(date.getHours()).padStart(2, '0');
      const euMinutes = String(date.getMinutes()).padStart(2, '0');
      const euSeconds = String(date.getSeconds()).padStart(2, '0');
      return `${euDay}/${euMonth}/${euYear} ${euHours}:${euMinutes}:${euSeconds}`;
    
    default:
      return date.toISOString();
  }
}

/**
 * Escape CSV value (handle quotes and delimiters)
 */
function escapeCSVValue(value: string, delimiter: string): string {
  // If value contains delimiter, newline, or quotes, wrap in quotes
  if (value.includes(delimiter) || value.includes('\n') || value.includes('"')) {
    // Escape quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return value;
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
 * Get Tableau import instructions
 */
export function getTableauInstructions(): string[] {
  return [
    '1. Open Tableau Desktop or Tableau Public',
    '2. Click "Connect" → "Text file"',
    '3. Select the exported CSV file',
    '4. Review data types in the Data Source page',
    '5. Drag fields to create visualizations',
    '6. Publish to Tableau Server/Online if needed'
  ];
}

/**
 * Create Tableau TDS (data source) file
 */
export function createTableauTDS(
  data: any[],
  options: {
    dataSourceName?: string;
    csvFileName?: string;
  } = {}
): string {
  const {
    dataSourceName = 'Churn Analysis',
    csvFileName = 'data.csv'
  } = options;

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const tds = `<?xml version='1.0' encoding='utf-8' ?>
<datasource formatted-name='${dataSourceName}' version='18.1'>
  <connection class='textscan' directory='' filename='${csvFileName}' server='' />
  <aliases enabled='yes' />
  <column caption='${dataSourceName}' datatype='table' name='[Table]' />
  ${columns.map(col => `<column datatype='string' name='[${col}]' />`).join('\n  ')}
</datasource>`;

  return tds;
}

/**
 * Export with TDS file
 */
export function exportToTableauWithTDS(
  data: any[],
  options: TableauExportOptions & { dataSourceName?: string } = {}
): void {
  const csvFileName = options.fileName || 'tableau_export.csv';
  const tdsFileName = csvFileName.replace('.csv', '.tds');

  // Export CSV
  exportToTableau(data, options);

  // Create and download TDS
  const tds = createTableauTDS(data, {
    dataSourceName: options.dataSourceName,
    csvFileName
  });

  const tdsBlob = new Blob([tds], { type: 'application/xml' });
  downloadBlob(tdsBlob, tdsFileName);
}

/**
 * Validate data for Tableau export
 */
export function validateForTableau(data: any[]): {
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

  // Check for special characters in headers
  const headers = Object.keys(data[0]);
  headers.forEach(header => {
    if (/[,\n\r"]/.test(header)) {
      warnings.push(`Header "${header}" contains special characters that may cause issues`);
    }
  });

  // Check for very large datasets
  if (data.length > 1000000) {
    warnings.push('Dataset is very large (>1M rows). Tableau may perform better with extracts.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  exportToTableau,
  convertToTableauCSV,
  getTableauInstructions,
  createTableauTDS,
  exportToTableauWithTDS,
  validateForTableau
};
