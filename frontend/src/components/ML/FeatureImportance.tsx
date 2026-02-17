// frontend/src/components/ML/FeatureImportance.tsx
import React, { useState } from 'react';

export interface Feature {
  name: string;
  importance: number;
  category?: string;
  description?: string;
}

export interface FeatureImportanceProps {
  features?: Feature[];
  title?: string;
  sortBy?: 'importance' | 'name';
  loading?: boolean;
}

const defaultFeatures: Feature[] = [
  { name: 'Tenure', importance: 0.245, category: 'Customer', description: 'Months as customer' },
  { name: 'Monthly Charges', importance: 0.187, category: 'Financial', description: 'Monthly bill amount' },
  { name: 'Total Charges', importance: 0.156, category: 'Financial', description: 'Lifetime revenue' },
  { name: 'Contract Type', importance: 0.134, category: 'Account', description: 'Month-to-month vs contract' },
  { name: 'Internet Service', importance: 0.098, category: 'Service', description: 'Type of internet' },
  { name: 'Payment Method', importance: 0.072, category: 'Financial', description: 'Payment type' },
  { name: 'Tech Support', importance: 0.045, category: 'Service', description: 'Has tech support' },
  { name: 'Online Security', importance: 0.034, category: 'Service', description: 'Has online security' },
  { name: 'Senior Citizen', importance: 0.029, category: 'Customer', description: 'Age 65+' }
];

export const FeatureImportance: React.FC<FeatureImportanceProps> = ({
  features = defaultFeatures,
  title = 'Feature Importance',
  sortBy = 'importance',
  loading = false
}) => {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [sort, setSort] = useState<'importance' | 'name'>(sortBy);

  const sortedFeatures = [...features].sort((a, b) => {
    if (sort === 'importance') {
      return b.importance - a.importance;
    }
    return a.name.localeCompare(b.name);
  });

  const maxImportance = Math.max(...features.map(f => f.importance));

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'Customer': '#667eea',
      'Financial': '#22c55e',
      'Account': '#f59e0b',
      'Service': '#3b82f6'
    };
    return colors[category || ''] || '#a1a1aa';
  };

  if (loading) {
    return (
      <div className="feature-importance-loading">
        <div className="spinner"></div>
        <p>Calculating feature importance...</p>
      </div>
    );
  }

  return (
    <div className="feature-importance">
      <div className="importance-header">
        <h3 className="importance-title">{title}</h3>
        <div className="importance-controls">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'importance' | 'name')}
            className="sort-select"
          >
            <option value="importance">Sort by Importance</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Feature Bars */}
      <div className="features-list">
        {sortedFeatures.map((feature, index) => (
          <div
            key={feature.name}
            className="feature-row"
            onClick={() => setSelectedFeature(feature)}
          >
            <div className="feature-rank">#{index + 1}</div>
            <div className="feature-info">
              <div className="feature-header-row">
                <span className="feature-name">{feature.name}</span>
                {feature.category && (
                  <span
                    className="feature-category"
                    style={{ backgroundColor: getCategoryColor(feature.category) }}
                  >
                    {feature.category}
                  </span>
                )}
              </div>
              {feature.description && (
                <p className="feature-description">{feature.description}</p>
              )}
            </div>
            <div className="feature-importance-value">
              {(feature.importance * 100).toFixed(1)}%
            </div>
            <div className="feature-bar-container">
              <div
                className="feature-bar-fill"
                style={{
                  width: `${(feature.importance / maxImportance) * 100}%`,
                  backgroundColor: getCategoryColor(feature.category)
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Category Legend */}
      <div className="category-legend">
        <h4>Categories:</h4>
        <div className="legend-items">
          {Array.from(new Set(features.map(f => f.category).filter(Boolean))).map(category => (
            <div key={category} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: getCategoryColor(category) }}
              />
              <span className="legend-label">{category}</span>
              <span className="legend-count">
                ({features.filter(f => f.category === category).length} features)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      {selectedFeature && (
        <div className="feature-modal-overlay" onClick={() => setSelectedFeature(null)}>
          <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedFeature(null)}>
              ✕
            </button>

            <h3>{selectedFeature.name}</h3>
            
            <div className="modal-section">
              <h4>Importance Score</h4>
              <div className="importance-gauge">
                <div
                  className="gauge-fill"
                  style={{
                    width: `${(selectedFeature.importance / maxImportance) * 100}%`,
                    backgroundColor: getCategoryColor(selectedFeature.category)
                  }}
                />
                <span className="gauge-value">
                  {(selectedFeature.importance * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {selectedFeature.category && (
              <div className="modal-section">
                <h4>Category</h4>
                <span
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(selectedFeature.category) }}
                >
                  {selectedFeature.category}
                </span>
              </div>
            )}

            {selectedFeature.description && (
              <div className="modal-section">
                <h4>Description</h4>
                <p>{selectedFeature.description}</p>
              </div>
            )}

            <div className="modal-section">
              <h4>Interpretation</h4>
              <p>
                This feature accounts for approximately <strong>{(selectedFeature.importance * 100).toFixed(1)}%</strong> of
                the model's decision-making process. Features with higher importance have more influence on churn predictions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureImportance;
