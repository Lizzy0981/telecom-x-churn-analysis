// frontend/src/services/export/excel.ts
/**
 * Excel Export Service
 * Export data to Excel-compatible format (CSV with Excel optimizations)
 */

export interface ExcelExportOptions {
  fileName?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  includeFormulas?: boolean;
  dateFormat?: 'ISO' | 'Excel';
}

/**
 * Export data to Excel-compatible CSV
 */
export function exportToExcel(
  data: any[],
  options: ExcelExportOptions = {}
): void {
  const {
    fileName = 'export.csv',
    includeHeaders = true,
    dateFormat = 'Excel'
  } = options;

  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // Convert to CSV with Excel optimizations
  const csv = convertToExcelCSV(data, {
    includeHeaders,
    dateFormat
  });

  // Create blob with UTF-8 BOM (Excel requirement)
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { 
    type: 'text/csv;charset=utf-8;' 
  });

  // Trigger download
  downloadBlob(blob, fileName);
}

/**
 * Convert data to Excel-optimized CSV format
 */
export function convertToExcelCSV(
  data: any[],
  options: {
    includeHeaders?: boolean;
    dateFormat?: 'ISO' | 'Excel';
  } = {}
): string {
  const {
    includeHeaders = true,
    dateFormat = 'Excel'
  } = options;

  if (!data || data.length === 0) {
    return '';
  }

  const rows: string[] = [];

  // Add headers
  if (includeHeaders) {
    const headers = Object.keys(data[0]);
    rows.push(headers.map(h => escapeExcelValue(h)).join(','));
  }

  // Add data rows
  data.forEach(row => {
    const values = Object.keys(data[0]).map(key => {
      const value = row[key];
      return formatValueForExcel(value, dateFormat);
    });
    rows.push(values.join(','));
  });

  return rows.join('\r\n'); // Excel prefers CRLF
}

/**
 * Format value for Excel
 */
function formatValueForExcel(
  value: any,
  dateFormat: 'ISO' | 'Excel'
): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle dates
  if (value instanceof Date) {
    return formatDateForExcel(value, dateFormat);
  }

  // Check if string is a date
  if (typeof value === 'string' && !isNaN(Date.parse(value))) {
    const date = new Date(value);
    if (date.toString() !== 'Invalid Date') {
      return formatDateForExcel(date, dateFormat);
    }
  }

  // Handle numbers
  if (typeof value === 'number') {
    // Prevent scientific notation for large numbers
    if (Math.abs(value) > 1e15) {
      return `="${value}"`;
    }
    return String(value);
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  // Handle strings
  return escapeExcelValue(String(value));
}

/**
 * Format date for Excel
 */
function formatDateForExcel(date: Date, format: 'ISO' | 'Excel'): string {
  if (format === 'ISO') {
    return date.toISOString();
  }

  // Excel date format: M/D/YYYY H:MM:SS AM/PM
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12 || 12;

  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Escape value for Excel CSV
 */
function escapeExcelValue(value: string): string {
  // Handle values that start with special characters (=, +, -, @)
  // to prevent formula injection
  if (/^[=+\-@]/.test(value)) {
    value = "'" + value;
  }

  // If value contains comma, newline, or quotes, wrap in quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
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
 * Generate summary statistics for Excel
 */
export function generateSummary(data: any[]): {
  totalRows: number;
  totalColumns: number;
  numericColumns: string[];
  dateColumns: string[];
  textColumns: string[];
} {
  if (!data || data.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      numericColumns: [],
      dateColumns: [],
      textColumns: []
    };
  }

  const columns = Object.keys(data[0]);
  const numericColumns: string[] = [];
  const dateColumns: string[] = [];
  const textColumns: string[] = [];

  columns.forEach(col => {
    const sampleValue = data[0][col];
    
    if (typeof sampleValue === 'number') {
      numericColumns.push(col);
    } else if (sampleValue instanceof Date || !isNaN(Date.parse(String(sampleValue)))) {
      dateColumns.push(col);
    } else {
      textColumns.push(col);
    }
  });

  return {
    totalRows: data.length,
    totalColumns: columns.length,
    numericColumns,
    dateColumns,
    textColumns
  };
}

/**
 * Get Excel import instructions
 */
export function getExcelInstructions(): string[] {
  return [
    '1. Open Microsoft Excel or Google Sheets',
    '2. Go to File → Open',
    '3. Select the exported CSV file',
    '4. If prompted, ensure UTF-8 encoding is selected',
    '5. Data should load automatically with proper formatting',
    '6. Use Excel features like pivot tables, charts, and formulas'
  ];
}

/**
 * Export with formulas (advanced)
 */
export function exportToExcelWithFormulas(
  data: any[],
  formulas: Record<string, string>,
  options: ExcelExportOptions = {}
): void {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const rows: string[] = [];

  // Add headers (include formula columns)
  const dataHeaders = Object.keys(data[0]);
  const formulaHeaders = Object.keys(formulas);
  const allHeaders = [...dataHeaders, ...formulaHeaders];
  rows.push(allHeaders.map(h => escapeExcelValue(h)).join(','));

  // Add data rows with formulas
  data.forEach((row, rowIdx) => {
    const values = dataHeaders.map(key => {
      const value = row[key];
      return formatValueForExcel(value, 'Excel');
    });

    // Add formula columns
    formulaHeaders.forEach(formulaCol => {
      const formula = formulas[formulaCol].replace(/{row}/g, String(rowIdx + 2)); // +2 for header and 1-based index
      values.push(formula);
    });

    rows.push(values.join(','));
  });

  const csv = rows.join('\r\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  
  const fileName = options.fileName || 'export_with_formulas.csv';
  downloadBlob(blob, fileName);
}

/**
 * Validate data for Excel export
 */
export function validateForExcel(data: any[]): {
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

  // Check Excel row limit (1,048,576 rows)
  if (data.length > 1048576) {
    errors.push('Data exceeds Excel row limit (1,048,576 rows)');
  }

  // Check Excel column limit (16,384 columns)
  const columnCount = Object.keys(data[0]).length;
  if (columnCount > 16384) {
    errors.push('Data exceeds Excel column limit (16,384 columns)');
  }

  // Check for formula injection
  data.forEach((row, idx) => {
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === 'string' && /^[=+\-@]/.test(value)) {
        warnings.push(`Row ${idx}, column "${key}" starts with special character (potential formula injection)`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  exportToExcel,
  convertToExcelCSV,
  generateSummary,
  getExcelInstructions,
  exportToExcelWithFormulas,
  validateForExcel
};
