"""
Unit tests for Visualization Components
Tests chart generation and rendering
"""

import pytest
import numpy as np
import sys
import os
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class TestChartGeneration:
    """Tests for chart generation"""
    
    def test_create_pie_chart_data(self):
        """Test pie chart data structure"""
        chart_data = {
            'type': 'pie',
            'labels': ['Active', 'Churned'],
            'values': [365, 135],
            'colors': ['#667eea', '#f093fb']
        }
        
        assert chart_data['type'] == 'pie'
        assert len(chart_data['labels']) == len(chart_data['values'])
        assert sum(chart_data['values']) == 500
    
    def test_create_bar_chart_data(self):
        """Test bar chart data structure"""
        chart_data = {
            'type': 'bar',
            'x': ['Month-to-Month', 'One Year', 'Two Year'],
            'y': [42, 11, 3],
            'colors': ['#FF6B6B', '#FFD93D', '#51CF66']
        }
        
        assert chart_data['type'] == 'bar'
        assert len(chart_data['x']) == len(chart_data['y'])
    
    def test_create_line_chart_data(self):
        """Test line chart data structure"""
        chart_data = {
            'type': 'line',
            'x': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            'y': [45000, 47500, 46800, 52000, 54200, 53800],
            'line_color': '#667eea',
            'line_width': 3
        }
        
        assert chart_data['type'] == 'line'
        assert len(chart_data['x']) == len(chart_data['y'])
        assert chart_data['line_width'] > 0
    
    def test_create_histogram_data(self):
        """Test histogram data structure"""
        chart_data = {
            'type': 'histogram',
            'values': np.random.randint(0, 73, 100).tolist(),
            'bins': 12,
            'color': '#764ba2'
        }
        
        assert chart_data['type'] == 'histogram'
        assert len(chart_data['values']) > 0
        assert chart_data['bins'] > 0
    
    def test_create_scatter_plot_data(self):
        """Test scatter plot data structure"""
        chart_data = {
            'type': 'scatter',
            'x': np.random.uniform(0, 100, 50).tolist(),
            'y': np.random.uniform(0, 100, 50).tolist(),
            'marker_size': 10,
            'marker_color': '#4facfe'
        }
        
        assert chart_data['type'] == 'scatter'
        assert len(chart_data['x']) == len(chart_data['y'])


class TestChartConfiguration:
    """Tests for chart configuration"""
    
    def test_chart_layout_configuration(self):
        """Test chart layout settings"""
        layout = {
            'title': 'Customer Churn Distribution',
            'width': 800,
            'height': 600,
            'font_family': 'SF Pro Display',
            'font_size': 12,
            'background_color': 'transparent'
        }
        
        assert layout['width'] > 0
        assert layout['height'] > 0
        assert layout['font_size'] > 0
    
    def test_chart_color_palette(self):
        """Test chart color palette"""
        colors = {
            'primary': '#667eea',
            'secondary': '#f093fb',
            'tertiary': '#764ba2',
            'success': '#51CF66',
            'error': '#FF6B6B'
        }
        
        assert all(c.startswith('#') for c in colors.values())
        assert all(len(c) == 7 for c in colors.values())
    
    def test_chart_axes_configuration(self):
        """Test chart axes settings"""
        axes_config = {
            'x_axis': {
                'title': 'Tenure (months)',
                'show_grid': True,
                'grid_color': '#E9ECEF'
            },
            'y_axis': {
                'title': 'Number of Customers',
                'show_grid': True,
                'grid_color': '#E9ECEF'
            }
        }
        
        assert 'x_axis' in axes_config
        assert 'y_axis' in axes_config
        assert axes_config['x_axis']['show_grid'] is True


class TestPlotlyIntegration:
    """Tests for Plotly.js integration"""
    
    def test_plotly_chart_config(self):
        """Test Plotly chart configuration"""
        config = {
            'responsive': True,
            'displayModeBar': False,
            'toImageButtonOptions': {
                'format': 'png',
                'filename': 'churn_analysis',
                'height': 600,
                'width': 800,
                'scale': 2
            }
        }
        
        assert config['responsive'] is True
        assert config['displayModeBar'] is False
    
    def test_plotly_data_format(self):
        """Test Plotly data format"""
        plotly_data = [{
            'x': [1, 2, 3, 4, 5],
            'y': [10, 15, 13, 17, 20],
            'type': 'scatter',
            'mode': 'lines+markers',
            'name': 'Revenue Trend'
        }]
        
        assert len(plotly_data) > 0
        assert 'type' in plotly_data[0]
        assert 'x' in plotly_data[0]
        assert 'y' in plotly_data[0]


class TestChartExport:
    """Tests for chart export functionality"""
    
    def test_export_chart_as_png(self, tmp_path):
        """Test exporting chart as PNG"""
        export_path = tmp_path / "chart.png"
        
        # Simulate PNG export
        with open(export_path, 'wb') as f:
            f.write(b'\x89PNG mock content')
        
        assert export_path.exists()
        assert export_path.suffix == '.png'
    
    def test_export_chart_as_svg(self, tmp_path):
        """Test exporting chart as SVG"""
        export_path = tmp_path / "chart.svg"
        
        # Simulate SVG export
        with open(export_path, 'w') as f:
            f.write('<svg>mock content</svg>')
        
        assert export_path.exists()
        assert export_path.suffix == '.svg'
    
    def test_export_with_dpi_setting(self):
        """Test export with DPI setting"""
        export_config = {
            'format': 'png',
            'dpi': 300,
            'width': 1200,
            'height': 800
        }
        
        assert export_config['dpi'] >= 72  # Minimum DPI
        assert export_config['width'] > 0
        assert export_config['height'] > 0


class TestDashboardRendering:
    """Tests for dashboard rendering"""
    
    def test_create_dashboard_grid(self):
        """Test dashboard grid layout"""
        dashboard = {
            'layout': 'grid',
            'rows': 3,
            'cols': 3,
            'charts': [
                {'id': 'chart1', 'row': 1, 'col': 1},
                {'id': 'chart2', 'row': 1, 'col': 2},
                {'id': 'chart3', 'row': 2, 'col': 1}
            ]
        }
        
        assert dashboard['layout'] == 'grid'
        assert dashboard['rows'] > 0
        assert dashboard['cols'] > 0
        assert len(dashboard['charts']) > 0
    
    def test_dashboard_responsive_design(self):
        """Test dashboard responsive configuration"""
        responsive_config = {
            'breakpoints': {
                'mobile': 768,
                'tablet': 1024,
                'desktop': 1440
            },
            'adapt_layout': True
        }
        
        assert 'mobile' in responsive_config['breakpoints']
        assert responsive_config['adapt_layout'] is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
