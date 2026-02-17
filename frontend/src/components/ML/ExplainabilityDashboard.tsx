// frontend/src/components/ML/ExplainabilityDashboard.tsx
import React, { useState } from 'react';

export interface ExplainabilityDashboardProps {
  modelName?: string;
  accuracy?: number;
  features?: string[];
}

export const ExplainabilityDashboard: React.FC<ExplainabilityDashboardProps> = ({
  modelName = 'Churn Prediction Model v1.0',
  accuracy = 0.873,
  features = [
    'Tenure', 'Monthly Charges', 'Total Charges', 'Contract Type',
    'Payment Method', 'Internet Service', 'Tech Support'
  ]
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'features' | 'shap'>('overview');

  return (
    <div className="explainability-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">🔍 Model Explainability</h2>
        <p className="dashboard-subtitle">
          Understand how the AI model makes predictions
        </p>
      </div>

      {/* Tabs */}
      <div className="explainability-tabs">
        <button
          className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${selectedTab === 'features' ? 'active' : ''}`}
          onClick={() => setSelectedTab('features')}
        >
          Feature Importance
        </button>
        <button
          className={`tab ${selectedTab === 'shap' ? 'active' : ''}`}
          onClick={() => setSelectedTab('shap')}
        >
          SHAP Analysis
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {selectedTab === 'overview' && (
          <div className="overview-content">
            <div className="model-info-card">
              <h3>Model Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Model Name:</span>
                  <span className="info-value">{modelName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Algorithm:</span>
                  <span className="info-value">Gradient Boosting (XGBoost)</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Accuracy:</span>
                  <span className="info-value">{(accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Training Samples:</span>
                  <span className="info-value">10,000</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Features:</span>
                  <span className="info-value">{features.length}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated:</span>
                  <span className="info-value">2 days ago</span>
                </div>
              </div>
            </div>

            <div className="explainability-principles">
              <h3>Explainability Principles</h3>
              <div className="principles-list">
                <div className="principle-item">
                  <span className="principle-icon">🎯</span>
                  <div className="principle-content">
                    <h4>Transparency</h4>
                    <p>All predictions include confidence scores and key influencing factors</p>
                  </div>
                </div>
                <div className="principle-item">
                  <span className="principle-icon">📊</span>
                  <div className="principle-content">
                    <h4>Feature Attribution</h4>
                    <p>SHAP values show each feature's contribution to predictions</p>
                  </div>
                </div>
                <div className="principle-item">
                  <span className="principle-icon">✓</span>
                  <div className="principle-content">
                    <h4>Validation</h4>
                    <p>Model performance validated on holdout test set</p>
                  </div>
                </div>
                <div className="principle-item">
                  <span className="principle-icon">🔄</span>
                  <div className="principle-content">
                    <h4>Continuous Monitoring</h4>
                    <p>Regular retraining and performance tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'features' && (
          <div className="features-content">
            <p className="content-placeholder">
              Feature Importance visualization will be displayed here.
              See <code>FeatureImportance.tsx</code> component.
            </p>
          </div>
        )}

        {selectedTab === 'shap' && (
          <div className="shap-content">
            <p className="content-placeholder">
              SHAP (SHapley Additive exPlanations) analysis will be displayed here.
              See <code>SHAPWaterfall.tsx</code> component.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplainabilityDashboard;
