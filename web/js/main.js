// ============================================================================
// TELECOM X - MAIN APPLICATION
// Main application logic and initialization
// ============================================================================

class TelecomApp {
    constructor() {
        this.uploadedData = null;
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
        
        // 🆕 Load new analytics
        await this.loadCorrelationMatrix();
        await this.loadAnomalyDetection();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('✅ Telecom X Application Initialized');
    }

    // ========== ORIGINAL METHODS - PRESERVED ==========

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

        // 🆕 Upload listeners
        this.setupUploadListeners();
        
        // 🆕 Clustering listeners
        this.setupClusteringListeners();
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

    // ========== NEW METHODS - ENHANCEMENTS ==========

    // 🆕 Setup upload event listeners
    setupUploadListeners() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');
        const processDataBtn = document.getElementById('processDataBtn');
        const clearUploadBtn = document.getElementById('clearUploadBtn');

        if (!uploadZone || !fileInput) return;

        // Drag & drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // Browse button
        if (browseBtn) {
            browseBtn.addEventListener('click', () => fileInput.click());
        }

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Process button
        if (processDataBtn) {
            processDataBtn.addEventListener('click', () => this.processUploadedData());
        }

        // Clear button
        if (clearUploadBtn) {
            clearUploadBtn.addEventListener('click', () => this.clearUpload());
        }
    }

    // 🆕 Setup clustering event listeners
    setupClusteringListeners() {
        const runClusteringBtn = document.getElementById('runClusteringBtn');
        const clustersSelect = document.getElementById('clustersSelect');

        if (runClusteringBtn) {
            runClusteringBtn.addEventListener('click', async () => {
                const k = parseInt(clustersSelect?.value || 3);
                await this.runClustering(k);
            });
        }
    }

    // 🆕 Handle file upload
    async handleFileUpload(file) {
        console.log('File uploaded:', file.name);
        
        const uploadPreview = document.getElementById('uploadPreview');
        const previewContent = document.getElementById('previewContent');
        
        if (uploadPreview && previewContent) {
            uploadPreview.style.display = 'block';
            previewContent.innerHTML = `
                <div class="file-info">
                    <p><strong>📄 File:</strong> ${file.name}</p>
                    <p><strong>📊 Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
                    <p><strong>🔖 Type:</strong> ${file.type || 'Unknown'}</p>
                </div>
            `;
        }

        this.uploadedData = file;
    }

    // 🆕 Process uploaded data
    async processUploadedData() {
        if (!this.uploadedData) {
            alert('Please upload a file first');
            return;
        }

        console.log('Processing data:', this.uploadedData.name);
        
        // In production, use fileParser to parse the file
        // For now, just show success
        alert(`✅ Data processed successfully!\n\nFile: ${this.uploadedData.name}\nReady for analysis.`);
        
        // Reload dashboards with new data
        await this.loadKPIs();
        await this.loadCustomerTable();
    }

    // 🆕 Clear upload
    clearUpload() {
        this.uploadedData = null;
        const uploadPreview = document.getElementById('uploadPreview');
        const fileInput = document.getElementById('fileInput');
        
        if (uploadPreview) uploadPreview.style.display = 'none';
        if (fileInput) fileInput.value = '';
    }

    // 🆕 Run K-Means clustering
    async runClustering(k) {
        console.log(`Running K-Means clustering with k=${k}`);
        
        const clusteringData = await apiConnector.fetchClusteringData(k);
        
        if (chartRenderer && clusteringData) {
            chartRenderer.renderClustering3D('clusteringChart', clusteringData);
            this.displayClusterProfiles(clusteringData);
        }
    }

    // 🆕 Display cluster profiles
    displayClusterProfiles(clusteringData) {
        const profilesContainer = document.getElementById('clusterProfiles');
        if (!profilesContainer) return;

        const k = clusteringData.k || 3;
        let html = '<div class="cluster-cards">';
        
        for (let i = 0; i < k; i++) {
            const clusterPoints = clusteringData.data.filter(p => p.cluster === i);
            const avgTenure = clusterPoints.reduce((sum, p) => sum + p.tenure, 0) / clusterPoints.length;
            const avgCharges = clusterPoints.reduce((sum, p) => sum + p.monthlyCharges, 0) / clusterPoints.length;
            
            html += `
                <div class="cluster-card">
                    <h4>Cluster ${i + 1}</h4>
                    <p><strong>Size:</strong> ${clusterPoints.length} customers</p>
                    <p><strong>Avg Tenure:</strong> ${avgTenure.toFixed(1)} months</p>
                    <p><strong>Avg Charges:</strong> $${avgCharges.toFixed(2)}</p>
                </div>
            `;
        }
        
        html += '</div>';
        profilesContainer.innerHTML = html;
    }

    // 🆕 Load correlation matrix
    async loadCorrelationMatrix() {
        const correlationData = await apiConnector.fetchCorrelationData();
        
        if (chartRenderer && correlationData) {
            chartRenderer.renderCorrelationMatrix('correlationChart', correlationData);
        }
    }

    // 🆕 Load anomaly detection
    async loadAnomalyDetection() {
        const anomalyData = await apiConnector.fetchAnomalies();
        
        if (chartRenderer && anomalyData) {
            chartRenderer.renderAnomalyDetection('anomalyChart', anomalyData);
            this.displayAnomalyList(anomalyData);
        }
    }

    // 🆕 Display anomaly list
    displayAnomalyList(anomalyData) {
        const anomalyItems = document.getElementById('anomalyItems');
        if (!anomalyItems || !anomalyData) return;

        let html = '';
        anomalyData.forEach(anomaly => {
            html += `
                <div class="anomaly-item">
                    <div class="anomaly-header">
                        <strong>${anomaly.customerId}</strong>
                        <span class="anomaly-score">${(anomaly.anomalyScore * 100).toFixed(0)}%</span>
                    </div>
                    <p>${anomaly.reason}</p>
                    <p class="anomaly-details">
                        Tenure: ${anomaly.tenure.toFixed(0)} months | 
                        Charges: $${anomaly.monthlyCharges.toFixed(2)}
                    </p>
                </div>
            `;
        });
        
        anomalyItems.innerHTML = html;
    }
}

// Initialize Application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new TelecomApp();
});
