# 📡 API Documentation - Telecom X

Complete API reference for Telecom X Customer Churn Analysis platform.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Customers API](#customers-api)
  - [KPIs API](#kpis-api)
  - [Predictions API](#predictions-api)
  - [Reports API](#reports-api)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## 🌐 Overview

The Telecom X API provides programmatic access to customer data, churn predictions, KPIs, and reports.

**Features:**
- ✅ RESTful design
- ✅ JSON responses
- ✅ Comprehensive error messages
- ✅ Rate limiting
- ✅ Pagination support

---

## 🔗 Base URL

```
Development: http://localhost:8000/api/v1
Production:  https://api.telecom-x.com/v1
```

---

## 🔐 Authentication

### API Key Authentication

Include your API key in the request headers:

```http
Authorization: Bearer YOUR_API_KEY_HERE
```

### Example

```bash
curl -H "Authorization: Bearer sk_test_123456789" \
     https://api.telecom-x.com/v1/customers
```

---

## 📌 Endpoints

### Customers API

#### GET /customers

Retrieve all customers with optional filtering.

**Request:**
```http
GET /api/v1/customers?limit=10&offset=0&segment=Premium
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Number of results (default: 20, max: 100) |
| offset | integer | No | Offset for pagination (default: 0) |
| segment | string | No | Filter by segment (Entry, Standard, Premium, Power User) |
| churn | string | No | Filter by churn status (Yes, No) |
| minTenure | integer | No | Minimum tenure in months |
| maxTenure | integer | No | Maximum tenure in months |

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "customerID": "CUST-001",
      "gender": "Male",
      "seniorCitizen": false,
      "tenure": 24,
      "monthlyCharges": 65.50,
      "totalCharges": 1572.00,
      "contract": "One Year",
      "segment": "Standard",
      "churn": "No",
      "riskScore": 35
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 500
  }
}
```

---

#### GET /customers/:id

Retrieve a specific customer by ID.

**Request:**
```http
GET /api/v1/customers/CUST-001
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "customerID": "CUST-001",
    "gender": "Male",
    "seniorCitizen": false,
    "partner": true,
    "dependents": false,
    "tenure": 24,
    "phoneService": true,
    "internetService": "Fiber optic",
    "monthlyCharges": 65.50,
    "totalCharges": 1572.00,
    "contract": "One Year",
    "paymentMethod": "Electronic check",
    "segment": "Standard",
    "churn": "No",
    "riskScore": 35,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-12-25T15:45:00Z"
  }
}
```

---

#### POST /customers

Create a new customer record.

**Request:**
```http
POST /api/v1/customers
Content-Type: application/json

{
  "customerID": "CUST-999",
  "gender": "Female",
  "tenure": 12,
  "monthlyCharges": 75.00,
  "contract": "Month-to-month"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "customerID": "CUST-999",
    "message": "Customer created successfully"
  }
}
```

---

#### PATCH /customers/:id

Update an existing customer.

**Request:**
```http
PATCH /api/v1/customers/CUST-001
Content-Type: application/json

{
  "monthlyCharges": 70.00,
  "contract": "Two Year"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "customerID": "CUST-001",
    "message": "Customer updated successfully"
  }
}
```

---

### KPIs API

#### GET /kpis

Retrieve key performance indicators.

**Request:**
```http
GET /api/v1/kpis
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalCustomers": 500,
    "churnRate": 27.0,
    "retentionRate": 73.0,
    "avgMonthlyCharges": 64.76,
    "avgTenure": 32.4,
    "highRiskCustomers": 45,
    "totalRevenue": 2400000,
    "avgCustomerLifetimeValue": 3240,
    "netPromoterScore": 42
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

#### GET /kpis/segment/:segment

Get KPIs for a specific customer segment.

**Request:**
```http
GET /api/v1/kpis/segment/Premium
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "segment": "Premium",
    "customerCount": 125,
    "churnRate": 15.0,
    "avgMonthlyCharges": 89.50,
    "avgTenure": 48.3
  }
}
```

---

### Predictions API

#### POST /predict

Predict churn probability for a customer.

**Request:**
```http
POST /api/v1/predict
Content-Type: application/json

{
  "customerID": "CUST-999",
  "tenure": 12,
  "monthlyCharges": 65.50,
  "totalCharges": 786.00,
  "contract": "Month-to-month",
  "paymentMethod": "Electronic check",
  "internetService": "Fiber optic"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "customerID": "CUST-999",
    "churnPrediction": "Yes",
    "churnProbability": 0.78,
    "riskScore": 78,
    "confidence": "high",
    "topFactors": [
      "Month-to-month contract",
      "Electronic check payment",
      "Low tenure (12 months)"
    ],
    "recommendations": [
      "Offer annual contract discount",
      "Suggest automatic payment",
      "Provide loyalty rewards"
    ]
  }
}
```

---

#### POST /predict/batch

Predict churn for multiple customers.

**Request:**
```http
POST /api/v1/predict/batch
Content-Type: application/json

{
  "customers": [
    {
      "customerID": "CUST-001",
      "tenure": 24,
      "monthlyCharges": 65.50
    },
    {
      "customerID": "CUST-002",
      "tenure": 6,
      "monthlyCharges": 85.00
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "predictions": [
      {
        "customerID": "CUST-001",
        "churnProbability": 0.35,
        "riskScore": 35
      },
      {
        "customerID": "CUST-002",
        "churnProbability": 0.82,
        "riskScore": 82
      }
    ],
    "processed": 2,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### Reports API

#### POST /reports/generate

Generate a PDF or Excel report.

**Request:**
```http
POST /api/v1/reports/generate
Content-Type: application/json

{
  "type": "executive",
  "format": "pdf",
  "includeKPIs": true,
  "includeCharts": true,
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "reportID": "RPT-20250115-001",
    "downloadURL": "https://api.telecom-x.com/v1/reports/download/RPT-20250115-001",
    "expiresAt": "2025-01-22T10:30:00Z"
  }
}
```

---

#### GET /reports/:reportID

Download a generated report.

**Request:**
```http
GET /api/v1/reports/RPT-20250115-001
```

**Response:**
Binary file download (PDF or Excel)

---

## 📊 Response Formats

### Success Response

```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Error Response

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid customer data",
    "details": [
      "tenure must be a positive integer",
      "monthlyCharges must be greater than 0"
    ]
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Request validation failed |
| AUTHENTICATION_ERROR | Authentication failed |
| NOT_FOUND | Resource not found |
| RATE_LIMIT_EXCEEDED | Too many requests |
| INTERNAL_ERROR | Internal server error |

---

## 🚦 Rate Limiting

### Limits

- **Free Tier:** 100 requests/hour
- **Pro Tier:** 1,000 requests/hour
- **Enterprise:** Unlimited

### Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705315200
```

### Rate Limit Response

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 3600 seconds.",
    "retryAfter": 3600
  }
}
```

---

## 💡 Examples

### Python Example

```python
import requests

API_URL = "http://localhost:8000/api/v1"
API_KEY = "your_api_key_here"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Get customers
response = requests.get(f"{API_URL}/customers", headers=headers)
customers = response.json()

# Predict churn
customer_data = {
    "customerID": "CUST-999",
    "tenure": 12,
    "monthlyCharges": 65.50
}

response = requests.post(
    f"{API_URL}/predict",
    headers=headers,
    json=customer_data
)
prediction = response.json()
```

### JavaScript Example

```javascript
const API_URL = 'http://localhost:8000/api/v1';
const API_KEY = 'your_api_key_here';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};

// Get customers
fetch(`${API_URL}/customers`, { headers })
  .then(res => res.json())
  .then(data => console.log(data));

// Predict churn
const customerData = {
  customerID: 'CUST-999',
  tenure: 12,
  monthlyCharges: 65.50
};

fetch(`${API_URL}/predict`, {
  method: 'POST',
  headers,
  body: JSON.stringify(customerData)
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### cURL Example

```bash
# Get customers
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:8000/api/v1/customers

# Predict churn
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"customerID":"CUST-999","tenure":12,"monthlyCharges":65.50}' \
     http://localhost:8000/api/v1/predict
```

---

## 🔗 Related Documentation

- [Installation Guide](INSTALLATION.md)
- [Usage Guide](USAGE_GUIDE.md)
- [Architecture Guide](ARCHITECTURE.md)

---

**Developed with 💜 by Elizabeth Díaz Familia**
