# 🎨 FONTS - Telecom X Project

## 📦 Required Fonts

This project uses the following fonts for optimal visual consistency:

### 1. **Inter** (Primary Font)
- **Weights:** Regular (400), Bold (700)
- **Format:** WOFF2 (Web)
- **License:** SIL Open Font License
- **Download:** https://rsms.me/inter/

#### How to Download:
```bash
# Visit Inter website
https://rsms.me/inter/

# Or use Google Fonts
https://fonts.google.com/specimen/Inter

# Direct download
wget https://github.com/rsms/inter/releases/download/v3.19/Inter-3.19.zip
unzip Inter-3.19.zip
cp Inter-3.19/Inter Desktop/Inter-Regular.otf ./
cp Inter-3.19/Inter Desktop/Inter-Bold.otf ./
```

#### Convert to WOFF2:
```bash
# Using fonttools
pip install fonttools brotli
pyftsubset Inter-Regular.otf --output-file=Inter-Regular.woff2 --flavor=woff2

# Or use online converter
https://cloudconvert.com/otf-to-woff2
```

### 2. **Roboto Mono** (Monospace Font - for code)
- **Weight:** Regular (400)
- **Format:** WOFF2 (Web)
- **License:** Apache License 2.0
- **Download:** https://fonts.google.com/specimen/Roboto+Mono

#### How to Download:
```bash
# Google Fonts
https://fonts.google.com/specimen/Roboto+Mono

# Direct download
wget https://github.com/google/fonts/raw/main/apache/robotomono/RobotoMono-Regular.ttf

# Convert to WOFF2
pyftsubset RobotoMono-Regular.ttf --output-file=RobotoMono-Regular.woff2 --flavor=woff2
```

## 📁 File Structure

Place the fonts in the following structure:

```
assets/fonts/
├── Inter-Regular.woff2
├── Inter-Bold.woff2
├── RobotoMono-Regular.woff2
└── FONTS_README.md (this file)
```

## 🎨 CSS Usage

Add to your CSS file:

```css
/* Inter Regular */
@font-face {
    font-family: 'Inter';
    font-weight: 400;
    font-style: normal;
    font-display: swap;
    src: url('../fonts/Inter-Regular.woff2') format('woff2');
}

/* Inter Bold */
@font-face {
    font-family: 'Inter';
    font-weight: 700;
    font-style: normal;
    font-display: swap;
    src: url('../fonts/Inter-Bold.woff2') format('woff2');
}

/* Roboto Mono Regular */
@font-face {
    font-family: 'Roboto Mono';
    font-weight: 400;
    font-style: normal;
    font-display: swap;
    src: url('../fonts/RobotoMono-Regular.woff2') format('woff2');
}

/* Apply to body */
body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Apply to code blocks */
code, pre {
    font-family: 'Roboto Mono', 'Courier New', monospace;
}
```

## 🌐 Alternative: Google Fonts CDN

If you prefer not to self-host fonts, use Google Fonts CDN:

```html
<!-- Add to <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto+Mono:wght@400&display=swap" rel="stylesheet">
```

```css
/* Then use in CSS */
body {
    font-family: 'Inter', sans-serif;
}

code {
    font-family: 'Roboto Mono', monospace;
}
```

## ⚡ Performance Tips

1. **Preload critical fonts:**
```html
<link rel="preload" href="fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
```

2. **Use font-display: swap** for better performance
3. **Subset fonts** to include only required characters
4. **Use WOFF2** format for best compression

## 📊 Font Sizes Used in Project

```css
/* Headers */
h1 { font-size: 3.5rem; font-weight: 900; }  /* 56px */
h2 { font-size: 2.5rem; font-weight: 700; }  /* 40px */
h3 { font-size: 1.5rem; font-weight: 600; }  /* 24px */

/* Body */
body { font-size: 1rem; }                    /* 16px */
small { font-size: 0.875rem; }               /* 14px */

/* Code */
code { font-size: 0.875rem; }                /* 14px */
```

## 🔗 Resources

- **Inter Font:** https://rsms.me/inter/
- **Roboto Mono:** https://fonts.google.com/specimen/Roboto+Mono
- **Font Converter:** https://cloudconvert.com/otf-to-woff2
- **Google Fonts:** https://fonts.google.com/
- **Font Squirrel Webfont Generator:** https://www.fontsquirrel.com/tools/webfont-generator

---

**Author:** Elizabeth Díaz Familia  
**Project:** Telecom X - Customer Churn Analysis
