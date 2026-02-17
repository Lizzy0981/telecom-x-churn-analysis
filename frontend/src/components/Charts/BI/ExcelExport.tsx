// frontend/src/components/Charts/BI/ExcelExport.tsx
import React, { useState } from 'react';
import '../Charts.css';

export interface ExcelExportProps {
  data: any[];
  fileName?: string;
  sheetName?: string;
  includeCharts?: boolean;
}

export const ExcelExport: React.FC<ExcelExportProps> = ({
  data,
  fileName = 'telecom_data',
  sheetName = 'Data',
  includeCharts = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const exportToExcel = async () => {
    setIsExporting(true);
    setExportStatus('idle');

    try {
      // Para Excel real, usarías una librería como xlsx o exceljs
      // Aquí exportamos como CSV compatible con Excel
      const csvContent = convertToExcelCSV(data);

      // Create BOM for UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Excel export error:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const convertToExcelCSV = (data: any[]): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        
        // Handle dates
        if (value instanceof Date) {
          return value.toLocaleDateString();
        }
        
        // Handle strings with special characters
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
        }
        
        return value;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  };

  const generateSummary = () => {
    if (data.length === 0) return null;

    const columns = Object.keys(data[0]);
    const numericColumns = columns.filter(col => 
      typeof data[0][col] === 'number'
    );

    return (
      <div className="data-summary">
        <h5>Data Summary:</h5>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Total Rows:</span>
            <span className="summary-value">{data.length.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Columns:</span>
            <span className="summary-value">{columns.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Numeric Columns:</span>
            <span className="summary-value">{numericColumns.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">File Size (est):</span>
            <span className="summary-value">
              {Math.round(JSON.stringify(data).length / 1024)} KB
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="excel-export">
      <div className="export-header">
        <div className="export-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#217346"/>
            <path d="M12 10H28V30H12V10Z" fill="white" fillOpacity="0.9"/>
            <path d="M16 15L22 20L16 25V15Z" fill="#217346"/>
            <path d="M22 15L28 20L22 25V15Z" fill="#217346"/>
          </svg>
        </div>
        <div className="export-info">
          <h4>Excel Export</h4>
          <p>Export data to Microsoft Excel format (.csv)</p>
        </div>
      </div>

      {generateSummary()}

      <button
        className="export-button"
        onClick={exportToExcel}
        disabled={isExporting || data.length === 0}
      >
        {isExporting ? (
          <>
            <span className="spinner-small"></span>
            Exporting...
          </>
        ) : exportStatus === 'success' ? (
          <>
            <span>✓</span>
            Exported Successfully
          </>
        ) : exportStatus === 'error' ? (
          <>
            <span>✗</span>
            Export Failed
          </>
        ) : (
          <>
            <span>📊</span>
            Export to Excel
          </>
        )}
      </button>

      <div className="export-instructions">
        <h5>Instructions:</h5>
        <ol>
          <li>Click "Export to Excel" to download CSV</li>
          <li>Open with Microsoft Excel or Google Sheets</li>
          <li>Data will be ready for analysis</li>
          <li>Create pivot tables and charts as needed</li>
        </ol>
      </div>

      <div className="export-features">
        <h5>Excel Features:</h5>
        <ul>
          <li>✓ Pivot Tables</li>
          <li>✓ Formulas & Functions</li>
          <li>✓ Charts & Graphs</li>
          <li>✓ Data Filtering</li>
          <li>✓ Conditional Formatting</li>
        </ul>
      </div>

      {includeCharts && (
        <div className="chart-options">
          <label>
            <input type="checkbox" defaultChecked />
            Include recommended charts
          </label>
          <label>
            <input type="checkbox" defaultChecked />
            Include summary statistics
          </label>
        </div>
      )}
    </div>
  );
};

export default ExcelExport;
