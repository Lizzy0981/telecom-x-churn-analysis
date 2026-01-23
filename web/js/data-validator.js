/**
 * DATA VALIDATOR - Sistema de validación de datos
 * Valida estructura, tipos, valores requeridos
 */

class DataValidator {
    constructor() {
        this.requiredColumns = ['customerID', 'Churn'];
        this.optionalColumns = ['tenure', 'MonthlyCharges', 'TotalCharges'];
        this.validChurnValues = ['Yes', 'No', 'yes', 'no', 'YES', 'NO', 1, 0, true, false];
    }

    /**
     * Valida un dataset completo
     * @param {Array} data - Array de objetos a validar
     * @returns {Object} - Resultado de validación
     */
    validate(data) {
        const errors = [];
        const warnings = [];
        const stats = {
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            duplicates: 0,
            missingValues: 0,
            columnStats: {}
        };

        try {
            // 1. Validar que sea un array
            if (!Array.isArray(data)) {
                errors.push('Data must be an array');
                return { isValid: false, errors, warnings, stats };
            }

            if (data.length === 0) {
                errors.push('Dataset is empty');
                return { isValid: false, errors, warnings, stats };
            }

            stats.totalRows = data.length;

            // 2. Detectar estructura (plana vs anidada)
            const structure = this.detectStructure(data[0]);
            console.log('📊 Structure detected:', structure);

            // 3. Verificar columnas requeridas
            const columnsCheck = this.checkRequiredColumns(data, structure);
            if (!columnsCheck.valid) {
                errors.push(...columnsCheck.errors);
            }
            warnings.push(...columnsCheck.warnings);

            // 4. Validar cada fila
            const customerIDs = new Set();
            let validCount = 0;
            let missingValuesCount = 0;

            data.forEach((row, index) => {
                const rowValidation = this.validateRow(row, index, structure);
                
                if (rowValidation.valid) {
                    validCount++;
                } else {
                    stats.invalidRows++;
                }

                // Detectar duplicados
                const customerID = this.getCustomerID(row, structure);
                if (customerID) {
                    if (customerIDs.has(customerID)) {
                        stats.duplicates++;
                        warnings.push(`Duplicate customerID found: ${customerID} at row ${index + 1}`);
                    }
                    customerIDs.add(customerID);
                }

                // Contar valores faltantes
                missingValuesCount += rowValidation.missingCount;
                
                errors.push(...rowValidation.errors.map(e => `Row ${index + 1}: ${e}`));
                warnings.push(...rowValidation.warnings.map(w => `Row ${index + 1}: ${w}`));
            });

            stats.validRows = validCount;
            stats.missingValues = missingValuesCount;

            // 5. Estadísticas de columnas
            stats.columnStats = this.getColumnStats(data, structure);

            // 6. Determinar si es válido
            const isValid = errors.length === 0 && stats.validRows > 0;

            console.log('✅ Validation complete:', {
                isValid,
                errors: errors.length,
                warnings: warnings.length,
                validRows: stats.validRows,
                totalRows: stats.totalRows
            });

            return {
                isValid,
                errors: errors.slice(0, 10), // Limitar a 10 errores
                warnings: warnings.slice(0, 10), // Limitar a 10 warnings
                stats,
                structure
            };

        } catch (error) {
            console.error('❌ Validation error:', error);
            errors.push(`Validation error: ${error.message}`);
            return { isValid: false, errors, warnings, stats };
        }
    }

    /**
     * Detecta la estructura del dataset
     */
    detectStructure(sample) {
        if (!sample) return 'unknown';

        // Estructura anidada (como el JSON original)
        if (sample.customer && sample.account) {
            return 'nested';
        }

        // Estructura con prefijos (customer.gender, account.Contract)
        const keys = Object.keys(sample);
        if (keys.some(k => k.includes('.'))) {
            return 'prefixed';
        }

        // Estructura plana (todos los campos al mismo nivel)
        if (sample.customerID || sample['customerID']) {
            return 'flat';
        }

        return 'unknown';
    }

    /**
     * Verifica columnas requeridas
     */
    checkRequiredColumns(data, structure) {
        const errors = [];
        const warnings = [];
        const sample = data[0];

        for (const col of this.requiredColumns) {
            const exists = this.columnExists(sample, col, structure);
            if (!exists) {
                errors.push(`Required column missing: ${col}`);
            }
        }

        for (const col of this.optionalColumns) {
            const exists = this.columnExists(sample, col, structure);
            if (!exists) {
                warnings.push(`Optional column missing: ${col}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Verifica si una columna existe
     */
    columnExists(row, column, structure) {
        switch(structure) {
            case 'flat':
                return row.hasOwnProperty(column) || 
                       row.hasOwnProperty(column.charAt(0).toLowerCase() + column.slice(1));
            
            case 'nested':
                // Para nested, buscar en subestructuras
                if (column === 'customerID') return row.customerID !== undefined;
                if (column === 'Churn') return row.Churn !== undefined;
                if (column === 'tenure') return row.customer && row.customer.tenure !== undefined;
                if (column === 'MonthlyCharges') return row.account && row.account.Charges && row.account.Charges.Monthly !== undefined;
                return false;
            
            case 'prefixed':
                return row.hasOwnProperty(column) ||
                       row.hasOwnProperty(`customer.${column}`) ||
                       row.hasOwnProperty(`account.${column}`);
            
            default:
                return false;
        }
    }

    /**
     * Valida una fila individual
     */
    validateRow(row, index, structure) {
        const errors = [];
        const warnings = [];
        let missingCount = 0;

        // Validar customerID
        const customerID = this.getCustomerID(row, structure);
        if (!customerID || customerID === '') {
            errors.push('Missing customerID');
            missingCount++;
        }

        // Validar Churn
        const churn = this.getChurn(row, structure);
        if (churn === null || churn === undefined) {
            errors.push('Missing Churn value');
            missingCount++;
        } else if (!this.isValidChurnValue(churn)) {
            warnings.push(`Invalid Churn value: ${churn} (expected Yes/No or 1/0)`);
        }

        // Validar tenure (si existe)
        const tenure = this.getTenure(row, structure);
        if (tenure !== null && tenure !== undefined) {
            if (isNaN(tenure) || tenure < 0) {
                warnings.push(`Invalid tenure value: ${tenure}`);
            }
        }

        // Validar MonthlyCharges (si existe)
        const monthlyCharges = this.getMonthlyCharges(row, structure);
        if (monthlyCharges !== null && monthlyCharges !== undefined) {
            if (isNaN(monthlyCharges) || monthlyCharges < 0) {
                warnings.push(`Invalid MonthlyCharges value: ${monthlyCharges}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            missingCount
        };
    }

    /**
     * Obtiene customerID según estructura
     */
    getCustomerID(row, structure) {
        if (structure === 'nested' || structure === 'flat') {
            return row.customerID || row.CustomerID || row.customer_id || row.CUSTOMERID;
        }
        return row.customerID || row['customer.customerID'];
    }

    /**
     * Obtiene Churn según estructura
     */
    getChurn(row, structure) {
        if (structure === 'nested' || structure === 'flat') {
            return row.Churn || row.churn || row.CHURN;
        }
        return row.Churn || row['customer.Churn'];
    }

    /**
     * Obtiene tenure según estructura
     */
    getTenure(row, structure) {
        switch(structure) {
            case 'flat':
                return row.tenure || row.Tenure || row.TENURE;
            case 'nested':
                return row.customer && row.customer.tenure;
            case 'prefixed':
                return row.tenure || row['customer.tenure'];
            default:
                return null;
        }
    }

    /**
     * Obtiene MonthlyCharges según estructura
     */
    getMonthlyCharges(row, structure) {
        switch(structure) {
            case 'flat':
                return row.MonthlyCharges || row.monthlyCharges || row['Charges.Monthly'];
            case 'nested':
                return row.account && row.account.Charges && row.account.Charges.Monthly;
            case 'prefixed':
                return row.MonthlyCharges || row['account.Charges.Monthly'];
            default:
                return null;
        }
    }

    /**
     * Valida si un valor de Churn es válido
     */
    isValidChurnValue(value) {
        return this.validChurnValues.includes(value);
    }

    /**
     * Normaliza valor de Churn
     */
    normalizeChurnValue(value) {
        if (value === 1 || value === true || value === 'yes' || value === 'YES' || value === 'Yes') {
            return 'Yes';
        }
        if (value === 0 || value === false || value === 'no' || value === 'NO' || value === 'No') {
            return 'No';
        }
        return value;
    }

    /**
     * Obtiene estadísticas de columnas
     */
    getColumnStats(data, structure) {
        const stats = {};
        const sample = data[0];
        const keys = this.getAllKeys(sample, structure);

        keys.forEach(key => {
            const values = data.map(row => this.getValue(row, key, structure)).filter(v => v !== null && v !== undefined);
            
            stats[key] = {
                total: data.length,
                filled: values.length,
                missing: data.length - values.length,
                fillRate: ((values.length / data.length) * 100).toFixed(2) + '%'
            };
        });

        return stats;
    }

    /**
     * Obtiene todas las claves de un objeto (incluyendo anidadas)
     */
    getAllKeys(obj, structure) {
        if (structure === 'flat') {
            return Object.keys(obj);
        }
        
        if (structure === 'nested') {
            const keys = ['customerID', 'Churn'];
            if (obj.customer) keys.push(...Object.keys(obj.customer).map(k => `customer.${k}`));
            if (obj.phone) keys.push(...Object.keys(obj.phone).map(k => `phone.${k}`));
            if (obj.internet) keys.push(...Object.keys(obj.internet).map(k => `internet.${k}`));
            if (obj.account) keys.push(...Object.keys(obj.account).map(k => `account.${k}`));
            return keys;
        }

        return Object.keys(obj);
    }

    /**
     * Obtiene un valor según la clave y estructura
     */
    getValue(obj, key, structure) {
        if (structure === 'flat') {
            return obj[key];
        }

        if (structure === 'nested') {
            const parts = key.split('.');
            if (parts.length === 1) return obj[key];
            return parts.reduce((o, k) => o && o[k], obj);
        }

        return obj[key];
    }

    /**
     * Genera un resumen legible de la validación
     */
    getValidationSummary(validationResult) {
        const { isValid, errors, warnings, stats } = validationResult;

        let summary = `Validation Result: ${isValid ? '✅ VALID' : '❌ INVALID'}\n\n`;
        summary += `Total Rows: ${stats.totalRows}\n`;
        summary += `Valid Rows: ${stats.validRows} (${((stats.validRows/stats.totalRows)*100).toFixed(1)}%)\n`;
        summary += `Invalid Rows: ${stats.invalidRows}\n`;
        summary += `Duplicates: ${stats.duplicates}\n`;
        summary += `Missing Values: ${stats.missingValues}\n\n`;

        if (errors.length > 0) {
            summary += `Errors (${errors.length}):\n`;
            errors.forEach(err => summary += `  • ${err}\n`);
            summary += '\n';
        }

        if (warnings.length > 0) {
            summary += `Warnings (${warnings.length}):\n`;
            warnings.forEach(warn => summary += `  • ${warn}\n`);
        }

        return summary;
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.DataValidator = DataValidator;
    window.dataValidator = new DataValidator();
    console.log('✅ DataValidator loaded');
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataValidator;
}
