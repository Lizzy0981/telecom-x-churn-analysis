/**
 * INSIGHTS GENERATOR - Generación automática de insights con IA
 * Analiza datos y genera recomendaciones accionables
 */

class InsightsGenerator {
    constructor() {
        this.insights = [];
        this.rules = this.loadRules();
    }

    /**
     * Genera insights automáticos de un dataset
     */
    generateInsights(data) {
        console.log('🤖 Generating AI insights...');
        
        this.insights = [];

        // Calcular métricas básicas
        const metrics = this.calculateMetrics(data);

        // Aplicar reglas de análisis
        this.analyzeChurnRate(metrics, data);
        this.analyzeContractTypes(metrics, data);
        this.analyzeRevenue(metrics, data);
        this.analyzeTenure(metrics, data);
        this.analyzeSeniorCitizens(metrics, data);
        this.analyzeInternetService(metrics, data);
        this.analyzePaymentMethods(metrics, data);
        this.analyzeCustomerSegments(metrics, data);

        // Ordenar por prioridad
        this.insights.sort((a, b) => {
            const priority = { critical: 3, warning: 2, opportunity: 1, info: 0 };
            return priority[b.type] - priority[a.type];
        });

        console.log(`✅ Generated ${this.insights.length} insights`);
        return this.insights;
    }

    /**
     * Calcula métricas del dataset
     */
    calculateMetrics(data) {
        const total = data.length;
        const churnYes = data.filter(r => r.Churn === 'Yes').length;
        const churnRate = (churnYes / total) * 100;

        return {
            total,
            churnYes,
            churnNo: total - churnYes,
            churnRate,
            retentionRate: 100 - churnRate,
            avgTenure: data.reduce((sum, r) => sum + (r.customer?.tenure || 0), 0) / total,
            avgMonthly: data.reduce((sum, r) => sum + (r.account?.Charges?.Monthly || 0), 0) / total,
            avgTotal: data.reduce((sum, r) => sum + (parseFloat(r.account?.Charges?.Total) || 0), 0) / total,
            seniorCitizens: data.filter(r => r.customer?.SeniorCitizen === 1).length,
            monthToMonth: data.filter(r => r.account?.Contract === 'Month-to-month').length,
            oneYear: data.filter(r => r.account?.Contract === 'One year').length,
            twoYear: data.filter(r => r.account?.Contract === 'Two year').length,
            fiberOptic: data.filter(r => r.internet?.InternetService === 'Fiber optic').length,
            dsl: data.filter(r => r.internet?.InternetService === 'DSL').length,
            noInternet: data.filter(r => r.internet?.InternetService === 'No').length
        };
    }

    /**
     * Analiza tasa de churn
     */
    analyzeChurnRate(metrics, data) {
        if (metrics.churnRate > 30) {
            this.insights.push({
                type: 'critical',
                category: 'churn',
                title: '🔴 Critical Churn Rate',
                message: `Churn rate is ${metrics.churnRate.toFixed(1)}%, significantly above industry average (15-20%)`,
                impact: 'high',
                recommendation: 'Immediate action required: Review customer satisfaction, service quality, and pricing strategy',
                actions: [
                    'Conduct customer satisfaction survey',
                    'Implement retention program',
                    'Review pricing vs competitors',
                    'Improve customer support'
                ],
                metrics: {
                    current: metrics.churnRate,
                    target: 20,
                    customersAtRisk: metrics.churnYes
                }
            });
        } else if (metrics.churnRate > 20) {
            this.insights.push({
                type: 'warning',
                category: 'churn',
                title: '⚠️ Elevated Churn Rate',
                message: `Churn rate is ${metrics.churnRate.toFixed(1)}%, above recommended level`,
                impact: 'medium',
                recommendation: 'Monitor closely and implement preventive measures',
                actions: [
                    'Analyze churn reasons',
                    'Strengthen customer relationships',
                    'Offer incentives for loyalty'
                ]
            });
        } else {
            this.insights.push({
                type: 'opportunity',
                category: 'churn',
                title: '✅ Healthy Churn Rate',
                message: `Churn rate is ${metrics.churnRate.toFixed(1)}%, within healthy range`,
                impact: 'low',
                recommendation: 'Maintain current retention strategies and continue monitoring'
            });
        }
    }

    /**
     * Analiza tipos de contrato
     */
    analyzeContractTypes(metrics, data) {
        const monthToMonthChurn = data.filter(r => 
            r.account?.Contract === 'Month-to-month' && r.Churn === 'Yes'
        ).length;
        const monthToMonthChurnRate = (monthToMonthChurn / metrics.monthToMonth) * 100;

        if (monthToMonthChurnRate > 40) {
            this.insights.push({
                type: 'critical',
                category: 'contracts',
                title: '🔴 Month-to-Month High Churn',
                message: `${monthToMonthChurnRate.toFixed(1)}% of month-to-month customers are churning`,
                impact: 'high',
                recommendation: 'Aggressive campaign to convert to longer contracts',
                actions: [
                    'Offer discounts for 1-year contracts',
                    'Create loyalty rewards program',
                    'Provide contract upgrade incentives'
                ],
                potentialSavings: Math.floor(monthToMonthChurn * 0.5) // 50% conversion
            });
        }

        // Analizar distribución de contratos
        const monthToMonthPct = (metrics.monthToMonth / metrics.total) * 100;
        if (monthToMonthPct > 50) {
            this.insights.push({
                type: 'warning',
                category: 'contracts',
                title: '⚠️ Too Many Month-to-Month Contracts',
                message: `${monthToMonthPct.toFixed(1)}% of customers are on month-to-month contracts`,
                impact: 'medium',
                recommendation: 'Incentivize longer contract commitments',
                actions: [
                    'Launch contract conversion campaign',
                    'Offer first-month discount for upgrades',
                    'Bundle services with longer contracts'
                ]
            });
        }
    }

    /**
     * Analiza revenue
     */
    analyzeRevenue(metrics, data) {
        const highValueCustomers = data.filter(r => 
            (r.account?.Charges?.Monthly || 0) > 80
        );
        const highValueChurn = highValueCustomers.filter(r => r.Churn === 'Yes').length;
        const highValueChurnRate = (highValueChurn / highValueCustomers.length) * 100;

        if (highValueChurnRate > 20) {
            const lostRevenue = highValueChurn * 80 * 12; // Aproximado anual
            this.insights.push({
                type: 'critical',
                category: 'revenue',
                title: '🔴 High-Value Customer Loss',
                message: `${highValueChurn} high-value customers (>$80/mo) are churning`,
                impact: 'high',
                recommendation: 'Priority retention program for high-value customers',
                actions: [
                    'Assign dedicated account managers',
                    'Offer premium support',
                    'Create VIP loyalty program',
                    'Proactive engagement calls'
                ],
                metrics: {
                    customersLost: highValueChurn,
                    estimatedAnnualLoss: `$${lostRevenue.toLocaleString()}`
                }
            });
        }

        // Analizar oportunidades de upsell
        const lowValueCustomers = data.filter(r => 
            (r.account?.Charges?.Monthly || 0) < 40 && r.Churn === 'No'
        );
        if (lowValueCustomers.length > metrics.total * 0.3) {
            this.insights.push({
                type: 'opportunity',
                category: 'revenue',
                title: '💰 Upsell Opportunity',
                message: `${lowValueCustomers.length} low-value customers with upsell potential`,
                impact: 'medium',
                recommendation: 'Launch targeted upsell campaign',
                actions: [
                    'Offer service bundle upgrades',
                    'Promote premium features',
                    'Time-limited upgrade offers'
                ],
                potentialRevenue: `$${(lowValueCustomers.length * 20 * 12).toLocaleString()}/year`
            });
        }
    }

    /**
     * Analiza tenure
     */
    analyzeTenure(metrics, data) {
        const newCustomers = data.filter(r => (r.customer?.tenure || 0) < 6);
        const newCustomerChurn = newCustomers.filter(r => r.Churn === 'Yes').length;
        const newCustomerChurnRate = (newCustomerChurn / newCustomers.length) * 100;

        if (newCustomerChurnRate > 30) {
            this.insights.push({
                type: 'warning',
                category: 'onboarding',
                title: '⚠️ High Early-Stage Churn',
                message: `${newCustomerChurnRate.toFixed(1)}% of customers churn within first 6 months`,
                impact: 'high',
                recommendation: 'Improve onboarding and early customer experience',
                actions: [
                    'Enhanced onboarding program',
                    'First-month check-in calls',
                    'Welcome incentives',
                    'Satisfaction surveys at 30, 60, 90 days'
                ]
            });
        }
    }

    /**
     * Analiza senior citizens
     */
    analyzeSeniorCitizens(metrics, data) {
        const seniorChurn = data.filter(r => 
            r.customer?.SeniorCitizen === 1 && r.Churn === 'Yes'
        ).length;
        const seniorChurnRate = (seniorChurn / metrics.seniorCitizens) * 100;

        const nonSeniorChurn = data.filter(r => 
            r.customer?.SeniorCitizen === 0 && r.Churn === 'Yes'
        ).length;
        const nonSeniorChurnRate = (nonSeniorChurn / (metrics.total - metrics.seniorCitizens)) * 100;

        if (seniorChurnRate > nonSeniorChurnRate * 1.5) {
            this.insights.push({
                type: 'warning',
                category: 'demographics',
                title: '⚠️ Senior Citizens Higher Churn',
                message: `Senior citizens have ${(seniorChurnRate - nonSeniorChurnRate).toFixed(1)}% higher churn rate`,
                impact: 'medium',
                recommendation: 'Develop senior-friendly programs and support',
                actions: [
                    'Simplified billing options',
                    'Enhanced customer support',
                    'Senior discount programs',
                    'Easy-to-use interfaces'
                ]
            });
        }
    }

    /**
     * Analiza servicios de internet
     */
    analyzeInternetService(metrics, data) {
        const fiberChurn = data.filter(r => 
            r.internet?.InternetService === 'Fiber optic' && r.Churn === 'Yes'
        ).length;
        const fiberChurnRate = (fiberChurn / metrics.fiberOptic) * 100;

        const dslChurn = data.filter(r => 
            r.internet?.InternetService === 'DSL' && r.Churn === 'Yes'
        ).length;
        const dslChurnRate = (dslChurn / metrics.dsl) * 100;

        if (fiberChurnRate > dslChurnRate * 1.3) {
            this.insights.push({
                type: 'warning',
                category: 'services',
                title: '⚠️ Fiber Optic Service Issues',
                message: `Fiber optic customers have ${(fiberChurnRate - dslChurnRate).toFixed(1)}% higher churn`,
                impact: 'medium',
                recommendation: 'Investigate fiber service quality and pricing',
                actions: [
                    'Review fiber pricing competitiveness',
                    'Assess service quality metrics',
                    'Customer satisfaction survey',
                    'Technical support review'
                ]
            });
        }
    }

    /**
     * Analiza métodos de pago
     */
    analyzePaymentMethods(metrics, data) {
        const paymentMethods = {};
        data.forEach(r => {
            const method = r.account?.PaymentMethod;
            if (method) {
                if (!paymentMethods[method]) {
                    paymentMethods[method] = { total: 0, churn: 0 };
                }
                paymentMethods[method].total++;
                if (r.Churn === 'Yes') paymentMethods[method].churn++;
            }
        });

        let highestChurnMethod = null;
        let highestChurnRate = 0;

        for (const [method, stats] of Object.entries(paymentMethods)) {
            const rate = (stats.churn / stats.total) * 100;
            if (rate > highestChurnRate) {
                highestChurnRate = rate;
                highestChurnMethod = method;
            }
        }

        if (highestChurnRate > 35) {
            this.insights.push({
                type: 'info',
                category: 'payments',
                title: 'ℹ️ Payment Method Correlation',
                message: `Customers using ${highestChurnMethod} have ${highestChurnRate.toFixed(1)}% churn rate`,
                impact: 'low',
                recommendation: 'Consider payment method incentives or improvements'
            });
        }
    }

    /**
     * Analiza segmentos de clientes
     */
    analyzeCustomerSegments(metrics, data) {
        // Segmento de alto riesgo
        const highRisk = data.filter(r => 
            r.account?.Contract === 'Month-to-month' &&
            (r.customer?.tenure || 0) < 12 &&
            r.Churn === 'No'
        );

        if (highRisk.length > 0) {
            this.insights.push({
                type: 'opportunity',
                category: 'prevention',
                title: '🎯 High-Risk Customer Segment',
                message: `${highRisk.length} customers at high risk of churning`,
                impact: 'high',
                recommendation: 'Proactive retention campaign for at-risk customers',
                actions: [
                    'Offer contract upgrade incentives',
                    'Personalized engagement calls',
                    'Special loyalty discounts',
                    'Service satisfaction check-ins'
                ],
                targetCustomers: highRisk.length
            });
        }
    }

    /**
     * Carga reglas de análisis (extensible)
     */
    loadRules() {
        return {
            churn: {
                critical: 30,
                warning: 20,
                healthy: 15
            },
            tenure: {
                newCustomer: 6,
                established: 24,
                loyal: 48
            },
            revenue: {
                highValue: 80,
                mediumValue: 50,
                lowValue: 30
            }
        };
    }

    /**
     * Filtra insights por categoría
     */
    filterByCategory(category) {
        return this.insights.filter(i => i.category === category);
    }

    /**
     * Filtra insights por tipo
     */
    filterByType(type) {
        return this.insights.filter(i => i.type === type);
    }

    /**
     * Obtiene insights críticos
     */
    getCriticalInsights() {
        return this.filterByType('critical');
    }

    /**
     * Exporta insights
     */
    exportInsights(format = 'json') {
        switch(format) {
            case 'json':
                return JSON.stringify(this.insights, null, 2);
            case 'text':
                return this.insights.map(i => 
                    `${i.title}\n${i.message}\n${i.recommendation}\n`
                ).join('\n---\n\n');
            default:
                return this.insights;
        }
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.InsightsGenerator = InsightsGenerator;
    window.insightsGenerator = new InsightsGenerator();
    console.log('✅ InsightsGenerator loaded');
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InsightsGenerator;
}
