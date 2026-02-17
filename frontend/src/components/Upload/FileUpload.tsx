// src/components/Upload/FileUpload.tsx
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import './FileUpload.css';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  preview?: string;
  error?: string;
}

interface FileUploadProps {
  maxFiles?: number;
  acceptedFormats?: string[];
  onFilesUploaded?: (files: File[]) => void;
  onProcessData?: (files: File[]) => void;
  onClearData?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  maxFiles = 10, // ⭐ Hasta 10 archivos
  acceptedFormats = ['.csv', '.xlsx', '.xls', '.json', '.pdf', '.xml', '.tsv', '.txt'],
  onFilesUploaded,
  onProcessData,
  onClearData
}) => {
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const filesArray = Array.from(files);
    
    // Check max files limit
    if (uploadedFiles.length + filesArray.length > maxFiles) {
      alert(t('upload.max_files_error', { max: maxFiles }));
      return;
    }

    // Process each file
    const newFiles: UploadedFile[] = filesArray.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    if (onFilesUploaded) {
      onFilesUploaded(filesArray);
    }
  }, [uploadedFiles.length, maxFiles, onFilesUploaded, t]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Remove single file
  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // ⭐ LIMPIAR DATOS - Clear all files
  const handleClearAllData = useCallback(() => {
    if (uploadedFiles.length === 0) return;
    
    const confirmed = window.confirm(t('upload.confirm_clear_all'));
    if (confirmed) {
      setUploadedFiles([]);
      setIsProcessing(false);
      
      if (onClearData) {
        onClearData();
      }
    }
  }, [uploadedFiles.length, onClearData, t]);

  // ⭐ PROCESAR DATOS - Process all files
  const handleProcessAllFiles = useCallback(async () => {
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);

    // Update all files to processing status
    setUploadedFiles(prev =>
      prev.map(file => ({ ...file, status: 'processing' as const }))
    );

    try {
      const filesToProcess = uploadedFiles.map(f => f.file);
      
      if (onProcessData) {
        await onProcessData(filesToProcess);
      }

      // Simulate processing (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update all files to success status
      setUploadedFiles(prev =>
        prev.map(file => ({ ...file, status: 'success' as const }))
      );
    } catch (error) {
      // Update files to error status
      setUploadedFiles(prev =>
        prev.map(file => ({
          ...file,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Processing failed'
        }))
      );
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFiles, onProcessData]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get status icon
  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="status-icon success" size={20} />;
      case 'error':
        return <AlertCircle className="status-icon error" size={20} />;
      case 'processing':
        return <div className="status-icon processing spinner"></div>;
      default:
        return <FileText className="status-icon pending" size={20} />;
    }
  };

  return (
    <div className="file-upload-container">
      {/* Header */}
      <div className="upload-header">
        <div className="upload-title">
          <Upload size={24} />
          <h2>{t('upload.title')}</h2>
        </div>
        <div className="upload-info">
          <span className="files-count">
            {uploadedFiles.length} / {maxFiles} {t('upload.files')}
          </span>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${
          uploadedFiles.length >= maxFiles ? 'disabled' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={48} className="drop-icon" />
        <h3>{t('upload.drop_zone_title')}</h3>
        <p>{t('upload.drop_zone_description')}</p>
        
        <label className="upload-button">
          <input
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={uploadedFiles.length >= maxFiles}
            style={{ display: 'none' }}
          />
          <span>{t('upload.browse_files')}</span>
        </label>

        <div className="accepted-formats">
          <p>{t('upload.accepted_formats')}:</p>
          <div className="formats-list">
            {acceptedFormats.map(format => (
              <span key={format} className="format-badge">
                {format.replace('.', '').toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        <p className="upload-limit">
          {t('upload.max_files')}: <strong>{maxFiles}</strong> | 
          {t('upload.max_size')}: <strong>100MB</strong> {t('upload.per_file')}
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <div className="files-header">
            <h3>{t('upload.uploaded_files')}</h3>
            <div className="files-actions">
              {/* ⭐ BOTÓN LIMPIAR DATOS */}
              <button
                className="clear-all-btn"
                onClick={handleClearAllData}
                disabled={isProcessing}
                title={t('upload.clear_all')}
              >
                <Trash2 size={18} />
                <span>{t('upload.clear_data')}</span>
              </button>
            </div>
          </div>

          <div className="files-list">
            {uploadedFiles.map((file) => (
              <div key={file.id} className={`file-item status-${file.status}`}>
                <div className="file-icon">
                  {getStatusIcon(file.status)}
                </div>
                
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="file-separator">•</span>
                    <span className="file-type">
                      {file.name.split('.').pop()?.toUpperCase()}
                    </span>
                    {file.status === 'error' && (
                      <>
                        <span className="file-separator">•</span>
                        <span className="file-error">{file.error}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  className="remove-file-btn"
                  onClick={() => handleRemoveFile(file.id)}
                  disabled={isProcessing}
                  title={t('upload.remove_file')}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* ⭐ BOTÓN PROCESAR DATOS */}
          <div className="process-actions">
            <button
              className="process-btn primary"
              onClick={handleProcessAllFiles}
              disabled={isProcessing || uploadedFiles.every(f => f.status === 'success')}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  <span>{t('upload.processing')}</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>{t('upload.process_data')}</span>
                </>
              )}
            </button>

            <div className="process-info">
              {uploadedFiles.filter(f => f.status === 'success').length > 0 && (
                <span className="success-message">
                  ✓ {uploadedFiles.filter(f => f.status === 'success').length} {t('upload.files_processed')}
                </span>
              )}
              {uploadedFiles.filter(f => f.status === 'error').length > 0 && (
                <span className="error-message">
                  ✗ {uploadedFiles.filter(f => f.status === 'error').length} {t('upload.files_failed')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="upload-tips">
        <h4>{t('upload.tips_title')}</h4>
        <ul>
          <li>📊 {t('upload.tip_1')}</li>
          <li>📁 {t('upload.tip_2', { max: maxFiles })}</li>
          <li>🔄 {t('upload.tip_3')}</li>
          <li>⚡ {t('upload.tip_4')}</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
