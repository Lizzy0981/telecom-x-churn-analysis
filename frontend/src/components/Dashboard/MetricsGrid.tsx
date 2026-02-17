// frontend/src/components/Dashboard/MetricsGrid.tsx
import React from 'react';
import { KPICard, KPICardProps } from './KPICard';
import './KPICard.css'; // Shared dashboard styles

export interface MetricsGridProps {
  metrics?: KPICardProps[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
}

const defaultMetrics: KPICardProps[] = [
  {
    title: 'Total Customers',
    value: '12,458',
    change: 8.2,
    trend: 'up',
    icon: '👥',
    color: 'purple',
    description: 'Active customer base'
  },
  {
    title: 'Churn Rate',
    value: '18.5%',
    change: -3.1,
    trend: 'down',
    icon: '📉',
    color: 'green',
    description: 'Month-over-month churn'
  },
  {
    title: 'Avg Revenue',
    value: '$84.32',
    change: 12.4,
    trend: 'up',
    icon: '💰',
    color: 'blue',
    description: 'Average revenue per user'
  },
  {
    title: 'At Risk',
    value: '2,341',
    change: 5.7,
    trend: 'up',
    icon: '⚠️',
    color: 'orange',
    description: 'Customers at high churn risk'
  },
  {
    title: 'Retention Rate',
    value: '81.5%',
    change: 2.8,
    trend: 'up',
    icon: '🎯',
    color: 'green',
    description: '90-day retention rate'
  },
  {
    title: 'ML Accuracy',
    value: '87.3%',
    change: 1.2,
    trend: 'up',
    icon: '🤖',
    color: 'pink',
    description: 'Prediction model accuracy'
  }
];

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics = defaultMetrics,
  columns = 3,
  loading = false
}) => {
  const gridClass = `metrics-grid metrics-grid-${columns}`;

  return (
    <div className={gridClass}>
      {metrics.map((metric, index) => (
        <KPICard
          key={index}
          {...metric}
          loading={loading}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;
