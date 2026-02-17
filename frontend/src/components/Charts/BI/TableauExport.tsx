// frontend/src/components/Charts/BI/TableauExport.tsx
import React, { useState } from 'react';
import '../Charts.css';

export interface TableauExportProps {
  data: any[];
  fileName?: string;
}

export const TableauExport: React.FC<TableauExportProps> = ({
  data,
  fileName = 'telecom_data'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const exportToTableau = async () => {
    setIsExporting(true);
    setExportStatus('idle');

    try {
      // Convertir a formato TDE/Hyper (simplificado - formato CSV compatible)
      const csvContent = convertToCSV(data);

      // Create blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}_tableau.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Tableau export error:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';

    // Headers
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    // Rows
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  };

  return (
    <div className="tableau-export">
      <div className="export-header">
        <div className="export-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#E97627"/>
            <rect x="14" y="10" width="12" height="4" fill="white"/>
            <rect x="10" y="18" width="4" height="4" fill="white"/>
            <rect x="14" y="18" width="12" height="4" fill="white"/>
            <rect x="26" y="18" width="4" height="4" fill="white"/>
            <rect x="14" y="26" width="12" height="4" fill="white"/>
          </svg>
        </div>
        <div className="export-info">
          <h4>Tableau Export</h4>
          <p>Export data to Tableau-compatible CSV format</p>
        </div>
      </div>

      <div className="export-stats">
        <div className="stat-item">
          <span className="stat-label">Records:</span>
          <span className="stat-value">{data.length.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Format:</span>
          <span className="stat-value">CSV</span>
        </div>
      </div>

      <button
        className="export-button"
        onClick={exportToTableau}
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
            Export to Tableau
          </>
        )}
      </button>

      <div className="export-instructions">
        <h5>Instructions:</h5>
        <ol>
          <li>Click "Export to Tableau" to download CSV</li>
          <li>Open Tableau Desktop or Tableau Public</li>
          <li>Select "Text file" from data sources</li>
          <li>Choose the downloaded CSV file</li>
          <li>Start building your visualizations</li>
        </ol>
      </div>

      <div className="export-features">
        <h5>Tableau Features Available:</h5>
        <ul>
          <li>✓ Interactive dashboards</li>
          <li>✓ Drag-and-drop analytics</li>
          <li>✓ Advanced calculations</li>
          <li>✓ Map visualizations</li>
          <li>✓ Real-time collaboration</li>
        </ul>
      </div>
    </div>
  );
};

export default TableauExport;
