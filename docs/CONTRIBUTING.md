# 🤝 Contributing to Telecom X

Thank you for your interest in contributing to Telecom X! This guide will help you get started.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

---

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/telecom-x-churn.git
cd telecom-x-churn
```

### 3. Set Up Development Environment

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install development tools
pip install pytest pytest-cov black flake8 mypy pre-commit
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `test/` - Test additions/modifications
- `refactor/` - Code refactoring

---

## 🔄 Development Process

### 1. Make Your Changes

- Write clean, readable code
- Follow coding standards (see below)
- Add tests for new features
- Update documentation as needed

### 2. Run Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html

# View coverage report
open htmlcov/index.html
```

### 3. Lint Your Code

```bash
# Format with Black
black src tests

# Check with flake8
flake8 src tests

# Type checking with mypy
mypy src
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add customer segmentation feature"
```

Commit message format:
```
type: subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Build/config changes

Example:
```
feat: add customer segmentation

Implemented K-means clustering for customer segmentation
based on tenure and monthly charges.

Closes #123
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

---

## 🔀 Pull Request Process

### Before Submitting

- [ ] All tests pass
- [ ] Code is properly formatted
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (for significant changes)
- [ ] No merge conflicts

### Creating Pull Request

1. Go to the original repository
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template
5. Submit for review

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Tests pass
- [ ] Code formatted
- [ ] Documentation updated
```

### Review Process

1. **Automated Checks** - CI/CD runs tests
2. **Code Review** - Maintainers review code
3. **Feedback** - Address review comments
4. **Approval** - Get approval from maintainer
5. **Merge** - Maintainer merges PR

---

## 📝 Coding Standards

### Python Style

Follow [PEP 8](https://pep8.org/) style guide.

**Use Black for formatting:**
```bash
black src tests
```

**Key conventions:**
- 4 spaces for indentation
- Maximum line length: 88 characters
- Use descriptive variable names
- Add docstrings to all functions/classes

### Example Code

```python
def calculate_churn_probability(
    tenure: int,
    monthly_charges: float,
    contract_type: str
) -> float:
    """
    Calculate churn probability for a customer.
    
    Args:
        tenure: Customer tenure in months
        monthly_charges: Monthly charges amount
        contract_type: Type of contract (Month-to-month, One Year, Two Year)
        
    Returns:
        Churn probability between 0 and 1
        
    Raises:
        ValueError: If tenure is negative or charges are invalid
    """
    if tenure < 0:
        raise ValueError("Tenure must be non-negative")
    
    if monthly_charges <= 0:
        raise ValueError("Monthly charges must be positive")
    
    # Implementation
    probability = model.predict([[tenure, monthly_charges, contract_type]])[0]
    
    return float(probability)
```

### Type Hints

Always use type hints:

```python
from typing import List, Dict, Optional

def process_customers(
    customer_ids: List[str],
    filters: Optional[Dict[str, str]] = None
) -> List[Dict[str, any]]:
    """Process list of customers with optional filters."""
    ...
```

### Error Handling

```python
import logging

logger = logging.getLogger(__name__)

try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Validation error: {e}")
    raise
except Exception as e:
    logger.exception(f"Unexpected error: {e}")
    return None
```

---

## 🧪 Testing Guidelines

### Test Structure

```python
import pytest
from src.etl.transformer import Transformer

class TestTransformer:
    """Tests for Transformer class."""
    
    @pytest.fixture
    def sample_data(self):
        """Create sample data for testing."""
        return pd.DataFrame({
            'customerID': ['C001', 'C002'],
            'tenure': [12, 24]
        })
    
    def test_clean_data(self, sample_data):
        """Test data cleaning functionality."""
        transformer = Transformer()
        result = transformer.clean_data(sample_data)
        
        assert len(result) == 2
        assert result['tenure'].min() >= 0
```

### Test Coverage

Aim for >80% coverage:

```bash
pytest tests/ --cov=src --cov-report=term-missing
```

### Test Types

1. **Unit Tests** - Test individual functions
2. **Integration Tests** - Test component interactions
3. **End-to-End Tests** - Test complete workflows

Mark tests appropriately:

```python
@pytest.mark.unit
def test_validation():
    ...

@pytest.mark.integration
def test_pipeline():
    ...
```

---

## 📚 Documentation

### Docstrings

Use Google-style docstrings:

```python
def segment_customers(data: pd.DataFrame, n_clusters: int = 4) -> pd.DataFrame:
    """
    Segment customers using K-means clustering.
    
    This function applies K-means clustering to segment customers based on
    their tenure and monthly charges.
    
    Args:
        data: Customer dataframe with tenure and charges columns
        n_clusters: Number of clusters for segmentation (default: 4)
        
    Returns:
        DataFrame with added 'Segment' column
        
    Raises:
        ValueError: If n_clusters is less than 2
        KeyError: If required columns are missing
        
    Example:
        >>> data = pd.read_csv('customers.csv')
        >>> segmented = segment_customers(data, n_clusters=5)
        >>> print(segmented['Segment'].value_counts())
    """
    ...
```

### README Updates

Update README.md when adding:
- New features
- New dependencies
- New configuration options
- New usage examples

### API Documentation

Document all API endpoints in `docs/API_DOCUMENTATION.md`.

---

## 🌍 Community

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General discussions
- **Pull Requests** - Code review and contributions

### Getting Help

1. Check existing [Issues](https://github.com/Lizzy0981/telecom-x-churn/issues)
2. Search [Discussions](https://github.com/Lizzy0981/telecom-x-churn/discussions)
3. Create new issue with detailed description

### Recognition

Contributors are recognized in:
- CONTRIBUTORS.md
- Release notes
- Project website

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Thank you for contributing to Telecom X! Your efforts help make this project better for everyone.

---

**Developed with 💜 by Elizabeth Díaz Familia**
