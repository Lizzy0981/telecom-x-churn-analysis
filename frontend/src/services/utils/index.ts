// frontend/src/services/utils/index.ts
/**
 * Utility Services
 * Centralized exports for all utility services
 */

// Data Processor
export * from './dataProcessor';
import dataProcessorService from './dataProcessor';

// File Parser
export * from './fileParser';
import fileParserService from './fileParser';

// Validators
export * from './validators';
import validatorsService from './validators';

// Re-export all services as a single object
export const utilServices = {
  dataProcessor: dataProcessorService,
  fileParser: fileParserService,
  validators: validatorsService
};

// Default export
export default utilServices;
