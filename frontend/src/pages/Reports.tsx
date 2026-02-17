// frontend/src/pages/Reports.tsx
import React, { useState } from 'react';
import { ReportList, ReportGenerator, Report } from '../components/Reports';

export const Reports: React.FC = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock reports
  const mockReports: Report[] = [
    {
      id: '1',
      title: 'Q4 2025 Churn Analysis',
      description: 'Comprehensive churn analysis with ML predictions and customer segmentation',
      type: 'churn',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      createdBy: 'Elizabeth Díaz',
      status: 'ready',
      fileSize: 2457600, // ~2.4 MB
      format: 'pdf',
      downloadUrl: '/reports/q4-2025-churn.pdf'
    },
    {
      id: '2',
      title: 'Monthly Revenue Report - January 2026',
      description: 'Revenue breakdown by segment and comparison with previous periods',
      type: 'revenue',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      createdBy: 'Elizabeth Díaz',
      status: 'ready',
      fileSize: 1048576, // 1 MB
      format: 'excel',
      downloadUrl: '/reports/revenue-jan-2026.xlsx'
    },
    {
      id: '3',
      title: 'Customer Insights Dashboard',
      description: 'Interactive customer behavior analysis and segmentation insights',
      type: 'customer',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      createdBy: 'System',
      status: 'ready',
      fileSize: 524288, // 512 KB
      format: 'pdf',
      downloadUrl: '/reports/customer-insights.pdf'
    },
    {
      id: '4',
      title: 'ML Model Performance Report',
      description: 'Model accuracy, precision, recall, and SHAP analysis',
      type: 'ml',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      createdBy: 'Elizabeth Díaz',
      status: 'ready',
      fileSize: 3145728, // 3 MB
      format: 'pdf',
      downloadUrl: '/reports/ml-performance.pdf'
    },
    {
      id: '5',
      title: 'Weekly Summary Report',
      description: 'Auto-generated weekly summary with key metrics and trends',
      type: 'custom',
      createdAt: new Date().toISOString(),
      createdBy: 'System',
      status: 'processing',
      format: 'pdf'
    }
  ];

  const handleGenerateReport = (config: any) => {
    console.log('Generating report with config:', config);
    setIsGenerating(true);

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setShowGenerator(false);
      alert(`Report "${config.templateName}" generated successfully!`);
    }, 3000);
  };

  const handleViewReport = (report: Report) => {
    console.log('Viewing report:', report);
    alert(`Opening report: ${report.title}`);
  };

  const handleDownloadReport = (report: Report) => {
    console.log('Downloading report:', report);
    if (report.downloadUrl) {
      alert(`Downloading: ${report.title}`);
      // window.open(report.downloadUrl, '_blank');
    }
  };

  const handleDeleteReport = (report: Report) => {
    if (confirm(`Delete report "${report.title}"?`)) {
      console.log('Deleting report:', report);
      alert('Report deleted successfully');
    }
  };

  const handleShareReport = (report: Report) => {
    console.log('Sharing report:', report);
    alert(`Share link for "${report.title}" copied to clipboard!`);
  };

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">
            Generate and manage comprehensive churn analysis reports
          </p>
        </div>
      </div>

      <div className="page-content">
        {!showGenerator ? (
          <ReportList
            reports={mockReports}
            loading={false}
            onViewReport={handleViewReport}
            onDownloadReport={handleDownloadReport}
            onDeleteReport={handleDeleteReport}
            onShareReport={handleShareReport}
            onCreateNew={() => setShowGenerator(true)}
          />
        ) : (
          <div className="generator-container">
            <ReportGenerator
              onGenerate={handleGenerateReport}
              onCancel={() => setShowGenerator(false)}
              isGenerating={isGenerating}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
