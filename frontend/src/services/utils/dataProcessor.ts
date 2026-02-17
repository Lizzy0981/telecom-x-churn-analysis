// frontend/src/services/utils/dataProcessor.ts
/**
 * Data Processor
 * Utilities for data transformation, aggregation, and processing
 */

export interface AggregationOptions {
  groupBy: string[];
  aggregations: {
    field: string;
    operation: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median';
  }[];
}

export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

/**
 * Filter data based on conditions
 */
export function filterData(
  data: any[],
  filters: FilterOptions[]
): any[] {
  return data.filter(row => {
    return filters.every(filter => {
      const fieldValue = row[filter.field];

      switch (filter.operator) {
        case 'eq':
          return fieldValue === filter.value;
        
        case 'ne':
          return fieldValue !== filter.value;
        
        case 'gt':
          return fieldValue > filter.value;
        
        case 'gte':
          return fieldValue >= filter.value;
        
        case 'lt':
          return fieldValue < filter.value;
        
        case 'lte':
          return fieldValue <= filter.value;
        
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(fieldValue);
        
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
        
        default:
          return true;
      }
    });
  });
}

/**
 * Sort data by field(s)
 */
export function sortData(
  data: any[],
  sortBy: string | string[],
  order: 'asc' | 'desc' | ('asc' | 'desc')[] = 'asc'
): any[] {
  const fields = Array.isArray(sortBy) ? sortBy : [sortBy];
  const orders = Array.isArray(order) ? order : [order];

  return [...data].sort((a, b) => {
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const currentOrder = orders[i] || orders[0];
      
      const aValue = a[field];
      const bValue = b[field];

      if (aValue < bValue) {
        return currentOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return currentOrder === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });
}

/**
 * Group data by field(s) and aggregate
 */
export function groupAndAggregate(
  data: any[],
  options: AggregationOptions
): any[] {
  const groups = new Map<string, any[]>();

  // Group data
  data.forEach(row => {
    const key = options.groupBy.map(field => row[field]).join('|');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });

  // Aggregate groups
  const result: any[] = [];
  groups.forEach((groupRows, key) => {
    const aggregated: any = {};

    // Add group keys
    options.groupBy.forEach((field, idx) => {
      aggregated[field] = key.split('|')[idx];
    });

    // Calculate aggregations
    options.aggregations.forEach(agg => {
      const values = groupRows.map(row => row[agg.field]).filter(v => v != null);
      
      switch (agg.operation) {
        case 'sum':
          aggregated[`${agg.field}_sum`] = values.reduce((a, b) => a + Number(b), 0);
          break;
        
        case 'avg':
          aggregated[`${agg.field}_avg`] = values.length > 0
            ? values.reduce((a, b) => a + Number(b), 0) / values.length
            : 0;
          break;
        
        case 'min':
          aggregated[`${agg.field}_min`] = Math.min(...values.map(Number));
          break;
        
        case 'max':
          aggregated[`${agg.field}_max`] = Math.max(...values.map(Number));
          break;
        
        case 'count':
          aggregated[`${agg.field}_count`] = values.length;
          break;
        
        case 'median':
          const sorted = values.map(Number).sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          aggregated[`${agg.field}_median`] = sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
          break;
      }
    });

    result.push(aggregated);
  });

  return result;
}

/**
 * Pivot data (rows to columns)
 */
export function pivotData(
  data: any[],
  options: {
    rowField: string;
    columnField: string;
    valueField: string;
    aggregation?: 'sum' | 'avg' | 'count';
  }
): any[] {
  const { rowField, columnField, valueField, aggregation = 'sum' } = options;

  const pivot = new Map<string, any>();

  data.forEach(row => {
    const rowKey = row[rowField];
    const colKey = row[columnField];
    const value = Number(row[valueField]) || 0;

    if (!pivot.has(rowKey)) {
      pivot.set(rowKey, { [rowField]: rowKey });
    }

    const pivotRow = pivot.get(rowKey)!;

    if (!(colKey in pivotRow)) {
      pivotRow[colKey] = aggregation === 'count' ? 0 : [];
    }

    if (aggregation === 'count') {
      pivotRow[colKey]++;
    } else {
      pivotRow[colKey].push(value);
    }
  });

  // Calculate aggregations
  const result: any[] = [];
  pivot.forEach(row => {
    const aggregatedRow: any = { [rowField]: row[rowField] };
    
    Object.keys(row).forEach(key => {
      if (key === rowField) return;
      
      const values = row[key];
      if (Array.isArray(values)) {
        if (aggregation === 'sum') {
          aggregatedRow[key] = values.reduce((a, b) => a + b, 0);
        } else if (aggregation === 'avg') {
          aggregatedRow[key] = values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0;
        }
      } else {
        aggregatedRow[key] = values;
      }
    });

    result.push(aggregatedRow);
  });

  return result;
}

/**
 * Remove duplicates based on field(s)
 */
export function removeDuplicates(
  data: any[],
  uniqueFields: string[]
): any[] {
  const seen = new Set<string>();
  
  return data.filter(row => {
    const key = uniqueFields.map(field => row[field]).join('|');
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Fill missing values
 */
export function fillMissingValues(
  data: any[],
  strategy: 'mean' | 'median' | 'mode' | 'forward' | 'backward' | 'constant',
  constantValue?: any
): any[] {
  const result = data.map(row => ({ ...row }));

  // Get all fields
  const fields = Object.keys(data[0] || {});

  fields.forEach(field => {
    const values = data.map(row => row[field]);
    const nonNullValues = values.filter(v => v != null && v !== '');

    // Calculate fill value based on strategy
    let fillValue: any;

    switch (strategy) {
      case 'mean':
        const numericValues = nonNullValues.map(Number).filter(n => !isNaN(n));
        fillValue = numericValues.length > 0
          ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length
          : null;
        break;

      case 'median':
        const sortedValues = nonNullValues.map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
        const mid = Math.floor(sortedValues.length / 2);
        fillValue = sortedValues.length > 0
          ? (sortedValues.length % 2 === 0
            ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
            : sortedValues[mid])
          : null;
        break;

      case 'mode':
        const counts = new Map<any, number>();
        nonNullValues.forEach(v => {
          counts.set(v, (counts.get(v) || 0) + 1);
        });
        let maxCount = 0;
        counts.forEach((count, value) => {
          if (count > maxCount) {
            maxCount = count;
            fillValue = value;
          }
        });
        break;

      case 'constant':
        fillValue = constantValue;
        break;

      case 'forward':
      case 'backward':
        // These are handled differently in the loop below
        break;
    }

    // Apply fill strategy
    for (let i = 0; i < result.length; i++) {
      if (result[i][field] == null || result[i][field] === '') {
        if (strategy === 'forward') {
          // Use previous non-null value
          for (let j = i - 1; j >= 0; j--) {
            if (result[j][field] != null && result[j][field] !== '') {
              result[i][field] = result[j][field];
              break;
            }
          }
        } else if (strategy === 'backward') {
          // Use next non-null value
          for (let j = i + 1; j < result.length; j++) {
            if (result[j][field] != null && result[j][field] !== '') {
              result[i][field] = result[j][field];
              break;
            }
          }
        } else {
          result[i][field] = fillValue;
        }
      }
    }
  });

  return result;
}

/**
 * Calculate statistics for numeric fields
 */
export function calculateStatistics(data: any[]): Record<string, any> {
  if (!data || data.length === 0) {
    return {};
  }

  const stats: Record<string, any> = {};
  const fields = Object.keys(data[0]);

  fields.forEach(field => {
    const values = data.map(row => row[field]);
    const numericValues = values.map(Number).filter(n => !isNaN(n));

    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const mean = sum / numericValues.length;
      const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;

      stats[field] = {
        count: numericValues.length,
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        sum,
        mean,
        median: sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)],
        variance,
        stdDev: Math.sqrt(variance),
        q1: sorted[Math.floor(sorted.length * 0.25)],
        q3: sorted[Math.floor(sorted.length * 0.75)]
      };
    } else {
      // Non-numeric field
      const uniqueValues = new Set(values.filter(v => v != null && v !== ''));
      stats[field] = {
        count: values.length,
        unique: uniqueValues.size,
        missing: values.filter(v => v == null || v === '').length
      };
    }
  });

  return stats;
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliers(
  data: any[],
  field: string,
  threshold: number = 1.5
): { outliers: any[]; normal: any[] } {
  const values = data.map(row => Number(row[field])).filter(n => !isNaN(n));
  const sorted = [...values].sort((a, b) => a - b);

  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;

  const lowerBound = q1 - threshold * iqr;
  const upperBound = q3 + threshold * iqr;

  const outliers: any[] = [];
  const normal: any[] = [];

  data.forEach(row => {
    const value = Number(row[field]);
    if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
      outliers.push(row);
    } else {
      normal.push(row);
    }
  });

  return { outliers, normal };
}

/**
 * Sample data randomly
 */
export function sampleData(
  data: any[],
  size: number,
  withReplacement: boolean = false
): any[] {
  if (size >= data.length && !withReplacement) {
    return [...data];
  }

  const sample: any[] = [];
  const available = [...data];

  for (let i = 0; i < size; i++) {
    if (withReplacement) {
      const idx = Math.floor(Math.random() * data.length);
      sample.push(data[idx]);
    } else {
      if (available.length === 0) break;
      const idx = Math.floor(Math.random() * available.length);
      sample.push(available[idx]);
      available.splice(idx, 1);
    }
  }

  return sample;
}

export default {
  filterData,
  sortData,
  groupAndAggregate,
  pivotData,
  removeDuplicates,
  fillMissingValues,
  calculateStatistics,
  detectOutliers,
  sampleData
};
