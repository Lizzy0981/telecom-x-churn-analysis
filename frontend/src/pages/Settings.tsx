// frontend/src/pages/Settings.tsx
import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'general' | 'ml' | 'data' | 'notifications'>('general');

  // State for settings
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('dark');
  const [timezone, setTimezone] = useState('America/Santo_Domingo');
  const [currency, setCurrency] = useState('USD');

  // ML Settings
  const [modelVersion, setModelVersion] = useState('v1.0');
  const [autoRetrain, setAutoRetrain] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [churnAlerts, setChurnAlerts] = useState(true);
  const [reportAlerts, setReportAlerts] = useState(false);

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Configure your application preferences
          </p>
        </div>
        <div className="header-right">
          <button className="btn-primary" onClick={handleSave}>
            <span className="btn-icon">💾</span>
            <span className="btn-text">Save Changes</span>
          </button>
        </div>
      </div>

      <div className="settings-container">
        {/* Sidebar Navigation */}
        <nav className="settings-sidebar">
          <button
            className={`settings-nav-item ${activeSection === 'general' ? 'active' : ''}`}
            onClick={() => setActiveSection('general')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">General</span>
          </button>
          <button
            className={`settings-nav-item ${activeSection === 'ml' ? 'active' : ''}`}
            onClick={() => setActiveSection('ml')}
          >
            <span className="nav-icon">🤖</span>
            <span className="nav-text">ML Configuration</span>
          </button>
          <button
            className={`settings-nav-item ${activeSection === 'data' ? 'active' : ''}`}
            onClick={() => setActiveSection('data')}
          >
            <span className="nav-icon">💾</span>
            <span className="nav-text">Data & Privacy</span>
          </button>
          <button
            className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <span className="nav-icon">🔔</span>
            <span className="nav-text">Notifications</span>
          </button>
        </nav>

        {/* Settings Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="settings-section">
              <h2 className="section-title">General Settings</h2>

              <div className="settings-group">
                <label className="settings-label">
                  Language
                  <span className="label-description">Choose your preferred language</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="settings-select"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="he">עברית</option>
                  <option value="zh">中文</option>
                  <option value="ru">Русский</option>
                  <option value="tr">Türkçe</option>
                  <option value="ko">한국어</option>
                  <option value="ja">日本語</option>
                </select>
              </div>

              <div className="settings-group">
                <label className="settings-label">
                  Theme
                  <span className="label-description">Select your preferred theme</span>
                </label>
                <div className="theme-options">
                  <button
                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <span className="theme-icon">🌙</span>
                    <span className="theme-name">Dark</span>
                  </button>
                  <button
                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <span className="theme-icon">☀️</span>
                    <span className="theme-name">Light</span>
                  </button>
                  <button
                    className={`theme-option ${theme === 'auto' ? 'active' : ''}`}
                    onClick={() => setTheme('auto')}
                  >
                    <span className="theme-icon">🔄</span>
                    <span className="theme-name">Auto</span>
                  </button>
                </div>
              </div>

              <div className="settings-group">
                <label className="settings-label">
                  Timezone
                  <span className="label-description">Your local timezone</span>
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="settings-select"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Santo_Domingo">Atlantic Time (AST)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>

              <div className="settings-group">
                <label className="settings-label">
                  Currency
                  <span className="label-description">Default currency for reports</span>
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="settings-select"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="DOP">DOP - Dominican Peso</option>
                </select>
              </div>
            </div>
          )}

          {/* ML Configuration */}
          {activeSection === 'ml' && (
            <div className="settings-section">
              <h2 className="section-title">ML Configuration</h2>

              <div className="settings-group">
                <label className="settings-label">
                  Model Version
                  <span className="label-description">Active churn prediction model</span>
                </label>
                <select
                  value={modelVersion}
                  onChange={(e) => setModelVersion(e.target.value)}
                  className="settings-select"
                >
                  <option value="v1.0">v1.0 (Current - 87.3% accuracy)</option>
                  <option value="v0.9">v0.9 (Previous - 85.1% accuracy)</option>
                  <option value="v0.8">v0.8 (Archived - 82.4% accuracy)</option>
                </select>
              </div>

              <div className="settings-group">
                <label className="settings-label">
                  <input
                    type="checkbox"
                    checked={autoRetrain}
                    onChange={(e) => setAutoRetrain(e.target.checked)}
                    className="settings-checkbox"
                  />
                  <span>Auto-retrain Model</span>
                  <span className="label-description">
                    Automatically retrain model when new data is uploaded
                  </span>
                </label>
              </div>

              <div className="settings-group">
                <label className="settings-label">
                  Confidence Threshold
                  <span className="label-description">
                    Minimum confidence for churn predictions ({confidenceThreshold}%)
                  </span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                  className="settings-slider"
                />
                <div className="slider-labels">
                  <span>50%</span>
                  <span>95%</span>
                </div>
              </div>

              <div className="settings-info">
                <div className="info-icon">ℹ️</div>
                <div className="info-text">
                  Changes to ML configuration will take effect after the next model training cycle.
                </div>
              </div>
            </div>
          )}

          {/* Data & Privacy */}
          {activeSection === 'data' && (
            <div className="settings-section">
              <h2 className="section-title">Data & Privacy</h2>

              <div className="settings-group">
                <h3 className="subsection-title">Data Storage</h3>
                <div className="data-info-grid">
                  <div className="data-info-card">
                    <div className="info-label">Storage Location</div>
                    <div className="info-value">Browser Local Storage</div>
                  </div>
                  <div className="data-info-card">
                    <div className="info-label">Data Retention</div>
                    <div className="info-value">Session Only</div>
                  </div>
                  <div className="data-info-card">
                    <div className="info-label">Uploaded Files</div>
                    <div className="info-value">12 files (24.3 MB)</div>
                  </div>
                  <div className="data-info-card">
                    <div className="info-label">ML Models</div>
                    <div className="info-value">3 versions (45.2 MB)</div>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h3 className="subsection-title">Privacy Options</h3>
                <label className="settings-label">
                  <input type="checkbox" className="settings-checkbox" defaultChecked />
                  <span>Process data locally (recommended)</span>
                </label>
                <label className="settings-label">
                  <input type="checkbox" className="settings-checkbox" defaultChecked />
                  <span>Anonymize customer IDs in reports</span>
                </label>
                <label className="settings-label">
                  <input type="checkbox" className="settings-checkbox" />
                  <span>Share anonymous usage statistics</span>
                </label>
              </div>

              <div className="settings-group">
                <button className="btn-danger">
                  <span className="btn-icon">🗑️</span>
                  <span className="btn-text">Clear All Data</span>
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h2 className="section-title">Notifications</h2>

              <div className="settings-group">
                <label className="settings-label">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="settings-checkbox"
                  />
                  <span>Email Notifications</span>
                  <span className="label-description">
                    Receive email updates about important events
                  </span>
                </label>
              </div>

              <div className="settings-group">
                <h3 className="subsection-title">Alert Types</h3>
                <label className="settings-label">
                  <input
                    type="checkbox"
                    checked={churnAlerts}
                    onChange={(e) => setChurnAlerts(e.target.checked)}
                    className="settings-checkbox"
                  />
                  <span>High Churn Risk Alerts</span>
                </label>
                <label className="settings-label">
                  <input
                    type="checkbox"
                    checked={reportAlerts}
                    onChange={(e) => setReportAlerts(e.target.checked)}
                    className="settings-checkbox"
                  />
                  <span>Report Generation Complete</span>
                </label>
                <label className="settings-label">
                  <input type="checkbox" className="settings-checkbox" />
                  <span>Model Training Complete</span>
                </label>
                <label className="settings-label">
                  <input type="checkbox" className="settings-checkbox" />
                  <span>Weekly Summary Reports</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
