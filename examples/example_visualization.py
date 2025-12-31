#!/usr/bin/env python3
"""
Telecom X - Visualization Example
Example of how to create interactive and static visualizations

This example demonstrates:
1. Creating Plotly interactive charts
2. Creating Matplotlib static charts
3. Saving visualizations
4. Building dashboards
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))


def main():
    """Main example function"""
    print("=" * 80)
    print("TELECOM X - Visualization Example")
    print("=" * 80)
    print()
    
    try:
        import pandas as pd
        from src.visualization.plotly_charts import PlotlyCharts
        from src.visualization.matplotlib_charts import MatplotlibCharts
        
        # Load data
        print("Loading data...")
        df = pd.read_csv('data/processed/dataset_final.csv')
        print(f"✓ Loaded {len(df)} records")
        print()
        
        # Initialize chart renderers
        plotly_renderer = PlotlyCharts(df)
        matplotlib_renderer = MatplotlibCharts(df)
        
        # Example 1: Create Plotly interactive charts
        print("Example 1: Creating Plotly Interactive Charts...")
        
        # Churn distribution (pie chart)
        print("  Creating churn distribution pie chart...")
        fig_pie = plotly_renderer.create_pie_chart(
            column='Churn',
            title='Customer Churn Distribution'
        )
        fig_pie.write_html('visualizations/interactive/churn_pie.html')
        print("  ✓ Saved: churn_pie.html")
        
        # Revenue analysis (line chart)
        print("  Creating revenue line chart...")
        fig_line = plotly_renderer.create_line_chart(
            x='tenure',
            y='TotalCharges',
            title='Revenue by Tenure'
        )
        fig_line.write_html('visualizations/interactive/revenue_line.html')
        print("  ✓ Saved: revenue_line.html")
        
        # Contract analysis (bar chart)
        print("  Creating contract bar chart...")
        fig_bar = plotly_renderer.create_bar_chart(
            x='Contract',
            y='MonthlyCharges',
            title='Monthly Charges by Contract Type'
        )
        fig_bar.write_html('visualizations/interactive/contract_bar.html')
        print("  ✓ Saved: contract_bar.html")
        print()
        
        # Example 2: Create Matplotlib static charts
        print("Example 2: Creating Matplotlib Static Charts...")
        
        # Correlation heatmap
        print("  Creating correlation heatmap...")
        matplotlib_renderer.create_heatmap(
            columns=['tenure', 'MonthlyCharges', 'TotalCharges'],
            output='visualizations/static/correlation_heatmap.png',
            title='Feature Correlation Heatmap'
        )
        print("  ✓ Saved: correlation_heatmap.png")
        
        # Distribution histogram
        print("  Creating tenure histogram...")
        matplotlib_renderer.create_histogram(
            column='tenure',
            bins=20,
            output='visualizations/static/tenure_histogram.png',
            title='Customer Tenure Distribution'
        )
        print("  ✓ Saved: tenure_histogram.png")
        print()
        
        # Example 3: Create interactive dashboard
        print("Example 3: Creating Interactive Dashboard...")
        dashboard_html = plotly_renderer.create_dashboard(
            charts=[
                {'type': 'pie', 'data': 'Churn'},
                {'type': 'bar', 'x': 'Contract', 'y': 'MonthlyCharges'},
                {'type': 'scatter', 'x': 'tenure', 'y': 'TotalCharges'},
                {'type': 'box', 'column': 'MonthlyCharges', 'by': 'Churn'}
            ],
            title='Telecom X - Interactive Dashboard',
            layout='grid'
        )
        
        with open('visualizations/interactive/dashboard.html', 'w') as f:
            f.write(dashboard_html)
        print("✓ Interactive dashboard created: dashboard.html")
        print()
        
        # Example 4: Export charts as images
        print("Example 4: Exporting Charts as Images...")
        fig_pie.write_image('visualizations/static/churn_pie.png', width=800, height=600)
        print("✓ Exported: churn_pie.png")
        
        fig_bar.write_image('visualizations/static/contract_bar.png', width=800, height=600)
        print("✓ Exported: contract_bar.png")
        print()
        
        # Summary
        print("Visualization Summary:")
        print("-" * 40)
        print("Interactive Charts: 4")
        print("Static Charts: 2")
        print("Dashboard: 1")
        print("Exported Images: 2")
        print()
        
        print("=" * 80)
        print("Visualization Example Completed!")
        print("=" * 80)
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
