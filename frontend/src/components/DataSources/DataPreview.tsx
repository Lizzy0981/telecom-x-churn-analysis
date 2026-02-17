// frontend/src/components/DataSources/DataPreview.tsx
import React, { useState } from 'react';

export interface DataPreviewProps {
  data: any[];
  fileName?: string;
  fileSize?: number;
  uploadDate?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  maxRows?: number;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
  data,
  fileName = 'data.csv',
  fileSize = 0,
  uploadDate = new Date().toISOString(),
  onConfirm,
  onCancel,
  maxRows = 10
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  if (!data || data.length === 0) {
    return (
      <div className="data-preview-empty">
        <div className="empty-icon">📄</div>
        <h3>No data to preview</h3>
        <p>Upload a file to see preview</p>
      </div>
    );
  }

  const columns = Object.keys(data[0]);
  const previewData = data.slice(0, maxRows);
  const totalRows = data.length;
  const hasMore = totalRows > maxRows;

  // Detect data types
  const getColumnType = (columnName: string): string => {
    const sampleValues = data.slice(0, 100).map(row => row[columnName]);
    const numericCount = sampleValues.filter(v => !isNaN(Number(v))).length;
    const dateCount = sampleValues.filter(v => !isNaN(Date.parse(v))).length;
    
    if (numericCount > sampleValues.length * 0.8) return 'numeric';
    if (dateCount > sampleValues.length * 0.8) return 'date';
    return 'text';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const toggleRowSelection = (index: number) => {
    setSelectedRows(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="data-preview">
      {/* Header */}
      <div className="preview-header">
        <div className="header-info">
          <h3 className="preview-title">📊 Data Preview</h3>
          <div className="file-info">
            <span className="file-name">{fileName}</span>
            <span className="file-meta">
              {formatFileSize(fileSize)} • {totalRows.toLocaleString()} rows • {columns.length} columns
            </span>
            <span className="upload-date">Uploaded: {formatDate(uploadDate)}</span>
          </div>
        </div>
        <div className="header-actions">
          {onCancel && (
            <button className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
          )}
          {onConfirm && (
            <button className="btn-confirm" onClick={onConfirm}>
              Confirm & Process
            </button>
          )}
        </div>
      </div>

      {/* Data Statistics */}
      <div className="data-stats">
        <div className="stat-card">
          <span className="stat-icon">📝</span>
          <div className="stat-content">
            <span className="stat-value">{totalRows.toLocaleString()}</span>
            <span className="stat-label">Total Rows</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-content">
            <span className="stat-value">{columns.length}</span>
            <span className="stat-label">Columns</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔢</span>
          <div className="stat-content">
            <span className="stat-value">
              {columns.filter(col => getColumnType(col) === 'numeric').length}
            </span>
            <span className="stat-label">Numeric</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div className="stat-content">
            <span className="stat-value">
              {columns.filter(col => getColumnType(col) === 'date').length}
            </span>
            <span className="stat-label">Date</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💾</span>
          <div className="stat-content">
            <span className="stat-value">{formatFileSize(fileSize)}</span>
            <span className="stat-label">File Size</span>
          </div>
        </div>
      </div>

      {/* Column Types */}
      <div className="column-types">
        <h4>Column Types:</h4>
        <div className="types-list">
          {columns.map((column) => {
            const type = getColumnType(column);
            const typeIcons: Record<string, string> = {
              numeric: '🔢',
              date: '📅',
              text: '📝'
            };
            return (
              <div key={column} className="type-item">
                <span className="type-icon">{typeIcons[type]}</span>
                <span className="type-column">{column}</span>
                <span className={`type-badge ${type}`}>{type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Table */}
      <div className="preview-table-container">
        <div className="preview-table-scroll">
          <table className="preview-table">
            <thead>
              <tr>
                <th className="row-selector">
                  <input 
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(previewData.map((_, i) => i));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    checked={selectedRows.length === previewData.length}
                  />
                </th>
                <th className="row-number">#</th>
                {columns.map((column) => (
                  <th key={column}>
                    <div className="column-header">
                      <span className="column-name">{column}</span>
                      <span className={`column-type ${getColumnType(column)}`}>
                        {getColumnType(column)}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className={selectedRows.includes(rowIndex) ? 'selected' : ''}
                >
                  <td className="row-selector">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowIndex)}
                      onChange={() => toggleRowSelection(rowIndex)}
                    />
                  </td>
                  <td className="row-number">{rowIndex + 1}</td>
                  {columns.map((column) => (
                    <td key={column}>
                      <div className="cell-content">
                        {row[column] !== null && row[column] !== undefined
                          ? String(row[column])
                          : <span className="null-value">—</span>
                        }
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {hasMore && (
        <div className="preview-footer">
          <p className="preview-note">
            ℹ️ Showing first {maxRows} of {totalRows.toLocaleString()} rows.
            Full dataset will be processed.
          </p>
        </div>
      )}

      {selectedRows.length > 0 && (
        <div className="selection-info">
          <span>{selectedRows.length} row(s) selected</span>
          <button 
            className="btn-clear-selection"
            onClick={() => setSelectedRows([])}
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default DataPreview;
