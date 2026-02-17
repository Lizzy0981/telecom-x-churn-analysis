// frontend/src/hooks/index.ts
/**
 * Custom React Hooks
 * Centralized exports for all custom hooks
 */

// Data hooks
export * from './useData';
export { default as useData } from './useData';

// ML hooks
export * from './useML';
export { default as useML } from './useML';

// Export hooks
export * from './useExport';
export { default as useExport } from './useExport';

// Translation hooks
export * from './useTranslation';
export { default as useTranslation } from './useTranslation';

// Re-export commonly used hooks for convenience
export {
  useData,
  usePaginatedData,
  useInfiniteData,
  useLocalStorage,
  useDebounce,
  useAsync
} from './useData';

export {
  useML,
  usePredictionHistory,
  useFeatureImportance,
  useModelMetrics,
  useStreamingPredictions
} from './useML';

export {
  useExport,
  useBatchExport,
  useExportWithPreview,
  useScheduledExport,
  useExportHistory,
  useExportTemplate
} from './useExport';

export {
  useTranslation,
  useLanguageDetection,
  useRTL,
  useDateTimeFormat,
  useNumberFormat,
  getAvailableLanguages
} from './useTranslation';
