// frontend/src/components/Charts/Web/PlotlyChart.tsx
import React, { useEffect, useRef } from 'react';

export interface PlotlyChartProps {
  data: any[];
  layout?: any;
  config?: any;
  title?: string;
  height?: number;
}

export const PlotlyChart: React.FC<PlotlyChartProps> = ({
  data,
  layout = {},
  config = {},
  title = 'Plotly Chart',
  height = 400
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import de Plotly para reducir bundle size
    const loadPlotly = async () => {
      try {
        const Plotly = await import('plotly.js-dist-min');
        
        if (chartRef.current) {
          const defaultLayout = {
            title: {
              text: title,
              font: { color: '#e4e4e7', size: 18 }
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#a1a1aa' },
            xaxis: {
              gridcolor: 'rgba(255,255,255,0.1)',
              color: '#a1a1aa'
            },
            yaxis: {
              gridcolor: 'rgba(255,255,255,0.1)',
              color: '#a1a1aa'
            },
            margin: { t: 60, r: 40, b: 60, l: 60 },
            height: height,
            ...layout
          };

          const defaultConfig = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            ...config
          };

          Plotly.newPlot(chartRef.current, data, defaultLayout, defaultConfig);
        }
      } catch (error) {
        console.error('Error loading Plotly:', error);
      }
    };

    loadPlotly();

    // Cleanup
    return () => {
      if (chartRef.current) {
        // Plotly.purge(chartRef.current);
      }
    };
  }, [data, layout, config, title, height]);

  return (
    <div className="plotly-chart-container">
      <div ref={chartRef} className="plotly-chart" />
      <p className="chart-info">
        Powered by Plotly.js - Interactive data visualization
      </p>
    </div>
  );
};

export default PlotlyChart;

// Example usage:
/*
const exampleData = [
  {
    x: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    y: [20, 14, 23, 25, 22],
    type: 'scatter',
    mode: 'lines+markers',
    marker: { color: '#667eea' },
    name: 'Revenue'
  }
];

<PlotlyChart 
  data={exampleData} 
  title="Monthly Revenue Trend"
  height={400}
/>
*/
