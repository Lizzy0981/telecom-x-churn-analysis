// frontend/src/services/ml/tfjs/ModelLoader.ts
/**
 * Model Loader for TensorFlow.js
 * Handles loading and caching of ML models
 */

import * as tf from '@tensorflow/tfjs';

export interface ModelMetadata {
  name: string;
  version: string;
  inputShape: number[];
  outputShape: number[];
  features: string[];
  accuracy?: number;
  trainedOn?: string;
}

export class ModelLoader {
  private modelCache: Map<string, tf.LayersModel> = new Map();
  private metadataCache: Map<string, ModelMetadata> = new Map();

  /**
   * Load model from URL or path
   */
  async loadModel(
    modelPath: string,
    options?: {
      fromLocalStorage?: boolean;
      cacheKey?: string;
    }
  ): Promise<tf.LayersModel> {
    const cacheKey = options?.cacheKey || modelPath;

    // Check cache first
    if (this.modelCache.has(cacheKey)) {
      console.log(`Loading model from cache: ${cacheKey}`);
      return this.modelCache.get(cacheKey)!;
    }

    try {
      console.log(`Loading model from: ${modelPath}`);

      let model: tf.LayersModel;

      if (options?.fromLocalStorage) {
        // Load from browser's IndexedDB
        model = await tf.loadLayersModel(`localstorage://${cacheKey}`);
      } else {
        // Load from URL/path
        model = await tf.loadLayersModel(modelPath);
      }

      // Warm up the model (run a dummy prediction)
      await this.warmUpModel(model);

      // Cache the model
      this.modelCache.set(cacheKey, model);

      console.log('Model loaded successfully');
      return model;
    } catch (error) {
      console.error('Failed to load model:', error);
      throw new Error(`Model loading failed: ${error}`);
    }
  }

  /**
   * Load model metadata
   */
  async loadMetadata(metadataPath: string): Promise<ModelMetadata> {
    // Check cache
    if (this.metadataCache.has(metadataPath)) {
      return this.metadataCache.get(metadataPath)!;
    }

    try {
      const response = await fetch(metadataPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }

      const metadata: ModelMetadata = await response.json();
      
      // Cache metadata
      this.metadataCache.set(metadataPath, metadata);

      return metadata;
    } catch (error) {
      console.error('Failed to load metadata:', error);
      throw error;
    }
  }

  /**
   * Save model to browser's IndexedDB
   */
  async saveModelToLocalStorage(
    model: tf.LayersModel,
    storageKey: string
  ): Promise<void> {
    try {
      await model.save(`localstorage://${storageKey}`);
      console.log(`Model saved to local storage: ${storageKey}`);
    } catch (error) {
      console.error('Failed to save model to local storage:', error);
      throw error;
    }
  }

  /**
   * Delete model from local storage
   */
  async deleteModelFromLocalStorage(storageKey: string): Promise<void> {
    try {
      await tf.io.removeModel(`localstorage://${storageKey}`);
      console.log(`Model deleted from local storage: ${storageKey}`);
    } catch (error) {
      console.error('Failed to delete model from local storage:', error);
      throw error;
    }
  }

  /**
   * List all saved models in local storage
   */
  async listLocalModels(): Promise<string[]> {
    try {
      const models = await tf.io.listModels();
      return Object.keys(models).filter(key => key.startsWith('localstorage://'));
    } catch (error) {
      console.error('Failed to list local models:', error);
      return [];
    }
  }

  /**
   * Warm up model by running a dummy prediction
   * This helps improve first real prediction performance
   */
  private async warmUpModel(model: tf.LayersModel): Promise<void> {
    try {
      const inputShape = model.inputs[0].shape as number[];
      const batchSize = 1;
      const features = inputShape.slice(1); // Remove batch dimension

      // Create dummy input
      const dummyInput = tf.randomNormal([batchSize, ...features]);

      // Run prediction
      const output = model.predict(dummyInput) as tf.Tensor;

      // Dispose tensors
      dummyInput.dispose();
      output.dispose();

      console.log('Model warmed up successfully');
    } catch (error) {
      console.warn('Model warm-up failed:', error);
      // Don't throw - warm-up failure is not critical
    }
  }

  /**
   * Get model summary
   */
  getModelSummary(model: tf.LayersModel): string {
    const lines: string[] = [];
    
    lines.push('Model Summary:');
    lines.push('-'.repeat(50));
    
    model.layers.forEach((layer, idx) => {
      const config = layer.getConfig();
      lines.push(`Layer ${idx + 1}: ${config.name} (${layer.constructor.name})`);
      
      if (layer.input instanceof tf.SymbolicTensor) {
        lines.push(`  Input: ${layer.input.shape}`);
      }
      if (layer.output instanceof tf.SymbolicTensor) {
        lines.push(`  Output: ${layer.output.shape}`);
      }
    });
    
    lines.push('-'.repeat(50));
    lines.push(`Total layers: ${model.layers.length}`);
    lines.push(`Trainable: ${model.trainable}`);
    
    return lines.join('\n');
  }

  /**
   * Clear model cache
   */
  clearCache(): void {
    // Dispose all cached models
    this.modelCache.forEach((model) => {
      model.dispose();
    });
    
    this.modelCache.clear();
    this.metadataCache.clear();
    
    console.log('Model cache cleared');
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.modelCache.size;
  }

  /**
   * Check if model is cached
   */
  isCached(cacheKey: string): boolean {
    return this.modelCache.has(cacheKey);
  }

  /**
   * Set TensorFlow.js backend
   */
  async setBackend(backend: 'cpu' | 'webgl' | 'wasm'): Promise<void> {
    try {
      await tf.setBackend(backend);
      await tf.ready();
      console.log(`TensorFlow.js backend set to: ${backend}`);
    } catch (error) {
      console.error(`Failed to set backend to ${backend}:`, error);
      throw error;
    }
  }

  /**
   * Get current backend
   */
  getBackend(): string {
    return tf.getBackend();
  }

  /**
   * Get memory info
   */
  getMemoryInfo(): tf.MemoryInfo {
    return tf.memory();
  }
}

// Export singleton instance
export const modelLoader = new ModelLoader();

export default ModelLoader;
