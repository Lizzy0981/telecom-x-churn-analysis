// frontend/src/services/ml/brain/SimplePredictor.ts
/**
 * Simple Churn Predictor using Brain.js
 * Lightweight alternative to TensorFlow.js for simple neural networks
 */

import * as brain from 'brain.js';

export interface SimplePredictionInput {
  tenure: number;        // 0-72 months
  monthlyCharges: number; // 0-120 dollars
  totalCharges: number;   // 0-9000 dollars
  hasContract: number;    // 0 or 1
  hasTechSupport: number; // 0 or 1
}

export interface SimplePredictionResult {
  churnProbability: number;
  churnLabel: 0 | 1;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export class SimplePredictor {
  private network: brain.NeuralNetwork | null = null;
  private isInitialized: boolean = false;
  private isTrained: boolean = false;

  /**
   * Initialize the neural network
   */
  initialize(config?: Partial<brain.INeuralNetworkOptions>): void {
    const defaultConfig: Partial<brain.INeuralNetworkOptions> = {
      hiddenLayers: [8, 4], // 2 hidden layers with 8 and 4 neurons
      activation: 'sigmoid',
      learningRate: 0.01,
      iterations: 20000,
      errorThresh: 0.005,
      log: false,
      logPeriod: 1000
    };

    this.network = new brain.NeuralNetwork({
      ...defaultConfig,
      ...config
    });

    this.isInitialized = true;
    console.log('SimplePredictor initialized');
  }

  /**
   * Train the network with sample data
   */
  async train(trainingData?: Array<{ input: SimplePredictionInput; output: { churn: number } }>): Promise<void> {
    if (!this.isInitialized || !this.network) {
      throw new Error('SimplePredictor not initialized. Call initialize() first.');
    }

    // Use provided data or generate sample training data
    const data = trainingData || this.generateSampleTrainingData();

    console.log(`Training SimplePredictor with ${data.length} samples...`);

    // Train the network
    const stats = this.network.train(data, {
      log: true,
      logPeriod: 1000,
      errorThresh: 0.005,
      iterations: 20000
    });

    this.isTrained = true;

    console.log('Training complete:', {
      iterations: stats.iterations,
      error: stats.error
    });
  }

  /**
   * Generate sample training data (for demo purposes)
   */
  private generateSampleTrainingData(): Array<{ input: SimplePredictionInput; output: { churn: number } }> {
    const samples: Array<{ input: SimplePredictionInput; output: { churn: number } }> = [];

    // Generate 200 synthetic samples
    for (let i = 0; i < 200; i++) {
      const tenure = Math.random() * 72;
      const monthlyCharges = 20 + Math.random() * 100;
      const totalCharges = tenure * monthlyCharges * (0.8 + Math.random() * 0.4);
      const hasContract = Math.random() > 0.6 ? 1 : 0;
      const hasTechSupport = Math.random() > 0.5 ? 1 : 0;

      // Simple heuristic for churn label
      let churnScore = 0;
      if (tenure < 12) churnScore += 0.4;
      if (monthlyCharges > 80) churnScore += 0.3;
      if (hasContract === 0) churnScore += 0.2;
      if (hasTechSupport === 0) churnScore += 0.1;

      const churn = churnScore > 0.5 ? 1 : 0;

      samples.push({
        input: {
          tenure: this.normalize(tenure, 0, 72),
          monthlyCharges: this.normalize(monthlyCharges, 20, 120),
          totalCharges: this.normalize(totalCharges, 0, 9000),
          hasContract,
          hasTechSupport
        },
        output: { churn }
      });
    }

    return samples;
  }

  /**
   * Make prediction
   */
  predict(input: SimplePredictionInput): SimplePredictionResult {
    if (!this.isTrained || !this.network) {
      throw new Error('SimplePredictor not trained. Call train() first.');
    }

    // Normalize inputs
    const normalizedInput = {
      tenure: this.normalize(input.tenure, 0, 72),
      monthlyCharges: this.normalize(input.monthlyCharges, 20, 120),
      totalCharges: this.normalize(input.totalCharges, 0, 9000),
      hasContract: input.hasContract,
      hasTechSupport: input.hasTechSupport
    };

    // Run prediction
    const output = this.network.run(normalizedInput) as { churn: number };
    const churnProbability = output.churn;
    const churnLabel = churnProbability >= 0.5 ? 1 : 0;
    const confidence = churnProbability >= 0.5 ? churnProbability : 1 - churnProbability;
    const riskLevel = this.getRiskLevel(churnProbability);

    return {
      churnProbability,
      churnLabel,
      confidence,
      riskLevel
    };
  }

  /**
   * Normalize value to [0, 1]
   */
  private normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }

  /**
   * Determine risk level
   */
  private getRiskLevel(probability: number): 'low' | 'medium' | 'high' {
    if (probability >= 0.7) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Export network to JSON
   */
  toJSON(): any {
    if (!this.network) {
      throw new Error('Network not initialized');
    }
    return this.network.toJSON();
  }

  /**
   * Import network from JSON
   */
  fromJSON(json: any): void {
    if (!this.isInitialized || !this.network) {
      this.initialize();
    }
    this.network!.fromJSON(json);
    this.isTrained = true;
    console.log('Network loaded from JSON');
  }

  /**
   * Save to localStorage
   */
  saveToLocalStorage(key: string = 'brain_churn_model'): void {
    if (!this.network) {
      throw new Error('Network not initialized');
    }

    const json = this.toJSON();
    localStorage.setItem(key, JSON.stringify(json));
    console.log(`Model saved to localStorage: ${key}`);
  }

  /**
   * Load from localStorage
   */
  loadFromLocalStorage(key: string = 'brain_churn_model'): void {
    const jsonStr = localStorage.getItem(key);
    if (!jsonStr) {
      throw new Error(`No model found in localStorage: ${key}`);
    }

    const json = JSON.parse(jsonStr);
    this.fromJSON(json);
    console.log(`Model loaded from localStorage: ${key}`);
  }

  /**
   * Check if ready
   */
  isReady(): boolean {
    return this.isInitialized && this.isTrained;
  }

  /**
   * Get network info
   */
  getInfo(): any {
    if (!this.network) {
      return null;
    }

    return {
      type: 'Brain.js Neural Network',
      initialized: this.isInitialized,
      trained: this.isTrained,
      structure: this.network.toJSON()?.sizes || []
    };
  }
}

// Export singleton instance
export const simplePredictor = new SimplePredictor();

export default SimplePredictor;
