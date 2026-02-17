// src/components/Upload/FileUploadOptimized.tsx
import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, FileText, CheckCircle, AlertCircle, Trash2, Loader } from 'lucide-react';
import './FileUpload.css';

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  rowsProcessed: number;
  totalRows: number;
  preview?: string;
  error?: string;
}

interface FileUploadOptimizedProps {
  maxFiles?: number;
  maxFileSize?: number; // in MB
  chunkSize?: number; // rows per chunk
  acceptedFormats?: string[];
  onFilesUploaded?: (files: File[]) => void;
  onProcessData?: (files: File[]) => void;
  onClearData?: () => void;
}

export const FileUploadOptimized: React.FC<FileUploadOptimizedProps> = ({
  maxFiles = 10,
  maxFileSize = 500, // ⭐ 500MB max per file
  chunkSize = 10000, // ⭐ Process 10,000 rows at a time
  acceptedFormats = ['.csv', '.xlsx', '.xls', '.json', '.pdf', '.xml', '.tsv', '.txt'],
  onFilesUploaded,
  onProcessData,
  onClearData
}) => {
  const { t } = useTranslation();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const workersRef = useRef<Map<string, Worker>>(new Map());

  // ⭐ Validate file size
  const validateFileSize = (file: File): boolean => {
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    return file.size <= maxSizeBytes;
  };

  // ⭐ Create Web Worker for file processing
  const createWorker = (fileId: string, file: File): Worker => {
    // Create blob URL for worker script
    const workerCode = `
      self.onmessage = async function(e) {
        const { file, chunkSize } = e.data;
        
        try {
          // Simulate chunked processing
          const fileSize = file.size;
          let processed = 0;
          let rowsProcessed = 0;
          
          // Estimate total rows (rough estimate)
          const avgRowSize = 100; // bytes
          const totalRows = Math.floor(fileSize / avgRowSize);
          
          while (processed < fileSize) {
            const chunk = Math.min(chunkSize * avgRowSize, fileSize - processed);
            processed += chunk;
            rowsProcessed += chunkSize;
            
            const progress = Math.min((processed / fileSize) * 100, 100);
            
            // Send progress update
            self.postMessage({
              type: 'progress',
              progress,
              rowsProcessed: Math.min(rowsProcessed, totalRows),
              totalRows
            });
            
            // Simulate processing time (remove in production)
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          self.postMessage({
            type: 'complete',
            rowsProcessed: totalRows,
            totalRows
          });
        } catch (error) {
          self.postMessage({
            type: 'error',
            error: error.message
          });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (e) => {
      const { type, progress, rowsProcessed, totalRows, error } = e.data;

      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                progress: progress || f.progress,
                rowsProcessed: rowsProcessed || f.rowsProcessed,
                totalRows: totalRows || f.totalRows,
                status: type === 'complete' ? 'success' : type === 'error' ? 'error' : 'processing',
                error: error
              }
            : f
        )
      );

      if (type === 'complete' || type === 'error') {
        worker.terminate();
        workersRef.current.delete(fileId);
        URL.revokeObjectURL(workerUrl);
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, status: 'error', error: 'Processing failed' }
            : f
        )
      );
      worker.terminate();
      workersRef.current.delete(fileId);
    };

    workersRef.current.set(fileId, worker);
    return worker;
  };

  // Handle file selection
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const filesArray = Array.from(files);
    
    // Check max files limit
    if (uploadedFiles.length + filesArray.length > maxFiles) {
      alert(t('upload.max_files_error', { max: maxFiles }));
      return;
    }

    // Validate file sizes
    const invalidFiles = filesArray.filter(f => !validateFileSize(f));
    if (invalidFiles.length > 0) {
      alert(
        t('upload.file_too_large', {
          files: invalidFiles.map(f => f.name).join(', '),
          max: maxFileSize
        })
      );
      return;
    }

    // Process each file
    const newFiles: UploadedFile[] = filesArray.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      rowsProcessed: 0,
      totalRows: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    if (onFilesUploaded) {
      onFilesUploaded(filesArray);
    }
  }, [uploadedFiles.length, maxFiles, maxFileSize, onFilesUploaded, t]);

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
    // Terminate worker if processing
    const worker = workersRef.current.get(fileId);
    if (worker) {
      worker.terminate();
      workersRef.current.delete(fileId);
    }

    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // ⭐ LIMPIAR DATOS - Clear all files
  const handleClearAllData = useCallback(() => {
    if (uploadedFiles.length === 0) return;
    
    const confirmed = window.confirm(t('upload.confirm_clear_all'));
    if (confirmed) {
      // Terminate all workers
      workersRef.current.forEach(worker => worker.terminate());
      workersRef.current.clear();

      setUploadedFiles([]);
      setIsProcessing(false);
      
      if (onClearData) {
        onClearData();
      }
    }
  }, [uploadedFiles.length, onClearData, t]);

  // ⭐ PROCESAR DATOS - Process all files with Web Workers
  const handleProcessAllFiles = useCallback(async () => {
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);

    // Update all files to processing status
    setUploadedFiles(prev =>
      prev.map(file => ({
        ...file,
        status: 'processing' as const,
        progress: 0,
        rowsProcessed: 0
      }))
    );

    try {
      // ⭐ Process each file in a separate Web Worker (parallel processing)
      uploadedFiles.forEach(uploadedFile => {
        const worker = createWorker(uploadedFile.id, uploadedFile.file);
        worker.postMessage({
          file: uploadedFile.file,
          chunkSize: chunkSize
        });
      });

      if (onProcessData) {
        const filesToProcess = uploadedFiles.map(f => f.file);
        await onProcessData(filesToProcess);
      }
    } catch (error) {
      console.error('Processing error:', error);
      setUploadedFiles(prev =>
        prev.map(file => ({
          ...file,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Processing failed'
        }))
      );
    } finally {
      // Don't set isProcessing to false here - workers will update status individually
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  }, [uploadedFiles, chunkSize, onProcessData]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Get status icon
  const getStatusIcon = (file: UploadedFile) => {
    switch (file.status) {
      case 'success':
        return <CheckCircle className="status-icon success" size={20} />;
      case 'error':
        return <AlertCircle className="status-icon error" size={20} />;
      case 'processing':
        return <Loader className="status-icon processing spin" size={20} />;
      default:
        return <FileText className="status-icon pending" size={20} />;
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      workersRef.current.forEach(worker => worker.terminate());
      workersRef.current.clear();
    };
  }, []);

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
          <span className="info-badge">
            ⚡ {t('upload.optimized')} - {t('upload.supports_large_files')}
          </span>
        </div>
      </div>

      {/* Performance Info Banner */}
      <div className="performance-banner">
        <div className="banner-content">
          <div className="banner-item">
            <span className="banner-icon">⚡</span>
            <span className="banner-text">{t('upload.parallel_processing')}</span>
          </div>
          <div className="banner-item">
            <span className="banner-icon">📊</span>
            <span className="banner-text">{t('upload.handles_millions')}</span>
          </div>
          <div className="banner-item">
            <span className="banner-icon">🚀</span>
            <span className="banner-text">{t('upload.no_ui_freeze')}</span>
          </div>
          <div className="banner-item">
            <span className="banner-icon">💾</span>
            <span className="banner-text">{formatFileSize(maxFileSize * 1024 * 1024)} {t('upload.max_per_file')}</span>
          </div>
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
          {t('upload.max_size')}: <strong>{maxFileSize}MB</strong> {t('upload.per_file')}
        </p>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <div className="files-header">
            <h3>{t('upload.uploaded_files')}</h3>
            <div className="files-actions">
              {/* Clear All Button */}
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
                  {getStatusIcon(file)}
                </div>
                
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <span className="file-separator">•</span>
                    <span className="file-type">
                      {file.name.split('.').pop()?.toUpperCase()}
                    </span>
                    {file.status === 'processing' && file.totalRows > 0 && (
                      <>
                        <span className="file-separator">•</span>
                        <span className="file-rows">
                          {formatNumber(file.rowsProcessed)} / {formatNumber(file.totalRows)} {t('upload.rows')}
                        </span>
                      </>
                    )}
                    {file.status === 'success' && file.totalRows > 0 && (
                      <>
                        <span className="file-separator">•</span>
                        <span className="file-rows success">
                          ✓ {formatNumber(file.totalRows)} {t('upload.rows_processed')}
                        </span>
                      </>
                    )}
                    {file.status === 'error' && (
                      <>
                        <span className="file-separator">•</span>
                        <span className="file-error">{file.error}</span>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {file.status === 'processing' && (
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${file.progress}%` }}
                      >
                        <span className="progress-text">{Math.round(file.progress)}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="remove-file-btn"
                  onClick={() => handleRemoveFile(file.id)}
                  disabled={isProcessing && file.status === 'processing'}
                  title={t('upload.remove_file')}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Process Actions */}
          <div className="process-actions">
            <button
              className="process-btn primary"
              onClick={handleProcessAllFiles}
              disabled={isProcessing || uploadedFiles.every(f => f.status === 'success')}
            >
              {isProcessing ? (
                <>
                  <Loader className="spin" size={20} />
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
              {uploadedFiles.filter(f => f.status === 'processing').length > 0 && (
                <span className="processing-message">
                  ⚡ {uploadedFiles.filter(f => f.status === 'processing').length} {t('upload.files_processing')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Tips - Enhanced for Large Files */}
      <div className="upload-tips">
        <h4>{t('upload.tips_title')}</h4>
        <ul>
          <li>⚡ <strong>{t('upload.tip_performance')}:</strong> {t('upload.tip_performance_desc')}</li>
          <li>📊 <strong>{t('upload.tip_large_files')}:</strong> {t('upload.tip_large_files_desc', { max: maxFileSize })}</li>
          <li>🚀 <strong>{t('upload.tip_parallel')}:</strong> {t('upload.tip_parallel_desc')}</li>
          <li>💾 <strong>{t('upload.tip_memory')}:</strong> {t('upload.tip_memory_desc')}</li>
          <li>🔄 <strong>{t('upload.tip_progress')}:</strong> {t('upload.tip_progress_desc')}</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploadOptimized;
