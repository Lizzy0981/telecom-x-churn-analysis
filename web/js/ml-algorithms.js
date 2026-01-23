/**
 * ML ALGORITHMS - Machine Learning en JavaScript
 * Implementa: K-Means Clustering, Correlation Matrix, Anomaly Detection
 * Sin dependencias externas - JavaScript puro
 */

class MLAlgorithms {
    constructor() {
        this.variables = ['tenure', 'MonthlyCharges', 'TotalCharges', 'SeniorCitizen', 'Churn'];
    }

    // ========================================
    // K-MEANS CLUSTERING
    // ========================================

    /**
     * Algoritmo K-Means Clustering
     * @param {Array} data - Dataset
     * @param {Number} k - Número de clusters (2-5)
     * @param {Number} maxIterations - Máximo de iteraciones
     * @returns {Object} - {clusters, centroids, iterations}
     */
    kMeans(data, k = 3, maxIterations = 100) {
        console.log(`🎯 Running K-Means with k=${k}...`);
        
        // Extraer features para clustering
        const features = this.extractFeaturesForClustering(data);
        
        if (features.length === 0) {
            throw new Error('No valid features for clustering');
        }

        // Normalizar features
        const normalized = this.normalizeFeatures(features);
        
        // Inicializar centroides aleatorios
        let centroids = this.initializeCentroids(normalized, k);
        let assignments = new Array(normalized.length).fill(0);
        let iterations = 0;

        // Iterar hasta convergencia o max iterations
        for (let iter = 0; iter < maxIterations; iter++) {
            iterations = iter + 1;
            
            // Asignar puntos al centroide más cercano
            const newAssignments = this.assignToClusters(normalized, centroids);
            
            // Verificar convergencia
            if (this.hasConverged(assignments, newAssignments)) {
                console.log(`✅ K-Means converged in ${iterations} iterations`);
                break;
            }
            
            assignments = newAssignments;
            
            // Recalcular centroides
            centroids = this.recalculateCentroids(normalized, assignments, k);
        }

        // Generar perfiles de clusters
        const profiles = this.generateClusterProfiles(data, assignments, k);

        return {
            assignments,
            centroids,
            iterations,
            k,
            profiles
        };
    }

    /**
     * Extrae features para clustering (tenure, Monthly, Total)
     */
    extractFeaturesForClustering(data) {
        return data.map(record => [
            record.customer?.tenure || 0,
            record.account?.Charges?.Monthly || 0,
            record.account?.Charges?.Total || 0
        ]).filter(features => 
            features.every(f => !isNaN(f) && isFinite(f))
        );
    }

    /**
     * Normaliza features (min-max scaling)
     */
    normalizeFeatures(features) {
        const numFeatures = features[0].length;
        const normalized = [];

        // Calcular min y max para cada feature
        const mins = new Array(numFeatures).fill(Infinity);
        const maxs = new Array(numFeatures).fill(-Infinity);

        features.forEach(point => {
            point.forEach((value, i) => {
                if (value < mins[i]) mins[i] = value;
                if (value > maxs[i]) maxs[i] = value;
            });
        });

        // Normalizar
        features.forEach(point => {
            const normalizedPoint = point.map((value, i) => {
                const range = maxs[i] - mins[i];
                return range === 0 ? 0 : (value - mins[i]) / range;
            });
            normalized.push(normalizedPoint);
        });

        return normalized;
    }

    /**
     * Inicializa centroides aleatorios (K-Means++)
     */
    initializeCentroids(data, k) {
        const centroids = [];
        const n = data.length;

        // Primer centroide aleatorio
        centroids.push(data[Math.floor(Math.random() * n)].slice());

        // Seleccionar k-1 centroides usando K-Means++
        for (let i = 1; i < k; i++) {
            const distances = data.map(point => {
                const minDist = Math.min(...centroids.map(centroid =>
                    this.euclideanDistance(point, centroid)
                ));
                return minDist * minDist;
            });

            const totalDist = distances.reduce((a, b) => a + b, 0);
            let threshold = Math.random() * totalDist;
            
            for (let j = 0; j < n; j++) {
                threshold -= distances[j];
                if (threshold <= 0) {
                    centroids.push(data[j].slice());
                    break;
                }
            }
        }

        return centroids;
    }

    /**
     * Asigna cada punto al cluster más cercano
     */
    assignToClusters(data, centroids) {
        return data.map(point => {
            const distances = centroids.map(centroid =>
                this.euclideanDistance(point, centroid)
            );
            return distances.indexOf(Math.min(...distances));
        });
    }

    /**
     * Recalcula centroides como el promedio de los puntos asignados
     */
    recalculateCentroids(data, assignments, k) {
        const centroids = [];
        const numFeatures = data[0].length;

        for (let cluster = 0; cluster < k; cluster++) {
            const clusterPoints = data.filter((_, i) => assignments[i] === cluster);
            
            if (clusterPoints.length === 0) {
                // Si un cluster está vacío, asignar un punto aleatorio
                centroids.push(data[Math.floor(Math.random() * data.length)].slice());
            } else {
                const centroid = new Array(numFeatures).fill(0);
                clusterPoints.forEach(point => {
                    point.forEach((value, i) => {
                        centroid[i] += value;
                    });
                });
                centroids.push(centroid.map(sum => sum / clusterPoints.length));
            }
        }

        return centroids;
    }

    /**
     * Verifica si el algoritmo ha convergido
     */
    hasConverged(oldAssignments, newAssignments) {
        if (oldAssignments.length !== newAssignments.length) return false;
        
        for (let i = 0; i < oldAssignments.length; i++) {
            if (oldAssignments[i] !== newAssignments[i]) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Calcula distancia euclidiana
     */
    euclideanDistance(point1, point2) {
        let sum = 0;
        for (let i = 0; i < point1.length; i++) {
            sum += Math.pow(point1[i] - point2[i], 2);
        }
        return Math.sqrt(sum);
    }

    /**
     * Genera perfiles de cada cluster
     */
    generateClusterProfiles(data, assignments, k) {
        const profiles = [];

        for (let cluster = 0; cluster < k; cluster++) {
            const clusterData = data.filter((_, i) => assignments[i] === cluster);
            
            if (clusterData.length === 0) {
                profiles.push({
                    cluster,
                    size: 0,
                    avgTenure: 0,
                    avgMonthly: 0,
                    avgTotal: 0,
                    churnRate: 0
                });
                continue;
            }

            const avgTenure = this.average(clusterData.map(r => r.customer?.tenure || 0));
            const avgMonthly = this.average(clusterData.map(r => r.account?.Charges?.Monthly || 0));
            const avgTotal = this.average(clusterData.map(r => r.account?.Charges?.Total || 0));
            const churnCount = clusterData.filter(r => r.Churn === 'Yes').length;
            const churnRate = (churnCount / clusterData.length) * 100;

            profiles.push({
                cluster,
                size: clusterData.length,
                avgTenure: Math.round(avgTenure),
                avgMonthly: Math.round(avgMonthly * 100) / 100,
                avgTotal: Math.round(avgTotal * 100) / 100,
                churnRate: Math.round(churnRate * 100) / 100,
                label: this.labelCluster(avgMonthly, churnRate)
            });
        }

        return profiles;
    }

    /**
     * Etiqueta cluster según características
     */
    labelCluster(avgMonthly, churnRate) {
        if (avgMonthly < 50 && churnRate > 30) return 'Low Value, High Risk';
        if (avgMonthly < 50 && churnRate <= 30) return 'Low Value, Low Risk';
        if (avgMonthly >= 50 && avgMonthly < 80 && churnRate > 20) return 'Medium Value, Medium Risk';
        if (avgMonthly >= 50 && avgMonthly < 80 && churnRate <= 20) return 'Medium Value, Low Risk';
        if (avgMonthly >= 80 && churnRate > 15) return 'High Value, Medium Risk';
        if (avgMonthly >= 80 && churnRate <= 15) return 'High Value, Low Risk';
        return 'Mixed Profile';
    }

    // ========================================
    // CORRELATION MATRIX
    // ========================================

    /**
     * Calcula matriz de correlación de Pearson
     * @param {Array} data - Dataset
     * @param {Array} variables - Variables a correlacionar
     * @returns {Object} - {matrix, variables}
     */
    calculateCorrelationMatrix(data, variables = null) {
        console.log('📊 Calculating correlation matrix...');

        variables = variables || this.variables;
        const matrix = [];

        // Extraer valores para cada variable
        const values = {};
        variables.forEach(variable => {
            values[variable] = this.extractVariable(data, variable);
        });

        // Calcular correlación para cada par
        for (let i = 0; i < variables.length; i++) {
            matrix[i] = [];
            for (let j = 0; j < variables.length; j++) {
                const corr = this.pearsonCorrelation(
                    values[variables[i]],
                    values[variables[j]]
                );
                matrix[i][j] = Math.round(corr * 1000) / 1000; // 3 decimales
            }
        }

        console.log('✅ Correlation matrix calculated');
        return { matrix, variables };
    }

    /**
     * Extrae valores de una variable del dataset
     */
    extractVariable(data, variable) {
        return data.map(record => {
            switch(variable) {
                case 'tenure':
                    return record.customer?.tenure || 0;
                case 'MonthlyCharges':
                    return record.account?.Charges?.Monthly || 0;
                case 'TotalCharges':
                    return record.account?.Charges?.Total || 0;
                case 'SeniorCitizen':
                    return record.customer?.SeniorCitizen || 0;
                case 'Churn':
                    return record.Churn === 'Yes' ? 1 : 0;
                default:
                    return 0;
            }
        });
    }

    /**
     * Calcula correlación de Pearson entre dos variables
     */
    pearsonCorrelation(x, y) {
        const n = Math.min(x.length, y.length);
        
        if (n === 0) return 0;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        if (denominator === 0) return 0;
        
        return numerator / denominator;
    }

    // ========================================
    // ANOMALY DETECTION
    // ========================================

    /**
     * Detecta anomalías usando método IQR (Interquartile Range)
     * @param {Array} data - Dataset
     * @param {String} field - Campo a analizar
     * @param {Number} threshold - Multiplicador IQR (default 1.5)
     * @returns {Object} - {anomalies, bounds, stats}
     */
    detectAnomalies(data, field = 'MonthlyCharges', threshold = 1.5) {
        console.log(`🔍 Detecting anomalies in ${field}...`);

        // Extraer valores
        const values = data.map((record, index) => ({
            index,
            value: this.getFieldValue(record, field),
            record
        })).filter(item => !isNaN(item.value) && isFinite(item.value));

        if (values.length === 0) {
            return { anomalies: [], bounds: {}, stats: {} };
        }

        // Ordenar valores
        const sorted = values.map(v => v.value).sort((a, b) => a - b);

        // Calcular cuartiles
        const q1 = this.quantile(sorted, 0.25);
        const q2 = this.quantile(sorted, 0.50); // Mediana
        const q3 = this.quantile(sorted, 0.75);
        const iqr = q3 - q1;

        // Calcular límites
        const lowerBound = q1 - threshold * iqr;
        const upperBound = q3 + threshold * iqr;

        // Encontrar anomalías
        const anomalies = values.filter(item => 
            item.value < lowerBound || item.value > upperBound
        );

        console.log(`✅ Found ${anomalies.length} anomalies (${((anomalies.length/values.length)*100).toFixed(2)}%)`);

        return {
            anomalies: anomalies.map(a => ({
                ...a.record,
                anomalyValue: a.value,
                anomalyType: a.value < lowerBound ? 'lower' : 'upper',
                zScore: this.calculateZScore(a.value, sorted)
            })),
            bounds: { lowerBound, upperBound },
            stats: {
                q1, q2, q3, iqr,
                min: sorted[0],
                max: sorted[sorted.length - 1],
                mean: this.average(sorted),
                std: this.standardDeviation(sorted),
                total: values.length,
                anomalyCount: anomalies.length,
                anomalyRate: (anomalies.length / values.length) * 100
            }
        };
    }

    /**
     * Obtiene valor de un campo del registro
     */
    getFieldValue(record, field) {
        switch(field) {
            case 'MonthlyCharges':
                return record.account?.Charges?.Monthly || 0;
            case 'TotalCharges':
                return record.account?.Charges?.Total || 0;
            case 'tenure':
                return record.customer?.tenure || 0;
            default:
                return 0;
        }
    }

    /**
     * Calcula cuantil
     */
    quantile(sorted, q) {
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        
        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    }

    /**
     * Calcula Z-score
     */
    calculateZScore(value, values) {
        const mean = this.average(values);
        const std = this.standardDeviation(values);
        return std === 0 ? 0 : ((value - mean) / std);
    }

    // ========================================
    // UTILIDADES ESTADÍSTICAS
    // ========================================

    /**
     * Calcula promedio
     */
    average(values) {
        if (values.length === 0) return 0;
        return values.reduce((a, b) => a + b, 0) / values.length;
    }

    /**
     * Calcula desviación estándar
     */
    standardDeviation(values) {
        if (values.length === 0) return 0;
        const avg = this.average(values);
        const squareDiffs = values.map(value => Math.pow(value - avg, 2));
        const avgSquareDiff = this.average(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * Calcula mediana
     */
    median(values) {
        const sorted = values.slice().sort((a, b) => a - b);
        return this.quantile(sorted, 0.5);
    }

    /**
     * Calcula moda
     */
    mode(values) {
        const frequency = {};
        let maxFreq = 0;
        let mode = null;

        values.forEach(value => {
            frequency[value] = (frequency[value] || 0) + 1;
            if (frequency[value] > maxFreq) {
                maxFreq = frequency[value];
                mode = value;
            }
        });

        return mode;
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.MLAlgorithms = MLAlgorithms;
    window.mlAlgorithms = new MLAlgorithms();
    console.log('✅ MLAlgorithms loaded');
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLAlgorithms;
}
