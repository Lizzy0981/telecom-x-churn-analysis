// frontend/src/pages/DataSources.tsx
import React, { useState } from 'react';
import { DataTable } from '../components/DataSources';

export const DataSources: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  // Mock data
  const mockCustomerData = Array.from({ length: 100 }, (_, i) => ({
    customerId: `CUST-${String(i + 1).padStart(4, '0')}`,
    name: `Customer ${i + 1}`,
    tenure: Math.floor(Math.random() * 72) + 1,
    monthlyCharges: (Math.random() * 100 + 20).toFixed(2),
    totalCharges: (Math.random() * 5000 + 100).toFixed(2),
    contract: ['Month-to-month', 'One year', 'Two year'][Math.floor(Math.random() * 3)],
    churnRisk: (Math.random() * 100).toFixed(1) + '%'
  }));

  const dataSources = [
    {
      id: '1',
      name: 'Customer Master Data',
      type: 'CSV',
      records: 12458,
      lastUpdated: '2 hours ago',
      status: 'active',
      icon: '📊'
    },
    {
      id: '2',
      name: 'Billing History',
      type: 'Excel',
      records: 45231,
      lastUpdated: '1 day ago',
      status: 'active',
      icon: '💰'
    },
    {
      id: '3',
      name: 'Service Usage Logs',
      type: 'JSON',
      records: 234567,
      lastUpdated: '5 hours ago',
      status: 'active',
      icon: '📡'
    },
    {
      id: '4',
      name: 'Support Tickets',
      type: 'CSV',
      records: 8945,
      lastUpdated: '3 days ago',
      status: 'syncing',
      icon: '🎫'
    }
  ];

  return (
    <div className="data-sources-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Data Sources</h1>
          <p className="page-subtitle">
            Manage and explore your customer data sources
          </p>
        </div>
        <div className="header-right">
          <button className="btn-secondary">
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Sync All</span>
          </button>
          <button className="btn-primary">
            <span className="btn-icon">➕</span>
            <span className="btn-text">Add Source</span>
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Data Sources Grid */}
        <section className="sources-section">
          <h2 className="section-title">Connected Sources</h2>
          <div className="sources-grid">
            {dataSources.map(source => (
              <div key={source.id} className="source-card">
                <div className="source-header">
                  <div className="source-icon">{source.icon}</div>
                  <div className={`source-status ${source.status}`}>
                    {source.status === 'active' ? '✓ Active' : '⏳ Syncing'}
                  </div>
                </div>
                <h3 className="source-name">{source.name}</h3>
                <div className="source-meta">
                  <div className="meta-item">
                    <span className="meta-label">Type:</span>
                    <span className="meta-value">{source.type}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Records:</span>
                    <span className="meta-value">{source.records.toLocaleString()}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Updated:</span>
                    <span className="meta-value">{source.lastUpdated}</span>
                  </div>
                </div>
                <div className="source-actions">
                  <button className="action-btn">👁️ View</button>
                  <button className="action-btn">⚙️ Configure</button>
                  <button className="action-btn">📥 Export</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Table */}
        <section className="table-section">
          <div className="table-header">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'current' ? 'active' : ''}`}
                onClick={() => setActiveTab('current')}
              >
                Current Data
              </button>
              <button
                className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                Upload History
              </button>
            </div>
          </div>

          {activeTab === 'current' && (
            <DataTable
              data={mockCustomerData}
              pageSize={25}
              showPagination={true}
              showSearch={true}
              showFilters={true}
              onRowClick={(row) => console.log('Row clicked:', row)}
            />
          )}

          {activeTab === 'history' && (
            <div className="upload-history">
              <div className="history-item">
                <div className="history-icon">📤</div>
                <div className="history-content">
                  <h4>customers_jan_2026.csv</h4>
                  <p>1,234 records • Uploaded by Elizabeth Díaz • 2 hours ago</p>
                </div>
                <button className="history-action">View</button>
              </div>
              <div className="history-item">
                <div className="history-icon">📤</div>
                <div className="history-content">
                  <h4>billing_data_dec_2025.xlsx</h4>
                  <p>3,456 records • Uploaded by Elizabeth Díaz • 1 day ago</p>
                </div>
                <button className="history-action">View</button>
              </div>
              <div className="history-item">
                <div className="history-icon">📤</div>
                <div className="history-content">
                  <h4>service_logs_nov_2025.json</h4>
                  <p>12,345 records • Uploaded by System • 3 days ago</p>
                </div>
                <button className="history-action">View</button>
              </div>
            </div>
          )}
        </section>

        {/* Data Quality */}
        <section className="quality-section">
          <h2 className="section-title">Data Quality Metrics</h2>
          <div className="quality-grid">
            <div className="quality-card">
              <div className="quality-score excellent">98%</div>
              <h4>Completeness</h4>
              <p>Very few missing values</p>
            </div>
            <div className="quality-card">
              <div className="quality-score good">94%</div>
              <h4>Accuracy</h4>
              <p>Data validation passed</p>
            </div>
            <div className="quality-card">
              <div className="quality-score fair">87%</div>
              <h4>Consistency</h4>
              <p>Minor format issues detected</p>
            </div>
            <div className="quality-card">
              <div className="quality-score excellent">100%</div>
              <h4>Uniqueness</h4>
              <p>No duplicate records</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DataSources;
