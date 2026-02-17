// frontend/src/components/Charts/ChartSelector.tsx
import React, { useState } from 'react';
import './Charts.css';

export interface ChartType {
  id: string;
  name: string;
  icon: string;
  description: string;
  library: 'plotly' | 'recharts' | 'd3';
  category: 'basic' | 'advanced' | 'statistical';
}

export interface ChartSelectorProps {
  onSelect: (chartType: ChartType) => void;
  selectedChart?: string;
}

const chartTypes: ChartType[] = [
  {
    id: 'line',
    name: 'Line Chart',
    icon: '📈',
    description: 'Show trends over time',
    library: 'plotly',
    category: 'basic'
  },
  {
    id: 'bar',
    name: 'Bar Chart',
    icon: '📊',
    description: 'Compare categories',
    library: 'plotly',
    category: 'basic'
  },
  {
    id: 'pie',
    name: 'Pie Chart',
    icon: '🥧',
    description: 'Show proportions',
    library: 'plotly',
    category: 'basic'
  },
  {
    id: 'area',
    name: 'Area Chart',
    icon: '📉',
    description: 'Visualize cumulative data',
    library: 'recharts',
    category: 'basic'
  },
  {
    id: 'scatter',
    name: 'Scatter Plot',
    icon: '⚫',
    description: 'Show correlations',
    library: 'd3',
    category: 'advanced'
  },
  {
    id: 'heatmap',
    name: 'Heatmap',
    icon: '🔥',
    description: 'Show data density',
    library: 'plotly',
    category: 'advanced'
  },
  {
    id: 'box',
    name: 'Box Plot',
    icon: '📦',
    description: 'Statistical distribution',
    library: 'plotly',
    category: 'statistical'
  },
  {
    id: 'histogram',
    name: 'Histogram',
    icon: '📶',
    description: 'Data distribution',
    library: 'plotly',
    category: 'statistical'
  },
  {
    id: 'treemap',
    name: 'Treemap',
    icon: '🌳',
    description: 'Hierarchical data',
    library: 'plotly',
    category: 'advanced'
  },
  {
    id: 'sunburst',
    name: 'Sunburst',
    icon: '☀️',
    description: 'Radial hierarchy',
    library: 'plotly',
    category: 'advanced'
  },
  {
    id: 'funnel',
    name: 'Funnel',
    icon: '🔽',
    description: 'Conversion rates',
    library: 'plotly',
    category: 'advanced'
  },
  {
    id: 'gauge',
    name: 'Gauge',
    icon: '🎯',
    description: 'KPI visualization',
    library: 'plotly',
    category: 'advanced'
  }
];

export const ChartSelector: React.FC<ChartSelectorProps> = ({
  onSelect,
  selectedChart
}) => {
  const [filter, setFilter] = useState<'all' | 'basic' | 'advanced' | 'statistical'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCharts = chartTypes.filter(chart => {
    const matchesFilter = filter === 'all' || chart.category === filter;
    const matchesSearch = chart.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chart.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="chart-selector">
      <div className="selector-header">
        <h3 className="selector-title">Select Chart Type</h3>
        <p className="selector-subtitle">Choose the best visualization for your data</p>
      </div>

      {/* Search */}
      <div className="selector-search">
        <input
          type="search"
          placeholder="Search charts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* Filters */}
      <div className="selector-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({chartTypes.length})
        </button>
        <button
          className={`filter-btn ${filter === 'basic' ? 'active' : ''}`}
          onClick={() => setFilter('basic')}
        >
          Basic ({chartTypes.filter(c => c.category === 'basic').length})
        </button>
        <button
          className={`filter-btn ${filter === 'advanced' ? 'active' : ''}`}
          onClick={() => setFilter('advanced')}
        >
          Advanced ({chartTypes.filter(c => c.category === 'advanced').length})
        </button>
        <button
          className={`filter-btn ${filter === 'statistical' ? 'active' : ''}`}
          onClick={() => setFilter('statistical')}
        >
          Statistical ({chartTypes.filter(c => c.category === 'statistical').length})
        </button>
      </div>

      {/* Chart Grid */}
      <div className="chart-grid">
        {filteredCharts.length > 0 ? (
          filteredCharts.map((chart) => (
            <button
              key={chart.id}
              className={`chart-card ${selectedChart === chart.id ? 'selected' : ''}`}
              onClick={() => onSelect(chart)}
            >
              <div className="chart-card-icon">{chart.icon}</div>
              <div className="chart-card-content">
                <h4 className="chart-card-name">{chart.name}</h4>
                <p className="chart-card-description">{chart.description}</p>
                <div className="chart-card-footer">
                  <span className="chart-library">{chart.library}</span>
                  <span className="chart-category">{chart.category}</span>
                </div>
              </div>
              {selectedChart === chart.id && (
                <div className="chart-card-check">✓</div>
              )}
            </button>
          ))
        ) : (
          <div className="no-results">
            <p>No charts found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartSelector;
