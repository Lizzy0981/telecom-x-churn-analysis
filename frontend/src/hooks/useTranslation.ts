// frontend/src/hooks/useTranslation.ts
/**
 * useTranslation Hook
 * Custom hook for internationalization (i18n)
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type Language = 
  | 'en' // English
  | 'es' // Español
  | 'pt' // Português
  | 'fr' // Français
  | 'ar' // العربية
  | 'he' // עברית
  | 'zh' // 中文
  | 'ru' // Русский
  | 'tr' // Türkçe
  | 'ko' // 한국어
  | 'ja'; // 日本語

export interface Translations {
  [key: string]: string | Translations;
}

export interface TranslationContextValue {
  language: Language;
  translations: Translations;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

// Translation context
export const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

// Default translations (English)
const defaultTranslations: Record<Language, Translations> = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      download: 'Download'
    },
    dashboard: {
      title: 'Dashboard',
      overview: 'Overview',
      kpis: 'Key Performance Indicators',
      churnRate: 'Churn Rate',
      totalCustomers: 'Total Customers',
      revenue: 'Revenue',
      predictions: 'Predictions'
    },
    customers: {
      title: 'Customers',
      customerId: 'Customer ID',
      name: 'Name',
      tenure: 'Tenure',
      monthlyCharges: 'Monthly Charges',
      totalCharges: 'Total Charges',
      contract: 'Contract',
      churnRisk: 'Churn Risk'
    },
    ml: {
      title: 'ML Predictions',
      churnProbability: 'Churn Probability',
      riskLevel: 'Risk Level',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      modelAccuracy: 'Model Accuracy',
      featureImportance: 'Feature Importance'
    },
    reports: {
      title: 'Reports',
      generate: 'Generate Report',
      download: 'Download',
      share: 'Share',
      churnAnalysis: 'Churn Analysis',
      revenueReport: 'Revenue Report'
    },
    settings: {
      title: 'Settings',
      language: 'Language',
      theme: 'Theme',
      notifications: 'Notifications',
      profile: 'Profile'
    }
  },
  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      search: 'Buscar',
      filter: 'Filtrar',
      export: 'Exportar',
      import: 'Importar',
      download: 'Descargar'
    },
    dashboard: {
      title: 'Panel de Control',
      overview: 'Resumen',
      kpis: 'Indicadores Clave',
      churnRate: 'Tasa de Abandono',
      totalCustomers: 'Total de Clientes',
      revenue: 'Ingresos',
      predictions: 'Predicciones'
    },
    customers: {
      title: 'Clientes',
      customerId: 'ID de Cliente',
      name: 'Nombre',
      tenure: 'Antigüedad',
      monthlyCharges: 'Cargos Mensuales',
      totalCharges: 'Cargos Totales',
      contract: 'Contrato',
      churnRisk: 'Riesgo de Abandono'
    },
    ml: {
      title: 'Predicciones ML',
      churnProbability: 'Probabilidad de Abandono',
      riskLevel: 'Nivel de Riesgo',
      high: 'Alto',
      medium: 'Medio',
      low: 'Bajo',
      modelAccuracy: 'Precisión del Modelo',
      featureImportance: 'Importancia de Características'
    },
    reports: {
      title: 'Reportes',
      generate: 'Generar Reporte',
      download: 'Descargar',
      share: 'Compartir',
      churnAnalysis: 'Análisis de Abandono',
      revenueReport: 'Reporte de Ingresos'
    },
    settings: {
      title: 'Configuración',
      language: 'Idioma',
      theme: 'Tema',
      notifications: 'Notificaciones',
      profile: 'Perfil'
    }
  },
  pt: {
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      search: 'Pesquisar',
      filter: 'Filtrar',
      export: 'Exportar',
      import: 'Importar',
      download: 'Baixar'
    },
    dashboard: {
      title: 'Painel',
      overview: 'Visão Geral',
      kpis: 'Indicadores-Chave',
      churnRate: 'Taxa de Rotatividade',
      totalCustomers: 'Total de Clientes',
      revenue: 'Receita',
      predictions: 'Previsões'
    }
  },
  fr: {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      search: 'Rechercher',
      filter: 'Filtrer',
      export: 'Exporter',
      import: 'Importer',
      download: 'Télécharger'
    }
  },
  de: {
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      loading: 'Wird geladen...',
      error: 'Fehler',
      success: 'Erfolg'
    }
  },
  zh: {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      loading: '加载中...',
      error: '错误',
      success: '成功'
    }
  },
  ja: {
    common: {
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      loading: '読み込み中...',
      error: 'エラー',
      success: '成功'
    }
  },
  ar: {
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح'
    }
  },
  he: {
    common: {
      save: 'שמור',
      cancel: 'ביטול',
      delete: 'מחק',
      edit: 'ערוך',
      loading: 'טוען...',
      error: 'שגיאה',
      success: 'הצלחה'
    }
  },
  ru: {
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успех'
    }
  },
  tr: {
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      loading: 'Yükleniyor...',
      error: 'Hata',
      success: 'Başarılı'
    }
  },
  ko: {
    common: {
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '편집',
      loading: '로딩 중...',
      error: '오류',
      success: '성공'
    }
  }
};

/**
 * Hook for translations
 */
export function useTranslation() {
  const context = useContext(TranslationContext);

  if (!context) {
    // Fallback if not wrapped in provider
    const [language, setLanguage] = useState<Language>('en');
    const [translations, setTranslations] = useState<Translations>(defaultTranslations.en);

    useEffect(() => {
      setTranslations(defaultTranslations[language] || defaultTranslations.en);
    }, [language]);

    const t = useCallback((key: string, params?: Record<string, any>): string => {
      const keys = key.split('.');
      let value: any = translations;

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // Return key if translation not found
        }
      }

      let result = typeof value === 'string' ? value : key;

      // Replace parameters
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(`{{${paramKey}}}`, String(paramValue));
        });
      }

      return result;
    }, [translations]);

    return { language, setLanguage, translations, t };
  }

  return context;
}

/**
 * Hook for language detection
 */
export function useLanguageDetection(): Language {
  const [detectedLanguage, setDetectedLanguage] = useState<Language>('en');

  useEffect(() => {
    // Detect from browser
    const browserLang = navigator.language.split('-')[0] as Language;
    
    // Check if supported
    if (Object.keys(defaultTranslations).includes(browserLang)) {
      setDetectedLanguage(browserLang);
    }

    // Check localStorage
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && Object.keys(defaultTranslations).includes(savedLang)) {
      setDetectedLanguage(savedLang);
    }
  }, []);

  return detectedLanguage;
}

/**
 * Hook for RTL languages
 */
export function useRTL(): boolean {
  const { language } = useTranslation();
  return ['ar', 'he'].includes(language);
}

/**
 * Hook for date/time formatting
 */
export function useDateTimeFormat() {
  const { language } = useTranslation();

  const formatDate = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  }, [language]);

  const formatTime = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(language, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }, [language]);

  const formatDateTime = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }, [language]);

  const formatRelative = useCallback((date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return formatDate(d);
  }, [formatDate]);

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative
  };
}

/**
 * Hook for number formatting
 */
export function useNumberFormat() {
  const { language } = useTranslation();

  const formatNumber = useCallback((value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat(language, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }, [language]);

  const formatCurrency = useCallback((
    value: number,
    currency: string = 'USD'
  ): string => {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency
    }).format(value);
  }, [language]);

  const formatPercent = useCallback((value: number, decimals: number = 1): string => {
    return new Intl.NumberFormat(language, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }, [language]);

  return {
    formatNumber,
    formatCurrency,
    formatPercent
  };
}

/**
 * Get available languages
 */
export function getAvailableLanguages(): Array<{ code: Language; name: string }> {
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
    { code: 'he', name: 'עברית' },
    { code: 'zh', name: '中文' },
    { code: 'ru', name: 'Русский' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ko', name: '한국어' },
    { code: 'ja', name: '日本語' }
  ];
}

export default useTranslation;
