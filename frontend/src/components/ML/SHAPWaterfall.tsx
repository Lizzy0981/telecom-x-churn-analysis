// frontend/src/components/ML/SHAPWaterfall.tsx
import React from 'react';

export interface SHAPValue {
  feature: string;
  value: number; // Feature value
  shapValue: number; // SHAP value (contribution)
  baseValue?: number;
}

export interface SHAPWaterfallProps {
  data?: SHAPValue[];
  baseValue?: number;
  prediction?: number;
  title?: string;
  customerId?: string;
  loading?: boolean;
}

const defaultData: SHAPValue[] = [
  { feature: 'Tenure', value: 3, shapValue: -0.42 },
  { feature: 'Monthly Charges', value: 95.5, shapValue: 0.35 },
  { feature: 'Contract Type', value: 1, shapValue: 0.28 },
  { feature: 'Total Charges', value: 285.6, shapValue: -0.18 },
  { feature: 'Internet Service', value: 1, shapValue: 0.15 },
  { feature: 'Payment Method', value: 2, shapValue: 0.12 },
  { feature: 'Tech Support', value: 0, shapValue: 0.08 },
  { feature: 'Online Security', value: 0, shapValue: 0.05 }
];

export const SHAPWaterfall: React.FC<SHAPWaterfallProps> = ({
  data = defaultData,
  baseValue = 0.185, // Base churn rate
  prediction = 0.87, // Final prediction
  title = 'SHAP Waterfall Chart',
  customerId = 'CUST-001',
  loading = false
}) => {
  // Sort by absolute SHAP value
  const sortedData = [...data].sort((a, b) => Math.abs(b.shapValue) - Math.abs(a.shapValue));

  // Calculate cumulative values for waterfall
  let cumulative = baseValue;
  const waterfallData = sortedData.map((item) => {
    const start = cumulative;
    cumulative += item.shapValue;
    return {
      ...item,
      start,
      end: cumulative
    };
  });

  const maxAbsValue = Math.max(...data.map(d => Math.abs(d.shapValue)));
  const chartHeight = 400;
  const barHeight = 30;
  const spacing = 10;

  if (loading) {
    return (
      <div className="shap-waterfall-loading">
        <div className="spinner"></div>
        <p>Computing SHAP values...</p>
      </div>
    );
  }

  return (
    <div className="shap-waterfall">
      <div className="shap-header">
        <h3 className="shap-title">{title}</h3>
        <div className="shap-customer-id">Customer: {customerId}</div>
      </div>

      <div className="shap-summary">
        <div className="summary-item">
          <span className="summary-label">Base Value</span>
          <span className="summary-value">{(baseValue * 100).toFixed(1)}%</span>
        </div>
        <div className="summary-arrow">→</div>
        <div className="summary-item">
          <span className="summary-label">Prediction</span>
          <span className="summary-value highlight">{(prediction * 100).toFixed(1)}%</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Impact</span>
          <span className={`summary-value ${prediction > baseValue ? 'increase' : 'decrease'}`}>
            {prediction > baseValue ? '+' : ''}{((prediction - baseValue) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Waterfall Chart */}
      <div className="waterfall-chart">
        <div className="waterfall-bars">
          {/* Base value bar */}
          <div className="waterfall-item base-value">
            <div className="bar-label">Base Value</div>
            <div className="bar-container">
              <div
                className="bar base"
                style={{
                  width: `${(baseValue / 1) * 100}%`,
                  backgroundColor: '#a1a1aa'
                }}
              >
                <span className="bar-value">{(baseValue * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Feature contributions */}
          {waterfallData.map((item, index) => {
            const isPositive = item.shapValue > 0;
            const width = Math.abs(item.shapValue) / maxAbsValue * 100;

            return (
              <div key={index} className="waterfall-item">
                <div className="bar-label">
                  <span className="feature-name">{item.feature}</span>
                  <span className="feature-value">= {item.value}</span>
                </div>
                <div className="bar-container">
                  <div
                    className={`bar ${isPositive ? 'positive' : 'negative'}`}
                    style={{
                      width: `${width}%`,
                      backgroundColor: isPositive ? '#ef4444' : '#22c55e',
                      marginLeft: isPositive ? `${(item.start / 1) * 100}%` : 'auto',
                      marginRight: !isPositive ? `${(1 - item.start / 1) * 100}%` : 'auto'
                    }}
                  >
                    <span className="bar-value">
                      {isPositive ? '+' : ''}{(item.shapValue * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="cumulative-value">
                  Cumulative: {(item.end * 100).toFixed(1)}%
                </div>
              </div>
            );
          })}

          {/* Final prediction bar */}
          <div className="waterfall-item final-prediction">
            <div className="bar-label">Final Prediction</div>
            <div className="bar-container">
              <div
                className="bar final"
                style={{
                  width: `${(prediction / 1) * 100}%`,
                  backgroundColor: '#667eea'
                }}
              >
                <span className="bar-value">{(prediction * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="shap-legend">
        <div className="legend-item">
          <span className="legend-box" style={{ backgroundColor: '#ef4444' }}></span>
          <span className="legend-text">Increases churn risk</span>
        </div>
        <div className="legend-item">
          <span className="legend-box" style={{ backgroundColor: '#22c55e' }}></span>
          <span className="legend-text">Decreases churn risk</span>
        </div>
      </div>

      {/* Interpretation */}
      <div className="shap-interpretation">
        <h4>How to Read This Chart:</h4>
        <p>
          SHAP (SHapley Additive exPlanations) values show how each feature contributes
          to moving the prediction away from the base value.
        </p>
        <ul>
          <li>
            <strong>Base Value ({(baseValue * 100).toFixed(1)}%):</strong> Average churn rate in the dataset
          </li>
          <li>
            <strong>Red bars:</strong> Features that increase churn probability
          </li>
          <li>
            <strong>Green bars:</strong> Features that decrease churn probability
          </li>
          <li>
            <strong>Final Value ({(prediction * 100).toFixed(1)}%):</strong> Sum of all contributions
          </li>
        </ul>
        <p className="interpretation-note">
          💡 <strong>Key Insight:</strong> {sortedData[0].feature} has the strongest impact
          ({sortedData[0].shapValue > 0 ? 'increasing' : 'decreasing'} churn risk
          by {Math.abs(sortedData[0].shapValue * 100).toFixed(1)}%)
        </p>
      </div>
    </div>
  );
};

export default SHAPWaterfall;
