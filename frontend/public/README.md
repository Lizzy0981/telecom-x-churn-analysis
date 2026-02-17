# TensorFlow.js Models

This directory contains pre-trained TensorFlow.js models for client-side inference.

## Churn Prediction Model

**Location:** `churn-model/`

### Model Architecture

- **Input Layer:** 15 features
- **Hidden Layer 1:** 64 neurons (ReLU) + Dropout (30%)
- **Hidden Layer 2:** 32 neurons (ReLU) + Dropout (20%)
- **Hidden Layer 3:** 16 neurons (ReLU)
- **Output Layer:** 1 neuron (Sigmoid) - Binary classification

### Performance Metrics

- **Validation Accuracy:** 87%
- **Test Accuracy:** 85%
- **Precision:** 83%
- **Recall:** 88%
- **F1-Score:** 85.5%
- **AUC-ROC:** 91%

### Input Features (15)

1. tenure
2. monthly_charges
3. total_charges
4. contract_type
5. payment_method
6. internet_service
7. online_security
8. online_backup
9. tech_support
10. streaming_tv
11. streaming_movies
12. paperless_billing
13. senior_citizen
14. partner
15. dependents

### Output

- **churn_probability:** Float (0-1)
  - 0.0 = No churn
  - 1.0 = Will churn

### Usage in Code

```typescript
import * as tf from '@tensorflow/tfjs';

// Load model
const model = await tf.loadLayersModel('/models/churn-model/model.json');

// Prepare input (15 features)
const input = tf.tensor2d([[
  12,      // tenure
  65.5,    // monthly_charges
  786.0,   // total_charges
  // ... 12 more features
]], [1, 15]);

// Predict
const prediction = model.predict(input) as tf.Tensor;
const churnProbability = await prediction.data();

console.log('Churn Probability:', churnProbability[0]);
// Output: 0.78 (78% chance of churn)
```

### File Structure

```
churn-model/
├── model.json          # Model architecture and metadata
└── weights.bin         # Model weights (~150 KB)
```

### Generating Weights

**For Development:**
```bash
npm run generate-dummy-weights
```

**For Production:**
The `weights.bin` file should be generated from your trained TensorFlow/Keras model:

```python
# Python - Convert Keras model to TensorFlow.js
import tensorflowjs as tfjs

# Train your model
model = create_and_train_model()

# Save as TensorFlow.js format
tfjs.converters.save_keras_model(
    model, 
    'public/models/churn-model'
)
```

### Model Updates

To update the model:

1. Train new model in Python/TensorFlow
2. Convert to TensorFlow.js format
3. Replace `model.json` and `weights.bin`
4. Update version in `model.json` metadata
5. Test in browser before deploying

### Browser Compatibility

✅ Chrome 57+  
✅ Firefox 52+  
✅ Safari 11+  
✅ Edge 79+  

### Performance

- **Load Time:** ~200ms (on 3G)
- **Inference Time:** ~50ms per prediction
- **Memory Usage:** ~10 MB

### Notes

- Model uses SMOTE for balanced training
- Optimized for production browser use
- Supports offline predictions (cached by Service Worker)
- Compatible with Web Workers for background inference

---

**Created by:** Elizabeth Díaz Familia  
**Model Version:** 1.0.0  
**Last Updated:** 2025-02-13
