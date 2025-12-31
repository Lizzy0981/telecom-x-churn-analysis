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
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`../translations/${lang}.json`);
            this.translations = await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to English
            if (lang !== 'en') {
                await this.loadTranslations('en');
            }
        }
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
                await this.changeLang uage(lang);
                languageDropdown.classList.remove('active');
                languageBtn.classList.remove('active');
            });
        });

        // Close dropdown when clicking outside
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
    }

    updateUI() {
        // Update language button
        const currentLang = document.getElementById('currentLang');
        const currentFlag = document.getElementById('currentFlag');
        
        const flags = {
            'es': '🇪🇸',
            'en': '🇺🇸',
            'pt': '🇧🇷',
            'fr': '🇫🇷',
            'ar': '🇸🇦',
            'he': '🇮🇱',
            'zh': '🇨🇳'
        };

        if (currentLang) currentLang.textContent = this.currentLang.toUpperCase();
        if (currentFlag) currentFlag.textContent = flags[this.currentLang];

        // Update all translatable elements
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(el => {
            const key = el.dataset.translate;
            const translation = this.getTranslation(key);
            if (translation) {
                el.textContent = translation;
            }
        });

        // Update active language option
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.toggle('active', option.dataset.lang === this.currentLang);
        });
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
}

// Initialize Language Manager
const languageManager = new LanguageManager();
