/**
 * COMPARISON ENGINE - Comparación de múltiples datasets
 * Compara KPIs, distribuciones, tendencias entre datasets
 */

class ComparisonEngine {
    constructor() {
        this.comparisonResults = null;
    }

    /**
     * Compara dos o más datasets
     * @param {Array} datasets - Array de datasets a comparar
     * @returns {Object} - Resultados de comparación
     */
    compareDatasets(datasets) {
        if (!datasets || datasets.length < 2) {
            throw new Error('Need at least 2 datasets to compare');
        }

        console.log(`⚖️ Comparing ${datasets.length} datasets...`);

        const results = {
            totalDatasets: datasets.length,
            comparisons: [],
            summary: this.generateSummary(datasets),
            recommendations: []
        };

        // Comparar cada par de datasets
        for (let i = 0; i < datasets.length - 1; i++) {
            for (let j = i + 1; j < datasets.length; j++) {
                results.comparisons.push(
                    this.comparePair(datasets[i], datasets[j], i, j)
                );
            }
        }

        // Generar recomendaciones
        results.recommendations = this.generateRecommendations(results);

        this.comparisonResults = results;
        console.log('✅ Comparison complete');
        return results;
    }

    /**
     * Compara un par de datasets
     */
    comparePair(dataset1, dataset2, index1, index2) {
        const kpis1 = this.calculateKPIs(dataset1);
        const kpis2 = this.calculateKPIs(dataset2);

        return {
            dataset1Index: index1,
            dataset2Index: index2,
            kpis: {
                dataset1: kpis1,
                dataset2: kpis2,
                differences: this.calculateDifferences(kpis1, kpis2)
            },
            distributions: this.compareDistributions(dataset1, dataset2),
            insights: this.generateInsights(kpis1, kpis2)
        };
    }

    /**
     * Calcula KPIs de un dataset
     */
    calculateKPIs(data) {
        const total = data.length;
        const churnYes = data.filter(r => r.Churn === 'Yes').length;
        const churnRate = (churnYes / total) * 100;
        
        const avgTenure = data.reduce((sum, r) => sum + (r.customer?.tenure || 0), 0) / total;
        const avgMonthly = data.reduce((sum, r) => sum + (r.account?.Charges?.Monthly || 0), 0) / total;
        const avgTotal = data.reduce((sum, r) => sum + (parseFloat(r.account?.Charges?.Total) || 0), 0) / total;

        const seniorCitizens = data.filter(r => r.customer?.SeniorCitizen === 1).length;
        const monthToMonth = data.filter(r => r.account?.Contract === 'Month-to-month').length;

        return {
            totalCustomers: total,
            churnCount: churnYes,
            churnRate: Math.round(churnRate * 100) / 100,
            retentionRate: Math.round((100 - churnRate) * 100) / 100,
            avgTenure: Math.round(avgTenure * 10) / 10,
            avgMonthly: Math.round(avgMonthly * 100) / 100,
            avgTotal: Math.round(avgTotal * 100) / 100,
            seniorCitizens: seniorCitizens,
            seniorRate: Math.round((seniorCitizens / total) * 10000) / 100,
            monthToMonthCount: monthToMonth,
            monthToMonthRate: Math.round((monthToMonth / total) * 10000) / 100
        };
    }

    /**
     * Calcula diferencias entre KPIs
     */
    calculateDifferences(kpis1, kpis2) {
        const diff = {};
        
        for (const key in kpis1) {
            if (typeof kpis1[key] === 'number' && typeof kpis2[key] === 'number') {
                const absolute = kpis2[key] - kpis1[key];
                const percentage = kpis1[key] === 0 ? 0 : ((absolute / kpis1[key]) * 100);
                
                diff[key] = {
                    absolute: Math.round(absolute * 100) / 100,
                    percentage: Math.round(percentage * 100) / 100,
                    direction: absolute > 0 ? 'increase' : absolute < 0 ? 'decrease' : 'same'
                };
            }
        }

        return diff;
    }

    /**
     * Compara distribuciones
     */
    compareDistributions(dataset1, dataset2) {
        return {
            byContract: this.compareByCategory(dataset1, dataset2, 'account.Contract'),
            byInternet: this.compareByCategory(dataset1, dataset2, 'internet.InternetService'),
            byGender: this.compareByCategory(dataset1, dataset2, 'customer.gender')
        };
    }

    /**
     * Compara por categoría
     */
    compareByCategory(dataset1, dataset2, path) {
        const getValue = (obj, path) => {
            return path.split('.').reduce((o, k) => o && o[k], obj);
        };

        const count1 = {};
        const count2 = {};

        dataset1.forEach(record => {
            const value = getValue(record, path);
            if (value) count1[value] = (count1[value] || 0) + 1;
        });

        dataset2.forEach(record => {
            const value = getValue(record, path);
            if (value) count2[value] = (count2[value] || 0) + 1;
        });

        const allKeys = new Set([...Object.keys(count1), ...Object.keys(count2)]);
        const comparison = {};

        allKeys.forEach(key => {
            const val1 = count1[key] || 0;
            const val2 = count2[key] || 0;
            const pct1 = (val1 / dataset1.length) * 100;
            const pct2 = (val2 / dataset2.length) * 100;

            comparison[key] = {
                dataset1: { count: val1, percentage: Math.round(pct1 * 100) / 100 },
                dataset2: { count: val2, percentage: Math.round(pct2 * 100) / 100 },
                difference: Math.round((pct2 - pct1) * 100) / 100
            };
        });

        return comparison;
    }

    /**
     * Genera insights de la comparación
     */
    generateInsights(kpis1, kpis2) {
        const insights = [];

        // Churn rate
        const churnDiff = kpis2.churnRate - kpis1.churnRate;
        if (Math.abs(churnDiff) > 5) {
            insights.push({
                type: churnDiff > 0 ? 'warning' : 'positive',
                message: `Churn rate ${churnDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(churnDiff).toFixed(1)}%`,
                metric: 'churnRate',
                severity: Math.abs(churnDiff) > 10 ? 'high' : 'medium'
            });
        }

        // Customer growth
        const customerDiff = kpis2.totalCustomers - kpis1.totalCustomers;
        const customerPct = (customerDiff / kpis1.totalCustomers) * 100;
        if (Math.abs(customerPct) > 10) {
            insights.push({
                type: customerDiff > 0 ? 'positive' : 'warning',
                message: `Customer base ${customerDiff > 0 ? 'grew' : 'shrunk'} by ${Math.abs(customerPct).toFixed(1)}% (${Math.abs(customerDiff)} customers)`,
                metric: 'totalCustomers',
                severity: Math.abs(customerPct) > 20 ? 'high' : 'medium'
            });
        }

        // Revenue
        const revenueDiff = kpis2.avgMonthly - kpis1.avgMonthly;
        const revenuePct = (revenueDiff / kpis1.avgMonthly) * 100;
        if (Math.abs(revenuePct) > 5) {
            insights.push({
                type: revenueDiff > 0 ? 'positive' : 'warning',
                message: `Average monthly revenue ${revenueDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(revenuePct).toFixed(1)}% ($${Math.abs(revenueDiff).toFixed(2)})`,
                metric: 'avgMonthly',
                severity: 'medium'
            });
        }

        return insights;
    }

    /**
     * Genera resumen general
     */
    generateSummary(datasets) {
        const summary = {
            totalCustomers: 0,
            avgChurnRate: 0,
            avgTenure: 0,
            avgMonthly: 0
        };

        datasets.forEach(dataset => {
            const kpis = this.calculateKPIs(dataset);
            summary.totalCustomers += kpis.totalCustomers;
            summary.avgChurnRate += kpis.churnRate;
            summary.avgTenure += kpis.avgTenure;
            summary.avgMonthly += kpis.avgMonthly;
        });

        const n = datasets.length;
        summary.avgChurnRate = Math.round((summary.avgChurnRate / n) * 100) / 100;
        summary.avgTenure = Math.round((summary.avgTenure / n) * 10) / 10;
        summary.avgMonthly = Math.round((summary.avgMonthly / n) * 100) / 100;

        return summary;
    }

    /**
     * Genera recomendaciones basadas en comparación
     */
    generateRecommendations(results) {
        const recommendations = [];

        // Analizar tendencias de churn
        const churnTrends = results.comparisons.map(c => 
            c.kpis.differences.churnRate
        );

        const increasingChurn = churnTrends.filter(t => t.direction === 'increase').length;
        if (increasingChurn > churnTrends.length / 2) {
            recommendations.push({
                priority: 'high',
                category: 'retention',
                message: 'Churn rate is increasing across datasets. Consider implementing retention strategies.',
                actions: ['Review customer satisfaction', 'Analyze contract types', 'Improve support services']
            });
        }

        return recommendations;
    }

    /**
     * Exporta resultados de comparación
     */
    exportComparison(format = 'json') {
        if (!this.comparisonResults) {
            throw new Error('No comparison results available');
        }

        switch(format) {
            case 'json':
                return JSON.stringify(this.comparisonResults, null, 2);
            case 'csv':
                return this.toCSV(this.comparisonResults);
            default:
                return this.comparisonResults;
        }
    }

    /**
     * Convierte a CSV
     */
    toCSV(results) {
        const rows = [];
        rows.push('Metric,Dataset 1,Dataset 2,Difference,Change %');

        results.comparisons.forEach(comparison => {
            const kpis1 = comparison.kpis.dataset1;
            const kpis2 = comparison.kpis.dataset2;
            const diff = comparison.kpis.differences;

            for (const key in kpis1) {
                if (diff[key]) {
                    rows.push([
                        key,
                        kpis1[key],
                        kpis2[key],
                        diff[key].absolute,
                        diff[key].percentage + '%'
                    ].join(','));
                }
            }
        });

        return rows.join('\n');
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.ComparisonEngine = ComparisonEngine;
    window.comparisonEngine = new ComparisonEngine();
    console.log('✅ ComparisonEngine loaded');
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComparisonEngine;
}
