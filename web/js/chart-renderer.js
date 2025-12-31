// ============================================================================
// TELECOM X - CHART RENDERER
// Renders interactive charts using Plotly.js
// ============================================================================

class ChartRenderer {
    constructor() {
        this.defaultLayout = {
            font: { family: 'SF Pro Display, sans-serif', color: '#E2E8F0' },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: { t: 40, r: 20, b: 40, l: 60 }
        };
        
        this.colors = {
            primary: '#667eea',
            secondary: '#f093fb',
            tertiary: '#764ba2',
            success: '#51CF66',
            error: '#FF6B6B'
        };
    }

    renderChurnDistribution(containerId, data) {
        const values = [data.active || 365, data.churned || 135];
        const labels = ['Active', 'Churned'];

        const plotData = [{
            values: values,
            labels: labels,
            type: 'pie',
            hole: 0.4,
            marker: {
                colors: [this.colors.primary, this.colors.secondary]
            },
            textinfo: 'label+percent',
            textfont: { size: 14, color: '#FFFFFF' }
        }];

        const layout = {
            ...this.defaultLayout,
            title: ''
        };

        Plotly.newPlot(containerId, plotData, layout, {responsive: true, displayModeBar: false});
    }

    renderChurnByContract(containerId, data) {
        const contracts = ['Month-to-Month', 'One Year', 'Two Year'];
        const churnRates = [data.monthToMonth || 42, data.oneYear || 11, data.twoYear || 3];

        const plotData = [{
            x: contracts,
            y: churnRates,
            type: 'bar',
            marker: {
                color: churnRates,
                colorscale: [[0, this.colors.success], [1, this.colors.error]]
            },
            text: churnRates.map(v => v + '%'),
            textposition: 'outside'
        }];

        const layout = {
            ...this.defaultLayout,
            yaxis: { title: 'Churn Rate (%)', gridcolor: '#2d3748' },
            xaxis: { title: 'Contract Type' }
        };

        Plotly.newPlot(containerId, plotData, layout, {responsive: true, displayModeBar: false});
    }

    renderRevenueAnalysis(containerId, data) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const revenue = data.revenue || [45000, 47500, 46800, 52000, 54200, 53800];

        const plotData = [{
            x: months,
            y: revenue,
            type: 'scatter',
            mode: 'lines+markers',
            line: {
                color: this.colors.primary,
                width: 3,
                shape: 'spline'
            },
            marker: {
                size: 10,
                color: this.colors.secondary
            }
        }];

        const layout = {
            ...this.defaultLayout,
            yaxis: { title: 'Revenue ($)', gridcolor: '#2d3748' },
            xaxis: { title: 'Month' }
        };

        Plotly.newPlot(containerId, plotData, layout, {responsive: true, displayModeBar: false});
    }

    renderTenureDistribution(containerId, data) {
        const tenures = data.tenures || [10, 15, 20, 25, 30, 25, 20, 15, 10, 8, 5, 3];
        const bins = Array.from({length: 12}, (_, i) => i * 6);

        const plotData = [{
            x: bins,
            y: tenures,
            type: 'bar',
            marker: {
                color: this.colors.tertiary
            }
        }];

        const layout = {
            ...this.defaultLayout,
            yaxis: { title: 'Number of Customers', gridcolor: '#2d3748' },
            xaxis: { title: 'Tenure (months)' }
        };

        Plotly.newPlot(containerId, plotData, layout, {responsive: true, displayModeBar: false});
    }

    updateAllCharts() {
        // Sample data - in production, this would come from API
        const data = {
            active: 365,
            churned: 135,
            monthToMonth: 42,
            oneYear: 11,
            twoYear: 3
        };

        this.renderChurnDistribution('churnDistributionChart', data);
        this.renderChurnByContract('churnByContractChart', data);
        this.renderRevenueAnalysis('revenueChart', {});
        this.renderTenureDistribution('tenureChart', {});
    }
}

// Initialize Chart Renderer
const chartRenderer = new ChartRenderer();
