// frontend/src/services/export/pdf.ts
/**
 * PDF Export Service
 * Export data and reports to PDF format
 * Note: For full PDF generation, consider using jsPDF or pdfmake libraries
 */

export interface PDFExportOptions {
  fileName?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'Letter' | 'Legal';
  includeDate?: boolean;
  includePageNumbers?: boolean;
}

/**
 * Export data table to PDF (simplified version)
 * For production, integrate jsPDF or pdfmake
 */
export function exportToPDF(
  data: any[],
  options: PDFExportOptions = {}
): void {
  const {
    fileName = 'export.pdf',
    title = 'Data Export',
    orientation = 'portrait',
    includeDate = true
  } = options;

  // This is a simplified implementation
  // For production, use jsPDF or pdfmake

  console.warn('PDF export is a placeholder. Integrate jsPDF or pdfmake for full functionality.');

  // Create HTML content for PDF
  const htmlContent = generateHTMLForPDF(data, title, includeDate);

  // Open print dialog (simple fallback)
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

/**
 * Generate HTML content for PDF printing
 */
function generateHTMLForPDF(
  data: any[],
  title: string,
  includeDate: boolean
): string {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      color: #333;
    }
    h1 {
      font-size: 18pt;
      margin-bottom: 10px;
      color: #000;
    }
    .date {
      font-size: 9pt;
      color: #666;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background-color: #f0f0f0;
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
      font-weight: bold;
    }
    td {
      border: 1px solid #ddd;
      padding: 6px;
    }
    tr:nth-child(even) {
      background-color: #fafafa;
    }
    @media print {
      body {
        margin: 0;
      }
      button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${includeDate ? `<div class="date">Generated: ${new Date().toLocaleString()}</div>` : ''}
  
  <table>
    <thead>
      <tr>
        ${columns.map(col => `<th>${col}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${columns.map(col => `<td>${formatValueForPDF(row[col])}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <script>
    // Auto-trigger print on load
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  return html;
}

/**
 * Format value for PDF display
 */
function formatValueForPDF(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  // Escape HTML
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Export report to PDF with jsPDF (requires jsPDF library)
 */
export async function exportReportToPDF(
  reportData: {
    title: string;
    sections: Array<{
      title: string;
      content: string;
      data?: any[];
    }>;
  },
  options: PDFExportOptions = {}
): Promise<void> {
  console.warn('This function requires jsPDF library. Install with: npm install jspdf');
  
  // Placeholder for jsPDF integration
  // Example implementation:
  /*
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: options.pageSize || 'a4'
  });

  // Add title
  doc.setFontSize(20);
  doc.text(reportData.title, 20, 20);

  // Add sections
  let yPosition = 40;
  reportData.sections.forEach(section => {
    doc.setFontSize(14);
    doc.text(section.title, 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(section.content, 20, yPosition);
    yPosition += 20;

    if (section.data) {
      // Add table using autoTable plugin
      // doc.autoTable({ ... });
    }
  });

  // Save PDF
  doc.save(options.fileName || 'report.pdf');
  */
}

/**
 * Export chart to PDF (requires html2canvas and jsPDF)
 */
export async function exportChartToPDF(
  chartElement: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  console.warn('This function requires html2canvas and jsPDF libraries');
  
  // Placeholder for html2canvas + jsPDF integration
  /*
  const html2canvas = await import('html2canvas');
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas.default(chartElement);
  const imgData = canvas.toDataURL('image/png');

  const doc = new jsPDF({
    orientation: options.orientation || 'landscape',
    unit: 'mm',
    format: options.pageSize || 'a4'
  });

  const imgWidth = 280; // A4 width in mm minus margins
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  doc.save(options.fileName || 'chart.pdf');
  */
}

/**
 * Get PDF export instructions
 */
export function getPDFInstructions(): string[] {
  return [
    '1. Click Export to PDF',
    '2. Use browser print dialog to save as PDF',
    '3. Adjust page settings if needed',
    '4. Save to desired location',
    'Note: For advanced PDF features, install jsPDF library'
  ];
}

/**
 * Check if PDF libraries are available
 */
export function checkPDFLibraries(): {
  jsPDF: boolean;
  html2canvas: boolean;
  autoTable: boolean;
} {
  return {
    jsPDF: typeof window !== 'undefined' && 'jsPDF' in window,
    html2canvas: typeof window !== 'undefined' && 'html2canvas' in window,
    autoTable: false // Would need to check jsPDF plugin
  };
}

/**
 * Generate PDF from HTML string (simple)
 */
export function generatePDFFromHTML(
  html: string,
  fileName: string = 'document.pdf'
): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Trigger print after content loads
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Validate data for PDF export
 */
export function validateForPDF(data: any[]): {
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
    warnings.push('Data array is empty');
  }

  // Check for very large datasets
  if (data.length > 1000) {
    warnings.push('Large dataset may result in a very long PDF');
  }

  // Check for very wide tables
  const columnCount = data.length > 0 ? Object.keys(data[0]).length : 0;
  if (columnCount > 15) {
    warnings.push('Many columns may not fit well in PDF format. Consider landscape orientation.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export default {
  exportToPDF,
  exportReportToPDF,
  exportChartToPDF,
  getPDFInstructions,
  checkPDFLibraries,
  generatePDFFromHTML,
  validateForPDF
};
