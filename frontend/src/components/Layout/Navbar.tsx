// frontend/src/components/Layout/Navbar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();

  const navItems = [
    { path: '/overview', label: t('nav.overview'), icon: '📊' },
    { path: '/dashboard', label: t('nav.dashboard'), icon: '📈' },
    { path: '/upload', label: t('nav.upload'), icon: '📤' },
    { path: '/ml/prediction', label: t('nav.mlPrediction'), icon: '🤖' },
    { path: '/reports', label: t('nav.reports'), icon: '📄' }
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Secondary navigation">
      <ul className="navbar-list">
        {navItems.map((item) => (
          <li key={item.path} className="navbar-item">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'navbar-link-active' : ''}`
              }
            >
              <span className="navbar-icon" role="img" aria-label={item.label}>
                {item.icon}
              </span>
              <span className="navbar-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
