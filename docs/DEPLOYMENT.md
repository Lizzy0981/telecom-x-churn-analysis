# 🚀 Deployment Guide

## Overview

This guide covers deploying Telecom X to production environments, including frontend, backend, database, and monitoring setup.

---

## 📋 Prerequisites

### Required Tools

- Node.js >= 18.0.0
- Python >= 3.11
- PostgreSQL >= 14
- Docker >= 20.10 (optional)
- Git

### Required Accounts

- Vercel / Netlify (Frontend)
- Railway / Render (Backend)
- Supabase / PlanetScale (Database)
- Sentry (Error tracking)
- Google Analytics (optional)

---

## 🎯 Deployment Architecture

```
┌─────────────┐
│   Vercel    │  Frontend (React + Vite)
│  (CDN Edge) │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│   Railway   │  Backend (FastAPI + Python)
│  (Docker)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │  PostgreSQL Database
│  (Cloud DB) │
└─────────────┘
```

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login

```bash
vercel login
```

#### 3. Deploy

```bash
cd frontend
vercel
```

#### 4. Environment Variables

Create `.env.production`:

```bash
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_API_TIMEOUT=30000
VITE_ENABLE_PWA=true
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

Add in Vercel Dashboard:
1. Project Settings → Environment Variables
2. Add each variable
3. Redeploy

#### 5. Custom Domain

```bash
vercel domains add your-domain.com
```

Configure DNS:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### Option 2: Netlify

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Login

```bash
netlify login
```

#### 3. Deploy

```bash
cd frontend
netlify deploy --prod
```

#### 4. Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

### Option 3: GitHub Pages

#### 1. Configure Vite

Update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/telecom-x-churn-analysis/',
  // ... rest of config
});
```

#### 2. Deploy Script

Add to `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

#### 3. Deploy

```bash
npm run deploy
```

---

## ⚙️ Backend Deployment

### Option 1: Railway (Recommended)

#### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

#### 2. Login

```bash
railway login
```

#### 3. Initialize Project

```bash
cd backend
railway init
```

#### 4. Environment Variables

Create `.env.production`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=telecom-x-data

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# ML Models
MODEL_PATH=/app/models
```

Add in Railway Dashboard:
1. Project → Variables
2. Add each variable
3. Deploy

#### 5. Dockerfile

Already included in `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 6. Deploy

```bash
railway up
```

---

### Option 2: Render

#### 1. Create Account

Go to https://render.com and sign up.

#### 2. New Web Service

- Connect GitHub repository
- Select `backend` directory
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### 3. Environment Variables

Add in Render Dashboard:
- DATABASE_URL
- SECRET_KEY
- ALLOWED_ORIGINS
- etc.

#### 4. Health Check

Enable health check:
- Path: `/health`
- Expected Status: 200

---

### Option 3: Docker Compose

#### 1. docker-compose.yml

Already included in `backend/docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/telecom_x
    depends_on:
      - db
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=telecom_x
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### 2. Deploy

```bash
cd backend
docker-compose up -d
```

---

## 🗄️ Database Setup

### Option 1: Supabase (Recommended)

#### 1. Create Project

Go to https://supabase.com and create a new project.

#### 2. Get Connection String

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### 3. Run Migrations

```bash
cd backend

# Set DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run Alembic migrations
alembic upgrade head
```

#### 4. Seed Data (Optional)

```bash
python scripts/seed_data.py
```

---

### Option 2: PlanetScale

#### 1. Create Database

```bash
pscale database create telecom-x
```

#### 2. Create Branch

```bash
pscale branch create telecom-x main
```

#### 3. Get Connection String

```bash
pscale connect telecom-x main --port 3309
```

#### 4. Configure SQLAlchemy

Update `app/core/config.py`:

```python
DATABASE_URL = "mysql+pymysql://user:pass@host:3306/telecom_x"
```

---

### Option 3: Railway PostgreSQL

#### 1. Add Database

```bash
railway add postgresql
```

#### 2. Link to Backend

Railway automatically sets `DATABASE_URL` environment variable.

#### 3. Run Migrations

```bash
railway run alembic upgrade head
```

---

## 🔐 Security Checklist

### Environment Variables

- ✅ Never commit `.env` files
- ✅ Use environment-specific configs
- ✅ Rotate secrets regularly
- ✅ Use strong SECRET_KEY (min 32 characters)

### HTTPS

- ✅ Enable HTTPS on all domains
- ✅ Force HTTPS redirects
- ✅ Use HSTS headers

### CORS

```python
# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # Not ["*"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/data", dependencies=[Depends(limiter.limit("10/minute"))])
```

### Input Validation

- ✅ Use Pydantic models for all inputs
- ✅ Validate file uploads (size, type)
- ✅ Sanitize SQL queries (use ORM)

---

## 📊 Monitoring

### Sentry (Error Tracking)

#### 1. Install

```bash
pip install sentry-sdk[fastapi]
```

#### 2. Configure

```python
# app/main.py
import sentry_sdk

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    traces_sample_rate=1.0,
    environment="production"
)
```

### Google Analytics

#### 1. Add to Frontend

```typescript
// src/main.tsx
import ReactGA from "react-ga4";

ReactGA.initialize("G-XXXXXXXXXX");
```

### Uptime Monitoring

Use **UptimeRobot** or **Pingdom**:

- Monitor: `https://your-api.com/health`
- Interval: 5 minutes
- Alert: Email + Slack

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: 3.11
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pytest
      - uses: Railway-Actions/railway-action@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          working-directory: ./backend
```

---

## 🧪 Testing Before Deployment

### Frontend Tests

```bash
cd frontend
npm run test
npm run test:e2e
npm run build
```

### Backend Tests

```bash
cd backend
pytest
pytest --cov=app --cov-report=html
```

### Load Testing

```bash
# Install Locust
pip install locust

# Run load test
locust -f tests/load_test.py --host=https://your-api.com
```

---

## 📈 Performance Optimization

### Frontend

- ✅ Code splitting
- ✅ Lazy loading
- ✅ Image optimization
- ✅ Service Worker caching
- ✅ CDN delivery

### Backend

- ✅ Database indexing
- ✅ Query optimization
- ✅ Redis caching
- ✅ Async endpoints
- ✅ Connection pooling

### Database

```sql
-- Add indexes for frequent queries
CREATE INDEX idx_customer_id ON customers(customer_id);
CREATE INDEX idx_churn ON customers(churn);
CREATE INDEX idx_created_at ON customers(created_at);
```

---

## 🔄 Backup Strategy

### Database Backups

**Automated (Supabase):**
- Daily backups (retained 7 days)
- Weekly backups (retained 4 weeks)
- Monthly backups (retained 12 months)

**Manual:**
```bash
# Backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20241215.sql
```

### File Backups

If using S3:
```bash
# Backup to S3
aws s3 sync ./data s3://telecom-x-backups/data/

# Restore from S3
aws s3 sync s3://telecom-x-backups/data/ ./data
```

---

## 🚨 Rollback Procedure

### Frontend

```bash
# Vercel - rollback to previous deployment
vercel rollback

# Or redeploy specific commit
vercel --prod --force
```

### Backend

```bash
# Railway - rollback to previous deployment
railway rollback

# Or redeploy specific commit
git checkout <previous-commit>
railway up
```

### Database

```bash
# Alembic - downgrade one version
alembic downgrade -1

# Or downgrade to specific version
alembic downgrade <revision>
```

---

## ✅ Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API endpoints respond (200 OK)
- [ ] Database connections work
- [ ] Authentication works
- [ ] File uploads work
- [ ] ML predictions work
- [ ] Email notifications work (if enabled)
- [ ] Error tracking configured
- [ ] Analytics tracking
- [ ] Performance metrics < targets
- [ ] Security headers present
- [ ] HTTPS working
- [ ] Custom domain configured
- [ ] Backups enabled
- [ ] Monitoring alerts configured

---

## 📞 Support

If you encounter issues during deployment:

1. Check logs:
   - Vercel: Dashboard → Logs
   - Railway: Dashboard → Logs
   - Sentry: Error dashboard

2. Common issues:
   - CORS errors → Check ALLOWED_ORIGINS
   - 502/504 errors → Check backend health
   - Database connection → Check DATABASE_URL
   - Missing env vars → Check deployment config

3. Contact:
   - Email: support@telecomx.com
   - GitHub Issues: https://github.com/Lizzy0981/telecom-x/issues

---

© 2025 Elizabeth Díaz Familia
