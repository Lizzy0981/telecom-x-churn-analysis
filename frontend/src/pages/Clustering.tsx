// frontend/src/pages/Clustering.tsx
import React, { useState } from 'react';
import { ClusteringViz3D } from '../components/ML';

export const Clustering: React.FC = () => {
  const [numClusters, setNumClusters] = useState(4);
  const [algorithm, setAlgorithm] = useState<'kmeans' | 'dbscan' | 'hierarchical'>('kmeans');

  const clusterDescriptions = [
    {
      id: 1,
      name: 'High-Value Loyalists',
      size: 3247,
      percentage: 26.1,
      color: '#667eea',
      characteristics: [
        'Average tenure: 52 months',
        'Monthly charges: $85+',
        'Contract: 2-year',
        'Churn risk: Low (8%)'
      ],
      recommendations: [
        'Maintain premium service quality',
        'Offer exclusive loyalty rewards',
        'Cross-sell premium add-ons'
      ]
    },
    {
      id: 2,
      name: 'At-Risk Price-Sensitive',
      size: 2341,
      percentage: 18.8,
      color: '#f59e0b',
      characteristics: [
        'Average tenure: 12 months',
        'Monthly charges: $65-75',
        'Contract: Month-to-month',
        'Churn risk: High (72%)'
      ],
      recommendations: [
        'Offer competitive pricing plans',
        'Introduce annual contract incentives',
        'Provide personalized retention offers'
      ]
    },
    {
      id: 3,
      name: 'Stable Mid-Tier',
      size: 4892,
      percentage: 39.3,
      color: '#22c55e',
      characteristics: [
        'Average tenure: 32 months',
        'Monthly charges: $55-65',
        'Contract: 1-year',
        'Churn risk: Medium (28%)'
      ],
      recommendations: [
        'Upgrade to premium tiers',
        'Maintain consistent service',
        'Regular engagement campaigns'
      ]
    },
    {
      id: 4,
      name: 'New Tech-Savvy',
      size: 1978,
      percentage: 15.8,
      color: '#3b82f6',
      characteristics: [
        'Average tenure: 6 months',
        'Monthly charges: $70-80',
        'Contract: Month-to-month',
        'Churn risk: Medium (35%)'
      ],
      recommendations: [
        'Highlight advanced features',
        'Provide tech support',
        'Early contract conversion offers'
      ]
    }
  ];

  return (
    <div className="clustering-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Customer Clustering</h1>
          <p className="page-subtitle">
            Intelligent customer segmentation using machine learning
          </p>
        </div>
        <div className="header-right">
          <button className="btn-secondary">
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Recompute Clusters</span>
          </button>
          <button className="btn-primary">
            <span className="btn-icon">📥</span>
            <span className="btn-text">Export Segments</span>
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Controls */}
        <section className="controls-section">
          <div className="controls-grid">
            <div className="control-group">
              <label className="control-label">Algorithm:</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as any)}
                className="control-select"
              >
                <option value="kmeans">K-Means</option>
                <option value="dbscan">DBSCAN</option>
                <option value="hierarchical">Hierarchical</option>
              </select>
            </div>
            <div className="control-group">
              <label className="control-label">Number of Clusters:</label>
              <input
                type="number"
                min="2"
                max="10"
                value={numClusters}
                onChange={(e) => setNumClusters(parseInt(e.target.value))}
                className="control-input"
              />
            </div>
            <div className="control-group">
              <label className="control-label">Features:</label>
              <select className="control-select">
                <option>All Features (15)</option>
                <option>Top 5 Features</option>
                <option>Custom Selection</option>
              </select>
            </div>
          </div>
        </section>

        {/* 3D Visualization */}
        <section className="visualization-section">
          <ClusteringViz3D
            title="3D Customer Clustering Visualization"
            width={900}
            height={600}
          />
        </section>

        {/* Cluster Details */}
        <section className="clusters-section">
          <h2 className="section-title">Cluster Profiles</h2>
          <div className="clusters-grid">
            {clusterDescriptions.map((cluster) => (
              <div key={cluster.id} className="cluster-card">
                <div className="cluster-header">
                  <div className="cluster-badge" style={{ backgroundColor: cluster.color }}>
                    Cluster {cluster.id}
                  </div>
                  <h3 className="cluster-name">{cluster.name}</h3>
                </div>

                <div className="cluster-stats">
                  <div className="stat-item">
                    <span className="stat-label">Size:</span>
                    <span className="stat-value">{cluster.size.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Percentage:</span>
                    <span className="stat-value">{cluster.percentage}%</span>
                  </div>
                </div>

                <div className="cluster-characteristics">
                  <h4>Characteristics:</h4>
                  <ul>
                    {cluster.characteristics.map((char, idx) => (
                      <li key={idx}>{char}</li>
                    ))}
                  </ul>
                </div>

                <div className="cluster-recommendations">
                  <h4>💡 Recommendations:</h4>
                  <ul>
                    {cluster.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>

                <button className="cluster-action">
                  View Customers in Cluster →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Clustering Metrics */}
        <section className="metrics-section">
          <h2 className="section-title">Clustering Quality Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-label">Silhouette Score</div>
                <div className="metric-value">0.68</div>
                <div className="metric-description">
                  Measures cluster separation (0-1, higher is better)
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <div className="metric-label">Calinski-Harabasz</div>
                <div className="metric-value">2847.3</div>
                <div className="metric-description">
                  Ratio of between-cluster to within-cluster variance
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📐</div>
              <div className="metric-content">
                <div className="metric-label">Davies-Bouldin</div>
                <div className="metric-value">0.52</div>
                <div className="metric-description">
                  Average similarity measure (lower is better)
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">💯</div>
              <div className="metric-content">
                <div className="metric-label">Explained Variance</div>
                <div className="metric-value">78.4%</div>
                <div className="metric-description">
                  Percentage of variance explained by clusters
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Banner */}
        <section className="info-section">
          <div className="info-banner">
            <div className="banner-icon">ℹ️</div>
            <div className="banner-content">
              <h4>About Customer Clustering</h4>
              <p>
                K-Means clustering groups customers based on similarities in their behavior,
                tenure, and spending patterns. This helps identify distinct customer segments
                for targeted marketing and retention strategies.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Clustering;
