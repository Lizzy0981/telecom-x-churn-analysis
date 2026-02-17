// frontend/src/components/Charts/ExportMenu.tsx
import React, { useState } from 'react';
import { PowerBIExport } from './BI/PowerBIExport';
import { TableauExport } from './BI/TableauExport';
import { ExcelExport } from './BI/ExcelExport';
import './Charts.css';

export interface ExportMenuProps {
  data: any[];
  fileName?: string;
  onExport?: (format: string) => void;
}

type ExportFormat = 'powerbi' | 'tableau' | 'excel' | 'csv' | 'json' | 'pdf';

export const ExportMenu: React.FC<ExportMenuProps> = ({
  data,
  fileName = 'telecom_data',
  onExport
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);

  const exportFormats = [
    {
      id: 'powerbi' as ExportFormat,
      name: 'Power BI',
      icon: '📊',
      description: 'Microsoft Power BI format',
      color: '#F2C811'
    },
    {
      id: 'tableau' as ExportFormat,
      name: 'Tableau',
      icon: '📈',
      description: 'Tableau-compatible CSV',
      color: '#E97627'
    },
    {
      id: 'excel' as ExportFormat,
      name: 'Excel',
      icon: '📗',
      description: 'Microsoft Excel format',
      color: '#217346'
    },
    {
      id: 'csv' as ExportFormat,
      name: 'CSV',
      icon: '📄',
      description: 'Comma-separated values',
      color: '#667eea'
    },
    {
      id: 'json' as ExportFormat,
      name: 'JSON',
      icon: '{ }',
      description: 'JavaScript Object Notation',
      color: '#f59e0b'
    },
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF',
      icon: '📕',
      description: 'Portable Document Format',
      color: '#ef4444'
    }
  ];

  const handleExport = (format: ExportFormat) => {
    setSelectedFormat(format);
    if (onExport) {
      onExport(format);
    }
  };

  const handleClose = () => {
    setSelectedFormat(null);
    setIsOpen(false);
  };

  const exportToCSV = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => JSON.stringify(row[h] || '')).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderExportModal = () => {
    switch (selectedFormat) {
      case 'powerbi':
        return <PowerBIExport data={data} fileName={fileName} />;
      case 'tableau':
        return <TableauExport data={data} fileName={fileName} />;
      case 'excel':
        return <ExcelExport data={data} fileName={fileName} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Export Button */}
      <div className="export-menu">
        <button
          className="export-trigger-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="btn-icon">📥</span>
          <span className="btn-text">Export Data</span>
          <span className="btn-chevron">{isOpen ? '▲' : '▼'}</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="export-dropdown">
            <div className="dropdown-header">
              <h4>Export Options</h4>
              <p>{data.length.toLocaleString()} records available</p>
            </div>

            <div className="export-formats-grid">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  className="export-format-card"
                  onClick={() => {
                    if (format.id === 'csv') {
                      exportToCSV();
                      handleClose();
                    } else if (format.id === 'json') {
                      exportToJSON();
                      handleClose();
                    } else if (format.id === 'pdf') {
                      alert('PDF export coming soon!');
                      handleClose();
                    } else {
                      handleExport(format.id);
                    }
                  }}
                  style={{ '--format-color': format.color } as React.CSSProperties}
                >
                  <div className="format-icon" style={{ color: format.color }}>
                    {format.icon}
                  </div>
                  <div className="format-info">
                    <h5 className="format-name">{format.name}</h5>
                    <p className="format-description">{format.description}</p>
                  </div>
                  <div className="format-arrow">→</div>
                </button>
              ))}
            </div>

            <div className="dropdown-footer">
              <button className="close-btn" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {selectedFormat && ['powerbi', 'tableau', 'excel'].includes(selectedFormat) && (
        <div className="export-modal-overlay" onClick={handleClose}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleClose}>
              ✕
            </button>
            {renderExportModal()}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div className="export-overlay" onClick={handleClose} />
      )}
    </>
  );
};

export default ExportMenu;
