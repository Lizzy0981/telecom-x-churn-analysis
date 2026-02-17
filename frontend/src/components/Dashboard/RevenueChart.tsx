// frontend/src/components/Dashboard/RevenueChart.tsx
import React from 'react';
import './KPICard.css'; // Shared dashboard styles

export interface RevenueChartProps {
  data?: RevenueDataPoint[];
  title?: string;
  height?: number;
  loading?: boolean;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  target?: number;
}

const defaultData: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 42500, target: 40000 },
  { month: 'Feb', revenue: 48200, target: 45000 },
  { month: 'Mar', revenue: 51800, target: 50000 },
  { month: 'Apr', revenue: 47300, target: 48000 },
  { month: 'May', revenue: 55600, target: 52000 },
  { month: 'Jun', revenue: 62400, target: 60000 },
  { month: 'Jul', revenue: 58900, target: 58000 },
  { month: 'Aug', revenue: 67200, target: 65000 },
  { month: 'Sep', revenue: 71500, target: 70000 },
  { month: 'Oct', revenue: 68300, target: 68000 },
  { month: 'Nov', revenue: 74800, target: 72000 },
  { month: 'Dec', revenue: 82100, target: 80000 }
];

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data = defaultData,
  title = 'Revenue Overview',
  height = 300,
  loading = false
}) => {
  // Find max value for scaling
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.revenue, d.target || 0))
  );
  const scale = height / maxValue;

  if (loading) {
    return (
      <div className="revenue-chart-container" style={{ height }}>
        <h3 className="chart-title">{title}</h3>
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="revenue-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color legend-revenue"></span>
            <span className="legend-label">Revenue</span>
          </div>
          <div className="legend-item">
            <span className="legend-color legend-target"></span>
            <span className="legend-label">Target</span>
          </div>
        </div>
      </div>

      <div className="chart-wrapper" style={{ height }}>
        <svg className="chart-svg" viewBox={`0 0 ${data.length * 80} ${height}`} preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => (
            <line
              key={i}
              x1="0"
              y1={height * (1 - fraction)}
              x2={data.length * 80}
              y2={height * (1 - fraction)}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
          ))}

          {/* Bars */}
          {data.map((point, index) => {
            const x = index * 80 + 10;
            const revenueHeight = point.revenue * scale;
            const targetHeight = (point.target || 0) * scale;

            return (
              <g key={index}>
                {/* Target bar (background) */}
                {point.target && (
                  <rect
                    x={x + 15}
                    y={height - targetHeight}
                    width="30"
                    height={targetHeight}
                    fill="rgba(255, 255, 255, 0.1)"
                    rx="4"
                  />
                )}

                {/* Revenue bar */}
                <rect
                  x={x}
                  y={height - revenueHeight}
                  width="30"
                  height={revenueHeight}
                  fill="url(#revenueGradient)"
                  rx="4"
                  className="chart-bar"
                >
                  <title>{`${point.month}: $${point.revenue.toLocaleString()}`}</title>
                </rect>

                {/* Month label */}
                <text
                  x={x + 15}
                  y={height + 20}
                  fill="var(--color-text-muted)"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {point.month}
                </text>
              </g>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#667eea" stopOpacity="1" />
              <stop offset="100%" stopColor="#764ba2" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Y-axis labels */}
      <div className="chart-y-axis">
        {[1, 0.75, 0.5, 0.25, 0].map((fraction, i) => (
          <div key={i} className="y-axis-label">
            ${((maxValue * fraction) / 1000).toFixed(0)}k
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueChart;
