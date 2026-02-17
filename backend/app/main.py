# backend/app/main.py
"""
Telecom X - Main FastAPI Application
=====================================

Main application entry point for the Telecom X Customer Churn Analysis Platform.
This module initializes the FastAPI application, configures middleware, and
includes all API routes.

Features:
    - RESTful API with 52+ endpoints
    - JWT-based authentication
    - CORS middleware for cross-origin requests
    - Automatic API documentation (Swagger/OpenAPI)
    - Machine Learning predictions
    - Power BI & Tableau integration
    - Multi-format data parsing (CSV, Excel, JSON, PDF, XML, TSV, TXT)

API Documentation:
    - Swagger UI: http://localhost:8000/docs
    - ReDoc: http://localhost:8000/redoc
    - OpenAPI JSON: http://localhost:8000/openapi.json

Environment:
    - Development: DEBUG=true
    - Production: DEBUG=false

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
Version: 0.9.0-beta
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from typing import Dict, Any

# Import API router
from .api import api_router

# ==================== LOGGING CONFIGURATION ====================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== FASTAPI APPLICATION ====================

app = FastAPI(
    title="Telecom X API",
    description="""
    ## AI-Powered Customer Churn Analysis Platform
    
    A comprehensive platform for predicting customer churn using machine learning,
    providing analytics, and integrating with business intelligence tools.
    
    ### Key Features:
    
    * **Authentication** - JWT-based secure authentication
    * **Data Management** - Upload and process datasets in multiple formats
    * **Machine Learning** - Real-time and batch churn predictions
    * **Analytics** - Comprehensive KPIs and business metrics
    * * **Exports** - Export data to CSV, Excel, JSON, PDF
    * **BI Integration** - Direct integration with Power BI and Tableau
    
    ### Supported Formats:
    
    * CSV, Excel (.xlsx, .xls), JSON, PDF, XML, TSV, TXT
    
    ### Author:
    
    Elizabeth Díaz Familia - Backend API Developer
    """,
    version="0.9.0-beta",
    contact={
        "name": "Elizabeth Díaz Familia",
        "email": "lizzyfamilia@gmail.com",
        "url": "https://github.com/Lizzy0981"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
    },
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# ==================== MIDDLEWARE CONFIGURATION ====================

# CORS Middleware - Configure for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # React dev server
        "https://telecom-x-pro.vercel.app",  # Production frontend
        # Add your production domains here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== API ROUTES ====================

# Include main API router with /api prefix
app.include_router(api_router, prefix="/api")

# ==================== ROOT ENDPOINTS ====================

@app.get("/", tags=["root"])
async def root() -> Dict[str, Any]:
    """
    Root endpoint - API health check and information.
    
    Returns:
        dict: API status, version, and available endpoints
    """
    return {
        "status": "online",
        "service": "Telecom X API",
        "version": "0.9.0-beta",
        "author": "Elizabeth Díaz Familia",
        "description": "AI-Powered Customer Churn Analysis Platform",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "openapi": "/openapi.json",
            "api": "/api"
        },
        "features": [
            "JWT Authentication",
            "Data Upload & Processing",
            "Machine Learning Predictions",
            "Analytics Dashboard",
            "Export Reports",
            "Power BI Integration",
            "Tableau Integration"
        ],
        "supported_formats": [
            "CSV", "Excel", "JSON", "PDF", "XML", "TSV", "TXT"
        ]
    }


@app.get("/health", tags=["root"])
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint for monitoring and load balancers.
    
    Returns:
        dict: Simple health status
    """
    return {
        "status": "healthy",
        "service": "telecom-x-api"
    }


@app.get("/version", tags=["root"])
async def version() -> Dict[str, str]:
    """
    Get API version information.
    
    Returns:
        dict: Version details
    """
    return {
        "version": "0.9.0-beta",
        "api_version": "v1",
        "build": "production-ready"
    }

# ==================== ERROR HANDLERS ====================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 Not Found errors"""
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": "Not Found",
            "message": f"The requested resource was not found: {request.url.path}",
            "suggestion": "Check the API documentation at /docs"
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 Internal Server errors"""
    logger.error(f"Internal server error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please try again later."
        }
    )

# ==================== STARTUP & SHUTDOWN EVENTS ====================

@app.on_event("startup")
async def startup_event():
    """
    Execute on application startup.
    Initialize connections, load models, etc.
    """
    logger.info("=" * 60)
    logger.info("🚀 Telecom X API Starting...")
    logger.info("=" * 60)
    logger.info("✅ FastAPI application initialized")
    logger.info("✅ CORS middleware configured")
    logger.info("✅ API routes loaded")
    logger.info("✅ Documentation available at /docs")
    logger.info("=" * 60)
    logger.info("🎯 Service: Telecom X - Customer Churn Analysis")
    logger.info("👤 Author: Elizabeth Díaz Familia")
    logger.info("📦 Version: 0.9.0-beta")
    logger.info("=" * 60)
    
    # TODO: Initialize database connections
    # TODO: Load ML models
    # TODO: Setup cache
    logger.info("✅ Application startup complete!")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Execute on application shutdown.
    Close connections, cleanup resources, etc.
    """
    logger.info("=" * 60)
    logger.info("🛑 Telecom X API Shutting down...")
    logger.info("=" * 60)
    
    # TODO: Close database connections
    # TODO: Cleanup resources
    # TODO: Save state if needed
    
    logger.info("✅ Application shutdown complete!")
    logger.info("=" * 60)

# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    
    # Run with uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Set to False in production
        log_level="info"
    )
