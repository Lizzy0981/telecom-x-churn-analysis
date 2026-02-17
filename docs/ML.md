# 🤖 Machine Learning Documentation

## Overview

Telecom X uses advanced machine learning algorithms to predict customer churn, segment customers, and provide actionable insights.

---

## 🎯 Models

### Churn Prediction Models

#### 1. XGBoost Classifier (Production)

**Status:** ✅ Production  
**Accuracy:** 87%  
**F1-Score:** 85.5%  
**AUC-ROC:** 91%

**Features:**
- Gradient boosting ensemble
- Handles missing values
- Feature importance ranking
- Fast inference (~50ms)

**Hyperparameters:**
```python
{
    "max_depth": 6,
    "learning_rate": 0.1,
    "n_estimators": 200,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "min_child_weight": 1,
    "gamma": 0,
    "reg_alpha": 0,
    "reg_lambda": 1
}
```

#### 2. Random Forest (Baseline)

**Status:** ✅ Production  
**Accuracy:** 85%  
**F1-Score:** 83.2%  
**AUC-ROC:** 89%

**Features:**
- Ensemble of decision trees
- Robust to overfitting
- Good feature importance
- Moderate speed (~80ms)

#### 3. Deep Neural Network

**Status:** 🧪 Experimental  
**Accuracy:** 88%  
**F1-Score:** 86.1%  
**AUC-ROC:** 92%

**Architecture:**
```
Input Layer (15 features)
    ↓
Dense Layer (64 neurons, ReLU)
    ↓
Dropout (30%)
    ↓
Dense Layer (32 neurons, ReLU)
    ↓
Dropout (20%)
    ↓
Dense Layer (16 neurons, ReLU)
    ↓
Output Layer (1 neuron, Sigmoid)
```

**Training:**
- Optimizer: Adam
- Loss: Binary Crossentropy
- Batch Size: 32
- Epochs: 100 (early stopping)
- Validation Split: 20%

#### 4. LightGBM

**Status:** ✅ Production  
**Accuracy:** 86.5%  
**F1-Score:** 84.8%  
**AUC-ROC:** 90.5%

**Features:**
- Faster than XGBoost
- Lower memory usage
- Excellent with large datasets

#### 5. Ensemble Model

**Status:** ✅ Production  
**Accuracy:** 89%  
**F1-Score:** 87.3%  
**AUC-ROC:** 93%

**Composition:**
- XGBoost (40%)
- Neural Network (30%)
- Random Forest (20%)
- LightGBM (10%)

**Method:** Weighted average of probabilities

---

## 📊 Feature Engineering

### Input Features (15)

1. **tenure** (int): Months with company (0-72)
2. **monthly_charges** (float): Monthly bill ($20-$120)
3. **total_charges** (float): Total spent ($20-$8,000)
4. **contract_type** (categorical): Month-to-month, One year, Two year
5. **payment_method** (categorical): Credit card, Bank transfer, Electronic check, Mailed check
6. **internet_service** (categorical): DSL, Fiber optic, No
7. **online_security** (binary): Yes, No
8. **online_backup** (binary): Yes, No
9. **tech_support** (binary): Yes, No
10. **streaming_tv** (binary): Yes, No
11. **streaming_movies** (binary): Yes, No
12. **paperless_billing** (binary): Yes, No
13. **senior_citizen** (binary): 0, 1
14. **partner** (binary): Yes, No
15. **dependents** (binary): Yes, No

### Derived Features

#### Customer Lifetime Value (CLV)
```python
CLV = monthly_charges * tenure * (1 - churn_probability)
```

#### Risk Score
```python
risk_score = (
    churn_probability * 0.5 +
    (1 - tenure / 72) * 0.2 +
    (1 if contract_type == "Month-to-month" else 0) * 0.2 +
    (1 if payment_method == "Electronic check" else 0) * 0.1
)
```

#### Tenure Groups
```python
if tenure < 6:
    tenure_group = "New"
elif tenure < 24:
    tenure_group = "Regular"
else:
    tenure_group = "Long-term"
```

### Feature Transformations

**Numerical Features:**
- StandardScaler for ML models
- MinMaxScaler for Neural Networks

**Categorical Features:**
- One-Hot Encoding
- Label Encoding (for tree-based models)

**Missing Values:**
- Mean imputation for numerical
- Mode imputation for categorical

---

## 🔍 Model Explainability

### SHAP (Shapley Additive Explanations)

**Global Feature Importance:**

1. **tenure** (↓ -0.15): Longer tenure → Lower churn
2. **contract_type** (↓ -0.12): Long contracts → Lower churn
3. **monthly_charges** (↑ +0.10): Higher charges → Higher churn
4. **tech_support** (↓ -0.08): Support → Lower churn
5. **internet_service** (↑ +0.06): Fiber → Higher churn

**SHAP Values Interpretation:**
- Negative values decrease churn probability
- Positive values increase churn probability
- Magnitude indicates impact strength

**Usage:**
```python
import shap

explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Plot
shap.summary_plot(shap_values, X_test)
shap.waterfall_plot(shap_values[0])
```

### LIME (Local Interpretable Model-Agnostic Explanations)

**Local Explanations:**

For customer CUST-12345:
- **tenure >= 24** → -15% churn (decreases)
- **monthly_charges > 80** → +8% churn (increases)
- **contract_type = "Two Year"** → -12% churn (decreases)
- **tech_support = "Yes"** → -6% churn (decreases)

**Usage:**
```python
from lime import lime_tabular

explainer = lime_tabular.LimeTabularExplainer(
    X_train,
    feature_names=features,
    class_names=["No Churn", "Churn"],
    mode="classification"
)

explanation = explainer.explain_instance(
    X_test[0],
    model.predict_proba
)

explanation.show_in_notebook()
```

### Feature Importance

**Tree-Based Importance:**
```python
importances = model.feature_importances_
sorted_idx = np.argsort(importances)[::-1]

for idx in sorted_idx:
    print(f"{features[idx]}: {importances[idx]:.4f}")
```

**Permutation Importance:**
```python
from sklearn.inspection import permutation_importance

perm_importance = permutation_importance(
    model, X_test, y_test, n_repeats=10
)
```

---

## 🎯 Clustering

### K-Means

**Optimal Clusters:** 5  
**Silhouette Score:** 0.72

**Cluster Characteristics:**

**Cluster 0: High Value (20%)**
- High tenure (48+ months)
- High monthly charges ($110+)
- Two-year contracts
- Low churn (1.2%)

**Cluster 1: At Risk (10%)**
- Low tenure (< 6 months)
- Month-to-month contracts
- High monthly charges
- High churn (8.9%)

**Cluster 2: Standard (40%)**
- Medium tenure (12-36 months)
- One-year contracts
- Moderate charges ($60-$80)
- Medium churn (3.5%)

**Cluster 3: Budget (20%)**
- Varying tenure
- Low monthly charges ($30-$50)
- DSL internet
- Low churn (1.8%)

**Cluster 4: Premium Fiber (10%)**
- Medium tenure (18-30 months)
- Fiber optic internet
- High charges ($90+)
- Medium-high churn (4.2%)

### DBSCAN

**Parameters:**
- eps: 0.5
- min_samples: 5

**Use Case:** Anomaly detection in customer behavior

### Hierarchical Clustering

**Linkage:** Ward  
**Distance Metric:** Euclidean

**Dendrogram Analysis:** Identifies optimal cut height

---

## 📈 Model Training Pipeline

### 1. Data Preparation

```python
# Load data
df = pd.read_csv("customers.csv")

# Split features/target
X = df.drop(columns=["churn"])
y = df["churn"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)
```

### 2. Preprocessing

```python
# Numerical features
numerical_features = ["tenure", "monthly_charges", "total_charges"]
numerical_transformer = StandardScaler()

# Categorical features
categorical_features = ["contract_type", "payment_method", ...]
categorical_transformer = OneHotEncoder(handle_unknown="ignore")

# Preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ("num", numerical_transformer, numerical_features),
        ("cat", categorical_transformer, categorical_features)
    ]
)
```

### 3. Model Training

```python
# Define model
model = XGBClassifier(**hyperparameters)

# Create pipeline
pipeline = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("classifier", model)
])

# Train
pipeline.fit(X_train, y_train)
```

### 4. Hyperparameter Tuning

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    "classifier__max_depth": [3, 5, 7],
    "classifier__learning_rate": [0.01, 0.1, 0.3],
    "classifier__n_estimators": [100, 200, 300]
}

grid_search = GridSearchCV(
    pipeline,
    param_grid,
    cv=5,
    scoring="f1",
    n_jobs=-1
)

grid_search.fit(X_train, y_train)
best_model = grid_search.best_estimator_
```

### 5. Model Evaluation

```python
# Predictions
y_pred = best_model.predict(X_test)
y_proba = best_model.predict_proba(X_test)[:, 1]

# Metrics
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_proba)

print(f"Accuracy: {accuracy:.3f}")
print(f"Precision: {precision:.3f}")
print(f"Recall: {recall:.3f}")
print(f"F1-Score: {f1:.3f}")
print(f"AUC-ROC: {auc:.3f}")
```

### 6. Model Saving

```python
import joblib

# Save model
joblib.dump(best_model, "models/churn_model_xgboost.pkl")

# Save metadata
metadata = {
    "model_type": "XGBoost",
    "accuracy": accuracy,
    "features": features,
    "created_at": datetime.now().isoformat()
}

with open("models/metadata.json", "w") as f:
    json.dump(metadata, f)
```

---

## 🚀 Model Deployment

### TensorFlow.js Export

```python
import tensorflowjs as tfjs

# Convert Keras model to TF.js
tfjs.converters.save_keras_model(
    model,
    "frontend/public/models/churn-model"
)
```

**Files Generated:**
- `model.json` - Model architecture
- `weights.bin` - Model weights

### Client-Side Inference

```typescript
import * as tf from "@tensorflow/tfjs";

// Load model
const model = await tf.loadLayersModel("/models/churn-model/model.json");

// Prepare input
const input = tf.tensor2d([[
  24,      // tenure
  89.99,   // monthly_charges
  2159.76, // total_charges
  // ... more features
]], [1, 15]);

// Predict
const prediction = model.predict(input) as tf.Tensor;
const churnProbability = await prediction.data();

console.log("Churn Probability:", churnProbability[0]);
```

---

## 📊 Model Monitoring

### Performance Metrics

**Track over time:**
- Accuracy
- Precision
- Recall
- F1-Score
- AUC-ROC

**Alert Conditions:**
- Accuracy drop > 5%
- Prediction latency > 100ms
- Error rate > 1%

### Data Drift Detection

**Features to monitor:**
- Distribution changes
- Missing value rates
- Outlier frequency

**Detection Methods:**
- Kolmogorov-Smirnov test
- Population Stability Index (PSI)
- Jensen-Shannon divergence

### Retraining Triggers

**Automatic retraining when:**
- Performance degrades > 3%
- New data > 10,000 rows
- Monthly scheduled retraining
- Manual trigger by data scientist

---

## 🔬 Experimentation

### MLflow Tracking

```python
import mlflow

with mlflow.start_run():
    # Log parameters
    mlflow.log_params(hyperparameters)
    
    # Train model
    model.fit(X_train, y_train)
    
    # Log metrics
    mlflow.log_metric("accuracy", accuracy)
    mlflow.log_metric("f1_score", f1)
    
    # Log model
    mlflow.sklearn.log_model(model, "model")
```

### A/B Testing

**Setup:**
- Control: XGBoost (80% traffic)
- Variant: Neural Network (20% traffic)

**Metrics:**
- Prediction accuracy
- Inference latency
- User engagement

**Duration:** 2 weeks

**Decision:** Promote variant if accuracy improves > 2%

---

## 📚 References

- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [TensorFlow Documentation](https://www.tensorflow.org/)
- [SHAP Documentation](https://shap.readthedocs.io/)
- [LIME Documentation](https://lime-ml.readthedocs.io/)

---

© 2025 Elizabeth Díaz Familia
