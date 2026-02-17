# backend/app/schemas/user.py
"""
User Schemas
============

Pydantic schemas for user authentication and management.

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User roles"""
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"
    API_USER = "api_user"


# ==================== BASE SCHEMAS ====================

class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    full_name: str = Field(..., min_length=2, max_length=255, description="Full name")


# ==================== REQUEST SCHEMAS ====================

class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=100, description="Password (min 8 chars)")
    role: UserRole = Field(default=UserRole.VIEWER, description="User role")
    
    @validator('password')
    def validate_password_strength(cls, v):
        """Validate password strength"""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "email": "analyst@telecom.com",
                "username": "analyst1",
                "full_name": "Jane Doe",
                "password": "SecurePass123",
                "role": "analyst"
            }
        }


class UserLogin(BaseModel):
    """Schema for user login"""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")
    
    class Config:
        schema_extra = {
            "example": {
                "username": "analyst1",
                "password": "SecurePass123"
            }
        }


class UserUpdate(BaseModel):
    """Schema for user profile update"""
    email: Optional[EmailStr] = Field(None, description="New email")
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    role: Optional[UserRole] = None


class PasswordReset(BaseModel):
    """Schema for password reset"""
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password")


class EmailVerification(BaseModel):
    """Schema for email verification"""
    token: str = Field(..., description="Email verification token")


# ==================== RESPONSE SCHEMAS ====================

class UserResponse(UserBase):
    """Schema for user response"""
    id: str = Field(..., description="User UUID")
    role: UserRole
    is_active: bool
    is_email_verified: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
        schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "analyst@telecom.com",
                "username": "analyst1",
                "full_name": "Jane Doe",
                "role": "analyst",
                "is_active": True,
                "is_email_verified": True,
                "created_at": "2024-01-15T10:30:00",
                "last_login_at": "2024-02-13T14:22:00"
            }
        }


# ==================== TOKEN SCHEMAS ====================

class Token(BaseModel):
    """JWT token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")
    
    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800
            }
        }


class TokenData(BaseModel):
    """Token payload data"""
    user_id: str
    username: str
    role: UserRole
