// frontend/src/services/ml/utils/index.ts
/**
 * ML Utilities
 * Helper functions for ML operations
 */

export * from './normalization';
export * from './validation';

// Re-export for convenience
import normalization from './normalization';
import validation from './validation';

export default {
  ...normalization,
  ...validation
};
