# 📡 API Documentation

## Overview

Telecom X API provides RESTful endpoints for customer churn analysis, machine learning predictions, and business intelligence operations.

**Base URL:** `http://localhost:8000`  
**API Version:** `v1`  
**Authentication:** JWT Bearer Token

---

## 🔐 Authentication

### Obtain Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Using Token

```http
GET /api/customers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Data Management

### Upload Data

Upload customer data files (CSV, Excel, JSON).

```http
POST /api/data/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: customers.csv
```

**Response:**
```json
{
  "file_id": "uuid-1234-5678",
  "filename": "customers.csv",
  "size": 1048576,
  "rows": 10000,
  "status": "processing"
}
```

### Get Upload Status

```http
GET /api/data/upload/{file_id}/status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "file_id": "uuid-1234-5678",
  "status": "completed",
  "progress": 100,
  "rows_processed": 10000,
  "errors": 0
}
```

### List Datasets

```http
GET /api/data/datasets
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20)
- `sort` (string): Sort field (default: created_at)
- `order` (string): asc or desc (default: desc)

**Response:**
```json
{
  "datasets": [
    {
      "id": "uuid-1234",
      "name": "Q4_2024_Customers",
      "rows": 124592,
      "columns": 42,
      "created_at": "2024-12-15T10:30:00Z",
      "status": "ready"
    }
  ],
  "total": 10,
  "page": 1,
  "pages": 1
}
```

---

## 🤖 Machine Learning

### Predict Churn

Predict churn probability for a single customer or batch.

**Single Prediction:**
```http
POST /api/ml/predict
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": "CUST-12345",
  "tenure": 24,
  "monthly_charges": 89.99,
  "total_charges": 2159.76,
  "contract_type": "Two Year",
  "payment_method": "Credit Card",
  "internet_service": "Fiber Optic",
  "online_security": "Yes",
  "tech_support": "Yes",
  "streaming_tv": "No",
  "streaming_movies": "Yes"
}
```

**Response:**
```json
{
  "customer_id": "CUST-12345",
  "churn_probability": 0.18,
  "churn_prediction": "No Churn",
  "risk_level": "Low",
  "confidence": 0.92,
  "factors": {
    "positive": ["Long tenure", "Two year contract", "Tech support"],
    "negative": ["High monthly charges"]
  }
}
```

**Batch Prediction:**
```http
POST /api/ml/predict/batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "dataset_id": "uuid-1234",
  "model": "xgboost",
  "output_format": "csv"
}
```

**Response:**
```json
{
  "job_id": "job-5678",
  "status": "queued",
  "estimated_time": 120
}
```

### Get Prediction Job Status

```http
GET /api/ml/jobs/{job_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "job_id": "job-5678",
  "status": "completed",
  "progress": 100,
  "predictions": 10000,
  "download_url": "/api/ml/jobs/job-5678/download"
}
```

### Model Performance

```http
GET /api/ml/models/{model_id}/performance
Authorization: Bearer {token}
```

**Response:**
```json
{
  "model_id": "xgboost-v1",
  "accuracy": 0.87,
  "precision": 0.83,
  "recall": 0.88,
  "f1_score": 0.855,
  "auc_roc": 0.91,
  "confusion_matrix": {
    "true_negative": 8420,
    "false_positive": 380,
    "false_negative": 240,
    "true_positive": 960
  }
}
```

---

## 🔍 Explainability

### SHAP Values

Get SHAP explanations for a prediction.

```http
POST /api/ml/explain/shap
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": "CUST-12345",
  "model": "xgboost"
}
```

**Response:**
```json
{
  "customer_id": "CUST-12345",
  "base_value": 0.24,
  "shap_values": {
    "tenure": -0.08,
    "monthly_charges": 0.05,
    "contract_type": -0.12,
    "tech_support": -0.06,
    "internet_service": 0.03
  },
  "prediction": 0.18
}
```

### LIME Explanation

```http
POST /api/ml/explain/lime
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": "CUST-12345",
  "model": "xgboost"
}
```

**Response:**
```json
{
  "customer_id": "CUST-12345",
  "explanation": [
    {
      "feature": "tenure >= 24",
      "weight": -0.15,
      "direction": "decreases_churn"
    },
    {
      "feature": "monthly_charges > 80",
      "weight": 0.08,
      "direction": "increases_churn"
    }
  ]
}
```

---

## 📈 Analytics

### KPIs

```http
GET /api/analytics/kpis
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` (date): Start date (YYYY-MM-DD)
- `end_date` (date): End date (YYYY-MM-DD)
- `segment` (string): Customer segment

**Response:**
```json
{
  "total_customers": 124592,
  "churn_rate": 0.024,
  "retention_rate": 0.976,
  "avg_revenue_per_user": 84.32,
  "customer_lifetime_value": 2016.0,
  "trends": {
    "churn_rate_change": -0.008,
    "revenue_change": 0.052
  }
}
```

### Revenue Analysis

```http
GET /api/analytics/revenue
Authorization: Bearer {token}
```

**Response:**
```json
{
  "total_revenue": 10503974.4,
  "monthly_recurring_revenue": 10503974.4,
  "annual_run_rate": 126047693,
  "by_segment": {
    "premium": 4201589.76,
    "standard": 3151192.32,
    "basic": 3151192.32
  },
  "by_contract": {
    "month_to_month": 3151192.32,
    "one_year": 4201589.76,
    "two_year": 3151192.32
  }
}
```

### Clustering

```http
POST /api/analytics/clustering
Authorization: Bearer {token}
Content-Type: application/json

{
  "dataset_id": "uuid-1234",
  "algorithm": "kmeans",
  "n_clusters": 5
}
```

**Response:**
```json
{
  "job_id": "cluster-9012",
  "status": "processing",
  "estimated_time": 60
}
```

### Get Clustering Results

```http
GET /api/analytics/clustering/{job_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "job_id": "cluster-9012",
  "status": "completed",
  "clusters": [
    {
      "cluster_id": 0,
      "name": "High Value",
      "size": 24918,
      "characteristics": {
        "avg_tenure": 48,
        "avg_monthly_charges": 110.50,
        "churn_rate": 0.012
      }
    },
    {
      "cluster_id": 1,
      "name": "At Risk",
      "size": 12459,
      "characteristics": {
        "avg_tenure": 6,
        "avg_monthly_charges": 75.25,
        "churn_rate": 0.089
      }
    }
  ]
}
```

---

## 📄 Reports

### Generate Report

```http
POST /api/reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "executive",
  "dataset_id": "uuid-1234",
  "format": "pdf",
  "sections": ["kpis", "trends", "predictions", "recommendations"]
}
```

**Response:**
```json
{
  "report_id": "report-3456",
  "status": "generating",
  "estimated_time": 30
}
```

### Download Report

```http
GET /api/reports/{report_id}/download
Authorization: Bearer {token}
```

**Response:** File download

### Export to Power BI

```http
POST /api/reports/export/powerbi
Authorization: Bearer {token}
Content-Type: application/json

{
  "dataset_id": "uuid-1234",
  "dashboard_type": "executive"
}
```

**Response:**
```json
{
  "export_id": "export-7890",
  "status": "processing",
  "download_url": "/api/reports/export/export-7890/download"
}
```

### Export to Tableau

```http
POST /api/reports/export/tableau
Authorization: Bearer {token}
Content-Type: application/json

{
  "dataset_id": "uuid-1234",
  "workbook_type": "technical"
}
```

---

## 🔔 Webhooks

### Register Webhook

```http
POST /api/webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["prediction.completed", "data.uploaded"],
  "secret": "your_webhook_secret"
}
```

**Response:**
```json
{
  "webhook_id": "webhook-1234",
  "url": "https://your-app.com/webhook",
  "events": ["prediction.completed", "data.uploaded"],
  "status": "active"
}
```

### Webhook Payload Example

```json
{
  "event": "prediction.completed",
  "timestamp": "2024-12-15T10:30:00Z",
  "data": {
    "job_id": "job-5678",
    "predictions": 10000,
    "status": "completed"
  }
}
```

---

## 📊 Rate Limits

| Tier | Requests/Hour | Concurrent Jobs |
|------|---------------|-----------------|
| Free | 100 | 1 |
| Basic | 1,000 | 5 |
| Pro | 10,000 | 20 |
| Enterprise | Unlimited | Unlimited |

---

## ❌ Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

**Error Response Format:**
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Tenure must be a positive integer",
    "details": {
      "field": "tenure",
      "value": -5
    }
  }
}
```

---

## 🔗 API Clients

### Python

```python
import requests

API_URL = "http://localhost:8000"
TOKEN = "your_token_here"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Predict churn
response = requests.post(
    f"{API_URL}/api/ml/predict",
    headers=headers,
    json={
        "customer_id": "CUST-12345",
        "tenure": 24,
        "monthly_charges": 89.99
    }
)

print(response.json())
```

### JavaScript

```javascript
const API_URL = "http://localhost:8000";
const TOKEN = "your_token_here";

const headers = {
  "Authorization": `Bearer ${TOKEN}`,
  "Content-Type": "application/json"
};

// Predict churn
const response = await fetch(`${API_URL}/api/ml/predict`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    customer_id: "CUST-12345",
    tenure: 24,
    monthly_charges: 89.99
  })
});

const data = await response.json();
console.log(data);
```

---

## 📚 Additional Resources

- **Interactive API Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI Spec:** http://localhost:8000/openapi.json

---

© 2025 Elizabeth Díaz Familia
