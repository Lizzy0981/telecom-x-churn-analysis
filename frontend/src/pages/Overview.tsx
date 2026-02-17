// frontend/src/pages/Overview.tsx
import React from 'react';
import { MetricsGrid } from '../components/Dashboard';
import { RevenueChart, CustomerSegments } from '../components/Dashboard';

export const Overview: React.FC = () => {
  return (
    <div className="overview-page">
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">
          High-level view of your customer analytics and churn metrics
        </p>
      </div>

      <div className="page-content">
        {/* Key Metrics */}
        <section className="overview-section">
          <MetricsGrid columns={3} />
        </section>

        {/* Charts Row */}
        <section className="overview-section">
          <div className="charts-row">
            <div className="chart-container">
              <RevenueChart title="Monthly Revenue Trend" height={350} />
            </div>
            <div className="chart-container">
              <CustomerSegments title="Customer Distribution" />
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="overview-section">
          <h2 className="section-title">Quick Statistics</h2>
          <div className="quick-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Active Campaigns</h3>
                <div className="stat-value">12</div>
                <div className="stat-change positive">+3 this month</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <h3>Retention Rate</h3>
                <div className="stat-value">81.5%</div>
                <div className="stat-change positive">+2.8% vs last month</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Avg Customer Value</h3>
                <div className="stat-value">$84.32</div>
                <div className="stat-change positive">+12.4% increase</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>At-Risk Customers</h3>
                <div className="stat-value">2,341</div>
                <div className="stat-change negative">+5.7% vs last month</div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="overview-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📤</div>
              <div className="activity-content">
                <h4>New data uploaded</h4>
                <p>customers_jan_2026.csv - 1,234 records</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🤖</div>
              <div className="activity-content">
                <h4>ML model retrained</h4>
                <p>Accuracy improved to 87.3%</p>
                <span className="activity-time">5 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📄</div>
              <div className="activity-content">
                <h4>Report generated</h4>
                <p>Q1 Churn Analysis Report.pdf</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">⚠️</div>
              <div className="activity-content">
                <h4>Churn alert triggered</h4>
                <p>152 customers flagged as high risk</p>
                <span className="activity-time">2 days ago</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Overview;
