# 📁 Example Data Files

Estos archivos de ejemplo están listos para probar el sistema de upload de la aplicación Telecom X.

## 📋 Archivos Disponibles

### 1. **example-data.csv** 
- Formato: CSV (Comma-Separated Values)
- Registros: 10 clientes
- Estructura: Plana (todas las columnas al mismo nivel)
- Uso: Ideal para probar import desde Excel, Google Sheets

### 2. **example-data.json**
- Formato: JSON
- Registros: 3 clientes (más detallados)
- Estructura: Anidada (igual que el dataset original)
- Uso: Ideal para desarrolladores, APIs

### 3. **example-data.xml**
- Formato: XML
- Registros: 3 clientes
- Estructura: Jerárquica
- Uso: Ideal para sistemas empresariales

## 🚀 Cómo Usar

1. **Abrir la aplicación** Telecom X
2. **Ir a la sección** "Upload Data"
3. **Arrastrar y soltar** cualquiera de estos archivos
4. **O hacer clic** en "Browse" y seleccionar el archivo
5. **Esperar** a que se procesen los datos
6. **Ver** los resultados en el dashboard

## ✅ Validación

Todos los archivos contienen datos válidos con:
- ✅ customerID único
- ✅ Churn (Yes/No)
- ✅ Todos los campos requeridos
- ✅ Formatos correctos

## 📊 Formatos Adicionales Soportados

La aplicación también soporta:
- XLSX (Excel nuevo formato)
- XLS (Excel formato antiguo)
- TSV (Tab-separated values)
- TXT (Texto plano con delimitadores)
- PDF (Extracción de tablas)

## 💡 Crear Tu Propio Archivo

### Campos Requeridos Mínimos:
```
customerID, Churn
```

### Campos Opcionales:
```
gender, SeniorCitizen, Partner, Dependents, tenure,
PhoneService, MultipleLines, InternetService,
Contract, PaymentMethod, MonthlyCharges, TotalCharges
```

### Ejemplo Mínimo CSV:
```csv
customerID,Churn
0001-ABC,No
0002-DEF,Yes
```

## 🎯 Estructura Recomendada

Para mejores resultados, usa la estructura completa como en estos ejemplos.

---

**Desarrollado con 💜 y mucho ☕ por Elizabeth Díaz Familia**
