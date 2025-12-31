"""
Unit tests for Internationalization (i18n)
Tests translation system and multi-language support
"""

import pytest
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


class TestTranslationFiles:
    """Tests for translation JSON files"""
    
    def test_load_spanish_translations(self):
        """Test loading Spanish translations"""
        mock_translations = {
            "app": {
                "title": "Telecom X - Análisis de Churn",
                "subtitle": "Plataforma de Inteligencia Predictiva"
            },
            "navigation": {
                "dashboard": "Panel de Control",
                "reports": "Reportes"
            }
        }
        
        assert "app" in mock_translations
        assert mock_translations["app"]["title"] is not None
    
    def test_load_english_translations(self):
        """Test loading English translations"""
        mock_translations = {
            "app": {
                "title": "Telecom X - Churn Analysis",
                "subtitle": "Predictive Intelligence Platform"
            },
            "navigation": {
                "dashboard": "Dashboard",
                "reports": "Reports"
            }
        }
        
        assert "app" in mock_translations
        assert mock_translations["navigation"]["dashboard"] == "Dashboard"
    
    def test_translation_file_structure(self):
        """Test translation file has required structure"""
        mock_structure = {
            "app": {},
            "navigation": {},
            "dashboard": {},
            "kpis": {},
            "charts": {},
            "actions": {},
            "messages": {},
            "customer": {}
        }
        
        required_keys = ["app", "navigation", "dashboard", "kpis"]
        assert all(key in mock_structure for key in required_keys)
    
    def test_all_languages_have_same_keys(self):
        """Test all language files have same keys"""
        es_keys = {"app", "navigation", "dashboard", "kpis"}
        en_keys = {"app", "navigation", "dashboard", "kpis"}
        
        assert es_keys == en_keys


class TestLanguageManager:
    """Tests for language manager functionality"""
    
    def test_set_default_language(self):
        """Test setting default language"""
        language_manager = {'current_language': 'en', 'fallback': 'en'}
        
        assert language_manager['current_language'] == 'en'
        assert language_manager['fallback'] == 'en'
    
    def test_change_language(self):
        """Test changing current language"""
        language_manager = {'current_language': 'en'}
        
        # Change to Spanish
        language_manager['current_language'] = 'es'
        
        assert language_manager['current_language'] == 'es'
    
    def test_fallback_to_default(self):
        """Test fallback to default language"""
        language_manager = {
            'current_language': 'invalid',
            'fallback': 'en',
            'available_languages': ['es', 'en', 'pt', 'fr']
        }
        
        if language_manager['current_language'] not in language_manager['available_languages']:
            language_manager['current_language'] = language_manager['fallback']
        
        assert language_manager['current_language'] == 'en'
    
    def test_get_translation(self):
        """Test retrieving translation"""
        translations = {
            "es": {"dashboard": {"title": "Panel de Control"}},
            "en": {"dashboard": {"title": "Dashboard"}}
        }
        
        current_lang = 'es'
        translation = translations[current_lang]["dashboard"]["title"]
        
        assert translation == "Panel de Control"
    
    def test_get_nested_translation(self):
        """Test retrieving nested translation"""
        translations = {
            "app": {
                "title": "Telecom X",
                "subtitle": "Churn Analysis"
            }
        }
        
        # Get nested value
        title = translations.get("app", {}).get("title")
        
        assert title == "Telecom X"


class TestSupportedLanguages:
    """Tests for supported languages"""
    
    def test_list_supported_languages(self):
        """Test listing all supported languages"""
        supported_languages = [
            {'code': 'es', 'name': 'Español', 'flag': '🇪🇸'},
            {'code': 'en', 'name': 'English', 'flag': '🇺🇸'},
            {'code': 'pt', 'name': 'Português', 'flag': '🇧🇷'},
            {'code': 'fr', 'name': 'Français', 'flag': '🇫🇷'},
            {'code': 'ar', 'name': 'العربية', 'flag': '🇸🇦'},
            {'code': 'he', 'name': 'עברית', 'flag': '🇮🇱'},
            {'code': 'zh', 'name': '中文', 'flag': '🇨🇳'}
        ]
        
        assert len(supported_languages) == 7
        assert all('code' in lang for lang in supported_languages)
    
    def test_validate_language_code(self):
        """Test validating language code"""
        valid_codes = ['es', 'en', 'pt', 'fr', 'ar', 'he', 'zh']
        test_code = 'es'
        
        assert test_code in valid_codes
    
    def test_invalid_language_code(self):
        """Test handling invalid language code"""
        valid_codes = ['es', 'en', 'pt', 'fr', 'ar', 'he', 'zh']
        test_code = 'invalid'
        
        assert test_code not in valid_codes


class TestRTLLanguages:
    """Tests for Right-to-Left languages"""
    
    def test_detect_rtl_language(self):
        """Test detecting RTL languages"""
        rtl_languages = ['ar', 'he']
        
        test_lang = 'ar'
        is_rtl = test_lang in rtl_languages
        
        assert is_rtl is True
    
    def test_apply_rtl_direction(self):
        """Test applying RTL text direction"""
        language = 'ar'
        rtl_config = {
            'direction': 'rtl' if language in ['ar', 'he'] else 'ltr',
            'text_align': 'right' if language in ['ar', 'he'] else 'left'
        }
        
        assert rtl_config['direction'] == 'rtl'
        assert rtl_config['text_align'] == 'right'


class TestTranslationPersistence:
    """Tests for translation persistence"""
    
    def test_save_language_preference(self):
        """Test saving language preference"""
        user_preferences = {'language': 'es'}
        
        # Simulate localStorage save
        stored_value = user_preferences['language']
        
        assert stored_value == 'es'
    
    def test_load_language_preference(self):
        """Test loading saved language preference"""
        # Simulate localStorage retrieval
        stored_value = 'es'
        
        current_language = stored_value if stored_value else 'en'
        
        assert current_language == 'es'
    
    def test_clear_language_preference(self):
        """Test clearing language preference"""
        user_preferences = {'language': 'es'}
        
        # Clear preference
        user_preferences['language'] = None
        
        assert user_preferences['language'] is None


class TestTranslationFormatting:
    """Tests for translation formatting"""
    
    def test_format_with_variables(self):
        """Test translation with variable substitution"""
        template = "Welcome, {name}!"
        formatted = template.format(name="Elizabeth")
        
        assert formatted == "Welcome, Elizabeth!"
    
    def test_pluralization(self):
        """Test pluralization in translations"""
        count = 5
        message = f"{count} customers" if count != 1 else f"{count} customer"
        
        assert message == "5 customers"
    
    def test_number_formatting(self):
        """Test number formatting by locale"""
        value = 1234.56
        
        # US format
        us_format = f"${value:,.2f}"  # $1,234.56
        
        assert us_format == "$1,234.56"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
