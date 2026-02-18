// frontend/src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { MetricsGrid, RevenueChart, CustomerSegments } from '../components/Dashboard';
import { ExportMenu } from '../components/Charts';

export const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Mock data for export
  const mockData = [
    { month: 'Jan', revenue: 42500, customers: 1234 },
    { month: 'Feb', revenue: 48200, customers: 1289 },
    { month: 'Mar', revenue: 51800, customers: 1345 }
  ];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Real-time customer analytics and churn insights
          </p>
        </div>
        <div className="header-right">
          <div className="time-range-selector">
            <button
              className={`range-btn ${timeRange === '7d' ? 'active' : ''}`}
              onClick={() => setTimeRange('7d')}
            >
              7D
            </button>
            <button
              className={`range-btn ${timeRange === '30d' ? 'active' : ''}`}
              onClick={() => setTimeRange('30d')}
            >
              30D
            </button>
            <button
              className={`range-btn ${timeRange === '90d' ? 'active' : ''}`}
              onClick={() => setTimeRange('90d')}
            >
              90D
            </button>
            <button
              className={`range-btn ${timeRange === '1y' ? 'active' : ''}`}
              onClick={() => setTimeRange('1y')}
            >
              1Y
            </button>
          </div>
          <ExportMenu data={mockData} fileName="dashboard_data" />
        </div>
      </div>

      <div className="page-content">
        {/* KPI Metrics */}
        <section className="dashboard-section">
          <MetricsGrid columns={3} />
        </section>

        {/* Main Charts */}
        <section className="dashboard-section">
          <div className="dashboard-grid">
            <div className="dashboard-card large">
              <RevenueChart 
                title="Revenue & Customer Trends" 
                height={400}
              />
            </div>
            <div className="dashboard-card">
              <CustomerSegments title="Customer Segmentation" />
            </div>
          </div>
        </section>

        {/* Insights Section */}
        <section className="dashboard-section">
          <h2 className="section-title">Key Insights</h2>
          <div className="insights-grid">
            <div className="insight-card insight-warning">
              <div className="insight-icon">⚠️</div>
              <div className="insight-content">
                <h3 className="insight-title">High Risk Alert</h3>
                <p className="insight-text">
                  2,341 customers flagged as high churn risk. 
                  Consider targeted retention campaigns.
                </p>
                <button className="insight-action">View Details →</button>
              </div>
            </div>
            
            <div className="insight-card insight-success">
              <div className="insight-icon">✓</div>
              <div className="insight-content">
                <h3 className="insight-title">Retention Improved</h3>
                <p className="insight-text">
                  Retention rate increased by 2.8% this month.
                  Current campaigns are effective.
                </p>
                <button className="insight-action">View Campaigns →</button>
              </div>
            </div>

            <div className="insight-card insight-info">
              <div className="insight-icon">💡</div>
              <div className="insight-content">
                <h3 className="insight-title">ML Model Updated</h3>
                <p className="insight-text">
                  Model accuracy improved to 87.3%.
                  New predictions available.
                </p>
                <button className="insight-action">View Predictions →</button>
              </div>
            </div>
          </div>
        </section>

        {/* Action Items */}
        <section className="dashboard-section">
          <h2 className="section-title">Recommended Actions</h2>
          <div className="action-items">
            <div className="action-item">
              <div className="action-priority high">High</div>
              <div className="action-content">
                <h4>Contact High-Risk Customers</h4>
                <p>152 customers with {'>'}85% churn probability require immediate attention</p>
              </div>
              <button className="action-btn">Take Action</button>
            </div>
            <div className="action-item">
              <div className="action-priority medium">Medium</div>
              <div className="action-content">
                <h4>Review Pricing Strategy</h4>
                <p>Monthly charges identified as top churn factor for 34% of at-risk customers</p>
              </div>
              <button className="action-btn">Analyze</button>
            </div>
            <div className="action-item">
              <div className="action-priority low">Low</div>
              <div className="action-content">
                <h4>Update Customer Segments</h4>
                <p>Clustering analysis suggests 2 new customer segments</p>
              </div>
              <button className="action-btn">Review</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
