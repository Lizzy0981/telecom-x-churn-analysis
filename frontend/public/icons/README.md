# 🎨 Iconos - Telecom X

**Proyecto:** Telecom X - Customer Churn Analysis  
**Autora:** Elizabeth Díaz Familia  
**Repositorio:** https://github.com/Lizzy0981/telecom-x-churn-analysis

---

## 📋 **Iconos SVG Incluidos (8 archivos):**

```
✓ favicon-16x16.svg
✓ favicon-32x32.svg
✓ apple-touch-icon.svg (180x180)
✓ android-chrome-192x192.svg
✓ android-chrome-512x512.svg
✓ maskable-icon-512x512.svg (con padding PWA)
✓ mstile-144x144.svg
✓ mstile-150x150.svg
```

---

## 🔄 **Convertir SVG a PNG**

**Los navegadores necesitan PNG para favicons.**

### **Método 1: CloudConvert (Más Fácil)** ⭐

1. Ve a: https://cloudconvert.com/svg-to-png
2. Arrastra todos los archivos `.svg` de esta carpeta
3. Configuración:
   - **Quality:** 100%
   - **Preserve aspect ratio:** ✅
4. Click "Convert"
5. Descarga todos los PNG
6. Reemplaza los SVG por los PNG (mismos nombres)

**Ejemplo:**
- `favicon-16x16.svg` → `favicon-16x16.png`
- `apple-touch-icon.svg` → `apple-touch-icon.png`

---

### **Método 2: Favicon.io**

1. Ve a: https://favicon.io/favicon-converter/
2. Sube `logo.svg` (del directorio `public/`)
3. Descarga el paquete completo
4. Extrae los PNG a esta carpeta

---

### **Método 3: Inkscape (Línea de Comandos)**

```bash
cd frontend/public/icons

# Convertir todos los SVG
for file in *.svg; do
    inkscape "$file" --export-type="png" --export-filename="${file%.svg}.png"
done
```

---

## ✅ **Archivos PNG Necesarios (8 archivos):**

Después de convertir, deberías tener:

```
favicon-16x16.png
favicon-32x32.png
apple-touch-icon.png
android-chrome-192x192.png
android-chrome-512x512.png
maskable-icon-512x512.png
mstile-144x144.png
mstile-150x150.png
```

---

## 📦 **Archivos Adicionales en `public/`**

También necesitas convertir:

```bash
cd ../  # Volver a public/

# Convertir logos principales
convert logo-192.svg logo-192.png
convert logo-512.svg logo-512.png
```

---

## 🎯 **Crear favicon.ico**

**Opción A - Online:**
1. https://favicon.io/favicon-converter/
2. Sube `logo.svg`
3. Descarga `favicon.ico`

**Opción B - ImageMagick:**
```bash
cd frontend/public/icons
convert favicon-16x16.png favicon-32x32.png ../favicon.ico
```

El `favicon.ico` debe ir en `public/`, NO en `icons/`.

---

## 🔍 **Verificar Conversión**

```bash
cd frontend/public

# Verificar iconos
ls -lh icons/*.png

# Verificar logos
ls -lh logo-192.png logo-512.png favicon.ico

# Deberías ver 11 archivos total:
# - 8 PNG en icons/
# - 2 PNG en public/ (logo-192, logo-512)
# - 1 ICO en public/ (favicon.ico)
```

---

## 💡 **Importante**

- **Mantén los SVG:** Son la fuente original
- **PNG para producción:** Los navegadores necesitan PNG
- **ICO para compatibilidad:** Navegadores antiguos usan .ico
- **Nombres exactos:** No cambies los nombres de los archivos

---

## 🎨 **Diseño de los Iconos**

Todos los iconos están basados en el logo de Telecom X:

- **Colores:** Gradiente púrpura (#667eea → #764ba2)
- **Diseño:** Letras "TX" con elementos de AI y sostenibilidad
- **Estilo:** Moderno, profesional, minimalista

---

## ✨ **Creado para Elizabeth Díaz Familia**

© 2025
