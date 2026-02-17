// frontend/src/components/ML/ConfusionMatrix.tsx
import React from 'react';

export interface ConfusionMatrixData {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface ConfusionMatrixProps {
  data?: ConfusionMatrixData;
  title?: string;
  labels?: { positive: string; negative: string };
  loading?: boolean;
}

const defaultData: ConfusionMatrixData = {
  truePositive: 892,   // Correctly predicted churn
  falsePositive: 148,  // Incorrectly predicted churn
  trueNegative: 1654,  // Correctly predicted no churn
  falseNegative: 108   // Incorrectly predicted no churn
};

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
  data = defaultData,
  title = 'Confusion Matrix',
  labels = { positive: 'Churn', negative: 'No Churn' },
  loading = false
}) => {
  const total = data.truePositive + data.falsePositive + data.trueNegative + data.falseNegative;
  
  // Calculate metrics
  const accuracy = (data.truePositive + data.trueNegative) / total;
  const precision = data.truePositive / (data.truePositive + data.falsePositive);
  const recall = data.truePositive / (data.truePositive + data.falseNegative);
  const f1Score = 2 * (precision * recall) / (precision + recall);

  // Get color intensity based on value
  const getColorIntensity = (value: number, isCorrect: boolean) => {
    const ratio = value / total;
    if (isCorrect) {
      // Green for correct predictions
      return `rgba(34, 197, 94, ${0.3 + ratio * 0.7})`;
    } else {
      // Red for incorrect predictions
      return `rgba(239, 68, 68, ${0.3 + ratio * 0.7})`;
    }
  };

  if (loading) {
    return (
      <div className="confusion-matrix-loading">
        <div className="spinner"></div>
        <p>Calculating confusion matrix...</p>
      </div>
    );
  }

  return (
    <div className="confusion-matrix">
      <div className="matrix-header">
        <h3 className="matrix-title">{title}</h3>
        <div className="matrix-total">Total Predictions: {total.toLocaleString()}</div>
      </div>

      {/* Matrix Grid */}
      <div className="matrix-container">
        <div className="matrix-labels">
          <div className="label-vertical">
            <span>Actual</span>
          </div>
        </div>

        <div className="matrix-grid">
          {/* Header */}
          <div className="matrix-cell header-cell corner-cell"></div>
          <div className="matrix-cell header-cell">
            <span className="label-text">Predicted: {labels.positive}</span>
          </div>
          <div className="matrix-cell header-cell">
            <span className="label-text">Predicted: {labels.negative}</span>
          </div>

          {/* Row 1: Actual Positive */}
          <div className="matrix-cell header-cell row-header">
            <span className="label-text">Actual: {labels.positive}</span>
          </div>
          <div
            className="matrix-cell data-cell correct"
            style={{ backgroundColor: getColorIntensity(data.truePositive, true) }}
          >
            <div className="cell-label">True Positive</div>
            <div className="cell-value">{data.truePositive.toLocaleString()}</div>
            <div className="cell-percent">{((data.truePositive / total) * 100).toFixed(1)}%</div>
          </div>
          <div
            className="matrix-cell data-cell incorrect"
            style={{ backgroundColor: getColorIntensity(data.falseNegative, false) }}
          >
            <div className="cell-label">False Negative</div>
            <div className="cell-value">{data.falseNegative.toLocaleString()}</div>
            <div className="cell-percent">{((data.falseNegative / total) * 100).toFixed(1)}%</div>
          </div>

          {/* Row 2: Actual Negative */}
          <div className="matrix-cell header-cell row-header">
            <span className="label-text">Actual: {labels.negative}</span>
          </div>
          <div
            className="matrix-cell data-cell incorrect"
            style={{ backgroundColor: getColorIntensity(data.falsePositive, false) }}
          >
            <div className="cell-label">False Positive</div>
            <div className="cell-value">{data.falsePositive.toLocaleString()}</div>
            <div className="cell-percent">{((data.falsePositive / total) * 100).toFixed(1)}%</div>
          </div>
          <div
            className="matrix-cell data-cell correct"
            style={{ backgroundColor: getColorIntensity(data.trueNegative, true) }}
          >
            <div className="cell-label">True Negative</div>
            <div className="cell-value">{data.trueNegative.toLocaleString()}</div>
            <div className="cell-percent">{((data.trueNegative / total) * 100).toFixed(1)}%</div>
          </div>
        </div>

        <div className="matrix-label-bottom">
          <span>Predicted</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="matrix-metrics">
        <div className="metric-item">
          <span className="metric-label">Accuracy</span>
          <span className="metric-value">{(accuracy * 100).toFixed(1)}%</span>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${accuracy * 100}%` }} />
          </div>
        </div>
        <div className="metric-item">
          <span className="metric-label">Precision</span>
          <span className="metric-value">{(precision * 100).toFixed(1)}%</span>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${precision * 100}%` }} />
          </div>
        </div>
        <div className="metric-item">
          <span className="metric-label">Recall</span>
          <span className="metric-value">{(recall * 100).toFixed(1)}%</span>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${recall * 100}%` }} />
          </div>
        </div>
        <div className="metric-item">
          <span className="metric-label">F1 Score</span>
          <span className="metric-value">{(f1Score * 100).toFixed(1)}%</span>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${f1Score * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="matrix-legend">
        <div className="legend-item">
          <span className="legend-box correct"></span>
          <span className="legend-text">Correct Predictions</span>
        </div>
        <div className="legend-item">
          <span className="legend-box incorrect"></span>
          <span className="legend-text">Incorrect Predictions</span>
        </div>
      </div>

      {/* Interpretation */}
      <div className="matrix-interpretation">
        <h4>Understanding the Matrix:</h4>
        <ul>
          <li>
            <strong>True Positive (TP):</strong> Correctly identified churners
            ({data.truePositive} cases)
          </li>
          <li>
            <strong>False Negative (FN):</strong> Missed churners
            ({data.falseNegative} cases) - Type II error
          </li>
          <li>
            <strong>False Positive (FP):</strong> False alarms
            ({data.falsePositive} cases) - Type I error
          </li>
          <li>
            <strong>True Negative (TN):</strong> Correctly identified non-churners
            ({data.trueNegative} cases)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ConfusionMatrix;
