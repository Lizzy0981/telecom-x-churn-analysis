// frontend/src/services/utils/validators.ts
/**
 * Data Validators
 * Business logic validators for customer data and churn analysis
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FieldValidator {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'date' | 'email';
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

/**
 * Validate customer data row
 */
export function validateCustomerData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Customer ID validation
  if (!data.customerId || String(data.customerId).trim() === '') {
    errors.push('Customer ID is required');
  }

  // Tenure validation (months as customer)
  if (data.tenure !== undefined && data.tenure !== null) {
    const tenure = Number(data.tenure);
    if (isNaN(tenure)) {
      errors.push('Tenure must be a number');
    } else if (tenure < 0) {
      errors.push('Tenure cannot be negative');
    } else if (tenure > 120) {
      warnings.push('Tenure is unusually high (>120 months)');
    }
  } else {
    errors.push('Tenure is required');
  }

  // Monthly charges validation
  if (data.monthlyCharges !== undefined && data.monthlyCharges !== null) {
    const charges = Number(data.monthlyCharges);
    if (isNaN(charges)) {
      errors.push('Monthly charges must be a number');
    } else if (charges < 0) {
      errors.push('Monthly charges cannot be negative');
    } else if (charges > 500) {
      warnings.push('Monthly charges are unusually high (>$500)');
    } else if (charges < 10) {
      warnings.push('Monthly charges are unusually low (<$10)');
    }
  } else {
    errors.push('Monthly charges is required');
  }

  // Total charges validation
  if (data.totalCharges !== undefined && data.totalCharges !== null) {
    const total = Number(data.totalCharges);
    const monthly = Number(data.monthlyCharges);
    const tenure = Number(data.tenure);

    if (isNaN(total)) {
      errors.push('Total charges must be a number');
    } else if (total < 0) {
      errors.push('Total charges cannot be negative');
    } else if (!isNaN(monthly) && !isNaN(tenure) && total > monthly * tenure * 1.5) {
      warnings.push('Total charges seem inconsistent with monthly charges and tenure');
    }
  }

  // Contract type validation
  if (data.contractType) {
    const validContracts = ['Month-to-month', 'One year', 'Two year'];
    if (!validContracts.includes(data.contractType)) {
      errors.push(`Invalid contract type. Must be one of: ${validContracts.join(', ')}`);
    }
  }

  // Payment method validation
  if (data.paymentMethod) {
    const validMethods = ['Electronic check', 'Mailed check', 'Bank transfer', 'Credit card'];
    if (!validMethods.includes(data.paymentMethod)) {
      errors.push(`Invalid payment method. Must be one of: ${validMethods.join(', ')}`);
    }
  }

  // Internet service validation
  if (data.internetService) {
    const validServices = ['DSL', 'Fiber optic', 'No'];
    if (!validServices.includes(data.internetService)) {
      errors.push(`Invalid internet service. Must be one of: ${validServices.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate field based on rules
 */
export function validateField(
  value: any,
  rules: FieldValidator
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push(`${rules.field} is required`);
    return { valid: false, errors, warnings };
  }

  // Skip other validations if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return { valid: true, errors, warnings };
  }

  // Type validation
  if (rules.type) {
    switch (rules.type) {
      case 'number':
        if (isNaN(Number(value))) {
          errors.push(`${rules.field} must be a number`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean' && !['true', 'false', '0', '1'].includes(String(value).toLowerCase())) {
          errors.push(`${rules.field} must be a boolean`);
        }
        break;

      case 'date':
        if (isNaN(Date.parse(String(value)))) {
          errors.push(`${rules.field} must be a valid date`);
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          errors.push(`${rules.field} must be a valid email`);
        }
        break;

      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${rules.field} must be a string`);
        }
        break;
    }
  }

  // Min/Max for numbers
  if (rules.type === 'number' && !isNaN(Number(value))) {
    const numValue = Number(value);
    
    if (rules.min !== undefined && numValue < rules.min) {
      errors.push(`${rules.field} must be at least ${rules.min}`);
    }
    
    if (rules.max !== undefined && numValue > rules.max) {
      errors.push(`${rules.field} must be at most ${rules.max}`);
    }
  }

  // Min/Max length for strings
  if (rules.type === 'string' || typeof value === 'string') {
    const strValue = String(value);
    
    if (rules.minLength !== undefined && strValue.length < rules.minLength) {
      errors.push(`${rules.field} must be at least ${rules.minLength} characters`);
    }
    
    if (rules.maxLength !== undefined && strValue.length > rules.maxLength) {
      errors.push(`${rules.field} must be at most ${rules.maxLength} characters`);
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(String(value))) {
    errors.push(`${rules.field} does not match required pattern`);
  }

  // Enum validation
  if (rules.enum && !rules.enum.includes(value)) {
    errors.push(`${rules.field} must be one of: ${rules.enum.join(', ')}`);
  }

  // Custom validation
  if (rules.custom) {
    const result = rules.custom(value);
    if (typeof result === 'string') {
      errors.push(result);
    } else if (result === false) {
      errors.push(`${rules.field} failed custom validation`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate multiple fields
 */
export function validateFields(
  data: any,
  rules: FieldValidator[]
): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  rules.forEach(rule => {
    const value = data[rule.field];
    const result = validateField(value, rule);
    
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Validate dataset
 */
export function validateDataset(
  data: any[],
  rules: FieldValidator[]
): {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{ row: number; errors: string[] }>;
  warnings: Array<{ row: number; warnings: string[] }>;
} {
  const rowErrors: Array<{ row: number; errors: string[] }> = [];
  const rowWarnings: Array<{ row: number; warnings: string[] }> = [];
  let validRows = 0;

  data.forEach((row, idx) => {
    const result = validateFields(row, rules);

    if (result.errors.length > 0) {
      rowErrors.push({ row: idx + 1, errors: result.errors });
    } else {
      validRows++;
    }

    if (result.warnings.length > 0) {
      rowWarnings.push({ row: idx + 1, warnings: result.warnings });
    }
  });

  return {
    valid: rowErrors.length === 0,
    totalRows: data.length,
    validRows,
    invalidRows: rowErrors.length,
    errors: rowErrors,
    warnings: rowWarnings
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: Date | string,
  endDate: Date | string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    errors.push('Start date is invalid');
  }

  if (isNaN(end.getTime())) {
    errors.push('End date is invalid');
  }

  if (!errors.length && start > end) {
    errors.push('Start date must be before end date');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate churn probability
 */
export function validateChurnProbability(probability: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (isNaN(probability)) {
    errors.push('Churn probability must be a number');
  } else if (probability < 0 || probability > 1) {
    errors.push('Churn probability must be between 0 and 1');
  } else if (probability > 0.9) {
    warnings.push('Very high churn probability (>90%)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s\-_.@]/g, ''); // Remove special characters except common ones
}

/**
 * Validate data completeness
 */
export function validateCompleteness(data: any[]): {
  completeness: number;
  missingFields: Record<string, number>;
  totalFields: number;
} {
  if (!data || data.length === 0) {
    return { completeness: 0, missingFields: {}, totalFields: 0 };
  }

  const fields = Object.keys(data[0]);
  const missingFields: Record<string, number> = {};
  let totalMissing = 0;

  fields.forEach(field => {
    const missing = data.filter(row => 
      row[field] === null || row[field] === undefined || row[field] === ''
    ).length;
    
    if (missing > 0) {
      missingFields[field] = missing;
      totalMissing += missing;
    }
  });

  const totalCells = data.length * fields.length;
  const completeness = totalCells > 0 
    ? ((totalCells - totalMissing) / totalCells) * 100 
    : 0;

  return {
    completeness: Math.round(completeness * 100) / 100,
    missingFields,
    totalFields: fields.length
  };
}

/**
 * Check for duplicates
 */
export function findDuplicates(
  data: any[],
  fields: string[]
): Array<{ key: string; count: number; indices: number[] }> {
  const groups = new Map<string, number[]>();

  data.forEach((row, idx) => {
    const key = fields.map(f => row[f]).join('|');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(idx);
  });

  const duplicates: Array<{ key: string; count: number; indices: number[] }> = [];

  groups.forEach((indices, key) => {
    if (indices.length > 1) {
      duplicates.push({
        key,
        count: indices.length,
        indices
      });
    }
  });

  return duplicates;
}

export default {
  validateCustomerData,
  validateField,
  validateFields,
  validateDataset,
  validateEmail,
  validatePhone,
  validateDateRange,
  validateChurnProbability,
  sanitizeString,
  validateCompleteness,
  findDuplicates
};
