# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a **Telecom X - Customer Churn Analysis**! 

Esta guía te ayudará a entender cómo puedes contribuir al proyecto.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Puedo Contribuir](#cómo-puedo-contribuir)
- [Guía de Estilo](#guía-de-estilo)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

---

## 📜 Código de Conducta

Este proyecto se adhiere a un Código de Conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamiento inaceptable a contact@elizabethdiaz.com.

### Nuestros Estándares

**Ejemplos de comportamiento que contribuyen a crear un ambiente positivo:**

- ✅ Usar lenguaje acogedor e inclusivo
- ✅ Ser respetuoso con diferentes puntos de vista
- ✅ Aceptar críticas constructivas
- ✅ Enfocarse en lo mejor para la comunidad
- ✅ Mostrar empatía hacia otros miembros

**Ejemplos de comportamiento inaceptable:**

- ❌ Uso de lenguaje o imágenes sexualizadas
- ❌ Trolling, comentarios insultantes o ataques personales
- ❌ Acoso público o privado
- ❌ Publicar información privada de otros sin permiso
- ❌ Otras conductas no profesionales

---

## 🚀 Cómo Puedo Contribuir

### 1. Reportar Bugs

Los bugs se rastrean como [GitHub issues](https://github.com/Lizzy0981/telecom-x-churn-analysis/issues). Crea un issue y proporciona la siguiente información:

- **Título claro y descriptivo**
- **Descripción detallada** del problema
- **Pasos para reproducir** el comportamiento
- **Comportamiento esperado** vs comportamiento actual
- **Capturas de pantalla** (si aplica)
- **Entorno:**
  - Versión de Python
  - Sistema Operativo
  - Versiones de dependencias

**Plantilla de Bug Report:**

```markdown
### Descripción del Bug
[Descripción clara y concisa del bug]

### Pasos para Reproducir
1. Ir a '...'
2. Ejecutar '...'
3. Ver error

### Comportamiento Esperado
[Qué debería suceder]

### Comportamiento Actual
[Qué está sucediendo]

### Capturas de Pantalla
[Si aplica]

### Entorno
- Python: [e.g. 3.11]
- OS: [e.g. Windows 11, macOS 14, Ubuntu 22.04]
- Versión del proyecto: [e.g. 1.0.0]
```

### 2. Sugerir Mejoras

Las mejoras también se rastrean como GitHub issues. Proporciona:

- **Título claro y descriptivo**
- **Descripción detallada** de la mejora
- **Justificación** de por qué sería útil
- **Ejemplos** de cómo funcionaría

**Plantilla de Feature Request:**

```markdown
### Descripción de la Feature
[Descripción clara y concisa de la feature]

### Problema que Resuelve
[Por qué es necesaria esta feature]

### Solución Propuesta
[Cómo debería funcionar]

### Alternativas Consideradas
[Otras soluciones que consideraste]

### Contexto Adicional
[Información adicional relevante]
```

### 3. Contribuir con Código

#### Fork del Repositorio

```bash
# Fork en GitHub, luego:
git clone https://github.com/TU-USUARIO/telecom-x-churn-analysis.git
cd telecom-x-churn-analysis
git remote add upstream https://github.com/Lizzy0981/telecom-x-churn-analysis.git
```

#### Crear una Rama

```bash
git checkout -b feature/nombre-feature
# o
git checkout -b fix/nombre-bug
```

Nombres sugeridos de ramas:
- `feature/` - Nuevas funcionalidades
- `fix/` - Correcciones de bugs
- `docs/` - Documentación
- `refactor/` - Refactorización
- `test/` - Tests

#### Hacer Cambios

1. Escribe código siguiendo la [Guía de Estilo](#guía-de-estilo)
2. Agrega tests si es necesario
3. Actualiza la documentación
4. Verifica que todo funcione

#### Commit

```bash
git add .
git commit -m "feat: Descripción clara del cambio"
```

**Formato de commits (Conventional Commits):**

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Formato (no afecta código)
- `refactor:` - Refactorización
- `test:` - Tests
- `chore:` - Mantenimiento

#### Push y Pull Request

```bash
git push origin feature/nombre-feature
```

Luego crea un Pull Request en GitHub.

---

## 🎨 Guía de Estilo

### Código Python

Seguimos [PEP 8](https://pep8.org/) con algunas excepciones:

**Formato:**
```python
# ✅ Correcto
def calculate_churn_rate(df: pd.DataFrame, churn_col: str = 'Churn') -> float:
    """
    Calcular tasa de churn.
    
    Args:
        df: DataFrame con datos
        churn_col: Nombre de columna de churn
        
    Returns:
        Tasa de churn (0-1)
    """
    return (df[churn_col] == 'Yes').mean()

# ❌ Incorrecto
def calculateChurnRate(df,churn_col='Churn'):
    return (df[churn_col]=='Yes').mean()
```

**Docstrings:**
- Usa docstrings de Google Style
- Documenta parámetros, returns y raises
- Incluye ejemplos si es relevante

**Nombres:**
- Variables y funciones: `snake_case`
- Clases: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`

**Imports:**
```python
# Orden:
# 1. Standard library
import os
import sys

# 2. Third-party
import pandas as pd
import numpy as np

# 3. Local
from src.utils import helpers
```

### Comentarios

```python
# ✅ Buenos comentarios
# Calculate churn rate for each customer segment
segment_churn = df.groupby('Segment')['Churn'].apply(
    lambda x: (x == 'Yes').mean()
)

# ❌ Comentarios obvios
# Loop through dataframe
for row in df.iterrows():  # Iterate rows
    pass  # Do nothing
```

### Tests

```python
import pytest

def test_calculate_churn_rate():
    """Test churn rate calculation"""
    # Arrange
    df = pd.DataFrame({
        'Churn': ['Yes', 'No', 'Yes', 'No']
    })
    
    # Act
    result = calculate_churn_rate(df)
    
    # Assert
    assert result == 0.5
```

---

## 🔄 Proceso de Pull Request

### Checklist

Antes de crear un PR, verifica:

- [ ] El código sigue la guía de estilo
- [ ] Los tests pasan (`pytest`)
- [ ] Agregaste tests para nuevo código
- [ ] Actualizaste la documentación
- [ ] El commit sigue Conventional Commits
- [ ] No hay conflictos con main
- [ ] El código está formateado (`black`)
- [ ] No hay errores de linting (`flake8`)

### Plantilla de PR

```markdown
### Descripción
[Descripción clara de los cambios]

### Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

### ¿Cómo ha sido probado?
[Describe las pruebas que realizaste]

### Checklist
- [ ] Mi código sigue la guía de estilo
- [ ] He realizado auto-review
- [ ] Comenté código complejo
- [ ] Actualicé documentación
- [ ] Mis cambios no generan warnings
- [ ] Agregué tests
- [ ] Tests nuevos y existentes pasan
```

### Proceso de Review

1. **Automático**: CI/CD ejecuta tests
2. **Manual**: Maintainer revisa código
3. **Feedback**: Se solicitan cambios si es necesario
4. **Aprobación**: Se aprueba y mergea

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Verifica** que no exista un issue similar
2. **Actualiza** a la última versión
3. **Reproduce** el bug en un ambiente limpio

### Información Necesaria

- **Descripción clara** del bug
- **Pasos para reproducir**
- **Resultado esperado vs actual**
- **Código de ejemplo** que reproduce el bug
- **Logs o mensajes de error**
- **Versión** del proyecto y dependencias
- **Sistema operativo** y versión de Python

---

## 💡 Sugerir Mejoras

### Tipos de Mejoras

- **Nuevas features**
- **Mejoras de rendimiento**
- **Mejoras de UX**
- **Mejoras de documentación**
- **Refactorización**

### Propuesta

Incluye:
- **Problema** que resuelve
- **Solución** propuesta
- **Alternativas** consideradas
- **Impacto** en usuarios
- **Complejidad** estimada

---

## 📝 Documentación

### Qué Documentar

- **Nuevas features**: Cómo usarlas
- **Cambios en API**: Breaking changes
- **Ejemplos**: Código de ejemplo
- **Tutoriales**: Guías paso a paso

### Formato

- Usa Markdown
- Incluye ejemplos de código
- Agrega capturas si es relevante
- Mantén consistencia con docs existentes

---

## 🧪 Tests

### Escribir Tests

```python
# tests/test_churn_analysis.py
import pytest
from src.analysis.churn_analysis import ChurnAnalysis

def test_calculate_churn_rate_basic():
    """Test basic churn rate calculation"""
    analyzer = ChurnAnalysis()
    df = create_test_dataframe()
    result = analyzer.calculate_churn_rate(df)
    assert 0 <= result <= 1

def test_calculate_churn_rate_empty():
    """Test churn rate with empty dataframe"""
    analyzer = ChurnAnalysis()
    df = pd.DataFrame()
    with pytest.raises(ValueError):
        analyzer.calculate_churn_rate(df)
```

### Ejecutar Tests

```bash
# Todos los tests
pytest

# Con coverage
pytest --cov=src

# Un archivo específico
pytest tests/test_churn_analysis.py

# Verbose
pytest -v
```

---

## 🏷️ Versionado

Usamos [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios incompatibles
- **MINOR**: Nueva funcionalidad compatible
- **PATCH**: Bug fixes

Ejemplo: `1.2.3`

---

## 📧 Contacto

¿Preguntas? Contáctanos:

- 💬 GitHub Discussions
- 💼 **LinkedIn**: [linkedin.com/in/eli-familia/](https://linkedin.com/in/eli-familia/)
- 🐦 **Twitter**: [twitter.com/Lizzyfamilia](https://twitter.com/Lizzyfamilia)
- 📧 **Email**: lizzyfamilia@gmail.com

---

## 🙏 Agradecimientos

¡Gracias por contribuir! Tu ayuda hace que este proyecto sea mejor para todos.

---

<div align="center">

**Hecho con 💜 por Elizabeth Díaz Familia**

</div>
