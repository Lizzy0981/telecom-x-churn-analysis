/**
 * FILTER MANAGER - Sistema de filtros avanzados
 * Filtros interactivos con rangos, categorías y búsqueda
 */

class FilterManager {
    constructor() {
        this.filters = {
            tenure: { min: 0, max: 72, active: false },
            monthlyCharges: { min: 0, max: 120, active: false },
            totalCharges: { min: 0, max: 9000, active: false },
            contract: { values: [], active: false },
            internetService: { values: [], active: false },
            churn: { values: [], active: false },
            gender: { values: [], active: false },
            seniorCitizen: { value: null, active: false },
            search: { query: '', active: false }
        };
        this.originalData = null;
        this.filteredData = null;
    }

    /**
     * Inicializa con datos
     */
    init(data) {
        this.originalData = data;
        this.filteredData = data;
        this.calculateRanges(data);
        return this;
    }

    /**
     * Calcula rangos automáticamente
     */
    calculateRanges(data) {
        const tenures = data.map(r => r.customer?.tenure || 0);
        const monthlyCharges = data.map(r => r.account?.Charges?.Monthly || 0);
        const totalCharges = data.map(r => parseFloat(r.account?.Charges?.Total) || 0);

        this.filters.tenure.min = Math.min(...tenures);
        this.filters.tenure.max = Math.max(...tenures);
        this.filters.monthlyCharges.min = Math.min(...monthlyCharges);
        this.filters.monthlyCharges.max = Math.max(...monthlyCharges);
        this.filters.totalCharges.min = Math.min(...totalCharges);
        this.filters.totalCharges.max = Math.max(...totalCharges);
    }

    /**
     * Aplica filtro de rango de tenure
     */
    filterByTenure(min, max) {
        this.filters.tenure = { min, max, active: true };
        return this.applyFilters();
    }

    /**
     * Aplica filtro de rango de monthly charges
     */
    filterByMonthlyCharges(min, max) {
        this.filters.monthlyCharges = { min, max, active: true };
        return this.applyFilters();
    }

    /**
     * Aplica filtro de rango de total charges
     */
    filterByTotalCharges(min, max) {
        this.filters.totalCharges = { min, max, active: true };
        return this.applyFilters();
    }

    /**
     * Aplica filtro por tipo de contrato
     */
    filterByContract(values) {
        this.filters.contract = { 
            values: Array.isArray(values) ? values : [values], 
            active: values && values.length > 0 
        };
        return this.applyFilters();
    }

    /**
     * Aplica filtro por servicio de internet
     */
    filterByInternetService(values) {
        this.filters.internetService = { 
            values: Array.isArray(values) ? values : [values], 
            active: values && values.length > 0 
        };
        return this.applyFilters();
    }

    /**
     * Aplica filtro por churn
     */
    filterByChurn(values) {
        this.filters.churn = { 
            values: Array.isArray(values) ? values : [values], 
            active: values && values.length > 0 
        };
        return this.applyFilters();
    }

    /**
     * Aplica filtro por género
     */
    filterByGender(values) {
        this.filters.gender = { 
            values: Array.isArray(values) ? values : [values], 
            active: values && values.length > 0 
        };
        return this.applyFilters();
    }

    /**
     * Aplica filtro por senior citizen
     */
    filterBySeniorCitizen(value) {
        this.filters.seniorCitizen = { value, active: value !== null };
        return this.applyFilters();
    }

    /**
     * Aplica búsqueda global
     */
    search(query) {
        this.filters.search = { query: query.toLowerCase(), active: query.length > 0 };
        return this.applyFilters();
    }

    /**
     * Aplica todos los filtros activos
     */
    applyFilters() {
        if (!this.originalData) return [];

        let filtered = this.originalData;

        // Filtro de tenure
        if (this.filters.tenure.active) {
            filtered = filtered.filter(r => {
                const tenure = r.customer?.tenure || 0;
                return tenure >= this.filters.tenure.min && tenure <= this.filters.tenure.max;
            });
        }

        // Filtro de monthly charges
        if (this.filters.monthlyCharges.active) {
            filtered = filtered.filter(r => {
                const monthly = r.account?.Charges?.Monthly || 0;
                return monthly >= this.filters.monthlyCharges.min && 
                       monthly <= this.filters.monthlyCharges.max;
            });
        }

        // Filtro de total charges
        if (this.filters.totalCharges.active) {
            filtered = filtered.filter(r => {
                const total = parseFloat(r.account?.Charges?.Total) || 0;
                return total >= this.filters.totalCharges.min && 
                       total <= this.filters.totalCharges.max;
            });
        }

        // Filtro de contract
        if (this.filters.contract.active) {
            filtered = filtered.filter(r => 
                this.filters.contract.values.includes(r.account?.Contract)
            );
        }

        // Filtro de internet service
        if (this.filters.internetService.active) {
            filtered = filtered.filter(r => 
                this.filters.internetService.values.includes(r.internet?.InternetService)
            );
        }

        // Filtro de churn
        if (this.filters.churn.active) {
            filtered = filtered.filter(r => 
                this.filters.churn.values.includes(r.Churn)
            );
        }

        // Filtro de gender
        if (this.filters.gender.active) {
            filtered = filtered.filter(r => 
                this.filters.gender.values.includes(r.customer?.gender)
            );
        }

        // Filtro de senior citizen
        if (this.filters.seniorCitizen.active) {
            filtered = filtered.filter(r => 
                r.customer?.SeniorCitizen === this.filters.seniorCitizen.value
            );
        }

        // Búsqueda global
        if (this.filters.search.active) {
            filtered = filtered.filter(r => this.matchesSearch(r, this.filters.search.query));
        }

        this.filteredData = filtered;
        return filtered;
    }

    /**
     * Verifica si un registro coincide con la búsqueda
     */
    matchesSearch(record, query) {
        const searchableFields = [
            record.customerID,
            record.Churn,
            record.customer?.gender,
            record.customer?.Partner,
            record.customer?.Dependents,
            record.phone?.PhoneService,
            record.internet?.InternetService,
            record.account?.Contract,
            record.account?.PaymentMethod,
            String(record.customer?.tenure),
            String(record.account?.Charges?.Monthly),
            String(record.account?.Charges?.Total)
        ];

        return searchableFields.some(field => 
            field && String(field).toLowerCase().includes(query)
        );
    }

    /**
     * Limpia todos los filtros
     */
    clearAll() {
        for (const key in this.filters) {
            if (this.filters[key].active !== undefined) {
                this.filters[key].active = false;
            }
            if (this.filters[key].values !== undefined) {
                this.filters[key].values = [];
            }
            if (this.filters[key].query !== undefined) {
                this.filters[key].query = '';
            }
        }
        this.filteredData = this.originalData;
        return this.originalData;
    }

    /**
     * Limpia un filtro específico
     */
    clearFilter(filterName) {
        if (this.filters[filterName]) {
            this.filters[filterName].active = false;
            if (this.filters[filterName].values !== undefined) {
                this.filters[filterName].values = [];
            }
            if (this.filters[filterName].query !== undefined) {
                this.filters[filterName].query = '';
            }
        }
        return this.applyFilters();
    }

    /**
     * Obtiene estadísticas de filtrado
     */
    getFilterStats() {
        return {
            originalCount: this.originalData?.length || 0,
            filteredCount: this.filteredData?.length || 0,
            filteredPercentage: this.originalData?.length > 0
                ? ((this.filteredData?.length / this.originalData.length) * 100).toFixed(1)
                : 0,
            activeFilters: Object.values(this.filters).filter(f => f.active).length
        };
    }

    /**
     * Obtiene filtros activos
     */
    getActiveFilters() {
        const active = {};
        for (const [key, filter] of Object.entries(this.filters)) {
            if (filter.active) {
                active[key] = filter;
            }
        }
        return active;
    }

    /**
     * Exporta configuración de filtros
     */
    exportConfig() {
        return JSON.stringify(this.filters, null, 2);
    }

    /**
     * Importa configuración de filtros
     */
    importConfig(config) {
        try {
            const parsed = typeof config === 'string' ? JSON.parse(config) : config;
            this.filters = parsed;
            return this.applyFilters();
        } catch (error) {
            console.error('Error importing filter config:', error);
            return this.filteredData;
        }
    }

    /**
     * Crea preset de filtros
     */
    createPreset(name, description = '') {
        return {
            name,
            description,
            filters: JSON.parse(JSON.stringify(this.filters)),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Aplica preset
     */
    applyPreset(preset) {
        this.filters = JSON.parse(JSON.stringify(preset.filters));
        return this.applyFilters();
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.FilterManager = FilterManager;
    window.filterManager = new FilterManager();
    console.log('✅ FilterManager loaded');
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterManager;
}
