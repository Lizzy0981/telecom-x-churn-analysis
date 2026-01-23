// ============================================================================
// TELECOM X - API CONNECTOR
// Handles API communications and data fetching
// ============================================================================

class APIConnector {
    constructor() {
        this.baseURL = '/api/v1';
        this.headers = {
            'Content-Type': 'application/json'
        };
        this.cache = new Map(); // 🆕 Cache for API responses
    }

    // ========== ORIGINAL METHODS - PRESERVED ==========

    async fetchCustomers(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.baseURL}/customers?${queryParams}`, {
                headers: this.headers
            });
            
            if (!response.ok) throw new Error('Failed to fetch customers');
            return await response.json();
        } catch (error) {
            console.error('Error fetching customers:', error);
            return this.getMockCustomers();
        }
    }

    async fetchKPIs() {
        try {
            const response = await fetch(`${this.baseURL}/kpis`, {
                headers: this.headers
            });
            
            if (!response.ok) throw new Error('Failed to fetch KPIs');
            return await response.json();
        } catch (error) {
            console.error('Error fetching KPIs:', error);
            return this.getMockKPIs();
        }
    }

    async fetchChartData(chartType) {
        try {
            const response = await fetch(`${this.baseURL}/charts/${chartType}`, {
                headers: this.headers
            });
            
            if (!response.ok) throw new Error(`Failed to fetch ${chartType} data`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${chartType}:`, error);
            return this.getMockChartData(chartType);
        }
    }

    async generateReport(reportType, format) {
        try {
            const response = await fetch(`${this.baseURL}/reports/${reportType}`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({ format })
            });
            
            if (!response.ok) throw new Error('Failed to generate report');
            
            const blob = await response.blob();
            this.downloadFile(blob, `${reportType}_report.${format}`);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Report generation failed. Using mock data...');
        }
    }

    downloadFile(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // Mock data for development/demo
    getMockKPIs() {
        return {
            totalCustomers: 500,
            churnRate: 27.0,
            retentionRate: 73.0,
            avgMonthlyCharges: 64.76,
            highRiskCustomers: 45,
            avgTenure: 32.4
        };
    }

    getMockCustomers() {
        return Array.from({length: 20}, (_, i) => ({
            id: `CUST-${1000 + i}`,
            segment: ['Entry', 'Standard', 'Premium', 'Power User'][Math.floor(Math.random() * 4)],
            tenure: Math.floor(Math.random() * 72),
            monthlyCharges: parseFloat((Math.random() * 100 + 20).toFixed(2)),
            riskScore: Math.floor(Math.random() * 100),
            churnStatus: Math.random() > 0.7 ? 'Churned' : 'Active'
        }));
    }

    getMockChartData(chartType) {
        switch(chartType) {
            case 'churn':
                return { active: 365, churned: 135 };
            case 'contract':
                return { monthToMonth: 42, oneYear: 11, twoYear: 3 };
            default:
                return {};
        }
    }

    // ========== NEW METHODS - ENHANCEMENTS ==========

    // 🆕 Upload data to API
    async uploadData(file, format) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('format', format);

            const response = await fetch(`${this.baseURL}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');
            return await response.json();
        } catch (error) {
            console.error('Error uploading data:', error);
            return { success: false, error: error.message };
        }
    }

    // 🆕 Fetch correlation matrix data
    async fetchCorrelationData() {
        try {
            const response = await fetch(`${this.baseURL}/analytics/correlation`, {
                headers: this.headers
            });
            
            if (!response.ok) throw new Error('Failed to fetch correlation data');
            return await response.json();
        } catch (error) {
            console.error('Error fetching correlation:', error);
            return this.getMockCorrelationData();
        }
    }

    // 🆕 Fetch clustering data
    async fetchClusteringData(numClusters = 3) {
        try {
            const response = await fetch(`${this.baseURL}/analytics/clustering?k=${numClusters}`, {
                headers: this.headers
            });
            
            if (!response.ok) throw new Error('Failed to fetch clustering data');
            return await response.json();
        } catch (error) {
            console.error('Error fetching clustering:', error);
            return this.getMockClusteringData(numClusters);
        }
    }

    // 🆕 Fetch anomaly detection data
    async fetchAnomalies() {
        try {
            const response = await fetch(`${this.baseURL}/analytics/anomalies`, {
                headers: this.headers
            });
            
            if (!response.ok) throw new Error('Failed to fetch anomalies');
            return await response.json();
        } catch (error) {
            console.error('Error fetching anomalies:', error);
            return this.getMockAnomalies();
        }
    }

    // 🆕 Mock correlation data
    getMockCorrelationData() {
        const features = ['Tenure', 'MonthlyCharges', 'TotalCharges', 'Contract', 'Churn'];
        const n = features.length;
        const matrix = [];
        
        for (let i = 0; i < n; i++) {
            matrix[i] = [];
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    matrix[i][j] = 1.0;
                } else {
                    matrix[i][j] = Math.random() * 2 - 1; // -1 to 1
                }
            }
        }
        
        return { features, matrix };
    }

    // 🆕 Mock clustering data
    getMockClusteringData(k = 3) {
        const numPoints = 100;
        const data = [];
        
        for (let i = 0; i < numPoints; i++) {
            data.push({
                tenure: Math.random() * 72,
                monthlyCharges: Math.random() * 100 + 20,
                totalCharges: Math.random() * 8000,
                cluster: Math.floor(Math.random() * k)
            });
        }
        
        return { 
            data, 
            k,
            centroids: Array.from({length: k}, (_, i) => ({
                tenure: Math.random() * 72,
                monthlyCharges: Math.random() * 100 + 20,
                totalCharges: Math.random() * 8000
            }))
        };
    }

    // 🆕 Mock anomalies data
    getMockAnomalies() {
        const anomalies = [];
        for (let i = 0; i < 5; i++) {
            anomalies.push({
                customerId: `CUST-${9000 + i}`,
                tenure: Math.random() * 72,
                monthlyCharges: Math.random() * 200 + 100, // High charges
                totalCharges: Math.random() * 15000,
                anomalyScore: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
                reason: 'Unusual spending pattern'
            });
        }
        return anomalies;
    }

    // 🆕 Clear cache
    clearCache() {
        this.cache.clear();
    }
}

// Initialize API Connector
const apiConnector = new APIConnector();
