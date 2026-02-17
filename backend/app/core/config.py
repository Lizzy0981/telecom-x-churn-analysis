# backend/app/core/config.py
"""
Application Configuration
=========================

Centralized configuration management using Pydantic Settings.
Loads configuration from environment variables with type validation.

Environment Variables:
    - APP_NAME: Application name
    - APP_VERSION: Application version
    - DEBUG: Debug mode (true/false)
    - API_V1_PREFIX: API version prefix
    - SECRET_KEY: JWT secret key
    - ACCESS_TOKEN_EXPIRE_MINUTES: Token expiration time
    - DATABASE_URL: Database connection string
    - CORS_ORIGINS: Allowed CORS origins (comma-separated)
    - ML_MODEL_PATH: Path to ML model files
    - MAX_UPLOAD_SIZE: Maximum file upload size in MB
    
Usage:
    from backend.app.core.config import settings
    
    print(settings.APP_NAME)
    print(settings.SECRET_KEY)

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache
import os


class Settings(BaseSettings):
    """
    Application settings with environment variable support.
    
    All settings can be overridden via environment variables.
    Example: APP_NAME="My App" python main.py
    """
    
    # ==================== APPLICATION ====================
    
    APP_NAME: str = "Telecom X API"
    APP_VERSION: str = "0.9.0-beta"
    APP_DESCRIPTION: str = "AI-Powered Customer Churn Analysis Platform"
    DEBUG: bool = True
    
    # API Configuration
    API_V1_PREFIX: str = "/api"
    
    # ==================== SECURITY ====================
    
    SECRET_KEY: str = "your-secret-key-change-in-production-use-env-var"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Password hashing
    PWD_CONTEXT_SCHEMES: List[str] = ["bcrypt"]
    PWD_CONTEXT_DEPRECATED: str = "auto"
    
    # ==================== DATABASE ====================
    
    DATABASE_URL: Optional[str] = None
    DB_ECHO: bool = False  # SQL query logging
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    
    # ==================== CORS ====================
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite dev
        "http://localhost:3000",  # React dev
        "http://localhost:8080",  # Alternative
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]
    
    # ==================== FILE UPLOAD ====================
    
    MAX_UPLOAD_SIZE: int = 50  # MB
    ALLOWED_FILE_EXTENSIONS: List[str] = [
        ".csv", ".xlsx", ".xls", ".json", 
        ".pdf", ".xml", ".tsv", ".txt"
    ]
    UPLOAD_DIR: str = "uploads"
    
    # ==================== MACHINE LEARNING ====================
    
    ML_MODEL_PATH: str = "models"
    ML_MODEL_VERSION: str = "1.0.0"
    ML_MODEL_TYPE: str = "tensorflow"  # tensorflow, sklearn, xgboost
    ML_CONFIDENCE_THRESHOLD: float = 0.7
    ML_BATCH_SIZE: int = 32
    
    # Feature columns for ML model
    ML_FEATURE_COLUMNS: List[str] = [
        "tenure", "MonthlyCharges", "TotalCharges",
        "Contract", "PaymentMethod", "InternetService"
    ]
    
    # ==================== REDIS/CACHE ====================
    
    REDIS_URL: Optional[str] = None
    CACHE_TTL: int = 300  # 5 minutes
    
    # ==================== LOGGING ====================
    
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # ==================== RATE LIMITING ====================
    
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # ==================== EMAIL (Optional) ====================
    
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    
    # ==================== EXTERNAL SERVICES ====================
    
    # Power BI
    POWERBI_CLIENT_ID: Optional[str] = None
    POWERBI_CLIENT_SECRET: Optional[str] = None
    POWERBI_TENANT_ID: Optional[str] = None
    
    # Tableau
    TABLEAU_SERVER_URL: Optional[str] = None
    TABLEAU_SITE_ID: Optional[str] = None
    TABLEAU_TOKEN_NAME: Optional[str] = None
    TABLEAU_TOKEN_VALUE: Optional[str] = None
    
    # ==================== MONITORING ====================
    
    SENTRY_DSN: Optional[str] = None
    ENABLE_METRICS: bool = False
    
    # ==================== DEVELOPMENT ====================
    
    RELOAD: bool = True
    WORKERS: int = 1
    
    class Config:
        """Pydantic configuration"""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        
    # ==================== COMPUTED PROPERTIES ====================
    
    @property
    def database_url_sync(self) -> Optional[str]:
        """Get synchronous database URL"""
        if self.DATABASE_URL:
            return self.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        return None
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.DEBUG
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return not self.DEBUG
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as list"""
        return self.CORS_ORIGINS
    
    # ==================== VALIDATION ====================
    
    def validate_settings(self) -> bool:
        """
        Validate critical settings.
        
        Returns:
            bool: True if all critical settings are valid
        """
        errors = []
        
        # Check secret key in production
        if self.is_production and self.SECRET_KEY == "your-secret-key-change-in-production-use-env-var":
            errors.append("SECRET_KEY must be changed in production")
        
        # Check ML model path exists
        if not os.path.exists(self.ML_MODEL_PATH):
            errors.append(f"ML_MODEL_PATH does not exist: {self.ML_MODEL_PATH}")
        
        if errors:
            for error in errors:
                print(f"⚠️  Configuration Error: {error}")
            return False
        
        return True
    
    def display_settings(self) -> None:
        """Display current settings (excluding sensitive data)"""
        print("=" * 60)
        print("⚙️  TELECOM X - CONFIGURATION")
        print("=" * 60)
        print(f"📦 App Name: {self.APP_NAME}")
        print(f"🔢 Version: {self.APP_VERSION}")
        print(f"🔧 Environment: {'Development' if self.DEBUG else 'Production'}")
        print(f"🌐 API Prefix: {self.API_V1_PREFIX}")
        print(f"⏰ Token Expiry: {self.ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
        print(f"📁 Upload Dir: {self.UPLOAD_DIR}")
        print(f"📊 Max Upload: {self.MAX_UPLOAD_SIZE} MB")
        print(f"🤖 ML Model: {self.ML_MODEL_TYPE} v{self.ML_MODEL_VERSION}")
        print(f"🎯 Confidence: {self.ML_CONFIDENCE_THRESHOLD}")
        print(f"🔗 CORS Origins: {len(self.CORS_ORIGINS)} configured")
        print("=" * 60)


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Uses LRU cache to ensure settings are only loaded once.
    
    Returns:
        Settings: Application settings instance
    """
    return Settings()


# Global settings instance
settings = get_settings()


# Validate settings on import (optional, comment out if not needed)
if __name__ != "__main__":
    settings.validate_settings()
