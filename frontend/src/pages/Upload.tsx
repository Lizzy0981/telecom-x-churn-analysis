// frontend/src/pages/Upload.tsx
import React, { useState } from 'react';
import { FileUploadOptimized } from '../components/Upload';
import { DataPreview } from '../components/DataSources';

export const Upload: React.FC = () => {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [uploadDate, setUploadDate] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const handleFileProcessed = (data: any[], file: File) => {
    setUploadedData(data);
    setFileName(file.name);
    setFileSize(file.size);
    setUploadDate(new Date().toISOString());
    setShowPreview(true);
  };

  const handleConfirm = () => {
    // Process the data
    console.log('Processing data:', uploadedData);
    // Reset
    setShowPreview(false);
    alert(`Successfully processed ${uploadedData.length} records from ${fileName}`);
  };

  const handleCancel = () => {
    setShowPreview(false);
    setUploadedData([]);
    setFileName('');
  };

  return (
    <div className="upload-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Upload Data</h1>
          <p className="page-subtitle">
            Upload customer data files for churn analysis
          </p>
        </div>
      </div>

      <div className="page-content">
        {!showPreview ? (
          <>
            {/* Upload Section */}
            <section className="upload-section">
              <FileUploadOptimized
                onFileProcessed={handleFileProcessed}
                maxFileSize={50 * 1024 * 1024} // 50MB
                acceptedFormats={['.csv', '.xlsx', '.xls', '.json']}
              />
            </section>

            {/* Instructions */}
            <section className="instructions-section">
              <h2 className="section-title">Upload Instructions</h2>
              <div className="instructions-grid">
                <div className="instruction-card">
                  <div className="instruction-number">1</div>
                  <h3>Prepare Your Data</h3>
                  <p>
                    Ensure your file contains customer information with columns like:
                    Customer ID, Tenure, Monthly Charges, Contract Type, etc.
                  </p>
                </div>
                <div className="instruction-card">
                  <div className="instruction-number">2</div>
                  <h3>Upload File</h3>
                  <p>
                    Drag and drop your file or click to browse.
                    Supported formats: CSV, Excel (.xlsx, .xls), JSON
                  </p>
                </div>
                <div className="instruction-card">
                  <div className="instruction-number">3</div>
                  <h3>Preview & Confirm</h3>
                  <p>
                    Review the data preview to ensure correct formatting,
                    then confirm to process the data.
                  </p>
                </div>
                <div className="instruction-card">
                  <div className="instruction-number">4</div>
                  <h3>Analyze Results</h3>
                  <p>
                    Once processed, view ML predictions, customer segments,
                    and generate comprehensive reports.
                  </p>
                </div>
              </div>
            </section>

            {/* Requirements */}
            <section className="requirements-section">
              <h2 className="section-title">Data Requirements</h2>
              <div className="requirements-content">
                <div className="requirement-group">
                  <h3>✓ Required Columns</h3>
                  <ul>
                    <li>Customer ID (unique identifier)</li>
                    <li>Tenure (months as customer)</li>
                    <li>Monthly Charges (billing amount)</li>
                    <li>Total Charges (lifetime revenue)</li>
                  </ul>
                </div>
                <div className="requirement-group">
                  <h3>💡 Recommended Columns</h3>
                  <ul>
                    <li>Contract Type (month-to-month, yearly, etc.)</li>
                    <li>Payment Method</li>
                    <li>Internet Service Type</li>
                    <li>Tech Support (Yes/No)</li>
                  </ul>
                </div>
                <div className="requirement-group">
                  <h3>📏 File Specifications</h3>
                  <ul>
                    <li>Max file size: 50 MB</li>
                    <li>Formats: CSV, Excel, JSON</li>
                    <li>Encoding: UTF-8 preferred</li>
                    <li>Max rows: 100,000</li>
                  </ul>
                </div>
                <div className="requirement-group">
                  <h3>🔒 Data Privacy</h3>
                  <ul>
                    <li>Data processed locally in browser</li>
                    <li>No personal data sent to servers</li>
                    <li>ML inference runs client-side</li>
                    <li>Files deleted after session</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Sample Data */}
            <section className="sample-section">
              <h2 className="section-title">Sample Data</h2>
              <p className="section-description">
                Download a sample dataset to test the platform
              </p>
              <div className="sample-buttons">
                <button className="btn-sample">
                  <span className="btn-icon">📥</span>
                  <span className="btn-text">Download CSV Sample</span>
                </button>
                <button className="btn-sample">
                  <span className="btn-icon">📥</span>
                  <span className="btn-text">Download Excel Sample</span>
                </button>
              </div>
            </section>
          </>
        ) : (
          /* Data Preview */
          <section className="preview-section">
            <DataPreview
              data={uploadedData}
              fileName={fileName}
              fileSize={fileSize}
              uploadDate={uploadDate}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              maxRows={10}
            />
          </section>
        )}
      </div>
    </div>
  );
};

export default Upload;
