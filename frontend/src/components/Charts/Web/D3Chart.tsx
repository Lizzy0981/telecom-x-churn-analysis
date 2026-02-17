// frontend/src/components/Charts/Web/D3Chart.tsx
import React, { useEffect, useRef } from 'react';

export interface D3ChartProps {
  data: any[];
  type?: 'scatter' | 'network' | 'force';
  title?: string;
  width?: number;
  height?: number;
}

export const D3Chart: React.FC<D3ChartProps> = ({
  data,
  type = 'scatter',
  title = 'D3 Visualization',
  width = 800,
  height = 400
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Dynamic import de D3 para reducir bundle size
    const loadD3 = async () => {
      try {
        const d3 = await import('d3');
        
        if (!svgRef.current || data.length === 0) return;

        // Clear previous chart
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
          .attr('width', width)
          .attr('height', height);

        // Simple scatter plot implementation
        if (type === 'scatter') {
          renderScatterPlot(d3, svg, data, width, height);
        }
      } catch (error) {
        console.error('Error loading D3:', error);
      }
    };

    loadD3();
  }, [data, type, width, height]);

  const renderScatterPlot = (d3: any, svg: any, data: any[], width: number, height: number) => {
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.x || 0)])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.y || 0)])
      .range([innerHeight, 0]);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#a1a1aa');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .attr('color', '#a1a1aa');

    // Grid
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );

    // Circles
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => xScale(d.x || 0))
      .attr('cy', (d: any) => yScale(d.y || 0))
      .attr('r', (d: any) => d.size || 5)
      .attr('fill', '#667eea')
      .attr('opacity', 0.7)
      .on('mouseover', function() {
        d3.select(this).attr('opacity', 1).attr('r', 8);
      })
      .on('mouseout', function(event: any, d: any) {
        d3.select(this).attr('opacity', 0.7).attr('r', d.size || 5);
      })
      .append('title')
      .text((d: any) => `(${d.x}, ${d.y})`);
  };

  return (
    <div className="d3-chart-container">
      <h3 className="chart-title">{title}</h3>
      <div className="d3-chart-wrapper">
        <svg ref={svgRef}></svg>
      </div>
      <p className="chart-info">
        D3.js - Data-Driven Documents for advanced visualizations
      </p>
    </div>
  );
};

export default D3Chart;

// Example usage:
/*
const scatterData = [
  { x: 10, y: 20, size: 5 },
  { x: 30, y: 40, size: 8 },
  { x: 50, y: 30, size: 6 },
  { x: 70, y: 60, size: 10 },
  { x: 90, y: 50, size: 7 }
];

<D3Chart 
  data={scatterData} 
  type="scatter"
  title="Customer Clustering"
  width={800}
  height={400}
/>
*/
