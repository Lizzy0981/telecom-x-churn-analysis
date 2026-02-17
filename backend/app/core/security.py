# backend/app/core/security.py
"""
Security Module
===============

Security utilities including JWT token management, password hashing,
and authentication helpers.

Features:
    - JWT token creation and validation
    - Password hashing with bcrypt
    - Token refresh mechanism
    - Security headers
    - Input sanitization

Dependencies:
    - python-jose: JWT token handling
    - passlib: Password hashing
    - bcrypt: Secure password hashing algorithm

Usage:
    from backend.app.core.security import create_access_token, verify_password
    
    # Create token
    token = create_access_token(data={"sub": "user@example.com"})
    
    # Verify password
    is_valid = verify_password("plain_password", "hashed_password")

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from .config import settings
import secrets
import hashlib


# ==================== PASSWORD HASHING ====================

# Password context for bcrypt hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.
    
    Args:
        plain_password: The plain text password
        hashed_password: The hashed password to verify against
        
    Returns:
        bool: True if password matches, False otherwise
        
    Example:
        >>> verify_password("mypassword", "$2b$12$...")
        True
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        str: Hashed password
        
    Example:
        >>> get_password_hash("mypassword")
        '$2b$12$...'
    """
    return pwd_context.hash(password)


# ==================== JWT TOKEN MANAGEMENT ====================

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing token payload data
        expires_delta: Optional custom expiration time
        
    Returns:
        str: Encoded JWT token
        
    Example:
        >>> token = create_access_token(
        ...     data={"sub": "user@example.com", "role": "admin"}
        ... )
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Create a JWT refresh token with longer expiration.
    
    Args:
        data: Dictionary containing token payload data
        
    Returns:
        str: Encoded JWT refresh token
        
    Example:
        >>> refresh = create_refresh_token({"sub": "user@example.com"})
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and verify a JWT access token.
    
    Args:
        token: JWT token string to decode
        
    Returns:
        Optional[Dict]: Token payload if valid, None otherwise
        
    Example:
        >>> payload = decode_access_token(token)
        >>> if payload:
        ...     user_id = payload.get("sub")
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Verify token type
        if payload.get("type") != "access":
            return None
        
        return payload
    
    except JWTError:
        return None


def decode_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and verify a JWT refresh token.
    
    Args:
        token: JWT refresh token string to decode
        
    Returns:
        Optional[Dict]: Token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Verify token type
        if payload.get("type") != "refresh":
            return None
        
        return payload
    
    except JWTError:
        return None


# ==================== API KEY MANAGEMENT ====================

def generate_api_key() -> str:
    """
    Generate a secure random API key.
    
    Returns:
        str: Random API key (32 characters)
        
    Example:
        >>> api_key = generate_api_key()
        >>> print(api_key)
        'a1b2c3d4e5f6...'
    """
    return secrets.token_urlsafe(32)


def hash_api_key(api_key: str) -> str:
    """
    Hash an API key for secure storage.
    
    Args:
        api_key: API key to hash
        
    Returns:
        str: Hashed API key
    """
    return hashlib.sha256(api_key.encode()).hexdigest()


def verify_api_key(api_key: str, hashed_key: str) -> bool:
    """
    Verify an API key against its hash.
    
    Args:
        api_key: Plain API key
        hashed_key: Hashed API key to verify against
        
    Returns:
        bool: True if valid, False otherwise
    """
    return hash_api_key(api_key) == hashed_key


# ==================== SECURITY UTILITIES ====================

class SecurityUtils:
    """
    Collection of security utility methods.
    """
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """
        Sanitize a filename to prevent directory traversal attacks.
        
        Args:
            filename: Original filename
            
        Returns:
            str: Sanitized filename
        """
        # Remove path components
        filename = filename.split("/")[-1].split("\\")[-1]
        
        # Remove dangerous characters
        dangerous_chars = ["<", ">", ":", '"', "/", "\\", "|", "?", "*"]
        for char in dangerous_chars:
            filename = filename.replace(char, "_")
        
        return filename
    
    @staticmethod
    def generate_secure_filename(original_filename: str) -> str:
        """
        Generate a secure unique filename.
        
        Args:
            original_filename: Original filename
            
        Returns:
            str: Secure filename with random prefix
        """
        import uuid
        from pathlib import Path
        
        # Get file extension
        ext = Path(original_filename).suffix
        
        # Generate unique filename
        unique_id = str(uuid.uuid4())
        secure_filename = f"{unique_id}{ext}"
        
        return secure_filename
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """
        Basic email validation.
        
        Args:
            email: Email address to validate
            
        Returns:
            bool: True if valid format, False otherwise
        """
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def sanitize_html(text: str) -> str:
        """
        Remove HTML tags from text to prevent XSS.
        
        Args:
            text: Text that may contain HTML
            
        Returns:
            str: Text with HTML tags removed
        """
        import re
        clean = re.compile('<.*?>')
        return re.sub(clean, '', text)
    
    @staticmethod
    def generate_reset_token() -> str:
        """
        Generate a secure password reset token.
        
        Returns:
            str: Random reset token
        """
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, Any]:
        """
        Validate password strength.
        
        Args:
            password: Password to validate
            
        Returns:
            Dict containing validation result and feedback
        """
        result = {
            "valid": True,
            "score": 0,
            "feedback": []
        }
        
        # Length check
        if len(password) < 8:
            result["valid"] = False
            result["feedback"].append("Password must be at least 8 characters")
        else:
            result["score"] += 1
        
        # Uppercase check
        if any(c.isupper() for c in password):
            result["score"] += 1
        else:
            result["feedback"].append("Add uppercase letters")
        
        # Lowercase check
        if any(c.islower() for c in password):
            result["score"] += 1
        else:
            result["feedback"].append("Add lowercase letters")
        
        # Digit check
        if any(c.isdigit() for c in password):
            result["score"] += 1
        else:
            result["feedback"].append("Add numbers")
        
        # Special character check
        if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            result["score"] += 1
        else:
            result["feedback"].append("Add special characters")
        
        # Overall strength
        if result["score"] < 3:
            result["valid"] = False
            result["strength"] = "weak"
        elif result["score"] < 4:
            result["strength"] = "medium"
        else:
            result["strength"] = "strong"
        
        return result


# ==================== SECURITY HEADERS ====================

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'",
    "Referrer-Policy": "strict-origin-when-cross-origin"
}


def get_security_headers() -> Dict[str, str]:
    """
    Get recommended security headers.
    
    Returns:
        Dict: Security headers to add to responses
    """
    return SECURITY_HEADERS.copy()
