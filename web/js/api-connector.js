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
    }

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
}

// Initialize API Connector
const apiConnector = new APIConnector();
