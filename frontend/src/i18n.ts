// frontend/src/i18n.ts
/**
 * i18n Configuration
 * Telecom X - Customer Churn Analysis Platform
 * 
 * Supports 11 languages:
 * - Spanish (es) - Default
 * - English (en) - Fallback
 * - Portuguese (pt)
 * - French (fr)
 * - Arabic (ar) - RTL
 * - Hebrew (he) - RTL
 * - Chinese (zh) - CJK
 * - Russian (ru) - Cyrillic
 * - Turkish (tr)
 * - Korean (ko) - CJK
 * - Japanese (ja) - CJK
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import es from './locales/es.json'
import en from './locales/en.json'
import pt from './locales/pt.json'
import fr from './locales/fr.json'
import ar from './locales/ar.json'
import he from './locales/he.json'
import zh from './locales/zh.json'
import ru from './locales/ru.json'
import tr from './locales/tr.json'
import ko from './locales/ko.json'
import ja from './locales/ja.json'

// Resources configuration
const resources = {
  es: { translation: es },
  en: { translation: en },
  pt: { translation: pt },
  fr: { translation: fr },
  ar: { translation: ar },
  he: { translation: he },
  zh: { translation: zh },
  ru: { translation: ru },
  tr: { translation: tr },
  ko: { translation: ko },
  ja: { translation: ja }
}

// RTL languages
const rtlLanguages = ['ar', 'he']

// Initialize i18n
i18n
  // Language detection plugin
  .use(LanguageDetector)
  // React bindings
  .use(initReactI18next)
  // Initialize
  .init({
    resources,
    
    // Default language
    lng: 'es',
    
    // Fallback language
    fallbackLng: 'en',
    
    // Namespaces
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Interpolation
    interpolation: {
      escapeValue: false // React already escapes
    },
    
    // Language detection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    
    // React specific
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
    },
    
    // Debug (only in development)
    debug: import.meta.env.DEV
  })

// Set document direction based on language
i18n.on('languageChanged', (lng) => {
  const dir = rtlLanguages.includes(lng) ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('dir', dir)
  document.documentElement.setAttribute('lang', lng)
})

// Set initial direction
const currentLang = i18n.language
const initialDir = rtlLanguages.includes(currentLang) ? 'rtl' : 'ltr'
document.documentElement.setAttribute('dir', initialDir)
document.documentElement.setAttribute('lang', currentLang)

export default i18n
