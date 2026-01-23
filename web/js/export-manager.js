/**
 * EXPORT MANAGER - Exportación de datos en múltiples formatos
 * Soporta: CSV, Excel, JSON, PDF, HTML, PNG, ZIP
 */

class ExportManager {
    constructor() {
        this.exportHistory = [];
    }

    /**
     * Exporta datos en el formato especificado
     */
    async export(data, format, filename = null) {
        console.log(`📥 Exporting ${data.length} records as ${format}...`);

        filename = filename || `telecom_export_${this.getTimestamp()}.${format}`;

        try {
            let result;
            switch(format.toLowerCase()) {
                case 'csv':
                    result = await this.exportCSV(data, filename);
                    break;
                case 'xlsx':
                case 'excel':
                    result = await this.exportExcel(data, filename);
                    break;
                case 'json':
                    result = await this.exportJSON(data, filename);
                    break;
                case 'pdf':
                    result = await this.exportPDF(data, filename);
                    break;
                case 'html':
                    result = await this.exportHTML(data, filename);
                    break;
                case 'png':
                case 'image':
                    result = await this.exportImage(filename);
                    break;
                case 'zip':
                    result = await this.exportZIP(data, filename);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            this.addToHistory(format, filename, data.length);
            console.log(`✅ Export complete: ${filename}`);
            return result;
        } catch (error) {
            console.error('❌ Export error:', error);
            throw error;
        }
    }

    /**
     * Exporta como CSV
     */
    async exportCSV(data, filename) {
        // Aplanar estructura anidada
        const flatData = this.flattenData(data);

        // Generar CSV
        const headers = Object.keys(flatData[0] || {});
        const csv = [
            headers.join(','),
            ...flatData.map(row => 
                headers.map(h => this.escapeCSV(row[h])).join(',')
            )
        ].join('\n');

        this.downloadFile(csv, filename, 'text/csv');
        return { success: true, format: 'csv', filename };
    }

    /**
     * Exporta como Excel
     */
    async exportExcel(data, filename) {
        if (typeof XLSX === 'undefined') {
            throw new Error('SheetJS library not loaded');
        }

        const flatData = this.flattenData(data);
        const ws = XLSX.utils.json_to_sheet(flatData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');

        // Agregar hoja de estadísticas
        const stats = this.calculateStats(data);
        const wsStats = XLSX.utils.json_to_sheet([stats]);
        XLSX.utils.book_append_sheet(wb, wsStats, 'Statistics');

        XLSX.writeFile(wb, filename);
        return { success: true, format: 'xlsx', filename };
    }

    /**
     * Exporta como JSON
     */
    async exportJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, filename, 'application/json');
        return { success: true, format: 'json', filename };
    }

    /**
     * Exporta como PDF
     */
    async exportPDF(data, filename) {
        if (typeof jspdf === 'undefined') {
            throw new Error('jsPDF library not loaded');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.text('Telecom X - Customer Churn Analysis', 20, 20);

        // Estadísticas
        doc.setFontSize(12);
        const stats = this.calculateStats(data);
        let y = 40;
        
        doc.text(`Total Customers: ${stats.total}`, 20, y);
        y += 10;
        doc.text(`Churn Rate: ${stats.churnRate}%`, 20, y);
        y += 10;
        doc.text(`Retention Rate: ${stats.retentionRate}%`, 20, y);
        y += 10;
        doc.text(`Avg Tenure: ${stats.avgTenure} months`, 20, y);
        y += 10;
        doc.text(`Avg Monthly Charges: $${stats.avgMonthly}`, 20, y);

        // Nota
        y += 20;
        doc.setFontSize(10);
        doc.text('Generated: ' + new Date().toLocaleString(), 20, y);

        doc.save(filename);
        return { success: true, format: 'pdf', filename };
    }

    /**
     * Exporta como HTML
     */
    async exportHTML(data, filename) {
        const stats = this.calculateStats(data);
        const flatData = this.flattenData(data);

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telecom X - Export Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #2563eb; }
        .stats { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .stat { background: white; padding: 15px; border-radius: 6px; }
        .stat-label { color: #6b7280; font-size: 14px; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; color: #374151; }
        tr:hover { background: #f9fafb; }
        .footer { margin-top: 40px; color: #6b7280; font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <h1>📊 Telecom X - Customer Churn Analysis</h1>
    
    <div class="stats">
        <h2>Key Metrics</h2>
        <div class="stats-grid">
            <div class="stat">
                <div class="stat-label">Total Customers</div>
                <div class="stat-value">${stats.total}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Churn Rate</div>
                <div class="stat-value">${stats.churnRate}%</div>
            </div>
            <div class="stat">
                <div class="stat-label">Retention Rate</div>
                <div class="stat-value">${stats.retentionRate}%</div>
            </div>
            <div class="stat">
                <div class="stat-label">Avg Tenure</div>
                <div class="stat-value">${stats.avgTenure} mo</div>
            </div>
            <div class="stat">
                <div class="stat-label">Avg Monthly</div>
                <div class="stat-value">$${stats.avgMonthly}</div>
            </div>
        </div>
    </div>

    <h2>Customer Data (First 100 records)</h2>
    <table>
        <thead>
            <tr>
                ${Object.keys(flatData[0] || {}).map(key => `<th>${key}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${flatData.slice(0, 100).map(row => `
                <tr>
                    ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        Generated: ${new Date().toLocaleString()} | Telecom X Dashboard
    </div>
</body>
</html>
        `;

        this.downloadFile(html, filename, 'text/html');
        return { success: true, format: 'html', filename };
    }

    /**
     * Exporta gráficos como imagen
     */
    async exportImage(filename) {
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas library not loaded');
        }

        const dashboard = document.querySelector('.dashboard-container') || document.body;
        const canvas = await html2canvas(dashboard);
        
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        });

        return { success: true, format: 'png', filename };
    }

    /**
     * Exporta todo como ZIP
     */
    async exportZIP(data, filename) {
        // Simplificado: exportar CSV, JSON y PDF por separado
        // En producción usaríamos JSZip
        await this.exportCSV(data, 'data.csv');
        await this.exportJSON(data, 'data.json');
        await this.exportPDF(data, 'report.pdf');
        
        return { success: true, format: 'zip', files: ['data.csv', 'data.json', 'report.pdf'] };
    }

    /**
     * Aplana estructura de datos anidada
     */
    flattenData(data) {
        return data.map(record => ({
            customerID: record.customerID,
            Churn: record.Churn,
            gender: record.customer?.gender,
            SeniorCitizen: record.customer?.SeniorCitizen,
            Partner: record.customer?.Partner,
            Dependents: record.customer?.Dependents,
            tenure: record.customer?.tenure,
            PhoneService: record.phone?.PhoneService,
            MultipleLines: record.phone?.MultipleLines,
            InternetService: record.internet?.InternetService,
            OnlineSecurity: record.internet?.OnlineSecurity,
            OnlineBackup: record.internet?.OnlineBackup,
            DeviceProtection: record.internet?.DeviceProtection,
            TechSupport: record.internet?.TechSupport,
            StreamingTV: record.internet?.StreamingTV,
            StreamingMovies: record.internet?.StreamingMovies,
            Contract: record.account?.Contract,
            PaperlessBilling: record.account?.PaperlessBilling,
            PaymentMethod: record.account?.PaymentMethod,
            MonthlyCharges: record.account?.Charges?.Monthly,
            TotalCharges: record.account?.Charges?.Total
        }));
    }

    /**
     * Calcula estadísticas básicas
     */
    calculateStats(data) {
        const total = data.length;
        const churnYes = data.filter(r => r.Churn === 'Yes').length;
        const churnRate = ((churnYes / total) * 100).toFixed(2);
        const avgTenure = (data.reduce((sum, r) => sum + (r.customer?.tenure || 0), 0) / total).toFixed(1);
        const avgMonthly = (data.reduce((sum, r) => sum + (r.account?.Charges?.Monthly || 0), 0) / total).toFixed(2);

        return {
            total,
            churnYes,
            churnNo: total - churnYes,
            churnRate,
            retentionRate: (100 - churnRate).toFixed(2),
            avgTenure,
            avgMonthly
        };
    }

    /**
     * Escapa valores para CSV
     */
    escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    /**
     * Descarga archivo
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Genera timestamp para nombres de archivo
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    }

    /**
     * Agrega al historial
     */
    addToHistory(format, filename, recordCount) {
        this.exportHistory.push({
            format,
            filename,
            recordCount,
            timestamp: new Date().toISOString()
        });

        // Mantener solo últimas 20
        if (this.exportHistory.length > 20) {
            this.exportHistory = this.exportHistory.slice(-20);
        }
    }

    /**
     * Obtiene historial de exportaciones
     */
    getHistory() {
        return this.exportHistory;
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.ExportManager = ExportManager;
    window.exportManager = new ExportManager();
    console.log('✅ ExportManager loaded');
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportManager;
}
