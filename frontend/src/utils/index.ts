// frontend/src/utils/index.ts
/**
 * Utils Index
 * Central exports for all utility functions
 */

// Constants
export * from './constants';
export { default as constants } from './constants';

// Helpers
export * from './helpers';
export { default as helpers } from './helpers';

// Formatters
export * from './formatters';
export { default as formatters } from './formatters';

// Re-export commonly used functions for convenience
export {
  generateId,
  generateUUID,
  sleep,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  capitalize,
  capitalizeWords,
  slugify,
  truncate,
  groupBy,
  sortBy,
  unique,
  uniqueBy,
  chunk,
  flatten,
  average,
  sum,
  median,
  clamp,
  roundTo,
  getRiskLevel,
  getRiskColor,
  percentage,
  copyToClipboard,
  downloadFile,
  formatFileSize,
  getQueryParams,
  setQueryParam,
  removeQueryParam,
  retry
} from './helpers';

export {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  formatBytes,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatPhone,
  formatChurnProbability,
  formatConfidence,
  formatRiskLevel,
  formatContractType,
  formatBoolean,
  formatError,
  formatInitials,
  formatJson,
  formatFieldLabel,
  formatList,
  formatOrdinal,
  formatRange,
  formatAccuracy
} from './formatters';

// Default export with all utilities
export default {
  constants,
  helpers,
  formatters
};
