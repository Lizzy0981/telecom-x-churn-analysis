// frontend/src/components/Layout/Header.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { t, i18n } = useTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setShowLanguageMenu(false);
  };

  return (
    <header className="header" role="banner">
      <div className="header-container">
        {/* Left Section - Menu Toggle & Title */}
        <div className="header-left">
          <button
            className="menu-toggle"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            type="button"
          >
            <span className="menu-icon">☰</span>
          </button>
          
          <div className="header-title">
            <h1>Customer Churn Analysis</h1>
            <span className="header-subtitle">AI-Powered Insights</span>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="header-right">
          {/* Search */}
          <div className="header-search">
            <input
              type="search"
              placeholder={t('common.search') || 'Search...'}
              className="search-input"
              aria-label="Search"
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* Notifications */}
          <button
            className="header-btn"
            aria-label="Notifications"
            type="button"
          >
            <span className="btn-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>

          {/* Language Selector */}
          <div className="header-dropdown">
            <button
              className="header-btn"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              aria-label="Select language"
              aria-expanded={showLanguageMenu}
              type="button"
            >
              <span className="btn-icon">{currentLanguage.flag}</span>
            </button>

            {showLanguageMenu && (
              <div className="dropdown-menu language-menu">
                <div className="dropdown-header">
                  <span className="dropdown-title">Select Language</span>
                </div>
                <div className="dropdown-content">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`dropdown-item ${
                        i18n.language === lang.code ? 'dropdown-item-active' : ''
                      }`}
                      onClick={() => changeLanguage(lang.code)}
                      type="button"
                    >
                      <span className="dropdown-icon">{lang.flag}</span>
                      <span className="dropdown-label">{lang.name}</span>
                      {i18n.language === lang.code && (
                        <span className="dropdown-check">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="header-dropdown">
            <button
              className="user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
              aria-expanded={showUserMenu}
              type="button"
            >
              <div className="avatar-image">ED</div>
              <span className="avatar-name">Elizabeth</span>
              <span className="avatar-chevron">▼</span>
            </button>

            {showUserMenu && (
              <div className="dropdown-menu user-menu">
                <div className="dropdown-header">
                  <div className="user-info">
                    <div className="user-info-avatar">ED</div>
                    <div className="user-info-details">
                      <span className="user-info-name">Elizabeth Díaz</span>
                      <span className="user-info-email">elizabeth@telecomx.app</span>
                    </div>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <div className="dropdown-content">
                  <button className="dropdown-item" type="button">
                    <span className="dropdown-icon">👤</span>
                    <span className="dropdown-label">Profile</span>
                  </button>
                  <button className="dropdown-item" type="button">
                    <span className="dropdown-icon">⚙️</span>
                    <span className="dropdown-label">Settings</span>
                  </button>
                  <button className="dropdown-item" type="button">
                    <span className="dropdown-icon">💳</span>
                    <span className="dropdown-label">Billing</span>
                  </button>
                  <button className="dropdown-item" type="button">
                    <span className="dropdown-icon">❓</span>
                    <span className="dropdown-label">Help & Support</span>
                  </button>
                </div>

                <div className="dropdown-divider" />

                <div className="dropdown-content">
                  <button className="dropdown-item dropdown-item-danger" type="button">
                    <span className="dropdown-icon">🚪</span>
                    <span className="dropdown-label">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showLanguageMenu || showUserMenu) && (
        <div
          className="dropdown-overlay"
          onClick={() => {
            setShowLanguageMenu(false);
            setShowUserMenu(false);
          }}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;
