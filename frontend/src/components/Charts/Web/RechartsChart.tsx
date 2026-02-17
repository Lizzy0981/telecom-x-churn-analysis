// frontend/src/components/Charts/Web/RechartsChart.tsx
import React from 'react';

export interface RechartsChartProps {
  data: any[];
  type?: 'line' | 'bar' | 'area' | 'pie';
  title?: string;
  height?: number;
  xKey?: string;
  yKey?: string;
}

export const RechartsChart: React.FC<RechartsChartProps> = ({
  data,
  type = 'line',
  title = 'Recharts Chart',
  height = 400,
  xKey = 'name',
  yKey = 'value'
}) => {
  // Placeholder - Recharts se importará dinámicamente
  // Para reducir el bundle size inicial

  const renderPlaceholder = () => {
    return (
      <div className="recharts-placeholder">
        <div className="placeholder-header">
          <h3>{title}</h3>
          <span className="chart-type-badge">{type.toUpperCase()}</span>
        </div>
        
        <div className="placeholder-content" style={{ height }}>
          <div className="placeholder-chart">
            <svg viewBox="0 0 800 400" className="chart-svg">
              {/* Simple bar chart visualization */}
              {data.slice(0, 12).map((item, index) => {
                const maxValue = Math.max(...data.map(d => d[yKey] || 0));
                const barHeight = ((item[yKey] || 0) / maxValue) * 350;
                const x = 50 + index * 60;
                
                return (
                  <g key={index}>
                    <rect
                      x={x}
                      y={400 - barHeight - 20}
                      width="40"
                      height={barHeight}
                      fill="url(#barGradient)"
                      rx="4"
                    >
                      <title>{`${item[xKey]}: ${item[yKey]}`}</title>
                    </rect>
                    <text
                      x={x + 20}
                      y={390}
                      textAnchor="middle"
                      fill="#a1a1aa"
                      fontSize="12"
                    >
                      {item[xKey]}
                    </text>
                  </g>
                );
              })}
              
              <defs>
                <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <p className="chart-info">
            Recharts - Composable charting library built on React components
          </p>
        </div>
      </div>
    );
  };

  return renderPlaceholder();
};

export default RechartsChart;

// Example usage with actual Recharts (uncomment when library is installed):
/*
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export const RechartsChart: React.FC<RechartsChartProps> = ({
  data, type, title, height, xKey, yKey
}) => {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={xKey} stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip
              contentStyle={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <Legend />
            <Bar dataKey={yKey} fill="#667eea" radius={[8, 8, 0, 0]} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={xKey} stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip />
            <Area type="monotone" dataKey={yKey} stroke="#667eea" fill="#667eea" fillOpacity={0.3} />
          </AreaChart>
        );
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey={xKey} stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip />
            <Line type="monotone" dataKey={yKey} stroke="#667eea" strokeWidth={2} />
          </LineChart>
        );
    }
  };

  return (
    <div className="recharts-chart-container">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};
*/
