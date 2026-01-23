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

        // 🆕 Listen for dark mode changes
        window.addEventListener('darkModeChanged', (e) => {
            this.updateAllChartsForDarkMode(e.detail.isDark);
        });
    }

    // ========== ORIGINAL METHODS - PRESERVED ==========

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

    // ========== NEW METHODS - ENHANCEMENTS ==========

    // 🆕 Render K-Means Clustering in 3D
    renderClustering3D(containerId, clusteringData) {
        if (!clusteringData || !clusteringData.data) {
            console.warn('No clustering data available');
            return;
        }

        const traces = [];
        const k = clusteringData.k || 3;
        const clusterColors = [
            this.colors.primary,
            this.colors.secondary,
            this.colors.tertiary,
            this.colors.success,
            this.colors.error
        ];

        // Create trace for each cluster
        for (let cluster = 0; cluster < k; cluster++) {
            const clusterPoints = clusteringData.data.filter(p => p.cluster === cluster);
            
            traces.push({
                x: clusterPoints.map(p => p.tenure),
                y: clusterPoints.map(p => p.monthlyCharges),
                z: clusterPoints.map(p => p.totalCharges),
                mode: 'markers',
                type: 'scatter3d',
                name: `Cluster ${cluster + 1}`,
                marker: {
                    size: 5,
                    color: clusterColors[cluster],
                    opacity: 0.8
                }
            });
        }

        // Add centroids if available
        if (clusteringData.centroids) {
            traces.push({
                x: clusteringData.centroids.map(c => c.tenure),
                y: clusteringData.centroids.map(c => c.monthlyCharges),
                z: clusteringData.centroids.map(c => c.totalCharges),
                mode: 'markers',
                type: 'scatter3d',
                name: 'Centroids',
                marker: {
                    size: 12,
                    color: '#FFD93D',
                    symbol: 'diamond',
                    line: { color: '#000', width: 2 }
                }
            });
        }

        const layout = {
            ...this.defaultLayout,
            scene: {
                xaxis: { title: 'Tenure (months)', gridcolor: '#2d3748' },
                yaxis: { title: 'Monthly Charges ($)', gridcolor: '#2d3748' },
                zaxis: { title: 'Total Charges ($)', gridcolor: '#2d3748' }
            },
            showlegend: true,
            legend: { x: 0, y: 1 }
        };

        Plotly.newPlot(containerId, traces, layout, {responsive: true, displayModeBar: false});
    }

    // 🆕 Render Correlation Matrix Heatmap
    renderCorrelationMatrix(containerId, correlationData) {
        if (!correlationData || !correlationData.matrix) {
            console.warn('No correlation data available');
            return;
        }

        const plotData = [{
            z: correlationData.matrix,
            x: correlationData.features,
            y: correlationData.features,
            type: 'heatmap',
            colorscale: [
                [0, this.colors.error],
                [0.5, '#FFFFFF'],
                [1, this.colors.success]
            ],
            zmid: 0,
            text: correlationData.matrix.map(row => 
                row.map(val => val.toFixed(2))
            ),
            texttemplate: '%{text}',
            textfont: { size: 10 },
            hovertemplate: '%{y} vs %{x}<br>Correlation: %{z:.2f}<extra></extra>'
        }];

        const layout = {
            ...this.defaultLayout,
            xaxis: { side: 'bottom' },
            yaxis: { autorange: 'reversed' },
            margin: { t: 40, r: 20, b: 80, l: 100 }
        };

        Plotly.newPlot(containerId, plotData, layout, {responsive: true, displayModeBar: false});
    }

    // 🆕 Render Anomaly Detection Scatter
    renderAnomalyDetection(containerId, anomalyData) {
        if (!anomalyData || !Array.isArray(anomalyData)) {
            console.warn('No anomaly data available');
            return;
        }

        const normal = {
            x: [],
            y: [],
            mode: 'markers',
            type: 'scatter',
            name: 'Normal',
            marker: {
                size: 8,
                color: this.colors.success,
                opacity: 0.6
            }
        };

        const anomalies = {
            x: anomalyData.map(a => a.tenure),
            y: anomalyData.map(a => a.monthlyCharges),
            mode: 'markers',
            type: 'scatter',
            name: 'Anomalies',
            marker: {
                size: 12,
                color: this.colors.error,
                symbol: 'x',
                line: { color: '#FFFFFF', width: 2 }
            },
            text: anomalyData.map(a => `${a.customerId}<br>Score: ${a.anomalyScore.toFixed(2)}`),
            hovertemplate: '%{text}<extra></extra>'
        };

        const layout = {
            ...this.defaultLayout,
            xaxis: { title: 'Tenure (months)', gridcolor: '#2d3748' },
            yaxis: { title: 'Monthly Charges ($)', gridcolor: '#2d3748' },
            showlegend: true
        };

        Plotly.newPlot(containerId, [normal, anomalies], layout, {responsive: true, displayModeBar: false});
    }

    // 🆕 Update all charts for dark mode
    updateAllChartsForDarkMode(isDark) {
        const textColor = isDark ? '#F8FAFC' : '#1F2937';
        const gridColor = isDark ? '#2d3748' : '#E5E7EB';

        this.defaultLayout.font.color = textColor;
        
        // Redraw all charts (if they exist)
        const chartIds = [
            'churnDistributionChart',
            'churnByContractChart',
            'revenueChart',
            'tenureChart',
            'clusteringChart',
            'correlationChart',
            'anomalyChart'
        ];

        chartIds.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.data) {
                Plotly.relayout(id, {
                    'font.color': textColor,
                    'xaxis.gridcolor': gridColor,
                    'yaxis.gridcolor': gridColor
                });
            }
        });
    }
}

// Initialize Chart Renderer
const chartRenderer = new ChartRenderer();
