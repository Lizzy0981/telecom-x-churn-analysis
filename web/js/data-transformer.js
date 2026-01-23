/**
 * DATA TRANSFORMER - Sistema de transformación de datos
 * Convierte diferentes formatos al formato interno unificado
 * Soporta merge de múltiples datasets
 */

class DataTransformer {
    constructor() {
        this.internalFormat = {
            customerID: 'string',
            Churn: 'Yes/No',
            customer: {
                gender: 'Male/Female',
                SeniorCitizen: 0/1,
                Partner: 'Yes/No',
                Dependents: 'Yes/No',
                tenure: 'number'
            },
            phone: {
                PhoneService: 'Yes/No',
                MultipleLines: 'Yes/No/No phone service'
            },
            internet: {
                InternetService: 'DSL/Fiber optic/No',
                OnlineSecurity: 'Yes/No/No internet service',
                OnlineBackup: 'Yes/No/No internet service',
                DeviceProtection: 'Yes/No/No internet service',
                TechSupport: 'Yes/No/No internet service',
                StreamingTV: 'Yes/No/No internet service',
                StreamingMovies: 'Yes/No/No internet service'
            },
            account: {
                Contract: 'Month-to-month/One year/Two year',
                PaperlessBilling: 'Yes/No',
                PaymentMethod: 'string',
                Charges: {
                    Monthly: 'number',
                    Total: 'number'
                }
            }
        };
    }

    /**
     * Transforma datos al formato interno
     * @param {Array} rawData - Datos crudos
     * @param {String} structure - Tipo de estructura (flat, nested, prefixed)
     * @returns {Array} - Datos transformados al formato interno
     */
    transformToInternalFormat(rawData, structure = null) {
        if (!rawData || rawData.length === 0) {
            throw new Error('No data to transform');
        }

        // Detectar estructura si no se especifica
        if (!structure) {
            structure = this.detectStructure(rawData[0]);
        }

        console.log(`🔄 Transforming ${rawData.length} records from ${structure} to internal format...`);

        switch(structure) {
            case 'flat':
                return this.transformFlat(rawData);
            case 'nested':
                return this.transformNested(rawData);
            case 'prefixed':
                return this.transformPrefixed(rawData);
            default:
                return this.intelligentTransform(rawData);
        }
    }

    /**
     * Detecta la estructura del dataset
     */
    detectStructure(sample) {
        if (!sample) return 'unknown';

        // Estructura anidada
        if (sample.customer && typeof sample.customer === 'object') {
            return 'nested';
        }

        // Estructura con prefijos
        const keys = Object.keys(sample);
        if (keys.some(k => k.includes('.'))) {
            return 'prefixed';
        }

        // Estructura plana
        return 'flat';
    }

    /**
     * Transforma estructura plana (CSV típico)
     */
    transformFlat(data) {
        return data.map(row => ({
            customerID: this.getValue(row, ['customerID', 'CustomerID', 'customer_id', 'CUSTOMERID']),
            Churn: this.normalizeChurn(this.getValue(row, ['Churn', 'churn', 'CHURN'])),
            customer: {
                gender: this.getValue(row, ['gender', 'Gender', 'GENDER']),
                SeniorCitizen: this.normalizeBoolean(this.getValue(row, ['SeniorCitizen', 'senior_citizen', 'senior'])),
                Partner: this.getValue(row, ['Partner', 'partner', 'PARTNER']),
                Dependents: this.getValue(row, ['Dependents', 'dependents', 'DEPENDENTS']),
                tenure: this.normalizeNumber(this.getValue(row, ['tenure', 'Tenure', 'TENURE']))
            },
            phone: {
                PhoneService: this.getValue(row, ['PhoneService', 'phone_service', 'phoneService']),
                MultipleLines: this.getValue(row, ['MultipleLines', 'multiple_lines', 'multipleLines'])
            },
            internet: {
                InternetService: this.getValue(row, ['InternetService', 'internet_service', 'internetService']),
                OnlineSecurity: this.getValue(row, ['OnlineSecurity', 'online_security', 'onlineSecurity']),
                OnlineBackup: this.getValue(row, ['OnlineBackup', 'online_backup', 'onlineBackup']),
                DeviceProtection: this.getValue(row, ['DeviceProtection', 'device_protection', 'deviceProtection']),
                TechSupport: this.getValue(row, ['TechSupport', 'tech_support', 'techSupport']),
                StreamingTV: this.getValue(row, ['StreamingTV', 'streaming_tv', 'streamingTV']),
                StreamingMovies: this.getValue(row, ['StreamingMovies', 'streaming_movies', 'streamingMovies'])
            },
            account: {
                Contract: this.getValue(row, ['Contract', 'contract', 'CONTRACT']),
                PaperlessBilling: this.getValue(row, ['PaperlessBilling', 'paperless_billing', 'paperlessBilling']),
                PaymentMethod: this.getValue(row, ['PaymentMethod', 'payment_method', 'paymentMethod']),
                Charges: {
                    Monthly: this.normalizeNumber(this.getValue(row, ['MonthlyCharges', 'monthly_charges', 'Charges.Monthly', 'monthly'])),
                    Total: this.normalizeNumber(this.getValue(row, ['TotalCharges', 'total_charges', 'Charges.Total', 'total']))
                }
            }
        }));
    }

    /**
     * Transforma estructura anidada (ya está en formato correcto)
     */
    transformNested(data) {
        return data.map(row => ({
            customerID: row.customerID,
            Churn: this.normalizeChurn(row.Churn),
            customer: {
                gender: row.customer?.gender,
                SeniorCitizen: this.normalizeBoolean(row.customer?.SeniorCitizen),
                Partner: row.customer?.Partner,
                Dependents: row.customer?.Dependents,
                tenure: this.normalizeNumber(row.customer?.tenure)
            },
            phone: {
                PhoneService: row.phone?.PhoneService,
                MultipleLines: row.phone?.MultipleLines
            },
            internet: {
                InternetService: row.internet?.InternetService,
                OnlineSecurity: row.internet?.OnlineSecurity,
                OnlineBackup: row.internet?.OnlineBackup,
                DeviceProtection: row.internet?.DeviceProtection,
                TechSupport: row.internet?.TechSupport,
                StreamingTV: row.internet?.StreamingTV,
                StreamingMovies: row.internet?.StreamingMovies
            },
            account: {
                Contract: row.account?.Contract,
                PaperlessBilling: row.account?.PaperlessBilling,
                PaymentMethod: row.account?.PaymentMethod,
                Charges: {
                    Monthly: this.normalizeNumber(row.account?.Charges?.Monthly),
                    Total: this.normalizeNumber(row.account?.Charges?.Total)
                }
            }
        }));
    }

    /**
     * Transforma estructura con prefijos (customer.gender, etc.)
     */
    transformPrefixed(data) {
        return data.map(row => ({
            customerID: row.customerID || row['customer.customerID'],
            Churn: this.normalizeChurn(row.Churn || row['customer.Churn']),
            customer: {
                gender: row['customer.gender'] || row.gender,
                SeniorCitizen: this.normalizeBoolean(row['customer.SeniorCitizen'] || row.SeniorCitizen),
                Partner: row['customer.Partner'] || row.Partner,
                Dependents: row['customer.Dependents'] || row.Dependents,
                tenure: this.normalizeNumber(row['customer.tenure'] || row.tenure)
            },
            phone: {
                PhoneService: row['phone.PhoneService'] || row.PhoneService,
                MultipleLines: row['phone.MultipleLines'] || row.MultipleLines
            },
            internet: {
                InternetService: row['internet.InternetService'] || row.InternetService,
                OnlineSecurity: row['internet.OnlineSecurity'] || row.OnlineSecurity,
                OnlineBackup: row['internet.OnlineBackup'] || row.OnlineBackup,
                DeviceProtection: row['internet.DeviceProtection'] || row.DeviceProtection,
                TechSupport: row['internet.TechSupport'] || row.TechSupport,
                StreamingTV: row['internet.StreamingTV'] || row.StreamingTV,
                StreamingMovies: row['internet.StreamingMovies'] || row.StreamingMovies
            },
            account: {
                Contract: row['account.Contract'] || row.Contract,
                PaperlessBilling: row['account.PaperlessBilling'] || row.PaperlessBilling,
                PaymentMethod: row['account.PaymentMethod'] || row.PaymentMethod,
                Charges: {
                    Monthly: this.normalizeNumber(row['account.Charges.Monthly'] || row.MonthlyCharges),
                    Total: this.normalizeNumber(row['account.Charges.Total'] || row.TotalCharges)
                }
            }
        }));
    }

    /**
     * Transformación inteligente (detecta automáticamente)
     */
    intelligentTransform(data) {
        const structure = this.detectStructure(data[0]);
        console.log('🤖 Intelligent transform detected structure:', structure);
        return this.transformToInternalFormat(data, structure);
    }

    /**
     * Merge de múltiples datasets
     */
    mergeDatasets(datasets, strategy = 'union') {
        if (!datasets || datasets.length === 0) {
            throw new Error('No datasets to merge');
        }

        if (datasets.length === 1) {
            return datasets[0];
        }

        console.log(`🔗 Merging ${datasets.length} datasets with strategy: ${strategy}`);

        switch(strategy) {
            case 'union':
                return this.mergeUnion(datasets);
            case 'intersection':
                return this.mergeIntersection(datasets);
            case 'append':
                return this.mergeAppend(datasets);
            default:
                return this.mergeUnion(datasets);
        }
    }

    /**
     * Merge por unión (combina todos los registros únicos)
     */
    mergeUnion(datasets) {
        const merged = [];
        const seenIDs = new Set();

        datasets.forEach(dataset => {
            dataset.forEach(record => {
                if (!seenIDs.has(record.customerID)) {
                    merged.push(record);
                    seenIDs.add(record.customerID);
                }
            });
        });

        console.log(`✅ Union merge: ${merged.length} unique records`);
        return merged;
    }

    /**
     * Merge por intersección (solo registros presentes en todos)
     */
    mergeIntersection(datasets) {
        if (datasets.length < 2) return datasets[0];

        const firstIDs = new Set(datasets[0].map(r => r.customerID));
        const intersection = datasets[0].filter(record => {
            return datasets.every(dataset => 
                dataset.some(r => r.customerID === record.customerID)
            );
        });

        console.log(`✅ Intersection merge: ${intersection.length} common records`);
        return intersection;
    }

    /**
     * Merge por append (concatena todos)
     */
    mergeAppend(datasets) {
        const merged = [].concat(...datasets);
        console.log(`✅ Append merge: ${merged.length} total records`);
        return merged;
    }

    /**
     * Obtiene valor de múltiples posibles claves
     */
    getValue(obj, keys) {
        for (const key of keys) {
            if (obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined) {
                return obj[key];
            }
        }
        return null;
    }

    /**
     * Normaliza valor de Churn
     */
    normalizeChurn(value) {
        if (value === null || value === undefined) return null;
        
        const val = String(value).toLowerCase();
        if (['yes', '1', 'true', 'y'].includes(val)) return 'Yes';
        if (['no', '0', 'false', 'n'].includes(val)) return 'No';
        
        return value;
    }

    /**
     * Normaliza booleano a 0/1
     */
    normalizeBoolean(value) {
        if (value === null || value === undefined) return 0;
        
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (typeof value === 'number') return value ? 1 : 0;
        
        const val = String(value).toLowerCase();
        if (['yes', '1', 'true', 'y'].includes(val)) return 1;
        if (['no', '0', 'false', 'n'].includes(val)) return 0;
        
        return 0;
    }

    /**
     * Normaliza número
     */
    normalizeNumber(value) {
        if (value === null || value === undefined || value === '') return 0;
        
        // Si es string, limpiar y convertir
        if (typeof value === 'string') {
            // Eliminar comas, símbolos de moneda, etc.
            const cleaned = value.replace(/[,$€£¥]/g, '').trim();
            const num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
        }
        
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    }

    /**
     * Convierte del formato interno a plano (para export CSV)
     */
    flattenInternalFormat(data) {
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
     * Limpia datos (elimina valores inválidos, duplicados)
     */
    cleanData(data) {
        console.log('🧹 Cleaning data...');
        
        // Eliminar registros sin customerID
        let cleaned = data.filter(record => record.customerID);
        
        // Eliminar duplicados
        const seenIDs = new Set();
        cleaned = cleaned.filter(record => {
            if (seenIDs.has(record.customerID)) {
                return false;
            }
            seenIDs.add(record.customerID);
            return true;
        });

        // Normalizar valores
        cleaned = cleaned.map(record => ({
            ...record,
            Churn: this.normalizeChurn(record.Churn),
            customer: {
                ...record.customer,
                SeniorCitizen: this.normalizeBoolean(record.customer?.SeniorCitizen),
                tenure: this.normalizeNumber(record.customer?.tenure)
            },
            account: {
                ...record.account,
                Charges: {
                    Monthly: this.normalizeNumber(record.account?.Charges?.Monthly),
                    Total: this.normalizeNumber(record.account?.Charges?.Total)
                }
            }
        }));

        console.log(`✅ Cleaned: ${data.length} → ${cleaned.length} records`);
        return cleaned;
    }

    /**
     * Aplica transformaciones personalizadas
     */
    applyCustomTransform(data, transformFn) {
        if (typeof transformFn !== 'function') {
            throw new Error('Transform function must be a function');
        }

        return data.map(transformFn);
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.DataTransformer = DataTransformer;
    window.dataTransformer = new DataTransformer();
    console.log('✅ DataTransformer loaded');
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataTransformer;
}
