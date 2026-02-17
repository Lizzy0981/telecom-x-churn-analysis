// src/components/Footer/Footer.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import './Footer.css';

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  title: string;
}

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  const socialLinks: SocialLink[] = [
    {
      name: 'GitHub',
      url: 'https://github.com/Lizzy0981',
      icon: <Github size={24} />,
      title: 'GitHub'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/eli-familia/',
      icon: <Linkedin size={24} />,
      title: 'LinkedIn'
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/Lizzyfamilia',
      icon: <Twitter size={24} />,
      title: 'Twitter'
    },
    {
      name: 'Email',
      url: 'mailto:lizzyfamilia@gmail.com',
      icon: <Mail size={24} />,
      title: 'Email'
    }
  ];

  const footerLinks = {
    product: [
      { label: t('footer.features'), url: '#features' },
      { label: t('footer.documentation'), url: '#docs' },
      { label: t('footer.api'), url: '#api' },
      { label: t('footer.pricing'), url: '#pricing' }
    ],
    company: [
      { label: t('footer.about'), url: '#about' },
      { label: t('footer.blog'), url: '#blog' },
      { label: t('footer.careers'), url: '#careers' },
      { label: t('footer.contact'), url: '#contact' }
    ],
    resources: [
      { label: t('footer.tutorials'), url: '#tutorials' },
      { label: t('footer.guides'), url: '#guides' },
      { label: t('footer.github'), url: 'https://github.com/Lizzy0981/telecom-x-churn-analysis' },
      { label: t('footer.community'), url: '#community' }
    ],
    legal: [
      { label: t('footer.privacy'), url: '#privacy' },
      { label: t('footer.terms'), url: '#terms' },
      { label: t('footer.cookies'), url: '#cookies' },
      { label: t('footer.license'), url: '#license' }
    ]
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">📊</span>
              <h3 className="logo-text">{t('footer.title')}</h3>
            </div>
            <p className="footer-description">
              {t('footer.description')}
            </p>
            <p className="footer-tagline">
              {t('footer.tagline')}
            </p>
            
            {/* Social Links */}
            <div className="social-links">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title={social.title}
                  aria-label={social.title}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="footer-links-grid">
            {/* Product */}
            <div className="footer-column">
              <h4 className="footer-column-title">{t('footer.product')}</h4>
              <ul className="footer-links-list">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <a href={link.url} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="footer-column">
              <h4 className="footer-column-title">{t('footer.company')}</h4>
              <ul className="footer-links-list">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a href={link.url} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="footer-column">
              <h4 className="footer-column-title">{t('footer.resources')}</h4>
              <ul className="footer-links-list">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.url} 
                      className="footer-link"
                      target={link.url.startsWith('http') ? '_blank' : undefined}
                      rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="footer-column">
              <h4 className="footer-column-title">{t('footer.legal')}</h4>
              <ul className="footer-links-list">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a href={link.url} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>
              © 2025 <strong>Elizabeth Díaz Familia</strong> - {t('footer.copyright')} 💜 ☕
            </p>
          </div>
          
          <div className="footer-meta">
            <span className="footer-version">
              v{process.env.VITE_APP_VERSION || '0.9.0-beta'}
            </span>
            <span className="footer-separator">•</span>
            <a 
              href="https://github.com/Lizzy0981/telecom-x-churn-analysis"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              {t('footer.open_source')}
            </a>
            <span className="footer-separator">•</span>
            <span className="footer-tech">
              {t('footer.built_with')} React + TypeScript
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
