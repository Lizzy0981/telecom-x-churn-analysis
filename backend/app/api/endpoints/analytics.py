# backend/app/api/endpoints/analytics.py
"""
Analytics Endpoints
===================

Provides comprehensive analytics, KPIs, and business intelligence metrics.

Endpoints:
    GET /kpis: Get key performance indicators
    GET /churn-rate: Get churn rate over time
    GET /revenue: Get revenue metrics over time
    GET /customer-segments: Get customer segmentation analysis
    GET /trends: Get trend data for various metrics
    GET /contract-distribution: Get distribution of contract types
    GET /payment-methods: Get distribution of payment methods
    GET /customer-lifetime-value: Get customer lifetime value analysis
    GET /cohort-analysis: Get cohort retention analysis
    GET /geographic-distribution: Get geographic distribution of customers

Features:
    - Real-time KPI tracking
    - Historical trend analysis
    - Customer segmentation
    - Cohort retention analysis
    - Revenue analytics
    - Geographic insights

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from fastapi import APIRouter, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import random
from datetime import datetime, timedelta
from ..deps import get_current_user

router = APIRouter()

# ==================== MODELS ====================

class KPIMetric(BaseModel):
    label: str
    value: float
    change: float
    trend: str
    unit: str


class ChurnRateData(BaseModel):
    period: str
    churn_rate: float
    total_customers: int
    churned_customers: int


class RevenueData(BaseModel):
    period: str
    revenue: float
    customers: int
    avg_revenue_per_customer: float


class CustomerSegment(BaseModel):
    segment_name: str
    count: int
    percentage: float
    avg_churn_probability: float


class TrendData(BaseModel):
    date: str
    value: float


# ==================== ENDPOINTS ====================

@router.get("/kpis")
async def get_kpis(
    current_user: dict = Depends(get_current_user)
):
    """
    Get key performance indicators
    """
    return {
        "total_customers": {
            "value": 124592,
            "change": 12.5,
            "trend": "up",
            "unit": ""
        },
        "churn_rate": {
            "value": 2.4,
            "change": -0.8,
            "trend": "down",
            "unit": "%"
        },
        "avg_monthly_revenue": {
            "value": 84.32,
            "change": 5.2,
            "trend": "up",
            "unit": "$"
        },
        "retention_rate": {
            "value": 94.2,
            "change": 1.1,
            "trend": "up",
            "unit": "%"
        },
        "high_risk_customers": {
            "value": 3247,
            "change": -8.3,
            "trend": "down",
            "unit": ""
        },
        "avg_customer_lifetime": {
            "value": 32.5,
            "change": 2.1,
            "trend": "up",
            "unit": "months"
        }
    }


@router.get("/churn-rate")
async def get_churn_rate(
    period: str = "30d",
    current_user: dict = Depends(get_current_user)
):
    """
    Get churn rate over time
    """
    # Generate mock data for last 12 months
    data = []
    base_date = datetime.now()
    
    for i in range(12, 0, -1):
        date = base_date - timedelta(days=i*30)
        data.append({
            "period": date.strftime("%Y-%m"),
            "churn_rate": round(random.uniform(2.0, 3.5), 2),
            "total_customers": random.randint(120000, 130000),
            "churned_customers": random.randint(2500, 4000)
        })
    
    return {
        "period": period,
        "data": data,
        "avg_churn_rate": round(sum(d['churn_rate'] for d in data) / len(data), 2)
    }


@router.get("/revenue")
async def get_revenue(
    period: str = "30d",
    current_user: dict = Depends(get_current_user)
):
    """
    Get revenue metrics over time
    """
    data = []
    base_date = datetime.now()
    
    for i in range(12, 0, -1):
        date = base_date - timedelta(days=i*30)
        customers = random.randint(120000, 130000)
        avg_rev = random.uniform(75, 95)
        
        data.append({
            "period": date.strftime("%Y-%m"),
            "revenue": round(customers * avg_rev, 2),
            "customers": customers,
            "avg_revenue_per_customer": round(avg_rev, 2)
        })
    
    return {
        "period": period,
        "data": data,
        "total_revenue": sum(d['revenue'] for d in data)
    }


@router.get("/customer-segments")
async def get_customer_segments(
    current_user: dict = Depends(get_current_user)
):
    """
    Get customer segmentation analysis
    """
    segments = [
        {
            "segment_name": "Low Risk",
            "count": 89234,
            "percentage": 71.6,
            "avg_churn_probability": 0.15,
            "avg_tenure": 45.2,
            "avg_monthly_charges": 72.50
        },
        {
            "segment_name": "Medium Risk",
            "count": 32111,
            "percentage": 25.8,
            "avg_churn_probability": 0.52,
            "avg_tenure": 28.3,
            "avg_monthly_charges": 85.30
        },
        {
            "segment_name": "High Risk",
            "count": 3247,
            "percentage": 2.6,
            "avg_churn_probability": 0.78,
            "avg_tenure": 12.5,
            "avg_monthly_charges": 95.20
        }
    ]
    
    return {
        "total_customers": 124592,
        "segments": segments
    }


@router.get("/trends")
async def get_trends(
    metric: str = "customers",
    period: str = "90d",
    current_user: dict = Depends(get_current_user)
):
    """
    Get trend data for various metrics
    """
    data = []
    base_date = datetime.now()
    days = 90 if period == "90d" else 30
    
    for i in range(days, 0, -1):
        date = base_date - timedelta(days=i)
        
        if metric == "customers":
            value = random.randint(123000, 126000)
        elif metric == "churn":
            value = round(random.uniform(2.0, 3.5), 2)
        elif metric == "revenue":
            value = round(random.uniform(9000000, 11000000), 2)
        else:
            value = random.randint(100, 1000)
        
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "value": value
        })
    
    return {
        "metric": metric,
        "period": period,
        "data": data
    }


@router.get("/contract-distribution")
async def get_contract_distribution(
    current_user: dict = Depends(get_current_user)
):
    """
    Get distribution of contract types
    """
    return {
        "total_customers": 124592,
        "distribution": [
            {
                "contract_type": "Month-to-month",
                "count": 55467,
                "percentage": 44.5,
                "avg_churn_rate": 4.2
            },
            {
                "contract_type": "One year",
                "count": 37378,
                "percentage": 30.0,
                "avg_churn_rate": 1.8
            },
            {
                "contract_type": "Two year",
                "count": 31747,
                "percentage": 25.5,
                "avg_churn_rate": 0.6
            }
        ]
    }


@router.get("/payment-methods")
async def get_payment_methods(
    current_user: dict = Depends(get_current_user)
):
    """
    Get distribution of payment methods
    """
    return {
        "total_customers": 124592,
        "distribution": [
            {
                "payment_method": "Electronic check",
                "count": 37378,
                "percentage": 30.0,
                "avg_churn_rate": 4.5
            },
            {
                "payment_method": "Mailed check",
                "count": 27415,
                "percentage": 22.0,
                "avg_churn_rate": 2.8
            },
            {
                "payment_method": "Bank transfer",
                "count": 31148,
                "percentage": 25.0,
                "avg_churn_rate": 1.5
            },
            {
                "payment_method": "Credit card",
                "count": 28651,
                "percentage": 23.0,
                "avg_churn_rate": 1.2
            }
        ]
    }


@router.get("/customer-lifetime-value")
async def get_customer_lifetime_value(
    current_user: dict = Depends(get_current_user)
):
    """
    Get customer lifetime value analysis
    """
    return {
        "avg_lifetime_value": 2847.60,
        "median_lifetime_value": 2156.30,
        "segments": [
            {
                "segment": "High Value",
                "min_value": 5000,
                "count": 18689,
                "percentage": 15.0
            },
            {
                "segment": "Medium Value",
                "min_value": 2000,
                "count": 62296,
                "percentage": 50.0
            },
            {
                "segment": "Low Value",
                "min_value": 0,
                "count": 43607,
                "percentage": 35.0
            }
        ]
    }


@router.get("/cohort-analysis")
async def get_cohort_analysis(
    current_user: dict = Depends(get_current_user)
):
    """
    Get cohort retention analysis
    """
    cohorts = []
    base_date = datetime.now()
    
    for i in range(6, 0, -1):
        date = base_date - timedelta(days=i*30)
        retention = []
        
        for month in range(6):
            retention.append({
                "month": month,
                "retention_rate": round(100 - (month * random.uniform(5, 15)), 2)
            })
        
        cohorts.append({
            "cohort": date.strftime("%Y-%m"),
            "initial_customers": random.randint(5000, 8000),
            "retention": retention
        })
    
    return {
        "cohorts": cohorts
    }


@router.get("/geographic-distribution")
async def get_geographic_distribution(
    current_user: dict = Depends(get_current_user)
):
    """
    Get geographic distribution of customers
    """
    return {
        "total_customers": 124592,
        "regions": [
            {
                "region": "North America",
                "count": 62296,
                "percentage": 50.0,
                "avg_churn_rate": 2.1
            },
            {
                "region": "Europe",
                "count": 37378,
                "percentage": 30.0,
                "avg_churn_rate": 2.8
            },
            {
                "region": "Asia Pacific",
                "count": 18689,
                "percentage": 15.0,
                "avg_churn_rate": 3.2
            },
            {
                "region": "Latin America",
                "count": 6229,
                "percentage": 5.0,
                "avg_churn_rate": 3.5
            }
        ]
    }
