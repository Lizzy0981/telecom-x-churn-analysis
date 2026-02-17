// frontend/src/services/export/csv.ts
/**
 * CSV Export Service
 * Export data to standard CSV format
 */

export interface CSVExportOptions {
  fileName?: string;
  delimiter?: ',' | ';' | '\t' | '|';
  includeHeaders?: boolean;
  lineEnding?: '\n' | '\r\n';
  encoding?: 'UTF-8' | 'UTF-8-BOM' | 'ASCII';
  quoteAll?: boolean;
}

/**
 * Export data to CSV
 */
export function exportToCSV(
  data: any[],
  options: CSVExportOptions = {}
): void {
  const {
    fileName = 'export.csv',
    delimiter = ',',
    includeHeaders = true,
    lineEnding = '\n',
    encoding = 'UTF-8',
    quoteAll = false
  } = options;

  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Convert to CSV
  const csv = convertToCSV(data, {
    delimiter,
    includeHeaders,
    lineEnding,
    quoteAll
  });

  // Create blob with appropriate encoding
  let content = csv;
  if (encoding === 'UTF-8-BOM') {
    content = '\uFEFF' + csv; // Add BOM for Excel compatibility
  }

  const blob = new Blob([content], { 
    type: 'text/csv;charset=utf-8;' 
  });

  // Trigger download
  downloadBlob(blob, fileName);
}

/**
 * Convert data to CSV string
 */
export function convertToCSV(
  data: any[],
  options: {
    delimiter?: string;
    includeHeaders?: boolean;
    lineEnding?: string;
    quoteAll?: boolean;
  } = {}
): string {
  const {
    delimiter = ',',
    includeHeaders = true,
    lineEnding = '\n',
    quoteAll = false
  } = options;

  if (!data || data.length === 0) {
    return '';
  }

  const rows: string[] = [];
  const columns = Object.keys(data[0]);

  // Add headers
  if (includeHeaders) {
    const headers = columns.map(col => 
      formatCSVValue(col, delimiter, quoteAll)
    );
    rows.push(headers.join(delimiter));
  }

  // Add data rows
  data.forEach(row => {
    const values = columns.map(col => 
      formatCSVValue(row[col], delimiter, quoteAll)
    );
    rows.push(values.join(delimiter));
  });

  return rows.join(lineEnding);
}

/**
 * Format value for CSV
 */
function formatCSVValue(
  value: any,
  delimiter: string,
  quoteAll: boolean
): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Convert to string
  let stringValue: string;

  if (value instanceof Date) {
    stringValue = value.toISOString();
  } else if (typeof value === 'boolean') {
    stringValue = value ? 'true' : 'false';
  } else if (typeof value === 'number') {
    stringValue = String(value);
  } else {
    stringValue = String(value);
  }

  // Escape quotes
  if (stringValue.includes('"')) {
    stringValue = stringValue.replace(/"/g, '""');
  }

  // Quote if necessary or if quoteAll is true
  const needsQuoting = quoteAll ||
    stringValue.includes(delimiter) ||
    stringValue.includes('\n') ||
    stringValue.includes('\r') ||
    stringValue.includes('"');

  if (needsQuoting) {
    return `"${stringValue}"`;
  }

  return stringValue;
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
 * Parse CSV string to data array
 */
export function parseCSV(
  csvString: string,
  options: {
    delimiter?: string;
    hasHeaders?: boolean;
    skipEmptyLines?: boolean;
  } = {}
): any[] {
  const {
    delimiter = ',',
    hasHeaders = true,
    skipEmptyLines = true
  } = options;

  const lines = csvString.split(/\r?\n/);
  const data: any[] = [];

  if (lines.length === 0) {
    return data;
  }

  // Parse headers
  let headers: string[] = [];
  let startIndex = 0;

  if (hasHeaders) {
    headers = parseCSVLine(lines[0], delimiter);
    startIndex = 1;
  }

  // Parse data rows
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];

    if (skipEmptyLines && !line.trim()) {
      continue;
    }

    const values = parseCSVLine(line, delimiter);

    if (hasHeaders) {
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      data.push(row);
    } else {
      data.push(values);
    }
  }

  return data;
}

/**
 * Parse a single CSV line (handles quoted values)
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      // End of value
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Add last value
  values.push(currentValue);

  return values;
}

/**
 * Export with custom column mapping
 */
export function exportToCSVWithMapping(
  data: any[],
  columnMapping: Record<string, string>,
  options: CSVExportOptions = {}
): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Remap columns
  const mappedData = data.map(row => {
    const mappedRow: any = {};
    Object.entries(columnMapping).forEach(([sourceCol, targetCol]) => {
      mappedRow[targetCol] = row[sourceCol];
    });
    return mappedRow;
  });

  exportToCSV(mappedData, options);
}

/**
 * Export filtered columns only
 */
export function exportToCSVFiltered(
  data: any[],
  columnsToInclude: string[],
  options: CSVExportOptions = {}
): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Filter columns
  const filteredData = data.map(row => {
    const filteredRow: any = {};
    columnsToInclude.forEach(col => {
      if (col in row) {
        filteredRow[col] = row[col];
      }
    });
    return filteredRow;
  });

  exportToCSV(filteredData, options);
}

/**
 * Get CSV file size estimate
 */
export function estimateCSVSize(
  data: any[],
  options: {
    includeHeaders?: boolean;
    delimiter?: string;
  } = {}
): number {
  const csv = convertToCSV(data, options);
  // Each character is approximately 1 byte in UTF-8 for ASCII characters
  // Multiply by 1.5 to account for non-ASCII characters
  return csv.length * 1.5;
}

/**
 * Validate data for CSV export
 */
export function validateForCSV(data: any[]): {
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
  const estimatedSize = estimateCSVSize(data);
  if (estimatedSize > 100 * 1024 * 1024) { // 100 MB
    warnings.push('CSV file will be very large (>100 MB). Consider splitting the data.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get CSV import instructions
 */
export function getCSVInstructions(): string[] {
  return [
    '1. Open your preferred spreadsheet application',
    '2. Use File → Open or Import',
    '3. Select the exported CSV file',
    '4. Configure import settings if prompted',
    '5. Data should load automatically'
  ];
}

export default {
  exportToCSV,
  convertToCSV,
  parseCSV,
  exportToCSVWithMapping,
  exportToCSVFiltered,
  estimateCSVSize,
  validateForCSV,
  getCSVInstructions
};
