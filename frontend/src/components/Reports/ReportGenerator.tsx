// frontend/src/components/Reports/ReportGenerator.tsx
import React, { useState } from 'react';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'churn' | 'revenue' | 'customer' | 'ml' | 'custom';
  icon: string;
  fields: ReportField[];
}

export interface ReportField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'checkbox' | 'number';
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  placeholder?: string;
}

export interface ReportGeneratorProps {
  templates?: ReportTemplate[];
  onGenerate?: (config: any) => void;
  onCancel?: () => void;
  isGenerating?: boolean;
}

const defaultTemplates: ReportTemplate[] = [
  {
    id: 'churn-analysis',
    name: 'Churn Analysis Report',
    description: 'Comprehensive churn analysis with predictions and recommendations',
    type: 'churn',
    icon: '📉',
    fields: [
      {
        id: 'dateRange',
        label: 'Date Range',
        type: 'daterange',
        required: true
      },
      {
        id: 'segment',
        label: 'Customer Segment',
        type: 'select',
        options: [
          { value: 'all', label: 'All Customers' },
          { value: 'high-value', label: 'High Value' },
          { value: 'at-risk', label: 'At Risk' },
          { value: 'new', label: 'New Customers' }
        ],
        defaultValue: 'all'
      },
      {
        id: 'includeML', 
        label: 'Include ML Predictions',
        type: 'checkbox',
        defaultValue: true
      }
    ]
  },
  {
    id: 'revenue-report',
    name: 'Revenue Report',
    description: 'Monthly and quarterly revenue breakdown',
    type: 'revenue',
    icon: '💰',
    fields: [
      {
        id: 'period',
        label: 'Report Period',
        type: 'select',
        required: true,
        options: [
          { value: 'monthly', label: 'Monthly' },
          { value: 'quarterly', label: 'Quarterly' },
          { value: 'yearly', label: 'Yearly' }
        ]
      },
      {
        id: 'compareWithPrevious',
        label: 'Compare with Previous Period',
        type: 'checkbox',
        defaultValue: true
      }
    ]
  },
  {
    id: 'customer-insights',
    name: 'Customer Insights',
    description: 'Detailed customer behavior and segmentation',
    type: 'customer',
    icon: '👥',
    fields: [
      {
        id: 'minCustomers',
        label: 'Minimum Customers',
        type: 'number',
        defaultValue: 100,
        placeholder: 'Enter minimum number'
      },
      {
        id: 'includeClustering',
        label: 'Include Clustering Analysis',
        type: 'checkbox',
        defaultValue: true
      }
    ]
  },
  {
    id: 'ml-performance',
    name: 'ML Model Performance',
    description: 'Model metrics, accuracy, and explainability',
    type: 'ml',
    icon: '🤖',
    fields: [
      {
        id: 'modelVersion',
        label: 'Model Version',
        type: 'select',
        required: true,
        options: [
          { value: 'latest', label: 'Latest (v1.0)' },
          { value: 'v0.9', label: 'Version 0.9' },
          { value: 'v0.8', label: 'Version 0.8' }
        ]
      },
      {
        id: 'includeSHAP',
        label: 'Include SHAP Analysis',
        type: 'checkbox',
        defaultValue: true
      }
    ]
  }
];

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  templates = defaultTemplates,
  onGenerate,
  onCancel,
  isGenerating = false
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'csv' | 'json'>('pdf');

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    
    // Initialize form data with default values
    const initialData: Record<string, any> = {};
    template.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.id] = field.defaultValue;
      }
    });
    setFormData(initialData);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleGenerate = () => {
    if (!selectedTemplate) return;

    const reportConfig = {
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      format: reportFormat,
      parameters: formData,
      generatedAt: new Date().toISOString()
    };

    onGenerate?.(reportConfig);
  };

  const renderField = (field: ReportField) => {
    const value = formData[field.id];

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="form-input"
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="form-select"
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="form-checkbox"
            />
            <span className="checkbox-text">{field.label}</span>
          </label>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="form-input"
            required={field.required}
          />
        );

      case 'daterange':
        return (
          <div className="date-range">
            <input
              type="date"
              value={value?.start || ''}
              onChange={(e) => handleFieldChange(field.id, { ...value, start: e.target.value })}
              className="form-input"
              placeholder="Start date"
              required={field.required}
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={value?.end || ''}
              onChange={(e) => handleFieldChange(field.id, { ...value, end: e.target.value })}
              className="form-input"
              placeholder="End date"
              required={field.required}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="report-generator">
      {!selectedTemplate ? (
        // Template Selection
        <div className="template-selection">
          <div className="generator-header">
            <h3 className="generator-title">Generate New Report</h3>
            <p className="generator-subtitle">Select a report template to get started</p>
          </div>

          <div className="template-grid">
            {templates.map(template => (
              <button
                key={template.id}
                className="template-card"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="template-icon">{template.icon}</div>
                <h4 className="template-name">{template.name}</h4>
                <p className="template-description">{template.description}</p>
                <div className="template-footer">
                  <span className="template-type">{template.type}</span>
                  <span className="template-arrow">→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Configuration Form
        <div className="report-configuration">
          <div className="generator-header">
            <button className="btn-back" onClick={() => setSelectedTemplate(null)}>
              ← Back
            </button>
            <div>
              <h3 className="generator-title">{selectedTemplate.name}</h3>
              <p className="generator-subtitle">{selectedTemplate.description}</p>
            </div>
          </div>

          <div className="configuration-form">
            {/* Template Fields */}
            <div className="form-section">
              <h4 className="section-title">Report Parameters</h4>
              <div className="form-fields">
                {selectedTemplate.fields.map(field => (
                  <div key={field.id} className="form-field">
                    {field.type !== 'checkbox' && (
                      <label className="form-label">
                        {field.label}
                        {field.required && <span className="required">*</span>}
                      </label>
                    )}
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="form-section">
              <h4 className="section-title">Output Format</h4>
              <div className="format-options">
                {['pdf', 'excel', 'csv', 'json'].map((format) => (
                  <button
                    key={format}
                    className={`format-btn ${reportFormat === format ? 'active' : ''}`}
                    onClick={() => setReportFormat(format as any)}
                  >
                    <span className="format-icon">
                      {format === 'pdf' && '📕'}
                      {format === 'excel' && '📗'}
                      {format === 'csv' && '📄'}
                      {format === 'json' && '{ }'}
                    </span>
                    <span className="format-label">{format.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="generator-actions">
            {onCancel && (
              <button className="btn-cancel" onClick={onCancel} disabled={isGenerating}>
                Cancel
              </button>
            )}
            <button
              className="btn-generate"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner-small"></span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="btn-icon">✨</span>
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
