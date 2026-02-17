// frontend/src/components/ML/ModelPerformance.tsx
import React from 'react';

export interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  loss: number;
}

export interface ModelPerformanceProps {
  metrics?: PerformanceMetrics;
  trainingHistory?: {
    epoch: number;
    trainLoss: number;
    valLoss: number;
    trainAcc: number;
    valAcc: number;
  }[];
  loading?: boolean;
}

const defaultMetrics: PerformanceMetrics = {
  accuracy: 0.873,
  precision: 0.851,
  recall: 0.892,
  f1Score: 0.871,
  auc: 0.915,
  loss: 0.342
};

export const ModelPerformance: React.FC<ModelPerformanceProps> = ({
  metrics = defaultMetrics,
  trainingHistory,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="model-performance-loading">
        <div className="spinner"></div>
        <p>Loading model performance...</p>
      </div>
    );
  }

  const getPerformanceLevel = (value: number): string => {
    if (value >= 0.9) return 'excellent';
    if (value >= 0.8) return 'good';
    if (value >= 0.7) return 'fair';
    return 'poor';
  };

  const metricsList = [
    {
      name: 'Accuracy',
      value: metrics.accuracy,
      description: 'Overall correctness of predictions',
      icon: '🎯'
    },
    {
      name: 'Precision',
      value: metrics.precision,
      description: 'Positive predictions that are correct',
      icon: '✓'
    },
    {
      name: 'Recall',
      value: metrics.recall,
      description: 'Actual positives correctly identified',
      icon: '🔍'
    },
    {
      name: 'F1 Score',
      value: metrics.f1Score,
      description: 'Harmonic mean of precision and recall',
      icon: '⚖️'
    },
    {
      name: 'AUC-ROC',
      value: metrics.auc,
      description: 'Area under ROC curve',
      icon: '📈'
    },
    {
      name: 'Loss',
      value: metrics.loss,
      description: 'Model error (lower is better)',
      icon: '📉',
      inverse: true
    }
  ];

  return (
    <div className="model-performance">
      <div className="performance-header">
        <h3 className="performance-title">📊 Model Performance Metrics</h3>
        <span className="performance-badge">Production Model v1.0</span>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metricsList.map((metric) => {
          const level = metric.inverse 
            ? (metric.value < 0.3 ? 'excellent' : metric.value < 0.5 ? 'good' : 'fair')
            : getPerformanceLevel(metric.value);
          
          return (
            <div key={metric.name} className={`metric-card ${level}`}>
              <div className="metric-icon">{metric.icon}</div>
              <div className="metric-content">
                <h4 className="metric-name">{metric.name}</h4>
                <div className="metric-value">
                  {(metric.value * 100).toFixed(1)}%
                </div>
                <div className="metric-bar">
                  <div
                    className="metric-fill"
                    style={{
                      width: `${metric.inverse ? (1 - metric.value) * 100 : metric.value * 100}%`
                    }}
                  />
                </div>
                <p className="metric-description">{metric.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <h4>Performance Summary</h4>
        <div className="summary-content">
          <p>
            The model demonstrates <strong>{getPerformanceLevel(metrics.accuracy)}</strong> overall performance
            with an accuracy of <strong>{(metrics.accuracy * 100).toFixed(1)}%</strong>.
          </p>
          <p>
            The balanced F1 score of <strong>{(metrics.f1Score * 100).toFixed(1)}%</strong> indicates
            effective handling of both positive and negative cases.
          </p>
          <p>
            AUC-ROC of <strong>{(metrics.auc * 100).toFixed(1)}%</strong> shows excellent discriminative ability.
          </p>
        </div>
      </div>

      {/* Training History (if available) */}
      {trainingHistory && trainingHistory.length > 0 && (
        <div className="training-history">
          <h4>Training History</h4>
          <div className="history-chart">
            <svg viewBox="0 0 600 300" className="chart-svg">
              {/* Simple line chart placeholder */}
              <text x="300" y="150" textAnchor="middle" fill="#a1a1aa">
                Training history visualization
              </text>
            </svg>
          </div>
        </div>
      )}

      {/* Model Info */}
      <div className="model-info">
        <div className="info-row">
          <span className="info-label">Training Dataset:</span>
          <span className="info-value">10,000 samples</span>
        </div>
        <div className="info-row">
          <span className="info-label">Validation Dataset:</span>
          <span className="info-value">2,500 samples</span>
        </div>
        <div className="info-row">
          <span className="info-label">Test Dataset:</span>
          <span className="info-value">2,500 samples</span>
        </div>
        <div className="info-row">
          <span className="info-label">Last Training:</span>
          <span className="info-value">2 days ago</span>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance;
