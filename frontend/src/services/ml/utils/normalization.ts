// frontend/src/services/ml/utils/normalization.ts
/**
 * Normalization Utilities
 * Functions for normalizing and denormalizing data
 */

/**
 * Normalize value using Min-Max scaling to [0, 1]
 */
export function normalizeMinMax(value: number, min: number, max: number): number {
  if (max === min) {
    return 0.5; // Avoid division by zero
  }
  return (value - min) / (max - min);
}

/**
 * Denormalize value from [0, 1] using Min-Max scaling
 */
export function denormalizeMinMax(normalizedValue: number, min: number, max: number): number {
  return normalizedValue * (max - min) + min;
}

/**
 * Normalize value using Z-score (standardization)
 */
export function normalizeZScore(value: number, mean: number, std: number): number {
  if (std === 0) {
    return 0; // Avoid division by zero
  }
  return (value - mean) / std;
}

/**
 * Denormalize value from Z-score
 */
export function denormalizeZScore(normalizedValue: number, mean: number, std: number): number {
  return normalizedValue * std + mean;
}

/**
 * Normalize array using Min-Max scaling
 */
export function normalizeArrayMinMax(values: number[]): { 
  normalized: number[]; 
  min: number; 
  max: number; 
} {
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const normalized = values.map(v => normalizeMinMax(v, min, max));
  
  return { normalized, min, max };
}

/**
 * Normalize array using Z-score
 */
export function normalizeArrayZScore(values: number[]): { 
  normalized: number[]; 
  mean: number; 
  std: number; 
} {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  
  const normalized = values.map(v => normalizeZScore(v, mean, std));
  
  return { normalized, mean, std };
}

/**
 * Clip value to range [min, max]
 */
export function clip(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalize to [0, 1] using sigmoid function
 */
export function normalizeSigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

/**
 * Normalize to [-1, 1] using tanh function
 */
export function normalizeTanh(value: number): number {
  return Math.tanh(value);
}

/**
 * Generic normalize function with method selection
 */
export function normalize(
  value: number,
  param1: number,
  param2: number,
  method: 'minmax' | 'zscore' = 'minmax'
): number {
  switch (method) {
    case 'minmax':
      return normalizeMinMax(value, param1, param2);
    case 'zscore':
      return normalizeZScore(value, param1, param2);
    default:
      return value;
  }
}

/**
 * Generic denormalize function with method selection
 */
export function denormalize(
  normalizedValue: number,
  param1: number,
  param2: number,
  method: 'minmax' | 'zscore' = 'minmax'
): number {
  switch (method) {
    case 'minmax':
      return denormalizeMinMax(normalizedValue, param1, param2);
    case 'zscore':
      return denormalizeZScore(normalizedValue, param1, param2);
    default:
      return normalizedValue;
  }
}

/**
 * Normalize matrix (2D array)
 */
export function normalizeMatrix(
  matrix: number[][],
  method: 'minmax' | 'zscore' = 'minmax'
): {
  normalized: number[][];
  params: Array<{ param1: number; param2: number }>;
} {
  const normalized: number[][] = [];
  const params: Array<{ param1: number; param2: number }> = [];

  // Transpose to work with columns
  const numRows = matrix.length;
  const numCols = matrix[0]?.length || 0;
  
  for (let col = 0; col < numCols; col++) {
    const column = matrix.map(row => row[col]);
    
    if (method === 'minmax') {
      const { normalized: normCol, min, max } = normalizeArrayMinMax(column);
      params.push({ param1: min, param2: max });
      
      normCol.forEach((val, row) => {
        if (!normalized[row]) normalized[row] = [];
        normalized[row][col] = val;
      });
    } else {
      const { normalized: normCol, mean, std } = normalizeArrayZScore(column);
      params.push({ param1: mean, param2: std });
      
      normCol.forEach((val, row) => {
        if (!normalized[row]) normalized[row] = [];
        normalized[row][col] = val;
      });
    }
  }

  return { normalized, params };
}

/**
 * One-hot encode categorical value
 */
export function oneHotEncode(value: string, categories: string[]): number[] {
  const encoded = new Array(categories.length).fill(0);
  const index = categories.indexOf(value);
  
  if (index >= 0) {
    encoded[index] = 1;
  }
  
  return encoded;
}

/**
 * Decode one-hot encoded value
 */
export function oneHotDecode(encoded: number[], categories: string[]): string {
  const index = encoded.indexOf(1);
  return index >= 0 && index < categories.length ? categories[index] : categories[0];
}

/**
 * Label encode categorical values to integers
 */
export function labelEncode(value: string, categories: string[]): number {
  const index = categories.indexOf(value);
  return index >= 0 ? index : 0;
}

/**
 * Decode label encoded value
 */
export function labelDecode(encoded: number, categories: string[]): string {
  return categories[encoded] || categories[0];
}

export default {
  normalizeMinMax,
  denormalizeMinMax,
  normalizeZScore,
  denormalizeZScore,
  normalizeArrayMinMax,
  normalizeArrayZScore,
  clip,
  normalizeSigmoid,
  normalizeTanh,
  normalize,
  denormalize,
  normalizeMatrix,
  oneHotEncode,
  oneHotDecode,
  labelEncode,
  labelDecode
};
