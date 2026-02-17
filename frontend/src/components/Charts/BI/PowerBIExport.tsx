// frontend/src/components/Charts/BI/PowerBIExport.tsx
import React, { useState } from 'react';
import '../Charts.css';

export interface PowerBIExportProps {
  data: any[];
  fileName?: string;
  datasetName?: string;
}

export const PowerBIExport: React.FC<PowerBIExportProps> = ({
  data,
  fileName = 'telecom_data',
  datasetName = 'Customer Churn Dataset'
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const exportToPowerBI = async () => {
    setIsExporting(true);
    setExportStatus('idle');

    try {
      // Convertir datos a formato compatible con Power BI
      const powerBIData = convertToPowerBIFormat(data);

      // Crear archivo .pbix (simplificado - en producción usarías API de Power BI)
      const blob = new Blob([JSON.stringify(powerBIData, null, 2)], { 
        type: 'application/json' 
      });

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}_powerbi.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      
      // Reset after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Power BI export error:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const convertToPowerBIFormat = (data: any[]) => {
    return {
      version: '1.0',
      datasetName: datasetName,
      tables: [
        {
          name: 'MainData',
          columns: data.length > 0 ? Object.keys(data[0]).map(key => ({
            name: key,
            dataType: typeof data[0][key] === 'number' ? 'Double' : 'String'
          })) : [],
          rows: data
        }
      ],
      metadata: {
        exportDate: new Date().toISOString(),
        rowCount: data.length,
        source: 'Telecom X - Customer Churn Analysis'
      }
    };
  };

  return (
    <div className="powerbi-export">
      <div className="export-header">
        <div className="export-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="#F2C811"/>
            <path d="M12 10H20L28 20L20 30H12V10Z" fill="#1C1C1C"/>
          </svg>
        </div>
        <div className="export-info">
          <h4>Power BI Export</h4>
          <p>Export data to Microsoft Power BI format (.json)</p>
        </div>
      </div>

      <div className="export-stats">
        <div className="stat-item">
          <span className="stat-label">Records:</span>
          <span className="stat-value">{data.length.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Columns:</span>
          <span className="stat-value">
            {data.length > 0 ? Object.keys(data[0]).length : 0}
          </span>
        </div>
      </div>

      <button
        className="export-button"
        onClick={exportToPowerBI}
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
            Export to Power BI
          </>
        )}
      </button>

      <div className="export-instructions">
        <h5>Instructions:</h5>
        <ol>
          <li>Click "Export to Power BI" to download data</li>
          <li>Open Power BI Desktop</li>
          <li>Go to "Get Data" → "JSON"</li>
          <li>Select the downloaded file</li>
          <li>Transform and load your data</li>
        </ol>
      </div>
    </div>
  );
};

export default PowerBIExport;
