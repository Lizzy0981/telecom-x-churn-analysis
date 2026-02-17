# backend/app/models/user.py
"""
User Model
==========

User model for authentication, authorization, and user management.

Features:
    - UUID primary key
    - Email and username authentication
    - Password hashing (bcrypt)
    - Role-based access control (RBAC)
    - Account status (active, inactive, suspended)
    - Email verification
    - Last login tracking
    - Soft delete support
    - Automatic timestamps

Roles:
    - ADMIN: Full system access
    - ANALYST: Data analysis and ML access
    - VIEWER: Read-only access
    - API_USER: API access only

Security:
    - Password hashing with bcrypt
    - Password strength validation
    - Email verification required
    - Account lockout after failed attempts
    - Session management

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum, Integer, Text
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from typing import Optional

from . import Base


# ==================== ENUMS ====================

class UserRole(str, enum.Enum):
    """User roles for RBAC"""
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"
    API_USER = "api_user"


class AccountStatus(str, enum.Enum):
    """Account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"


# ==================== MIXINS ====================

class TimestampMixin:
    """Mixin for automatic timestamps"""
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class SoftDeleteMixin:
    """Mixin for soft delete"""
    deleted_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)


# ==================== USER MODEL ====================

class User(Base, TimestampMixin, SoftDeleteMixin):
    """
    User model for authentication and authorization.
    
    Attributes:
        id: UUID primary key
        email: Unique email address
        username: Unique username
        hashed_password: Bcrypt hashed password
        full_name: User's full name
        role: User role (admin, analyst, viewer, api_user)
        status: Account status
        is_active: Quick active check
        is_email_verified: Email verification status
        email_verified_at: Email verification timestamp
        last_login_at: Last login timestamp
        failed_login_attempts: Failed login counter
        api_key: Optional API key for programmatic access
        preferences: JSON preferences (stored as Text)
        
    Relationships:
        datasets: User's uploaded datasets
        predictions: User's prediction history
        
    Example:
        >>> user = User(
        ...     email="analyst@telecom.com",
        ...     username="analyst1",
        ...     full_name="Jane Doe",
        ...     role=UserRole.ANALYST
        ... )
        >>> user.set_password("secure_password")
        >>> session.add(user)
        >>> session.commit()
    """
    
    __tablename__ = "users"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Authentication
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile
    full_name = Column(String(255), nullable=False)
    
    # Authorization
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
    
    # Account Status
    status = Column(Enum(AccountStatus), default=AccountStatus.PENDING_VERIFICATION, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Email Verification
    is_email_verified = Column(Boolean, default=False, nullable=False)
    email_verified_at = Column(DateTime, nullable=True)
    verification_token = Column(String(255), nullable=True)
    
    # Security
    last_login_at = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    password_reset_token = Column(String(255), nullable=True)
    password_reset_expires = Column(DateTime, nullable=True)
    
    # API Access
    api_key = Column(String(255), unique=True, nullable=True, index=True)
    
    # Preferences (stored as JSON string)
    preferences = Column(Text, nullable=True)
    
    # Relationships
    datasets = relationship("Dataset", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        """String representation"""
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"
    
    # ==================== AUTHENTICATION METHODS ====================
    
    def set_password(self, password: str):
        """
        Hash and set password.
        
        Args:
            password: Plain text password
        """
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.hashed_password = pwd_context.hash(password)
    
    def verify_password(self, password: str) -> bool:
        """
        Verify password against hash.
        
        Args:
            password: Plain text password
            
        Returns:
            bool: True if password matches
        """
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(password, self.hashed_password)
    
    def generate_api_key(self) -> str:
        """
        Generate new API key.
        
        Returns:
            str: Generated API key
        """
        import secrets
        self.api_key = secrets.token_urlsafe(32)
        return self.api_key
    
    def generate_verification_token(self) -> str:
        """
        Generate email verification token.
        
        Returns:
            str: Verification token
        """
        import secrets
        self.verification_token = secrets.token_urlsafe(32)
        return self.verification_token
    
    def verify_email(self):
        """Mark email as verified"""
        self.is_email_verified = True
        self.email_verified_at = datetime.utcnow()
        self.verification_token = None
        self.status = AccountStatus.ACTIVE
    
    # ==================== AUTHORIZATION METHODS ====================
    
    def has_role(self, role: UserRole) -> bool:
        """
        Check if user has specific role.
        
        Args:
            role: Role to check
            
        Returns:
            bool: True if user has role
        """
        return self.role == role
    
    def is_admin(self) -> bool:
        """Check if user is admin"""
        return self.role == UserRole.ADMIN
    
    def is_analyst(self) -> bool:
        """Check if user is analyst"""
        return self.role == UserRole.ANALYST
    
    def can_access_ml(self) -> bool:
        """Check if user can access ML features"""
        return self.role in [UserRole.ADMIN, UserRole.ANALYST]
    
    def can_upload_datasets(self) -> bool:
        """Check if user can upload datasets"""
        return self.role in [UserRole.ADMIN, UserRole.ANALYST]
    
    # ==================== ACCOUNT MANAGEMENT ====================
    
    def activate(self):
        """Activate user account"""
        self.is_active = True
        self.status = AccountStatus.ACTIVE
    
    def deactivate(self):
        """Deactivate user account"""
        self.is_active = False
        self.status = AccountStatus.INACTIVE
    
    def suspend(self):
        """Suspend user account"""
        self.is_active = False
        self.status = AccountStatus.SUSPENDED
    
    def soft_delete(self):
        """Soft delete user"""
        self.is_deleted = True
        self.deleted_at = datetime.utcnow()
        self.is_active = False
    
    def record_login(self):
        """Record successful login"""
        self.last_login_at = datetime.utcnow()
        self.failed_login_attempts = 0
    
    def record_failed_login(self):
        """Record failed login attempt"""
        self.failed_login_attempts += 1
        
        # Lock account after 5 failed attempts
        if self.failed_login_attempts >= 5:
            self.suspend()
    
    # ==================== UTILITY METHODS ====================
    
    def to_dict(self, include_sensitive: bool = False) -> dict:
        """
        Convert to dictionary.
        
        Args:
            include_sensitive: Whether to include sensitive fields
            
        Returns:
            dict: User data
        """
        data = {
            'id': str(self.id),
            'email': self.email,
            'username': self.username,
            'full_name': self.full_name,
            'role': self.role.value,
            'status': self.status.value,
            'is_active': self.is_active,
            'is_email_verified': self.is_email_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None
        }
        
        if include_sensitive:
            data.update({
                'api_key': self.api_key,
                'failed_login_attempts': self.failed_login_attempts
            })
        
        return data
    
    @classmethod
    def create(
        cls,
        email: str,
        username: str,
        password: str,
        full_name: str,
        role: UserRole = UserRole.VIEWER
    ) -> 'User':
        """
        Create new user.
        
        Args:
            email: Email address
            username: Username
            password: Plain text password
            full_name: Full name
            role: User role
            
        Returns:
            User: New user instance
        """
        user = cls(
            email=email,
            username=username,
            full_name=full_name,
            role=role
        )
        user.set_password(password)
        user.generate_verification_token()
        
        return user


# ==================== INDEXES ====================

# Composite indexes for common queries
from sqlalchemy import Index

Index('idx_user_email_active', User.email, User.is_active)
Index('idx_user_role_active', User.role, User.is_active)
Index('idx_user_created_at', User.created_at.desc())
