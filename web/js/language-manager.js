// ============================================================================
// TELECOM X - LANGUAGE MANAGER
// Manages i18n translations for the application
// ============================================================================

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadTranslations(this.currentLang);
        this.setupEventListeners();
        this.updateUI();
        this.setupDarkMode();
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`../translations/${lang}.json`);
            this.translations = await response.json();
        } catch (error) {
            console.warn(`⚠️ Could not load ${lang}.json, using fallback`);
            if (lang !== 'en') {
                await this.loadTranslations('en');
            } else {
                this.translations = this.getFallbackTranslations();
            }
        }
    }

    getFallbackTranslations() {
        return {
            app: {
                title: "Telecom X - Customer Churn Analysis",
                subtitle: "AI-Powered Predictive Intelligence Platform"
            },
            status: { ai_active: "AI System Active" },
            upload: {
                title: "Upload Your Data",
                drop_title: "Drag & Drop Your Files Here",
                drop_subtitle: "or click to browse",
                supported: "Supported:",
                browse: "Browse Files"
            }
        };
    }

    setupEventListeners() {
        const languageBtn = document.getElementById('languageBtn');
        const languageDropdown = document.getElementById('languageDropdown');
        const languageOptions = document.querySelectorAll('.language-option');

        if (languageBtn) {
            languageBtn.addEventListener('click', () => {
                languageDropdown.classList.toggle('active');
                languageBtn.classList.toggle('active');
            });
        }

        languageOptions.forEach(option => {
            option.addEventListener('click', async (e) => {
                const lang = option.dataset.lang;
                await this.changeLanguage(lang);
                languageDropdown.classList.remove('active');
                languageBtn.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) {
                languageDropdown?.classList.remove('active');
                languageBtn?.classList.remove('active');
            }
        });
    }

    async changeLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        await this.loadTranslations(lang);
        this.updateUI();
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    updateUI() {
        const currentLang = document.getElementById('currentLang');
        const currentFlag = document.getElementById('currentFlag');
        
        const flags = {
            'es': '🇪🇸', 'en': '🇺🇸', 'pt': '🇧🇷', 'fr': '🇫🇷',
            'ar': '🇸🇦', 'he': '🇮🇱', 'zh': '🇨🇳'
        };

        if (currentLang) currentLang.textContent = this.currentLang.toUpperCase();
        if (currentFlag) currentFlag.textContent = flags[this.currentLang];

        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(el => {
            const key = el.dataset.translate;
            const translation = this.getTranslation(key);
            if (translation && translation !== key) {
                el.textContent = translation;
            }
        });

        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.toggle('active', option.dataset.lang === this.currentLang);
        });

        const rtlLanguages = ['ar', 'he'];
        document.body.setAttribute('dir', rtlLanguages.includes(this.currentLang) ? 'rtl' : 'ltr');
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations;
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }
        return value || key;
    }

    t(key) {
        return this.getTranslation(key);
    }

    setupDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }

        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                const isNowDark = document.body.classList.contains('dark-mode');
                localStorage.setItem('darkMode', isNowDark);
                window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: { isDark: isNowDark } }));
            });
        }
    }
}

const languageManager = new LanguageManager();
