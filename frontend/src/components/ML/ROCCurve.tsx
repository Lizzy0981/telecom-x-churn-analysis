// frontend/src/components/ML/ROCCurve.tsx
import React from 'react';

export interface ROCPoint {
  fpr: number; // False Positive Rate
  tpr: number; // True Positive Rate
  threshold: number;
}

export interface ROCCurveProps {
  data?: ROCPoint[];
  auc?: number;
  title?: string;
  width?: number;
  height?: number;
  loading?: boolean;
}

// Generate sample ROC curve data
const generateROCData = (): ROCPoint[] => {
  const points: ROCPoint[] = [];
  for (let i = 0; i <= 100; i++) {
    const threshold = i / 100;
    const tpr = Math.pow(threshold, 0.6); // Simulated TPR
    const fpr = Math.pow(threshold, 1.8); // Simulated FPR
    points.push({ fpr, tpr, threshold: 1 - threshold });
  }
  return points;
};

export const ROCCurve: React.FC<ROCCurveProps> = ({
  data = generateROCData(),
  auc = 0.915,
  title = 'ROC Curve',
  width = 500,
  height = 500,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="roc-curve-loading">
        <div className="spinner"></div>
        <p>Generating ROC curve...</p>
      </div>
    );
  }

  const padding = 60;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Convert data point to SVG coordinates
  const toX = (fpr: number) => padding + fpr * chartWidth;
  const toY = (tpr: number) => height - padding - tpr * chartHeight;

  // Generate path for ROC curve
  const rocPath = data
    .map((point, i) => {
      const x = toX(point.fpr);
      const y = toY(point.tpr);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  // Diagonal line (random classifier)
  const diagonalPath = `M ${padding} ${height - padding} L ${width - padding} ${padding}`;

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((value) => ({
    x1: padding,
    y1: toY(value),
    x2: width - padding,
    y2: toY(value),
    label: value.toFixed(2)
  }));

  const getAUCLevel = (auc: number) => {
    if (auc >= 0.9) return { level: 'Excellent', color: '#22c55e' };
    if (auc >= 0.8) return { level: 'Good', color: '#3b82f6' };
    if (auc >= 0.7) return { level: 'Fair', color: '#f59e0b' };
    return { level: 'Poor', color: '#ef4444' };
  };

  const aucInfo = getAUCLevel(auc);

  return (
    <div className="roc-curve">
      <div className="roc-header">
        <h3 className="roc-title">{title}</h3>
        <div className="auc-badge" style={{ backgroundColor: aucInfo.color }}>
          AUC = {auc.toFixed(3)} ({aucInfo.level})
        </div>
      </div>

      <svg width={width} height={height} className="roc-svg">
        {/* Grid lines */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={line.y1 + 5}
              fill="#a1a1aa"
              fontSize="12"
              textAnchor="end"
            >
              {line.label}
            </text>
            <text
              x={toX(parseFloat(line.label))}
              y={height - padding + 20}
              fill="#a1a1aa"
              fontSize="12"
              textAnchor="middle"
            >
              {line.label}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#e4e4e7"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#e4e4e7"
          strokeWidth="2"
        />

        {/* Axis labels */}
        <text
          x={width / 2}
          y={height - 20}
          fill="#e4e4e7"
          fontSize="14"
          textAnchor="middle"
          fontWeight="600"
        >
          False Positive Rate (FPR)
        </text>
        <text
          x={20}
          y={height / 2}
          fill="#e4e4e7"
          fontSize="14"
          textAnchor="middle"
          fontWeight="600"
          transform={`rotate(-90, 20, ${height / 2})`}
        >
          True Positive Rate (TPR)
        </text>

        {/* Diagonal line (random classifier) */}
        <path
          d={diagonalPath}
          stroke="rgba(239, 68, 68, 0.5)"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
        />

        {/* ROC Curve */}
        <path
          d={rocPath}
          stroke="#667eea"
          strokeWidth="3"
          fill="none"
        />

        {/* Fill area under curve */}
        <path
          d={`${rocPath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
          fill="url(#rocGradient)"
          opacity="0.2"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="rocGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#667eea" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#764ba2" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>

      {/* Legend */}
      <div className="roc-legend">
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: '#667eea' }}></span>
          <span className="legend-label">ROC Curve (AUC = {auc.toFixed(3)})</span>
        </div>
        <div className="legend-item">
          <span className="legend-line dashed" style={{ backgroundColor: '#ef4444' }}></span>
          <span className="legend-label">Random Classifier (AUC = 0.500)</span>
        </div>
      </div>

      {/* Interpretation */}
      <div className="roc-interpretation">
        <h4>Interpretation:</h4>
        <p>
          The ROC (Receiver Operating Characteristic) curve shows the trade-off between
          true positive rate and false positive rate at different classification thresholds.
        </p>
        <p>
          An AUC (Area Under Curve) of <strong>{auc.toFixed(3)}</strong> indicates
          <strong> {aucInfo.level.toLowerCase()}</strong> model performance.
          The closer to 1.0, the better the model's discriminative ability.
        </p>
      </div>
    </div>
  );
};

export default ROCCurve;
