// frontend/src/pages/Landing.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning models predict customer churn with 87% accuracy'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Monitor key metrics and get actionable insights in real-time'
    },
    {
      icon: '🎯',
      title: 'Customer Segmentation',
      description: 'Intelligent clustering to understand your customer base better'
    },
    {
      icon: '📈',
      title: 'Interactive Reports',
      description: 'Generate comprehensive reports with visualizations and recommendations'
    },
    {
      icon: '💡',
      title: 'Explainable AI',
      description: 'Understand exactly why customers are predicted to churn with SHAP values'
    },
    {
      icon: '🌍',
      title: 'Multi-language Support',
      description: 'Available in 11 languages for global telecom operations'
    }
  ];

  const stats = [
    { value: '87%', label: 'Prediction Accuracy' },
    { value: '12K+', label: 'Customers Analyzed' },
    { value: '18.5%', label: 'Avg Churn Rate' },
    { value: '30%', label: 'Retention Improvement' }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span className="badge-text">AI-Powered Customer Analytics</span>
            </div>
            
            <h1 className="hero-title">
              Predict & Prevent <br />
              <span className="gradient-text">Customer Churn</span>
            </h1>
            
            <p className="hero-description">
              Leverage advanced machine learning to identify at-risk customers,
              understand churn drivers, and take proactive retention actions.
            </p>

            <div className="hero-actions">
              <button 
                className="btn-primary"
                onClick={() => navigate('/dashboard')}
              >
                <span className="btn-text">Get Started</span>
                <span className="btn-icon">→</span>
              </button>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/overview')}
              >
                <span className="btn-icon">👁️</span>
                <span className="btn-text">View Demo</span>
              </button>
            </div>

            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-card">
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="visual-icon">📊</div>
                <h3>Live Dashboard</h3>
                <div className="visual-chart">
                  <div className="chart-bar" style={{ height: '60%' }}></div>
                  <div className="chart-bar" style={{ height: '80%' }}></div>
                  <div className="chart-bar" style={{ height: '45%' }}></div>
                  <div className="chart-bar" style={{ height: '90%' }}></div>
                  <div className="chart-bar" style={{ height: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">
              Everything you need to understand and reduce customer churn
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Reduce Churn?</h2>
            <p className="cta-description">
              Start analyzing your customer data and get actionable insights in minutes.
            </p>
            <button 
              className="btn-cta"
              onClick={() => navigate('/upload')}
            >
              <span className="btn-text">Upload Your Data</span>
              <span className="btn-icon">🚀</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="brand-name">Telecom X</h3>
              <p className="brand-tagline">AI-Powered Churn Analysis</p>
            </div>
            <div className="footer-links">
              <button onClick={() => navigate('/dashboard')}>Dashboard</button>
              <button onClick={() => navigate('/reports')}>Reports</button>
              <button onClick={() => navigate('/settings')}>Settings</button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Telecom X Pro. Built with 💜 by Elizabeth Díaz Familia</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
