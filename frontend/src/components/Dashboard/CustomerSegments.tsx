// frontend/src/components/Dashboard/CustomerSegments.tsx
import React from 'react';
import './KPICard.css'; // Shared dashboard styles

export interface Segment {
  name: string;
  count: number;
  percentage: number;
  color: string;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

export interface CustomerSegmentsProps {
  segments?: Segment[];
  title?: string;
  loading?: boolean;
}

const defaultSegments: Segment[] = [
  {
    name: 'High Value',
    count: 3247,
    percentage: 26.1,
    color: '#667eea',
    icon: '💎',
    trend: 'up',
    description: 'Premium customers with high ARPU'
  },
  {
    name: 'At Risk',
    count: 2341,
    percentage: 18.8,
    color: '#f59e0b',
    icon: '⚠️',
    trend: 'up',
    description: 'High churn probability (>70%)'
  },
  {
    name: 'Stable',
    count: 4892,
    percentage: 39.3,
    color: '#22c55e',
    icon: '✓',
    trend: 'stable',
    description: 'Low churn risk, consistent usage'
  },
  {
    name: 'New',
    count: 1245,
    percentage: 10.0,
    color: '#3b82f6',
    icon: '🆕',
    trend: 'up',
    description: 'Customers < 3 months tenure'
  },
  {
    name: 'Dormant',
    count: 733,
    percentage: 5.8,
    color: '#ef4444',
    icon: '💤',
    trend: 'down',
    description: 'Minimal activity last 30 days'
  }
];

export const CustomerSegments: React.FC<CustomerSegmentsProps> = ({
  segments = defaultSegments,
  title = 'Customer Segments',
  loading = false
}) => {
  const total = segments.reduce((sum, seg) => sum + seg.count, 0);

  const getTrendIcon = (trend?: string) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  if (loading) {
    return (
      <div className="customer-segments">
        <h3 className="segments-title">{title}</h3>
        <div className="segments-loading">
          <div className="spinner"></div>
          <p>Loading segments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-segments">
      <div className="segments-header">
        <h3 className="segments-title">{title}</h3>
        <div className="segments-total">
          <span className="total-label">Total:</span>
          <span className="total-value">{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="segments-chart">
        <svg viewBox="0 0 200 200" className="donut-chart">
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="40"
          />
          
          {segments.reduce((acc, segment, index) => {
            const previousPercentage = segments
              .slice(0, index)
              .reduce((sum, seg) => sum + seg.percentage, 0);
            
            const circumference = 2 * Math.PI * 80;
            const offset = circumference * (1 - previousPercentage / 100);
            const dashArray = `${circumference * segment.percentage / 100} ${circumference}`;

            acc.push(
              <circle
                key={segment.name}
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={segment.color}
                strokeWidth="40"
                strokeDasharray={dashArray}
                strokeDashoffset={-offset}
                transform="rotate(-90 100 100)"
                className="donut-segment"
              >
                <title>{`${segment.name}: ${segment.percentage}%`}</title>
              </circle>
            );

            return acc;
          }, [] as JSX.Element[])}

          {/* Center text */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fill="var(--color-text-light)"
            fontSize="32"
            fontWeight="700"
          >
            {segments.length}
          </text>
          <text
            x="100"
            y="115"
            textAnchor="middle"
            fill="var(--color-text-muted)"
            fontSize="12"
          >
            Segments
          </text>
        </svg>
      </div>

      {/* Segments List */}
      <div className="segments-list">
        {segments.map((segment) => (
          <div key={segment.name} className="segment-item">
            <div className="segment-info">
              <div className="segment-header-row">
                <div className="segment-color" style={{ backgroundColor: segment.color }}></div>
                <span className="segment-icon">{segment.icon}</span>
                <span className="segment-name">{segment.name}</span>
                {segment.trend && (
                  <span className={`segment-trend segment-trend-${segment.trend}`}>
                    {getTrendIcon(segment.trend)}
                  </span>
                )}
              </div>
              {segment.description && (
                <p className="segment-description">{segment.description}</p>
              )}
            </div>

            <div className="segment-stats">
              <div className="segment-count">{segment.count.toLocaleString()}</div>
              <div className="segment-percentage">{segment.percentage}%</div>
            </div>

            {/* Progress bar */}
            <div className="segment-progress-bg">
              <div
                className="segment-progress-fill"
                style={{
                  width: `${segment.percentage}%`,
                  backgroundColor: segment.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerSegments;
