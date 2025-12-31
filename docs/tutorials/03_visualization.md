# 📊 Tutorial 3: Creating Visualizations

Learn to create interactive and static visualizations.

---

## 📋 What You'll Learn

- Creating interactive charts with Plotly
- Creating static charts with Matplotlib
- Building dashboards
- Exporting visualizations

**Time:** ~25 minutes  
**Level:** Intermediate  
**Prerequisites:** Tutorials 1-2 completed

---

## 🎨 Interactive Charts (Plotly)

### Setup

```python
from src.visualization.plotly_charts import PlotlyCharts
import pandas as pd

# Load data
df = pd.read_csv('data/processed/dataset_final.csv')

# Initialize renderer
viz = PlotlyCharts(df)
```

### Pie Chart

```python
# Create churn distribution pie chart
fig = viz.create_pie_chart(
    column='Churn',
    title='Customer Churn Distribution',
    colors=['#51CF66', '#FF6B6B']  # Green for No, Red for Yes
)

# Save to file
fig.write_html('visualizations/interactive/churn_pie.html')

# Show in browser
fig.show()
```

### Bar Chart

```python
# Monthly charges by contract type
fig = viz.create_bar_chart(
    x='Contract',
    y='MonthlyCharges',
    title='Monthly Charges by Contract Type',
    color='Contract'
)

fig.write_html('visualizations/interactive/charges_bar.html')
```

### Line Chart

```python
# Revenue trend by tenure
fig = viz.create_line_chart(
    x='tenure',
    y='TotalCharges',
    title='Total Revenue by Tenure',
    smooth=True  # Smoothed line
)

fig.write_html('visualizations/interactive/revenue_line.html')
```

### Scatter Plot

```python
# Tenure vs Monthly Charges
fig = viz.create_scatter(
    x='tenure',
    y='MonthlyCharges',
    color='Churn',  # Color by churn status
    title='Tenure vs Monthly Charges'
)

fig.write_html('visualizations/interactive/scatter.html')
```

---

## 📈 Static Charts (Matplotlib)

### Setup

```python
from src.visualization.matplotlib_charts import MatplotlibCharts

mat_viz = MatplotlibCharts(df)
```

### Histogram

```python
mat_viz.create_histogram(
    column='tenure',
    bins=20,
    title='Customer Tenure Distribution',
    xlabel='Tenure (months)',
    ylabel='Number of Customers',
    output='visualizations/static/tenure_histogram.png'
)
```

### Correlation Heatmap

```python
mat_viz.create_heatmap(
    columns=['tenure', 'MonthlyCharges', 'TotalCharges'],
    title='Feature Correlation Heatmap',
    cmap='coolwarm',
    output='visualizations/static/correlation.png'
)
```

### Box Plot

```python
mat_viz.create_boxplot(
    column='MonthlyCharges',
    by='Contract',
    title='Monthly Charges Distribution by Contract',
    output='visualizations/static/charges_boxplot.png'
)
```

---

## 🎭 Advanced Visualizations

### Sunburst Chart

```python
import plotly.express as px

fig = px.sunburst(
    df,
    path=['Segment', 'Contract', 'Churn'],
    values='MonthlyCharges',
    title='Customer Hierarchy'
)

fig.write_html('visualizations/interactive/sunburst.html')
```

### 3D Scatter Plot

```python
fig = px.scatter_3d(
    df,
    x='tenure',
    y='MonthlyCharges',
    z='TotalCharges',
    color='Churn',
    title='3D Customer Analysis'
)

fig.write_html('visualizations/interactive/3d_scatter.html')
```

### Animated Chart

```python
fig = px.scatter(
    df,
    x='tenure',
    y='MonthlyCharges',
    animation_frame='Contract',
    color='Churn',
    title='Charges Over Contract Types'
)

fig.write_html('visualizations/interactive/animated.html')
```

---

## 📊 Creating Dashboards

### Method 1: Plotly Subplots

```python
from plotly.subplots import make_subplots
import plotly.graph_objects as go

# Create 2x2 subplot grid
fig = make_subplots(
    rows=2, cols=2,
    subplot_titles=('Churn Distribution', 'Charges by Contract',
                   'Revenue Trend', 'Tenure Distribution')
)

# Add charts
fig.add_trace(
    go.Pie(labels=df['Churn'].value_counts().index,
           values=df['Churn'].value_counts().values),
    row=1, col=1
)

# Save complete dashboard
fig.write_html('visualizations/interactive/dashboard.html')
```

### Method 2: HTML Dashboard

```python
dashboard_html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Telecom X Dashboard</title>
    <style>
        .grid {{
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }}
    </style>
</head>
<body>
    <h1>Telecom X Dashboard</h1>
    <div class="grid">
        <div>{fig1.to_html()}</div>
        <div>{fig2.to_html()}</div>
        <div>{fig3.to_html()}</div>
        <div>{fig4.to_html()}</div>
    </div>
</body>
</html>
"""

with open('visualizations/interactive/dashboard.html', 'w') as f:
    f.write(dashboard_html)
```

---

## 🎨 Customization

### Custom Colors

```python
# Define custom color palette
TELECOM_COLORS = {
    'primary': '#667eea',
    'secondary': '#f093fb',
    'success': '#51CF66',
    'error': '#FF6B6B',
    'warning': '#FFD93D'
}

# Use in chart
fig = px.pie(
    df,
    names='Churn',
    title='Churn Distribution',
    color_discrete_map={'Yes': TELECOM_COLORS['error'],
                        'No': TELECOM_COLORS['success']}
)
```

### Custom Layout

```python
fig.update_layout(
    font=dict(family="SF Pro Display", size=14),
    plot_bgcolor='rgba(0,0,0,0)',
    paper_bgcolor='rgba(0,0,0,0)',
    title_font_size=24,
    showlegend=True,
    legend=dict(
        orientation="h",
        yanchor="bottom",
        y=1.02,
        xanchor="right",
        x=1
    )
)
```

---

## 💾 Exporting Visualizations

### Export as PNG

```python
fig.write_image('chart.png', width=800, height=600, scale=2)
```

### Export as SVG

```python
fig.write_image('chart.svg')
```

### Export as PDF

```python
fig.write_image('chart.pdf')
```

**Note:** Requires `kaleido` package:
```bash
pip install kaleido
```

---

## 🎯 Exercises

### Exercise 1: Multi-Chart Dashboard

Create a dashboard with 6 charts showing different analyses.

### Exercise 2: Custom Theme

Create a dark theme for all visualizations.

### Exercise 3: Animated Timeline

Create an animated chart showing customer behavior over time.

---

## 📚 Next Steps

- [Tutorial 4: Report Generation](04_report_generation.md)

---

**Developed with 💜 by Elizabeth Díaz Familia**
