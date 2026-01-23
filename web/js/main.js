// ============================================================================
// TELECOM X - MAIN APPLICATION (VERSIÓN COMPLETA Y DEFINITIVA)
// Main application logic with all features included
// ============================================================================

class TelecomApp {
    constructor() {
        this.uploadedFiles = []; // Múltiples archivos
        this.selectedDemo = null; // Demo seleccionado
        this.currentData = null; // Datos actuales
        this.dataLoaded = false; // Flag para saber si hay datos cargados
        this.init();
    }

    async init() {
        // Create quantum particles background
        this.createQuantumParticles();
        
        // 🆕 NUEVA LÓGICA: Página vacía hasta que usuario cargue datos
        this.showEmptyState();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup demo selector
        this.setupDemoSelector();
        
        console.log('✅ Telecom X Application Initialized (Empty State)');
    }

    // 🆕 Mostrar estado vacío
    showEmptyState() {
        // KPIs vacíos
        document.getElementById('totalCustomers').textContent = '-';
        document.getElementById('churnRate').textContent = '-';
        document.getElementById('retentionRate').textContent = '-';
        document.getElementById('avgCharges').textContent = '-';
        document.getElementById('highRisk').textContent = '-';
        document.getElementById('avgTenure').textContent = '-';
        
        // Mensaje en charts
        const chartIds = ['churnDistributionChart', 'churnByContractChart', 'revenueChart', 'tenureChart'];
        chartIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:300px;color:#ADB5BD;font-size:1.2rem;">📊 Load data to visualize</div>';
            }
        });
        
        // Tabla vacía
        const tbody = document.getElementById('customersTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#ADB5BD;">📂 Upload data or select a demo dataset to view customers</td></tr>';
        }
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

        // Upload listeners
        this.setupUploadListeners();
        
        // Clustering listeners
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
    }

    showAnalytics() {
        const clusteringSection = document.getElementById('clusteringSection');
        if (clusteringSection) {
            clusteringSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    showReports() {
        const reportsSection = document.querySelector('.reports-center');
        if (reportsSection) {
            reportsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 🆕 Setup demo selector
    setupDemoSelector() {
        const demoCards = document.querySelectorAll('.demo-card');
        demoCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active from all
                demoCards.forEach(c => c.classList.remove('active'));
                // Add active to clicked
                card.classList.add('active');
                // Store selected demo
                this.selectedDemo = card.dataset.demo;
                console.log('Demo selected:', this.selectedDemo);
            });
        });
    }

    // 🆕 Setup upload event listeners (MEJORADO - múltiples archivos)
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
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                this.handleMultipleFiles(files);
            }
        });

        // Browse button
        if (browseBtn) {
            browseBtn.addEventListener('click', () => fileInput.click());
        }

        // File input change - MÚLTIPLES ARCHIVOS
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                this.handleMultipleFiles(files);
            }
        });

        // Process button
        if (processDataBtn) {
            processDataBtn.addEventListener('click', () => this.processData());
        }

        // Clear button
        if (clearUploadBtn) {
            clearUploadBtn.addEventListener('click', () => this.clearData());
        }
    }

    // 🆕 Handle MÚLTIPLES archivos
    handleMultipleFiles(files) {
        this.uploadedFiles = files;
        const uploadPreview = document.getElementById('uploadPreview');
        const previewContent = document.getElementById('previewContent');
        
        if (uploadPreview && previewContent) {
            uploadPreview.style.display = 'block';
            
            let html = '<div class="files-list">';
            files.forEach((file, index) => {
                html += `
                    <div class="file-item">
                        <span class="file-icon">📄</span>
                        <div class="file-details">
                            <strong>${file.name}</strong>
                            <small>${(file.size / 1024).toFixed(2)} KB</small>
                        </div>
                    </div>
                `;
            });
            html += `</div>
                    <p style="margin-top:15px;color:var(--text-accent);">
                        ✅ ${files.length} file(s) ready to process
                    </p>`;
            
            previewContent.innerHTML = html;
        }
        
        // Deseleccionar demo si había uno seleccionado
        this.selectedDemo = null;
        document.querySelectorAll('.demo-card').forEach(card => card.classList.remove('active'));
    }

    // 🆕 Procesar datos (demo o archivos)
    async processData() {
        // Opción 1: Demo seleccionado
        if (this.selectedDemo) {
            await this.loadDemoData(this.selectedDemo);
            return;
        }
        
        // Opción 2: Archivos cargados
        if (this.uploadedFiles.length > 0) {
            await this.loadUploadedData();
            return;
        }
        
        // Ninguna opción
        alert('⚠️ Please select a demo dataset or upload your own files first.');
    }

    // 🆕 Cargar datos de demo
    async loadDemoData(demoName) {
        console.log('Loading demo:', demoName);
        
        try {
            // Fetch demo file
            const response = await fetch(`demo-datasets/${demoName}.csv`);
            if (!response.ok) throw new Error('Demo file not found');
            
            const csvText = await response.text();
            
            // Parse CSV con Papa Parse
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                complete: (results) => {
                    this.currentData = results.data;
                    this.dataLoaded = true;
                    this.updateAllSections();
                    alert(`✅ Demo "${demoName}" loaded successfully!\n\n${results.data.length} records processed.`);
                },
                error: (error) => {
                    console.error('Parse error:', error);
                    alert('❌ Error parsing demo data');
                }
            });
        } catch (error) {
            console.error('Error loading demo:', error);
            alert(`❌ Error loading demo: ${error.message}`);
        }
    }

    // 🆕 Cargar datos de archivos subidos (SOPORTA 8 FORMATOS)
    async loadUploadedData() {
        console.log(`Processing ${this.uploadedFiles.length} file(s)...`);
        
        if (this.uploadedFiles.length === 0) {
            alert('⚠️ No files uploaded');
            return;
        }
        
        // Procesar primer archivo (o combinar múltiples en el futuro)
        const file = this.uploadedFiles[0];
        const extension = file.name.split('.').pop().toLowerCase();
        
        console.log(`Parsing ${file.name} as ${extension.toUpperCase()}`);
        
        try {
            // Usar fileParser para todos los formatos (CSV, XLSX, XLS, JSON, PDF, XML, TSV, TXT)
            if (typeof fileParser !== 'undefined') {
                const parsed = await fileParser.parseFile(file);
                this.currentData = parsed.data;
                this.dataLoaded = true;
                this.updateAllSections();
                alert(`✅ File "${file.name}" processed successfully!\n\nFormat: ${extension.toUpperCase()}\nRecords: ${parsed.data.length}`);
            } else {
                // Fallback: Papa Parse para CSV/TSV
                Papa.parse(file, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        this.currentData = results.data;
                        this.dataLoaded = true;
                        this.updateAllSections();
                        alert(`✅ File "${file.name}" processed successfully!\n\n${results.data.length} records loaded.`);
                    },
                    error: (error) => {
                        console.error('Parse error:', error);
                        alert('❌ Error processing file');
                    }
                });
            }
        } catch (error) {
            console.error('Error processing file:', error);
            alert(`❌ Error processing file: ${error.message}`);
        }
    }

    // 🆕 Actualizar todas las secciones con datos
    async updateAllSections() {
        if (!this.dataLoaded || !this.currentData) return;
        
        console.log('Updating all sections with', this.currentData.length, 'records');
        
        // Actualizar KPIs
        await this.loadKPIs();
        
        // Actualizar tabla
        await this.loadCustomerTable();
        
        // Actualizar charts
        if (typeof chartRenderer !== 'undefined') {
            chartRenderer.updateAllCharts();
        }
        
        // Actualizar clustering si está visible
        await this.loadCorrelationMatrix();
        await this.loadAnomalyDetection();
        
        console.log('✅ All sections updated');
    }

    // 🆕 Limpiar datos (vuelve a empty state)
    clearData() {
        this.uploadedFiles = [];
        this.selectedDemo = null;
        this.currentData = null;
        this.dataLoaded = false;
        
        const uploadPreview = document.getElementById('uploadPreview');
        const fileInput = document.getElementById('fileInput');
        
        if (uploadPreview) uploadPreview.style.display = 'none';
        if (fileInput) fileInput.value = '';
        
        // Deseleccionar demos
        document.querySelectorAll('.demo-card').forEach(card => card.classList.remove('active'));
        
        // Volver a estado vacío
        this.showEmptyState();
        
        console.log('✅ Data cleared - back to empty state');
    }

    // Setup clustering event listeners
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

    // Run K-Means clustering
    async runClustering(k) {
        console.log(`Running K-Means clustering with k=${k}`);
        
        const clusteringData = await apiConnector.fetchClusteringData(k);
        
        if (chartRenderer && clusteringData) {
            chartRenderer.renderClustering3D('clusteringChart', clusteringData);
            this.displayClusterProfiles(clusteringData);
        }
    }

    // Display cluster profiles (FIX: empieza en Cluster 1)
    displayClusterProfiles(clusteringData) {
        const profilesContainer = document.getElementById('clusterProfiles');
        if (!profilesContainer) return;

        const k = clusteringData.k || 3;
        let html = '<div class="cluster-cards">';
        
        for (let i = 0; i < k; i++) {
            const clusterPoints = clusteringData.data.filter(p => p.cluster === i);
            
            const avgTenure = clusterPoints.length > 0 
                ? clusterPoints.reduce((sum, p) => sum + p.tenure, 0) / clusterPoints.length 
                : 0;
            const avgCharges = clusterPoints.length > 0 
                ? clusterPoints.reduce((sum, p) => sum + p.monthlyCharges, 0) / clusterPoints.length 
                : 0;
            
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

    // Load correlation matrix
    async loadCorrelationMatrix() {
        const correlationData = await apiConnector.fetchCorrelationData();
        
        if (chartRenderer && correlationData) {
            chartRenderer.renderCorrelationMatrix('correlationChart', correlationData);
        }
    }

    // Load anomaly detection
    async loadAnomalyDetection() {
        const anomalyData = await apiConnector.fetchAnomalies();
        
        if (chartRenderer && anomalyData) {
            chartRenderer.renderAnomalyDetection('anomalyChart', anomalyData);
            this.displayAnomalyList(anomalyData);
        }
    }

    // Display anomaly list
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
