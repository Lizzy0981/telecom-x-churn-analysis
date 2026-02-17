// frontend/src/services/ml/tfjs/FeatureProcessor.ts
/**
 * Feature Processor
 * Handles feature engineering and preprocessing for ML models
 */

import { normalize, denormalize } from '../utils/normalization';
import { validateFeatures } from '../utils/validation';

export interface FeatureConfig {
  name: string;
  type: 'numeric' | 'categorical' | 'binary' | 'ordinal';
  min?: number;
  max?: number;
  mean?: number;
  std?: number;
  categories?: string[];
  defaultValue?: any;
}

export class FeatureProcessor {
  private featureConfigs: Map<string, FeatureConfig> = new Map();
  private featureOrder: string[] = [];

  constructor() {
    this.initializeFeatureConfigs();
  }

  /**
   * Initialize feature configurations
   */
  private initializeFeatureConfigs(): void {
    const configs: FeatureConfig[] = [
      // Numeric features
      {
        name: 'tenure',
        type: 'numeric',
        min: 0,
        max: 72,
        mean: 32.4,
        std: 24.5,
        defaultValue: 0
      },
      {
        name: 'monthlyCharges',
        type: 'numeric',
        min: 18.25,
        max: 118.75,
        mean: 64.76,
        std: 30.09,
        defaultValue: 64.76
      },
      {
        name: 'totalCharges',
        type: 'numeric',
        min: 18.8,
        max: 8684.8,
        mean: 2283.3,
        std: 2266.8,
        defaultValue: 2283.3
      },
      // Categorical features
      {
        name: 'contractType',
        type: 'categorical',
        categories: ['Month-to-month', 'One year', 'Two year'],
        defaultValue: 'Month-to-month'
      },
      {
        name: 'paymentMethod',
        type: 'categorical',
        categories: ['Electronic check', 'Mailed check', 'Bank transfer', 'Credit card'],
        defaultValue: 'Electronic check'
      },
      {
        name: 'internetService',
        type: 'categorical',
        categories: ['DSL', 'Fiber optic', 'No'],
        defaultValue: 'DSL'
      },
      // Binary features
      {
        name: 'techSupport',
        type: 'binary',
        categories: ['Yes', 'No'],
        defaultValue: 'No'
      },
      {
        name: 'onlineSecurity',
        type: 'binary',
        categories: ['Yes', 'No'],
        defaultValue: 'No'
      }
    ];

    // Store configs
    configs.forEach(config => {
      this.featureConfigs.set(config.name, config);
      this.featureOrder.push(config.name);
    });
  }

  /**
   * Process raw features into model-ready format
   */
  processFeatures(rawData: Record<string, any>): number[] {
    const processedFeatures: number[] = [];

    this.featureOrder.forEach(featureName => {
      const config = this.featureConfigs.get(featureName);
      if (!config) return;

      const rawValue = rawData[featureName] ?? config.defaultValue;
      const processedValue = this.processFeature(rawValue, config);
      
      processedFeatures.push(...processedValue);
    });

    return processedFeatures;
  }

  /**
   * Process a single feature based on its type
   */
  private processFeature(value: any, config: FeatureConfig): number[] {
    switch (config.type) {
      case 'numeric':
        return [this.processNumeric(value, config)];

      case 'categorical':
        return this.processCategorical(value, config);

      case 'binary':
        return [this.processBinary(value, config)];

      case 'ordinal':
        return [this.processOrdinal(value, config)];

      default:
        console.warn(`Unknown feature type: ${config.type}`);
        return [0];
    }
  }

  /**
   * Process numeric feature (normalize)
   */
  private processNumeric(value: any, config: FeatureConfig): number {
    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      console.warn(`Invalid numeric value for ${config.name}: ${value}`);
      return config.defaultValue ?? 0;
    }

    // Normalize using min-max or z-score
    if (config.min !== undefined && config.max !== undefined) {
      return normalize(numValue, config.min, config.max, 'minmax');
    } else if (config.mean !== undefined && config.std !== undefined) {
      return normalize(numValue, config.mean, config.std, 'zscore');
    }

    return numValue;
  }

  /**
   * Process categorical feature (one-hot encoding)
   */
  private processCategorical(value: any, config: FeatureConfig): number[] {
    if (!config.categories) {
      console.warn(`No categories defined for ${config.name}`);
      return [0];
    }

    const strValue = String(value);
    const index = config.categories.indexOf(strValue);

    // One-hot encoding
    const encoded = new Array(config.categories.length).fill(0);
    if (index >= 0) {
      encoded[index] = 1;
    } else {
      console.warn(`Unknown category for ${config.name}: ${value}`);
      encoded[0] = 1; // Default to first category
    }

    return encoded;
  }

  /**
   * Process binary feature
   */
  private processBinary(value: any, config: FeatureConfig): number {
    const strValue = String(value).toLowerCase();
    
    if (strValue === 'yes' || strValue === 'true' || strValue === '1') {
      return 1;
    }
    return 0;
  }

  /**
   * Process ordinal feature (preserve order)
   */
  private processOrdinal(value: any, config: FeatureConfig): number {
    if (!config.categories) {
      return 0;
    }

    const strValue = String(value);
    const index = config.categories.indexOf(strValue);

    if (index >= 0) {
      // Normalize ordinal to [0, 1]
      return index / (config.categories.length - 1);
    }

    return 0;
  }

  /**
   * Validate raw features
   */
  validate(rawData: Record<string, any>): { valid: boolean; errors: string[] } {
    return validateFeatures(rawData, Array.from(this.featureConfigs.values()));
  }

  /**
   * Get feature importance scores (mock)
   */
  getFeatureImportance(): Array<{ name: string; importance: number }> {
    // In real scenario, this would come from model training
    return [
      { name: 'tenure', importance: 0.245 },
      { name: 'monthlyCharges', importance: 0.187 },
      { name: 'totalCharges', importance: 0.156 },
      { name: 'contractType', importance: 0.134 },
      { name: 'internetService', importance: 0.098 },
      { name: 'paymentMethod', importance: 0.072 },
      { name: 'techSupport', importance: 0.045 },
      { name: 'onlineSecurity', importance: 0.034 }
    ].sort((a, b) => b.importance - a.importance);
  }

  /**
   * Get expected input dimension
   */
  getInputDimension(): number {
    let dimension = 0;

    this.featureConfigs.forEach(config => {
      if (config.type === 'categorical') {
        dimension += config.categories?.length || 1;
      } else {
        dimension += 1;
      }
    });

    return dimension;
  }

  /**
   * Get feature names in order
   */
  getFeatureNames(): string[] {
    return [...this.featureOrder];
  }

  /**
   * Get feature config
   */
  getFeatureConfig(name: string): FeatureConfig | undefined {
    return this.featureConfigs.get(name);
  }

  /**
   * Add custom feature config
   */
  addFeatureConfig(config: FeatureConfig): void {
    this.featureConfigs.set(config.name, config);
    if (!this.featureOrder.includes(config.name)) {
      this.featureOrder.push(config.name);
    }
  }

  /**
   * Reset to default configs
   */
  reset(): void {
    this.featureConfigs.clear();
    this.featureOrder = [];
    this.initializeFeatureConfigs();
  }
}

// Export singleton instance
export const featureProcessor = new FeatureProcessor();

export default FeatureProcessor;
