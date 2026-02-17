# backend/app/utils/file_handlers.py
"""
File Handlers
=============

Utilities for file upload, validation, and storage.

Author: Elizabeth Díaz Familia
Project: Telecom X - Customer Churn Analysis Platform
"""

from typing import Optional, Dict, Any, List, Tuple
from pathlib import Path
import mimetypes
import hashlib
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class FileHandler:
    """
    File handling utilities for uploads and storage.
    
    Features:
        - File upload validation
        - MIME type detection
        - File size checking
        - Secure filename generation
        - Storage path management
    """
    
    ALLOWED_EXTENSIONS = {
        'csv', 'xlsx', 'xls', 'json', 'tsv', 'txt', 'pdf', 'xml'
    }
    
    ALLOWED_MIME_TYPES = {
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/json',
        'text/tab-separated-values',
        'text/plain',
        'application/pdf',
        'application/xml',
        'text/xml'
    }
    
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
    
    def __init__(self, upload_dir: Path = Path("uploads")):
        """
        Initialize FileHandler.
        
        Args:
            upload_dir: Directory for uploaded files
        """
        self.upload_dir = upload_dir
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def validate_file(
        self,
        filename: str,
        file_size: int,
        content_type: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Validate uploaded file.
        
        Args:
            filename: Original filename
            file_size: File size in bytes
            content_type: MIME type
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check extension
        extension = Path(filename).suffix.lower().lstrip('.')
        if extension not in self.ALLOWED_EXTENSIONS:
            return False, f"File type .{extension} not allowed"
        
        # Check file size
        if file_size > self.MAX_FILE_SIZE:
            max_mb = self.MAX_FILE_SIZE / (1024 * 1024)
            return False, f"File size exceeds {max_mb}MB limit"
        
        # Check MIME type if provided
        if content_type and content_type not in self.ALLOWED_MIME_TYPES:
            return False, f"MIME type {content_type} not allowed"
        
        return True, None
    
    def generate_storage_path(
        self,
        filename: str,
        user_id: Optional[str] = None
    ) -> Path:
        """
        Generate storage path for file.
        
        Args:
            filename: Original filename
            user_id: Optional user ID for organization
            
        Returns:
            Path: Storage path
        """
        # Generate unique filename
        unique_filename = generate_unique_filename(filename)
        
        # Organize by date and user
        date_str = datetime.utcnow().strftime("%Y/%m/%d")
        
        if user_id:
            storage_path = self.upload_dir / user_id / date_str / unique_filename
        else:
            storage_path = self.upload_dir / date_str / unique_filename
        
        # Create directory
        storage_path.parent.mkdir(parents=True, exist_ok=True)
        
        return storage_path
    
    def save_file(
        self,
        file_data: bytes,
        filename: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Save uploaded file.
        
        Args:
            file_data: File content bytes
            filename: Original filename
            user_id: Optional user ID
            
        Returns:
            Dict with file info
        """
        # Generate storage path
        storage_path = self.generate_storage_path(filename, user_id)
        
        # Write file
        with open(storage_path, 'wb') as f:
            f.write(file_data)
        
        # Calculate hash
        file_hash = hashlib.sha256(file_data).hexdigest()
        
        return {
            'filepath': str(storage_path),
            'filename': storage_path.name,
            'original_filename': filename,
            'file_size': len(file_data),
            'file_hash': file_hash,
            'mime_type': mimetypes.guess_type(filename)[0]
        }


# ==================== UTILITY FUNCTIONS ====================

def validate_file_upload(
    filename: str,
    file_size: int,
    content_type: Optional[str] = None,
    max_size: int = 50 * 1024 * 1024
) -> bool:
    """
    Quick validation for file upload.
    
    Args:
        filename: Filename
        file_size: Size in bytes
        content_type: MIME type
        max_size: Maximum allowed size
        
    Returns:
        bool: True if valid
    """
    handler = FileHandler()
    is_valid, error = handler.validate_file(filename, file_size, content_type)
    
    if not is_valid:
        logger.warning(f"File validation failed: {error}")
        return False
    
    return True


def save_uploaded_file(
    file_data: bytes,
    filename: str,
    upload_dir: Path = Path("uploads"),
    user_id: Optional[str] = None
) -> Path:
    """
    Save uploaded file to storage.
    
    Args:
        file_data: File bytes
        filename: Original filename
        upload_dir: Upload directory
        user_id: Optional user ID
        
    Returns:
        Path: Storage path
    """
    handler = FileHandler(upload_dir)
    file_info = handler.save_file(file_data, filename, user_id)
    return Path(file_info['filepath'])


def get_file_info(filepath: Path) -> Dict[str, Any]:
    """
    Get file information.
    
    Args:
        filepath: Path to file
        
    Returns:
        Dict with file info
    """
    if not filepath.exists():
        raise FileNotFoundError(f"File not found: {filepath}")
    
    stat = filepath.stat()
    
    return {
        'filename': filepath.name,
        'extension': filepath.suffix.lstrip('.'),
        'size_bytes': stat.st_size,
        'size_mb': round(stat.st_size / (1024 * 1024), 2),
        'mime_type': mimetypes.guess_type(filepath)[0],
        'created': datetime.fromtimestamp(stat.st_ctime),
        'modified': datetime.fromtimestamp(stat.st_mtime)
    }


def generate_unique_filename(original_filename: str) -> str:
    """
    Generate unique filename preserving extension.
    
    Args:
        original_filename: Original filename
        
    Returns:
        str: Unique filename
    """
    extension = Path(original_filename).suffix
    unique_id = str(uuid.uuid4())
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    
    return f"{timestamp}_{unique_id}{extension}"


def calculate_file_hash(filepath: Path, algorithm: str = 'sha256') -> str:
    """
    Calculate file hash.
    
    Args:
        filepath: Path to file
        algorithm: Hash algorithm
        
    Returns:
        str: Hex digest
    """
    hash_obj = hashlib.new(algorithm)
    
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_obj.update(chunk)
    
    return hash_obj.hexdigest()
