// frontend/src/services/utils/fileParser.ts
/**
 * File Parser
 * Utilities for parsing various file formats (CSV, Excel, JSON)
 */

export interface ParseOptions {
  delimiter?: string;
  hasHeaders?: boolean;
  skipEmptyLines?: boolean;
  trimValues?: boolean;
  maxRows?: number;
}

export interface ParseResult {
  data: any[];
  headers: string[];
  rowCount: number;
  columnCount: number;
  parseTime: number;
  errors: string[];
}

/**
 * Parse CSV file
 */
export async function parseCSV(
  file: File,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const startTime = performance.now();
  const {
    delimiter = ',',
    hasHeaders = true,
    skipEmptyLines = true,
    trimValues = true,
    maxRows = Infinity
  } = options;

  const errors: string[] = [];
  const text = await file.text();
  const lines = text.split(/\r?\n/);

  let headers: string[] = [];
  const data: any[] = [];
  let currentLine = 0;

  // Parse headers
  if (hasHeaders && lines.length > 0) {
    headers = parseCSVLine(lines[0], delimiter, trimValues);
    currentLine = 1;
  }

  // Parse data rows
  for (let i = currentLine; i < lines.length && data.length < maxRows; i++) {
    const line = lines[i];

    if (skipEmptyLines && !line.trim()) {
      continue;
    }

    try {
      const values = parseCSVLine(line, delimiter, trimValues);

      if (hasHeaders && headers.length > 0) {
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        data.push(row);
      } else {
        data.push(values);
      }
    } catch (error) {
      errors.push(`Error parsing line ${i + 1}: ${error}`);
    }
  }

  const parseTime = performance.now() - startTime;

  return {
    data,
    headers: hasHeaders ? headers : [],
    rowCount: data.length,
    columnCount: headers.length || (data[0] ? Object.keys(data[0]).length : 0),
    parseTime,
    errors
  };
}

/**
 * Parse a single CSV line (handles quoted values)
 */
function parseCSVLine(
  line: string,
  delimiter: string,
  trimValues: boolean = true
): string[] {
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
      values.push(trimValues ? currentValue.trim() : currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Add last value
  values.push(trimValues ? currentValue.trim() : currentValue);

  return values;
}

/**
 * Parse Excel file (requires XLSX library)
 */
export async function parseExcel(
  file: File,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const startTime = performance.now();
  const errors: string[] = [];

  try {
    // Check if XLSX library is available
    if (typeof window === 'undefined' || !('XLSX' in window)) {
      errors.push('XLSX library not found. Install with: npm install xlsx');
      return {
        data: [],
        headers: [],
        rowCount: 0,
        columnCount: 0,
        parseTime: performance.now() - startTime,
        errors
      };
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse with XLSX
    const XLSX = (window as any).XLSX;
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: options.hasHeaders !== false ? undefined : 1,
      defval: '',
      raw: false
    });

    // Limit rows if specified
    const limitedData = options.maxRows
      ? data.slice(0, options.maxRows)
      : data;

    // Extract headers
    const headers = limitedData.length > 0 ? Object.keys(limitedData[0]) : [];

    const parseTime = performance.now() - startTime;

    return {
      data: limitedData,
      headers,
      rowCount: limitedData.length,
      columnCount: headers.length,
      parseTime,
      errors
    };
  } catch (error: any) {
    errors.push(`Excel parsing error: ${error.message}`);
    return {
      data: [],
      headers: [],
      rowCount: 0,
      columnCount: 0,
      parseTime: performance.now() - startTime,
      errors
    };
  }
}

/**
 * Parse JSON file
 */
export async function parseJSON(
  file: File,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const startTime = performance.now();
  const errors: string[] = [];

  try {
    const text = await file.text();
    let parsedData = JSON.parse(text);

    // Handle both array and single object
    if (!Array.isArray(parsedData)) {
      parsedData = [parsedData];
    }

    // Limit rows if specified
    const data = options.maxRows
      ? parsedData.slice(0, options.maxRows)
      : parsedData;

    // Extract headers
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    const parseTime = performance.now() - startTime;

    return {
      data,
      headers,
      rowCount: data.length,
      columnCount: headers.length,
      parseTime,
      errors
    };
  } catch (error: any) {
    errors.push(`JSON parsing error: ${error.message}`);
    return {
      data: [],
      headers: [],
      rowCount: 0,
      columnCount: 0,
      parseTime: performance.now() - startTime,
      errors
    };
  }
}

/**
 * Auto-detect file type and parse
 */
export async function parseFile(
  file: File,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'csv':
    case 'txt':
      return parseCSV(file, options);

    case 'xlsx':
    case 'xls':
      return parseExcel(file, options);

    case 'json':
      return parseJSON(file, options);

    default:
      return {
        data: [],
        headers: [],
        rowCount: 0,
        columnCount: 0,
        parseTime: 0,
        errors: [`Unsupported file type: ${extension}`]
      };
  }
}

/**
 * Detect delimiter in CSV file
 */
export async function detectDelimiter(file: File): Promise<string> {
  const text = await file.text();
  const firstLine = text.split('\n')[0];

  const delimiters = [',', ';', '\t', '|'];
  const counts = delimiters.map(d => ({
    delimiter: d,
    count: firstLine.split(d).length
  }));

  // Return delimiter with highest count
  counts.sort((a, b) => b.count - a.count);
  return counts[0].delimiter;
}

/**
 * Infer data types from sample
 */
export function inferDataTypes(
  data: any[],
  sampleSize: number = 100
): Record<string, 'string' | 'number' | 'boolean' | 'date'> {
  if (!data || data.length === 0) {
    return {};
  }

  const types: Record<string, 'string' | 'number' | 'boolean' | 'date'> = {};
  const sample = data.slice(0, Math.min(sampleSize, data.length));
  const headers = Object.keys(data[0]);

  headers.forEach(header => {
    const values = sample.map(row => row[header]).filter(v => v != null && v !== '');

    if (values.length === 0) {
      types[header] = 'string';
      return;
    }

    // Check if all values are numbers
    const numericValues = values.map(v => Number(v)).filter(n => !isNaN(n));
    if (numericValues.length === values.length) {
      types[header] = 'number';
      return;
    }

    // Check if all values are booleans
    const boolValues = values.filter(v => {
      const str = String(v).toLowerCase();
      return ['true', 'false', '0', '1', 'yes', 'no'].includes(str);
    });
    if (boolValues.length === values.length) {
      types[header] = 'boolean';
      return;
    }

    // Check if all values are dates
    const dateValues = values.filter(v => !isNaN(Date.parse(String(v))));
    if (dateValues.length === values.length) {
      types[header] = 'date';
      return;
    }

    // Default to string
    types[header] = 'string';
  });

  return types;
}

/**
 * Convert data types based on inferred types
 */
export function convertDataTypes(
  data: any[],
  types: Record<string, 'string' | 'number' | 'boolean' | 'date'>
): any[] {
  return data.map(row => {
    const converted: any = {};

    Object.keys(row).forEach(key => {
      const value = row[key];
      const type = types[key] || 'string';

      if (value === null || value === undefined || value === '') {
        converted[key] = null;
        return;
      }

      switch (type) {
        case 'number':
          converted[key] = Number(value);
          break;

        case 'boolean':
          const str = String(value).toLowerCase();
          converted[key] = ['true', '1', 'yes'].includes(str);
          break;

        case 'date':
          converted[key] = new Date(value);
          break;

        case 'string':
        default:
          converted[key] = String(value);
          break;
      }
    });

    return converted;
  });
}

/**
 * Get file preview (first N rows)
 */
export async function getFilePreview(
  file: File,
  previewRows: number = 10
): Promise<ParseResult> {
  return parseFile(file, { maxRows: previewRows });
}

/**
 * Validate file before parsing
 */
export function validateFile(file: File): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size (max 50 MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File size exceeds 50 MB (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const supportedExtensions = ['csv', 'txt', 'xlsx', 'xls', 'json'];
  
  if (!extension || !supportedExtensions.includes(extension)) {
    errors.push(`Unsupported file type: .${extension}`);
  }

  // Warn about large files
  if (file.size > 10 * 1024 * 1024) {
    warnings.push('Large file detected. Parsing may take a while.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get file info
 */
export function getFileInfo(file: File): {
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  extension: string;
  lastModified: Date;
} {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  return {
    name: file.name,
    size: file.size,
    sizeFormatted: formatFileSize(file.size),
    type: file.type,
    extension,
    lastModified: new Date(file.lastModified)
  };
}

/**
 * Format file size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default {
  parseCSV,
  parseExcel,
  parseJSON,
  parseFile,
  detectDelimiter,
  inferDataTypes,
  convertDataTypes,
  getFilePreview,
  validateFile,
  getFileInfo
};
