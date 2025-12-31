// ============================================================================
// TELECOM X - MAIN APPLICATION
// Main application logic and initialization
// ============================================================================

class TelecomApp {
    constructor() {
        this.init();
    }

    async init() {
        // Create quantum particles background
        this.createQuantumParticles();
        
        // Load KPIs
        await this.loadKPIs();
        
        // Load charts
        if (typeof chartRenderer !== 'undefined') {
            chartRenderer.updateAllCharts();
        }
        
        // Load customer table
        await this.loadCustomerTable();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Telecom X Application Initialized');
    }

    createQuantumParticles() {
        const container = document.getElementById('quantumParticles');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            container.appendChild(particle);
        }
    }

    async loadKPIs() {
        const kpis = await apiConnector.fetchKPIs();
        
        document.getElementById('totalCustomers').textContent = kpis.totalCustomers || 0;
        document.getElementById('churnRate').textContent = (kpis.churnRate || 0) + '%';
        document.getElementById('retentionRate').textContent = (kpis.retentionRate || 0) + '%';
        document.getElementById('avgCharges').textContent = '$' + (kpis.avgMonthlyCharges || 0).toFixed(2);
        document.getElementById('highRisk').textContent = kpis.highRiskCustomers || 0;
        document.getElementById('avgTenure').textContent = (kpis.avgTenure || 0).toFixed(1) + ' mo';
    }

    async loadCustomerTable() {
        const customers = await apiConnector.fetchCustomers();
        const tbody = document.getElementById('customersTableBody');
        
        if (!tbody) return;
        
        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.id}</td>
                <td><span class="badge badge-info">${customer.segment}</span></td>
                <td>${customer.tenure} months</td>
                <td>$${customer.monthlyCharges.toFixed(2)}</td>
                <td><span class="badge ${customer.riskScore > 70 ? 'badge-error' : customer.riskScore > 40 ? 'badge-warning' : 'badge-success'}">${customer.riskScore}</span></td>
                <td><span class="badge ${customer.churnStatus === 'Active' ? 'badge-success' : 'badge-error'}">${customer.churnStatus}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="app.viewCustomer('${customer.id}')">View</button>
                </td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        // Search table
        const searchInput = document.getElementById('searchTable');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterTable(e.target.value));
        }

        // Filter segment
        const filterSegment = document.getElementById('filterSegment');
        if (filterSegment) {
            filterSegment.addEventListener('change', (e) => this.filterBySegment(e.target.value));
        }
    }

    filterTable(query) {
        const rows = document.querySelectorAll('#customersTableBody tr');
        const lowerQuery = query.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    }

    filterBySegment(segment) {
        const rows = document.querySelectorAll('#customersTableBody tr');
        
        rows.forEach(row => {
            if (!segment) {
                row.style.display = '';
            } else {
                const segmentCell = row.querySelector('.badge-info');
                row.style.display = segmentCell && segmentCell.textContent === segment ? '' : 'none';
            }
        });
    }

    async generateReport(reportType, format) {
        alert(`Generating ${reportType} report in ${format} format...`);
        await apiConnector.generateReport(reportType, format);
    }

    viewCustomer(customerId) {
        alert(`Viewing details for customer: ${customerId}`);
        // In production, this would open a modal or navigate to detail page
    }

    showAnalytics() {
        alert('Analytics page coming soon!');
    }

    showReports() {
        const reportsSection = document.querySelector('.reports-center');
        if (reportsSection) {
            reportsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize Application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TelecomApp();
});
