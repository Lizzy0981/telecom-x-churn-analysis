// frontend/src/hooks/useExport.ts
/**
 * useExport Hook
 * Custom hook for data export functionality
 */

import { useState, useCallback } from 'react';
import { exportData, validateForExport, getExportInstructions } from '../services/export';

export type ExportFormat = 'powerbi' | 'tableau' | 'excel' | 'pdf' | 'csv';

export interface UseExportOptions {
  onSuccess?: (format: ExportFormat) => void;
  onError?: (error: any, format: ExportFormat) => void;
  validateBeforeExport?: boolean;
}

export interface UseExportResult {
  exporting: boolean;
  error: any;
  lastExportFormat: ExportFormat | null;
  exportTo: (data: any[], format: ExportFormat, options?: any) => Promise<void>;
  validate: (data: any[], format: ExportFormat) => { valid: boolean; errors: string[]; warnings: string[] };
  getInstructions: (format: ExportFormat) => string[];
  reset: () => void;
}

/**
 * Hook for exporting data
 */
export function useExport(options: UseExportOptions = {}): UseExportResult {
  const {
    onSuccess,
    onError,
    validateBeforeExport = true
  } = options;

  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<any>(null);
  const [lastExportFormat, setLastExportFormat] = useState<ExportFormat | null>(null);

  // Export data to specific format
  const exportTo = useCallback(async (
    data: any[],
    format: ExportFormat,
    exportOptions: any = {}
  ) => {
    setExporting(true);
    setError(null);

    try {
      // Validate before export if enabled
      if (validateBeforeExport) {
        const validation = validateForExport(data, format);
        
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // Log warnings
        if (validation.warnings.length > 0) {
          console.warn('Export warnings:', validation.warnings);
        }
      }

      // Perform export
      exportData(data, format, exportOptions);

      setLastExportFormat(format);
      onSuccess?.(format);
    } catch (err) {
      console.error(`Export to ${format} failed:`, err);
      setError(err);
      onError?.(err, format);
    } finally {
      setExporting(false);
    }
  }, [validateBeforeExport, onSuccess, onError]);

  // Validate data for export
  const validate = useCallback((data: any[], format: ExportFormat) => {
    return validateForExport(data, format);
  }, []);

  // Get export instructions
  const getInstructions = useCallback((format: ExportFormat) => {
    return getExportInstructions(format);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setExporting(false);
    setError(null);
    setLastExportFormat(null);
  }, []);

  return {
    exporting,
    error,
    lastExportFormat,
    exportTo,
    validate,
    getInstructions,
    reset
  };
}

/**
 * Hook for batch export (multiple formats at once)
 */
export function useBatchExport() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<Record<ExportFormat, any>>({} as any);

  const exportToMultiple = useCallback(async (
    data: any[],
    formats: ExportFormat[],
    options?: any
  ) => {
    setExporting(true);
    setProgress(0);
    setErrors({} as any);

    const total = formats.length;
    const exportErrors: Record<ExportFormat, any> = {} as any;

    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];
      
      try {
        exportData(data, format, options);
        setProgress(((i + 1) / total) * 100);
      } catch (err) {
        console.error(`Export to ${format} failed:`, err);
        exportErrors[format] = err;
      }
    }

    setErrors(exportErrors);
    setExporting(false);
    setProgress(100);
  }, []);

  return {
    exporting,
    progress,
    errors,
    exportToMultiple
  };
}

/**
 * Hook for export with preview
 */
export function useExportWithPreview() {
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [previewFormat, setPreviewFormat] = useState<ExportFormat | null>(null);
  const { exportTo, ...rest } = useExport();

  const preview = useCallback((data: any[], format: ExportFormat, maxRows: number = 10) => {
    setPreviewData(data.slice(0, maxRows));
    setPreviewFormat(format);
  }, []);

  const confirmExport = useCallback(async (
    fullData: any[],
    options?: any
  ) => {
    if (!previewFormat) return;
    
    await exportTo(fullData, previewFormat, options);
    setPreviewData(null);
    setPreviewFormat(null);
  }, [previewFormat, exportTo]);

  const cancelPreview = useCallback(() => {
    setPreviewData(null);
    setPreviewFormat(null);
  }, []);

  return {
    ...rest,
    exportTo,
    previewData,
    previewFormat,
    preview,
    confirmExport,
    cancelPreview
  };
}

/**
 * Hook for scheduled exports
 */
export function useScheduledExport() {
  const [schedules, setSchedules] = useState<Array<{
    id: string;
    format: ExportFormat;
    frequency: 'daily' | 'weekly' | 'monthly';
    lastExport: Date | null;
    nextExport: Date;
  }>>([]);

  const addSchedule = useCallback((
    format: ExportFormat,
    frequency: 'daily' | 'weekly' | 'monthly'
  ) => {
    const now = new Date();
    const nextExport = new Date(now);
    
    switch (frequency) {
      case 'daily':
        nextExport.setDate(nextExport.getDate() + 1);
        break;
      case 'weekly':
        nextExport.setDate(nextExport.getDate() + 7);
        break;
      case 'monthly':
        nextExport.setMonth(nextExport.getMonth() + 1);
        break;
    }

    const schedule = {
      id: `${format}-${Date.now()}`,
      format,
      frequency,
      lastExport: null,
      nextExport
    };

    setSchedules(prev => [...prev, schedule]);
  }, []);

  const removeSchedule = useCallback((id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  }, []);

  return {
    schedules,
    addSchedule,
    removeSchedule
  };
}

/**
 * Hook for export history
 */
export function useExportHistory() {
  const [history, setHistory] = useState<Array<{
    timestamp: Date;
    format: ExportFormat;
    rowCount: number;
    fileName: string;
    success: boolean;
  }>>([]);

  const addToHistory = useCallback((
    format: ExportFormat,
    rowCount: number,
    fileName: string,
    success: boolean = true
  ) => {
    const entry = {
      timestamp: new Date(),
      format,
      rowCount,
      fileName,
      success
    };

    setHistory(prev => [entry, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getByFormat = useCallback((format: ExportFormat) => {
    return history.filter(h => h.format === format);
  }, [history]);

  const getSuccessRate = useCallback(() => {
    if (history.length === 0) return 0;
    const successful = history.filter(h => h.success).length;
    return (successful / history.length) * 100;
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    getByFormat,
    getSuccessRate
  };
}

/**
 * Hook for export with custom templates
 */
export function useExportTemplate() {
  const [templates, setTemplates] = useState<Record<string, {
    name: string;
    format: ExportFormat;
    columnMapping?: Record<string, string>;
    filters?: any[];
    options?: any;
  }>>({});

  const saveTemplate = useCallback((
    name: string,
    format: ExportFormat,
    config: {
      columnMapping?: Record<string, string>;
      filters?: any[];
      options?: any;
    }
  ) => {
    setTemplates(prev => ({
      ...prev,
      [name]: {
        name,
        format,
        ...config
      }
    }));
  }, []);

  const removeTemplate = useCallback((name: string) => {
    setTemplates(prev => {
      const newTemplates = { ...prev };
      delete newTemplates[name];
      return newTemplates;
    });
  }, []);

  const getTemplate = useCallback((name: string) => {
    return templates[name];
  }, [templates]);

  return {
    templates: Object.values(templates),
    saveTemplate,
    removeTemplate,
    getTemplate
  };
}

export default useExport;
