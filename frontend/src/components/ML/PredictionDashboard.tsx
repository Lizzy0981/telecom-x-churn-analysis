// frontend/src/components/ML/PredictionDashboard.tsx
import React, { useState } from 'react';

export interface Prediction {
  id: string;
  customerId: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  factors: {
    name: string;
    impact: number;
    value: string | number;
  }[];
  recommendation?: string;
  timestamp: string;
}

export interface PredictionDashboardProps {
  predictions?: Prediction[];
  loading?: boolean;
  onPredict?: (customerId: string) => void;
}

const mockPredictions: Prediction[] = [
  {
    id: '1',
    customerId: 'CUST-001',
    churnProbability: 0.87,
    riskLevel: 'high',
    confidence: 0.92,
    factors: [
      { name: 'Tenure', impact: -0.35, value: '3 months' },
      { name: 'Monthly Charges', impact: 0.28, value: '$95.50' },
      { name: 'Contract Type', impact: 0.21, value: 'Month-to-month' }
    ],
    recommendation: 'Offer loyalty discount or upgrade incentive',
    timestamp: new Date().toISOString()
  }
];

export const PredictionDashboard: React.FC<PredictionDashboardProps> = ({
  predictions = mockPredictions,
  loading = false,
  onPredict
}) => {
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#667eea';
    }
  };

  const getRiskLabel = (probability: number) => {
    if (probability >= 0.7) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className="ml-dashboard-loading">
        <div className="spinner"></div>
        <p>Running ML predictions...</p>
      </div>
    );
  }

  return (
    <div className="prediction-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">🤖 ML Predictions</h2>
        <p className="dashboard-subtitle">
          AI-powered churn predictions with explainability
        </p>
      </div>

      {/* Summary Stats */}
      <div className="prediction-stats">
        <div className="stat-card">
          <span className="stat-label">Total Predictions</span>
          <span className="stat-value">{predictions.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">High Risk</span>
          <span className="stat-value" style={{ color: '#ef4444' }}>
            {predictions.filter(p => p.riskLevel === 'high').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Confidence</span>
          <span className="stat-value">
            {(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="predictions-table">
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Churn Probability</th>
              <th>Risk Level</th>
              <th>Confidence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((prediction) => (
              <tr key={prediction.id}>
                <td className="customer-id">{prediction.customerId}</td>
                <td>
                  <div className="probability-bar">
                    <div
                      className="probability-fill"
                      style={{
                        width: `${prediction.churnProbability * 100}%`,
                        backgroundColor: getRiskColor(prediction.riskLevel)
                      }}
                    />
                    <span className="probability-text">
                      {(prediction.churnProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    className="risk-badge"
                    style={{ backgroundColor: getRiskColor(prediction.riskLevel) }}
                  >
                    {prediction.riskLevel.toUpperCase()}
                  </span>
                </td>
                <td>{(prediction.confidence * 100).toFixed(0)}%</td>
                <td>
                  <button
                    className="btn-details"
                    onClick={() => setSelectedPrediction(prediction)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedPrediction && (
        <div className="prediction-modal-overlay" onClick={() => setSelectedPrediction(null)}>
          <div className="prediction-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPrediction(null)}>
              ✕
            </button>

            <h3>Prediction Details</h3>
            <p className="customer-id-large">{selectedPrediction.customerId}</p>

            <div className="modal-section">
              <h4>Churn Probability</h4>
              <div className="probability-gauge">
                <div
                  className="gauge-fill"
                  style={{
                    width: `${selectedPrediction.churnProbability * 100}%`,
                    backgroundColor: getRiskColor(selectedPrediction.riskLevel)
                  }}
                />
                <span className="gauge-value">
                  {(selectedPrediction.churnProbability * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="modal-section">
              <h4>Key Factors</h4>
              <div className="factors-list">
                {selectedPrediction.factors.map((factor, idx) => (
                  <div key={idx} className="factor-item">
                    <div className="factor-header">
                      <span className="factor-name">{factor.name}</span>
                      <span className="factor-value">{factor.value}</span>
                    </div>
                    <div className="factor-impact-bar">
                      <div
                        className="impact-fill"
                        style={{
                          width: `${Math.abs(factor.impact) * 100}%`,
                          backgroundColor: factor.impact > 0 ? '#ef4444' : '#22c55e'
                        }}
                      />
                      <span className="impact-value">
                        {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPrediction.recommendation && (
              <div className="modal-section">
                <h4>💡 Recommendation</h4>
                <p className="recommendation-text">{selectedPrediction.recommendation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionDashboard;
