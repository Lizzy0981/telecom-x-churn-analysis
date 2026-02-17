// frontend/src/components/Reports/ReportCard.tsx
import React from 'react';

export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'churn' | 'revenue' | 'customer' | 'ml' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  createdAt: string;
  createdBy?: string;
  size?: number;
  status: 'ready' | 'generating' | 'failed';
  downloadUrl?: string;
  metrics?: {
    customers?: number;
    revenue?: number;
    accuracy?: number;
    [key: string]: any;
  };
}

export interface ReportCardProps {
  report: Report;
  onDownload?: (report: Report) => void;
  onDelete?: (report: Report) => void;
  onView?: (report: Report) => void;
  onShare?: (report: Report) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onDownload,
  onDelete,
  onView,
  onShare
}) => {
  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      churn: '📉',
      revenue: '💰',
      customer: '👥',
      ml: '🤖',
      custom: '📊'
    };
    return icons[type] || '📄';
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      churn: '#ef4444',
      revenue: '#22c55e',
      customer: '#3b82f6',
      ml: '#667eea',
      custom: '#f59e0b'
    };
    return colors[type] || '#a1a1aa';
  };

  const getFormatIcon = (format: string): string => {
    const icons: Record<string, string> = {
      pdf: '📕',
      excel: '📗',
      csv: '📄',
      json: '{ }'
    };
    return icons[format] || '📄';
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className={`report-card report-status-${report.status}`}>
      {/* Header */}
      <div className="report-card-header">
        <div className="report-type-icon" style={{ backgroundColor: getTypeColor(report.type) }}>
          {getTypeIcon(report.type)}
        </div>
        <div className="report-header-info">
          <h4 className="report-title">{report.title}</h4>
          <p className="report-description">{report.description}</p>
        </div>
        {report.status === 'generating' && (
          <div className="status-badge generating">
            <span className="spinner-small"></span>
            Generating...
          </div>
        )}
        {report.status === 'failed' && (
          <div className="status-badge failed">
            ✗ Failed
          </div>
        )}
        {report.status === 'ready' && (
          <div className="status-badge ready">
            ✓ Ready
          </div>
        )}
      </div>

      {/* Metrics */}
      {report.metrics && Object.keys(report.metrics).length > 0 && (
        <div className="report-metrics">
          {Object.entries(report.metrics).map(([key, value]) => (
            <div key={key} className="metric-item">
              <span className="metric-label">{key}:</span>
              <span className="metric-value">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="report-card-footer">
        <div className="report-meta">
          <span className="meta-item">
            {getFormatIcon(report.format)} {report.format.toUpperCase()}
          </span>
          <span className="meta-item">
            📦 {formatFileSize(report.size)}
          </span>
          <span className="meta-item">
            🕐 {formatDate(report.createdAt)}
          </span>
          {report.createdBy && (
            <span className="meta-item">
              👤 {report.createdBy}
            </span>
          )}
        </div>

        {/* Actions */}
        {report.status === 'ready' && (
          <div className="report-actions">
            {onView && (
              <button
                className="action-btn btn-view"
                onClick={() => onView(report)}
                title="View report"
              >
                👁️
              </button>
            )}
            {onDownload && (
              <button
                className="action-btn btn-download"
                onClick={() => onDownload(report)}
                title="Download report"
              >
                ⬇️
              </button>
            )}
            {onShare && (
              <button
                className="action-btn btn-share"
                onClick={() => onShare(report)}
                title="Share report"
              >
                🔗
              </button>
            )}
            {onDelete && (
              <button
                className="action-btn btn-delete"
                onClick={() => onDelete(report)}
                title="Delete report"
              >
                🗑️
              </button>
            )}
          </div>
        )}

        {report.status === 'failed' && onDelete && (
          <button
            className="action-btn btn-delete"
            onClick={() => onDelete(report)}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
