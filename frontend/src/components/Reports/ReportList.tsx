// frontend/src/components/Reports/ReportList.tsx
import React, { useState } from 'react';
import { ReportCard, Report } from './ReportCard';

export interface ReportListProps {
  reports?: Report[];
  loading?: boolean;
  onViewReport?: (report: Report) => void;
  onDownloadReport?: (report: Report) => void;
  onDeleteReport?: (report: Report) => void;
  onShareReport?: (report: Report) => void;
  onCreateNew?: () => void;
  emptyMessage?: string;
}

export const ReportList: React.FC<ReportListProps> = ({
  reports = [],
  loading = false,
  onViewReport,
  onDownloadReport,
  onDeleteReport,
  onShareReport,
  onCreateNew,
  emptyMessage = 'No reports found'
}) => {
  const [filter, setFilter] = useState<'all' | 'churn' | 'revenue' | 'customer' | 'ml' | 'custom'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.type === filter;
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  // Group by status
  const groupedReports = {
    processing: sortedReports.filter(r => r.status === 'processing'),
    ready: sortedReports.filter(r => r.status === 'ready'),
    draft: sortedReports.filter(r => r.status === 'draft'),
    error: sortedReports.filter(r => r.status === 'error')
  };

  if (loading) {
    return (
      <div className="report-list-loading">
        <div className="spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="report-list">
      {/* Header */}
      <div className="report-list-header">
        <div className="header-left">
          <h2 className="list-title">Reports</h2>
          <span className="list-count">
            {sortedReports.length} {sortedReports.length === 1 ? 'report' : 'reports'}
          </span>
        </div>

        <div className="header-right">
          {onCreateNew && (
            <button className="btn-create-report" onClick={onCreateNew}>
              <span className="btn-icon">➕</span>
              <span className="btn-text">New Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="report-list-controls">
        <div className="search-container">
          <input
            type="search"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">Type:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="churn">Churn Analysis</option>
              <option value="revenue">Revenue</option>
              <option value="customer">Customer</option>
              <option value="ml">ML Performance</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="filter-select"
            >
              <option value="date">Date Created</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Sections */}
      {sortedReports.length === 0 ? (
        <div className="report-list-empty">
          <div className="empty-icon">📄</div>
          <h3>{emptyMessage}</h3>
          {onCreateNew && (
            <button className="btn-create-empty" onClick={onCreateNew}>
              Create Your First Report
            </button>
          )}
        </div>
      ) : (
        <div className="report-sections">
          {/* Processing Reports */}
          {groupedReports.processing.length > 0 && (
            <div className="report-section">
              <h3 className="section-title">
                <span className="section-icon">⏳</span>
                Processing ({groupedReports.processing.length})
              </h3>
              <div className="report-grid">
                {groupedReports.processing.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={onViewReport}
                    onDownload={onDownloadReport}
                    onDelete={onDeleteReport}
                    onShare={onShareReport}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Ready Reports */}
          {groupedReports.ready.length > 0 && (
            <div className="report-section">
              <h3 className="section-title">
                <span className="section-icon">✓</span>
                Ready ({groupedReports.ready.length})
              </h3>
              <div className="report-grid">
                {groupedReports.ready.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={onViewReport}
                    onDownload={onDownloadReport}
                    onDelete={onDeleteReport}
                    onShare={onShareReport}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Draft Reports */}
          {groupedReports.draft.length > 0 && (
            <div className="report-section">
              <h3 className="section-title">
                <span className="section-icon">📝</span>
                Drafts ({groupedReports.draft.length})
              </h3>
              <div className="report-grid">
                {groupedReports.draft.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={onViewReport}
                    onDownload={onDownloadReport}
                    onDelete={onDeleteReport}
                    onShare={onShareReport}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error Reports */}
          {groupedReports.error.length > 0 && (
            <div className="report-section">
              <h3 className="section-title">
                <span className="section-icon">⚠️</span>
                Failed ({groupedReports.error.length})
              </h3>
              <div className="report-grid">
                {groupedReports.error.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onView={onViewReport}
                    onDownload={onDownloadReport}
                    onDelete={onDeleteReport}
                    onShare={onShareReport}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportList;
