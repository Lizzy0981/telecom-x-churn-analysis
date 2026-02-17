// frontend/src/services/export/index.ts
/**
 * Export Services
 * Centralized exports for all export formats
 */

// Power BI
export * from './powerbi';
import powerbiService from './powerbi';

// Tableau
export * from './tableau';
import tableauService from './tableau';

// Excel
export * from './excel';
import excelService from './excel';

// PDF
export * from './pdf';
import pdfService from './pdf';

// CSV
export * from './csv';
import csvService from './csv';

// Re-export all services as a single object
export const exportServices = {
  powerbi: powerbiService,
  tableau: tableauService,
  excel: excelService,
  pdf: pdfService,
  csv: csvService
};

/**
 * Generic export function that routes to appropriate service
 */
export function exportData(
  data: any[],
  format: 'powerbi' | 'tableau' | 'excel' | 'pdf' | 'csv',
  options: any = {}
): void {
  switch (format) {
    case 'powerbi':
      powerbiService.exportToPowerBI(data, options);
      break;
    
    case 'tableau':
      tableauService.exportToTableau(data, options);
      break;
    
    case 'excel':
      excelService.exportToExcel(data, options);
      break;
    
    case 'pdf':
      pdfService.exportToPDF(data, options);
      break;
    
    case 'csv':
      csvService.exportToCSV(data, options);
      break;
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Get export instructions for a format
 */
export function getExportInstructions(
  format: 'powerbi' | 'tableau' | 'excel' | 'pdf' | 'csv'
): string[] {
  switch (format) {
    case 'powerbi':
      return powerbiService.getPowerBIInstructions();
    
    case 'tableau':
      return tableauService.getTableauInstructions();
    
    case 'excel':
      return excelService.getExcelInstructions();
    
    case 'pdf':
      return pdfService.getPDFInstructions();
    
    case 'csv':
      return csvService.getCSVInstructions();
    
    default:
      return [];
  }
}

/**
 * Validate data for export
 */
export function validateForExport(
  data: any[],
  format: 'powerbi' | 'tableau' | 'excel' | 'pdf' | 'csv'
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  switch (format) {
    case 'powerbi':
      return powerbiService.validateForPowerBI(data);
    
    case 'tableau':
      return tableauService.validateForTableau(data);
    
    case 'excel':
      return excelService.validateForExcel(data);
    
    case 'pdf':
      return pdfService.validateForPDF(data);
    
    case 'csv':
      return csvService.validateForCSV(data);
    
    default:
      return {
        valid: false,
        errors: [`Unknown format: ${format}`],
        warnings: []
      };
  }
}

/**
 * Get available export formats
 */
export function getAvailableFormats(): Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
}> {
  return [
    {
      id: 'powerbi',
      name: 'Power BI',
      description: 'Export as JSON for Microsoft Power BI',
      icon: '📊'
    },
    {
      id: 'tableau',
      name: 'Tableau',
      description: 'Export as CSV for Tableau Desktop/Public',
      icon: '📈'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Export as CSV for Microsoft Excel',
      icon: '📗'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Export as PDF document',
      icon: '📕'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Export as standard CSV file',
      icon: '📄'
    }
  ];
}

// Default export
export default {
  exportData,
  getExportInstructions,
  validateForExport,
  getAvailableFormats,
  ...exportServices
};
