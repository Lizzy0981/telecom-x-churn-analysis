// frontend/src/components/Layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { t } = useTranslation();

  const menuItems = [
    {
      path: '/overview',
      icon: '📊',
      label: t('nav.overview'),
      description: t('nav.overviewDesc') // ✅ Ahora usa i18n
    },
    {
      path: '/dashboard',
      icon: '📈',
      label: t('nav.dashboard'),
      description: t('nav.dashboardDesc') // ✅ i18n
    },
    {
      path: '/data-sources',
      icon: '💾',
      label: t('nav.dataSources'),
      description: t('nav.dataSourcesDesc') // ✅ i18n
    },
    {
      path: '/upload',
      icon: '📤',
      label: t('nav.upload'),
      description: t('nav.uploadDesc') // ✅ i18n
    },
    {
      path: '/ml/prediction',
      icon: '🤖',
      label: t('nav.mlPrediction'),
      description: t('nav.mlPredictionDesc') // ✅ i18n
    },
    {
      path: '/ml/clustering',
      icon: '🔮',
      label: t('nav.clustering'),
      description: t('nav.clusteringDesc') // ✅ i18n
    },
    {
      path: '/reports',
      icon: '📄',
      label: t('nav.reports'),
      description: t('nav.reportsDesc') // ✅ i18n
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: t('nav.settings'),
      description: t('nav.settingsDesc') // ✅ i18n
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo Section */}
        <div className="sidebar-logo">
          <div className="logo-icon">TX</div>
          <div className="logo-text">
            <h2>Telecom X</h2>
            <span className="logo-subtitle">{t('app.subtitle')}</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.path} className="sidebar-menu-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="sidebar-icon" role="img" aria-label={item.label}>
                    {item.icon}
                  </span>
                  <div className="sidebar-link-content">
                    <span className="sidebar-link-label">{item.label}</span>
                    <span className="sidebar-link-description">
                      {item.description}
                    </span>
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sustainability Badge */}
        <div className="sidebar-badge">
          <div className="sustainability-badge">
            <span className="badge-icon">🌱</span>
            <div className="badge-content">
              <span className="badge-title">{t('sustainability.title')}</span>
              <span className="badge-subtitle">{t('sustainability.subtitle')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-version">
            <span className="version-label">{t('app.version')}</span>
            <span className="version-number">0.9.0-beta</span>
          </div>
          <div className="sidebar-credits">
            <span>{t('app.credits')}</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;