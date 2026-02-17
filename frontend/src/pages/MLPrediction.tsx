// frontend/src/pages/MLPrediction.tsx
import React, { useState } from 'react';
import {
  PredictionDashboard,
  ModelPerformance,
  FeatureImportance,
  ROCCurve,
  ConfusionMatrix,
  SHAPWaterfall
} from '../components/ML';

export const MLPrediction: React.FC = () => {
  const [activeView, setActiveView] = useState<'predictions' | 'performance' | 'explainability'>('predictions');

  return (
    <div className="ml-prediction-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">ML Predictions</h1>
          <p className="page-subtitle">
            AI-powered churn predictions with model explainability
          </p>
        </div>
        <div className="header-right">
          <button className="btn-secondary">
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Retrain Model</span>
          </button>
          <button className="btn-primary">
            <span className="btn-icon">🤖</span>
            <span className="btn-text">Run Predictions</span>
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="view-tabs">
        <button
          className={`tab-btn ${activeView === 'predictions' ? 'active' : ''}`}
          onClick={() => setActiveView('predictions')}
        >
          <span className="tab-icon">🎯</span>
          <span className="tab-text">Predictions</span>
        </button>
        <button
          className={`tab-btn ${activeView === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveView('performance')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-text">Model Performance</span>
        </button>
        <button
          className={`tab-btn ${activeView === 'explainability' ? 'active' : ''}`}
          onClick={() => setActiveView('explainability')}
        >
          <span className="tab-icon">🔍</span>
          <span className="tab-text">Explainability</span>
        </button>
      </div>

      <div className="page-content">
        {/* Predictions View */}
        {activeView === 'predictions' && (
          <section className="predictions-section">
            <PredictionDashboard />
          </section>
        )}

        {/* Performance View */}
        {activeView === 'performance' && (
          <div className="performance-view">
            <section className="ml-section">
              <ModelPerformance />
            </section>

            <div className="ml-grid">
              <section className="ml-section">
                <ROCCurve
                  title="ROC Curve Analysis"
                  auc={0.915}
                  width={600}
                  height={500}
                />
              </section>

              <section className="ml-section">
                <ConfusionMatrix
                  title="Prediction Confusion Matrix"
                />
              </section>
            </div>
          </div>
        )}

        {/* Explainability View */}
        {activeView === 'explainability' && (
          <div className="explainability-view">
            <section className="ml-section">
              <FeatureImportance
                title="Global Feature Importance"
                sortBy="importance"
              />
            </section>

            <section className="ml-section">
              <SHAPWaterfall
                title="SHAP Analysis - Sample Customer"
                customerId="CUST-001"
              />
            </section>

            <section className="ml-section explanation-section">
              <h2 className="section-title">Understanding ML Predictions</h2>
              <div className="explanation-grid">
                <div className="explanation-card">
                  <h3>🎯 Prediction Accuracy</h3>
                  <p>
                    Our model achieves 87.3% accuracy in predicting customer churn,
                    meaning it correctly identifies churners and non-churners
                    87 out of 100 times.
                  </p>
                </div>

                <div className="explanation-card">
                  <h3>📊 Feature Importance</h3>
                  <p>
                    Tenure, monthly charges, and contract type are the top 3 features
                    that influence churn predictions. Focus retention efforts on these areas.
                  </p>
                </div>

                <div className="explanation-card">
                  <h3>🔍 SHAP Values</h3>
                  <p>
                    SHAP (SHapley Additive exPlanations) shows exactly how each feature
                    contributes to individual predictions. Red bars increase churn risk,
                    green bars decrease it.
                  </p>
                </div>

                <div className="explanation-card">
                  <h3>⚖️ Model Fairness</h3>
                  <p>
                    The model is evaluated for bias across customer segments to ensure
                    fair and ethical predictions for all demographics.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Model Info */}
        <section className="model-info-section">
          <div className="info-banner">
            <div className="banner-icon">ℹ️</div>
            <div className="banner-content">
              <h4>Current Model: Churn Prediction v1.0</h4>
              <p>
                Trained on 10,000 samples • Last updated 2 days ago •
                Algorithm: XGBoost • Accuracy: 87.3%
              </p>
            </div>
            <button className="banner-action">View Details</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MLPrediction;
