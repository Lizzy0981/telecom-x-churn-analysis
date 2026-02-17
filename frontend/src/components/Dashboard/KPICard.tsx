// frontend/src/components/Dashboard/KPICard.tsx
import React from 'react';
import './KPICard.css';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  description?: string;
  color?: 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'pink';
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon = '📊',
  description,
  color = 'purple',
  loading = false
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '➡️';
  };

  const getTrendClass = () => {
    if (trend === 'up') return 'kpi-trend-up';
    if (trend === 'down') return 'kpi-trend-down';
    return 'kpi-trend-neutral';
  };

  if (loading) {
    return (
      <div className={`kpi-card kpi-card-${color}`}>
        <div className="kpi-loading">
          <div className="kpi-skeleton kpi-skeleton-title"></div>
          <div className="kpi-skeleton kpi-skeleton-value"></div>
          <div className="kpi-skeleton kpi-skeleton-change"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`kpi-card kpi-card-${color}`}>
      <div className="kpi-header">
        <div className="kpi-icon" role="img" aria-label={title}>
          {icon}
        </div>
        <h3 className="kpi-title">{title}</h3>
      </div>

      <div className="kpi-body">
        <div className="kpi-value">{value}</div>

        {change !== undefined && (
          <div className={`kpi-change ${getTrendClass()}`}>
            <span className="kpi-trend-icon">{getTrendIcon()}</span>
            <span className="kpi-change-value">
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="kpi-change-label">vs last month</span>
          </div>
        )}

        {description && (
          <p className="kpi-description">{description}</p>
        )}
      </div>

      {/* Decorative gradient */}
      <div className="kpi-gradient"></div>
    </div>
  );
};

export default KPICard;
