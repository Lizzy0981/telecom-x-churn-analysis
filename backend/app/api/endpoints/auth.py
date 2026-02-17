# backend/app/api/endpoints/auth.py
"""
Authentication Endpoints
========================

Handles user authentication, registration, and token management.

Endpoints:
    POST /login: User login with email and password
    POST /register: New user registration
    GET /me: Get current user information
    POST /logout: User logout
    POST /change-password: Change user password
    POST /refresh-token: Refresh JWT access token

Security:
    - JWT tokens with configurable expiration
    - Password hashing with SHA-256
    - Role-based access control (admin, analyst, user)

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import timedelta
from ..deps import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
import hashlib

router = APIRouter()

# ==================== MODELS ====================

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    company: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    company: Optional[str] = None


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


# ==================== MOCK DATABASE ====================
# In production, replace with actual database

USERS_DB = {
    "demo@telecomx.com": {
        "id": "user_001",
        "email": "demo@telecomx.com",
        "password": hashlib.sha256("demo123".encode()).hexdigest(),
        "name": "Demo User",
        "role": "admin",
        "company": "Telecom X"
    },
    "analyst@telecomx.com": {
        "id": "user_002",
        "email": "analyst@telecomx.com",
        "password": hashlib.sha256("analyst123".encode()).hexdigest(),
        "name": "Data Analyst",
        "role": "analyst",
        "company": "Telecom X"
    }
}

# ==================== HELPER FUNCTIONS ====================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password


def get_user_by_email(email: str):
    """Get user by email"""
    return USERS_DB.get(email)


def authenticate_user(email: str, password: str):
    """Authenticate user with email and password"""
    user = get_user_by_email(email)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user


# ==================== ENDPOINTS ====================

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """
    Login with email and password
    Returns JWT access token
    """
    user = authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"]
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """
    Register new user
    """
    # Check if user exists
    if user_data.email in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = f"user_{len(USERS_DB) + 1:03d}"
    new_user = {
        "id": user_id,
        "email": user_data.email,
        "password": hashlib.sha256(user_data.password.encode()).hexdigest(),
        "name": user_data.name,
        "role": "user",
        "company": user_data.company
    }
    
    USERS_DB[user_data.email] = new_user
    
    return UserResponse(
        id=new_user["id"],
        email=new_user["email"],
        name=new_user["name"],
        role=new_user["role"],
        company=new_user.get("company")
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current user information
    """
    user = get_user_by_email(current_user["email"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        company=user.get("company")
    )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout current user
    Note: With JWT, actual logout is handled client-side by removing token
    """
    return {
        "success": True,
        "message": "Logged out successfully"
    }


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """
    Change user password
    """
    user = get_user_by_email(current_user["email"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify old password
    if not verify_password(password_data.old_password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    # Update password
    user["password"] = hashlib.sha256(password_data.new_password.encode()).hexdigest()
    
    return {
        "success": True,
        "message": "Password changed successfully"
    }


@router.post("/refresh-token", response_model=Token)
async def refresh_token(current_user: dict = Depends(get_current_user)):
    """
    Refresh access token
    """
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": current_user["id"],
            "email": current_user["email"],
            "role": current_user["role"]
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }
