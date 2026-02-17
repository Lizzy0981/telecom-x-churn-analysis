// frontend/src/services/ml/utils/validation.ts
/**
 * Validation Utilities
 * Functions for validating ML inputs and features
 */

import type { FeatureConfig } from '../tfjs/FeatureProcessor';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate features against configuration
 */
export function validateFeatures(
  data: Record<string, any>,
  configs: FeatureConfig[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  configs.forEach(config => {
    const value = data[config.name];

    // Check if required feature is missing
    if (value === undefined || value === null) {
      if (config.defaultValue === undefined) {
        errors.push(`Missing required feature: ${config.name}`);
      }
      return;
    }

    // Validate based on type
    switch (config.type) {
      case 'numeric':
        if (!isValidNumeric(value, config)) {
          errors.push(`Invalid numeric value for ${config.name}: ${value}`);
        }
        break;

      case 'categorical':
        if (!isValidCategorical(value, config)) {
          errors.push(`Invalid categorical value for ${config.name}: ${value}`);
        }
        break;

      case 'binary':
        if (!isValidBinary(value)) {
          errors.push(`Invalid binary value for ${config.name}: ${value}`);
        }
        break;

      case 'ordinal':
        if (!isValidOrdinal(value, config)) {
          errors.push(`Invalid ordinal value for ${config.name}: ${value}`);
        }
        break;
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate numeric value
 */
function isValidNumeric(value: any, config: FeatureConfig): boolean {
  const num = Number(value);
  
  if (isNaN(num)) {
    return false;
  }

  // Check range if specified
  if (config.min !== undefined && num < config.min) {
    return false;
  }
  if (config.max !== undefined && num > config.max) {
    return false;
  }

  return true;
}

/**
 * Validate categorical value
 */
function isValidCategorical(value: any, config: FeatureConfig): boolean {
  if (!config.categories || config.categories.length === 0) {
    return true; // Can't validate without categories
  }

  const strValue = String(value);
  return config.categories.includes(strValue);
}

/**
 * Validate binary value
 */
function isValidBinary(value: any): boolean {
  const strValue = String(value).toLowerCase();
  const validValues = ['0', '1', 'yes', 'no', 'true', 'false'];
  return validValues.includes(strValue);
}

/**
 * Validate ordinal value
 */
function isValidOrdinal(value: any, config: FeatureConfig): boolean {
  if (!config.categories || config.categories.length === 0) {
    return true;
  }

  const strValue = String(value);
  return config.categories.includes(strValue);
}

/**
 * Validate data completeness
 */
export function validateCompleteness(
  data: Record<string, any>,
  requiredFields: string[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate data types
 */
export function validateDataTypes(
  data: Record<string, any>,
  schema: Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>
): ValidationResult {
  const errors: string[] = [];

  Object.entries(schema).forEach(([field, expectedType]) => {
    const value = data[field];

    if (value === undefined || value === null) {
      return; // Skip undefined/null (handled by completeness check)
    }

    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (actualType !== expectedType) {
      errors.push(`Invalid type for ${field}: expected ${expectedType}, got ${actualType}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Validate numeric ranges
 */
export function validateRanges(
  data: Record<string, any>,
  ranges: Record<string, { min?: number; max?: number }>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  Object.entries(ranges).forEach(([field, range]) => {
    const value = Number(data[field]);

    if (isNaN(value)) {
      return; // Skip non-numeric
    }

    if (range.min !== undefined && value < range.min) {
      errors.push(`${field} is below minimum: ${value} < ${range.min}`);
    }

    if (range.max !== undefined && value > range.max) {
      errors.push(`${field} exceeds maximum: ${value} > ${range.max}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate array dimensions
 */
export function validateArrayDimensions(
  array: any[],
  expectedShape: number[]
): ValidationResult {
  const errors: string[] = [];

  // Check first dimension
  if (array.length !== expectedShape[0]) {
    errors.push(`Invalid array length: expected ${expectedShape[0]}, got ${array.length}`);
    return { valid: false, errors, warnings: [] };
  }

  // Check nested dimensions (for 2D arrays)
  if (expectedShape.length > 1 && Array.isArray(array[0])) {
    const expectedCols = expectedShape[1];
    const invalidRows: number[] = [];

    array.forEach((row, idx) => {
      if (!Array.isArray(row) || row.length !== expectedCols) {
        invalidRows.push(idx);
      }
    });

    if (invalidRows.length > 0) {
      errors.push(`Invalid column count in rows: ${invalidRows.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Validate model input tensor shape
 */
export function validateTensorShape(
  actualShape: number[],
  expectedShape: number[]
): ValidationResult {
  const errors: string[] = [];

  if (actualShape.length !== expectedShape.length) {
    errors.push(
      `Shape dimension mismatch: expected ${expectedShape.length}D, got ${actualShape.length}D`
    );
    return { valid: false, errors, warnings: [] };
  }

  actualShape.forEach((dim, idx) => {
    const expected = expectedShape[idx];
    // -1 means flexible dimension
    if (expected !== -1 && dim !== expected) {
      errors.push(`Shape mismatch at dimension ${idx}: expected ${expected}, got ${dim}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Validate prediction confidence
 */
export function validateConfidence(
  confidence: number,
  minThreshold: number = 0.5
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (confidence < 0 || confidence > 1) {
    errors.push(`Invalid confidence value: ${confidence} (must be between 0 and 1)`);
  }

  if (confidence < minThreshold) {
    warnings.push(`Low confidence: ${confidence} < ${minThreshold}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitize input data
 */
export function sanitizeInput(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  Object.entries(data).forEach(([key, value]) => {
    // Remove whitespace from strings
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    }
    // Convert string numbers to actual numbers
    else if (typeof value === 'string' && !isNaN(Number(value))) {
      sanitized[key] = Number(value);
    }
    // Keep other types as-is
    else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Check for missing values
 */
export function checkMissingValues(data: Record<string, any>): {
  hasMissing: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      missingFields.push(key);
    }
  });

  return {
    hasMissing: missingFields.length > 0,
    missingFields
  };
}

/**
 * Comprehensive validation
 */
export function validateAll(
  data: Record<string, any>,
  config: {
    requiredFields?: string[];
    featureConfigs?: FeatureConfig[];
    schema?: Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>;
    ranges?: Record<string, { min?: number; max?: number }>;
  }
): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Validate completeness
  if (config.requiredFields) {
    const { errors } = validateCompleteness(data, config.requiredFields);
    allErrors.push(...errors);
  }

  // Validate types
  if (config.schema) {
    const { errors } = validateDataTypes(data, config.schema);
    allErrors.push(...errors);
  }

  // Validate ranges
  if (config.ranges) {
    const { errors, warnings } = validateRanges(data, config.ranges);
    allErrors.push(...errors);
    allWarnings.push(...warnings);
  }

  // Validate features
  if (config.featureConfigs) {
    const { errors } = validateFeatures(data, config.featureConfigs);
    allErrors.push(...errors);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

export default {
  validateFeatures,
  validateCompleteness,
  validateDataTypes,
  validateRanges,
  validateArrayDimensions,
  validateTensorShape,
  validateConfidence,
  sanitizeInput,
  checkMissingValues,
  validateAll
};
