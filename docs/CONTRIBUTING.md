# 🤝 Contributing Guide

Thank you for considering contributing to Telecom X! This document provides guidelines for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

---

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, experience level, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Examples of behavior that contributes to creating a positive environment:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**

- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at conduct@telecomx.com.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Python >= 3.11
- Git
- PostgreSQL (for database development)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/telecom-x-churn-analysis.git
cd telecom-x-churn-analysis
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/Lizzy0981/telecom-x-churn-analysis.git
```

### Setup Development Environment

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 💻 Development Process

### Branching Strategy

We use **Git Flow**:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
git checkout develop
git pull upstream develop
git checkout feature/your-feature-name
git rebase develop
```

---

## 📝 Coding Standards

### TypeScript/JavaScript (Frontend)

**Style Guide:** We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

**ESLint Configuration:**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-console": "warn",
    "react/prop-types": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}
```

**Formatting:**

```bash
npm run lint
npm run format
```

**Good Example:**

```typescript
// ✅ Good
interface CustomerData {
  customerId: string;
  tenure: number;
  monthlyCharges: number;
}

export const predictChurn = async (data: CustomerData): Promise<number> => {
  const model = await loadModel();
  const prediction = await model.predict(data);
  return prediction;
};
```

**Bad Example:**

```typescript
// ❌ Bad
export const predictChurn = async (data: any) => {
  let model = await loadModel();
  var prediction = model.predict(data);
  return prediction;
};
```

### Python (Backend)

**Style Guide:** We follow [PEP 8](https://pep8.org/)

**Tools:**

- **Black** for formatting
- **flake8** for linting
- **mypy** for type checking
- **isort** for import sorting

**Configuration:**

```bash
# Format code
black app/

# Lint
flake8 app/

# Type check
mypy app/

# Sort imports
isort app/
```

**Good Example:**

```python
# ✅ Good
from typing import List, Optional

def predict_churn(
    customer_id: str,
    tenure: int,
    monthly_charges: float
) -> float:
    """
    Predict churn probability for a customer.
    
    Args:
        customer_id: Unique customer identifier
        tenure: Months with company
        monthly_charges: Monthly bill amount
        
    Returns:
        Churn probability (0-1)
    """
    model = load_model()
    prediction = model.predict(customer_id, tenure, monthly_charges)
    return prediction
```

**Bad Example:**

```python
# ❌ Bad
def predict_churn(customer_id,tenure,monthly_charges):
    model=load_model()
    prediction=model.predict(customer_id,tenure,monthly_charges)
    return prediction
```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/).

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
# Good
feat(ml): add SHAP explainability to predictions
fix(api): resolve 500 error on large file uploads
docs(readme): update installation instructions

# Bad
added stuff
fix bug
update
```

---

## 🧪 Testing

### Frontend Tests

**Run all tests:**

```bash
cd frontend
npm run test
```

**Run specific test:**

```bash
npm run test -- ChurnPredictor.test.tsx
```

**Coverage report:**

```bash
npm run test:coverage
```

**Writing Tests:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ChurnPredictor } from './ChurnPredictor';

describe('ChurnPredictor', () => {
  it('should render input form', () => {
    render(<ChurnPredictor />);
    expect(screen.getByLabelText('Tenure')).toBeInTheDocument();
  });

  it('should make prediction on submit', async () => {
    render(<ChurnPredictor />);
    
    fireEvent.change(screen.getByLabelText('Tenure'), {
      target: { value: '24' }
    });
    
    fireEvent.click(screen.getByText('Predict'));
    
    expect(await screen.findByText('Churn Probability:')).toBeInTheDocument();
  });
});
```

### Backend Tests

**Run all tests:**

```bash
cd backend
pytest
```

**Run specific test:**

```bash
pytest tests/test_ml.py::test_predict_churn
```

**Coverage report:**

```bash
pytest --cov=app --cov-report=html
```

**Writing Tests:**

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_predict_churn():
    """Test churn prediction endpoint."""
    response = client.post(
        "/api/ml/predict",
        json={
            "customer_id": "TEST-001",
            "tenure": 24,
            "monthly_charges": 89.99
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "churn_probability" in data
    assert 0 <= data["churn_probability"] <= 1
```

### Test Coverage Requirements

- **Minimum coverage:** 85%
- **Critical paths:** 100% (ML predictions, authentication)
- **New features:** Must include tests
- **Bug fixes:** Must include regression tests

---

## 🔄 Submitting Changes

### Pull Request Process

1. **Create a Pull Request:**

```bash
git push origin feature/your-feature-name
```

Then open a PR on GitHub.

2. **PR Title:**

Follow conventional commits format:

```
feat(ml): add LIME explanations for predictions
```

3. **PR Description Template:**

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Coverage maintained/improved

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
```

4. **Review Process:**

- At least 1 approval required
- All CI checks must pass
- No merge conflicts
- Squash commits before merging

5. **After Merge:**

```bash
git checkout develop
git pull upstream develop
git branch -d feature/your-feature-name
```

---

## 🐛 Reporting Bugs

### Before Submitting

1. Check existing issues
2. Check if it's already fixed in `develop`
3. Ensure you can reproduce the bug

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug.

## To Reproduce
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Screenshots
[Add screenshots if applicable]

## Environment
- OS: [e.g., Windows 10, macOS 12, Ubuntu 22.04]
- Browser: [e.g., Chrome 120, Firefox 121]
- Frontend version: [e.g., v1.2.0]
- Backend version: [e.g., v1.2.0]

## Additional Context
Any other relevant information.
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
## Problem Statement
Describe the problem this feature would solve.

## Proposed Solution
Describe your proposed solution.

## Alternatives Considered
Other solutions you've considered.

## Additional Context
Mockups, examples, etc.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

---

## 📚 Documentation

### When to Update Docs

- New features
- API changes
- Configuration changes
- Bug fixes affecting usage

### Documentation Structure

```
docs/
├── API.md              # API documentation
├── ML.md               # ML documentation
├── DEPLOYMENT.md       # Deployment guide
├── CONTRIBUTING.md     # This file
└── CHANGELOG.md        # Version history
```

---

## 🏆 Recognition

Contributors will be:

- Listed in [AUTHORS.md](../AUTHORS.md)
- Mentioned in release notes
- Featured on our website (with permission)

---

## 📞 Getting Help

- **Discord:** https://discord.gg/telecomx
- **GitHub Discussions:** https://github.com/Lizzy0981/telecom-x/discussions
- **Email:** dev@telecomx.com

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).

---

Thank you for contributing to Telecom X! 🙏

---

© 2025 Elizabeth Díaz Familia
