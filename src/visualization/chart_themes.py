"""
🎨 Chart Themes
==============

Autor: Elizabeth Díaz Familia
"""

TELECOM_COLORS = {
    'primary': '#667eea',
    'secondary': '#764ba2',
    'success': '#00d4aa',
    'danger': '#f5576c',
    'warning': '#f093fb',
    'info': '#4facfe'
}

PLOTLY_THEME = {
    'template': 'plotly_dark',
    'color_discrete_sequence': list(TELECOM_COLORS.values())
}
