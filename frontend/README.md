# 📱 Telecom X Pro - Frontend

**AI-Powered Customer Churn Prediction & Analytics Platform**

Modern, responsive React + TypeScript frontend with TensorFlow.js machine learning integration, real-time analytics, and seamless Power BI & Tableau connectivity.

---

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js >= 18.0.0
- npm >= 9.0.0

### **Installation**

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📦 **Available Scripts**

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on all TypeScript files |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript compiler without emitting |
| `npm test` | Run unit tests with Vitest |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Generate test coverage report |

---

## 🏗️ **Project Structure**

```
frontend/
├── public/                      # Static assets
│   ├── logo.svg
│   ├── favicon.ico
│   └── manifest.json
│
├── src/
│   ├── components/              # React components (50 files)
│   │   ├── ui/                  # UI primitives
│   │   ├── layout/              # Layout components
│   │   ├── dashboard/           # Dashboard widgets
│   │   ├── customers/           # Customer components
│   │   ├── ml/                  # ML components
│   │   ├── charts/              # Chart components
│   │   ├── reports/             # Report components
│   │   └── common/              # Shared components
│   │
│   ├── pages/                   # Page components (10 files)
│   │   ├── Dashboard.tsx
│   │   ├── Customers.tsx
│   │   ├── Predictions.tsx
│   │   ├── Clustering.tsx
│   │   ├── Reports.tsx
│   │   └── ...
│   │
│   ├── services/                # Services layer
│   │   ├── api/                 # API clients (4 files)
│   │   ├── ml/                  # ML services (9 files)
│   │   ├── export/              # Export services (6 files)
│   │   └── utils/               # Service utilities (4 files)
│   │
│   ├── hooks/                   # Custom React hooks (5 files)
│   │   ├── useData.ts
│   │   ├── useML.ts
│   │   ├── useExport.ts
│   │   ├── useTranslation.ts
│   │   └── index.ts
│   │
│   ├── store/                   # Zustand state management (5 files)
│   │   ├── dataStore.ts
│   │   ├── mlStore.ts
│   │   ├── uiStore.ts
│   │   ├── authStore.ts
│   │   └── index.ts
│   │
│   ├── types/                   # TypeScript types (5 files)
│   │   ├── common.types.ts
│   │   ├── data.types.ts
│   │   ├── ml.types.ts
│   │   ├── api.types.ts
│   │   └── index.ts
│   │
│   ├── utils/                   # Utility functions (4 files)
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── formatters.ts
│   │   └── index.ts
│   │
│   ├── styles/                  # Global styles (4 files)
│   │   ├── globals.css
│   │   ├── variables.css
│   │   ├── themes.css
│   │   └── tailwind.css
│   │
│   ├── locales/                 # i18n translations
│   │   ├── en/
│   │   ├── es/
│   │   └── ...
│   │
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
│
├── .env.example                 # Environment variables template
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tsconfig.node.json           # Node TypeScript config
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
├── postcss.config.js            # PostCSS config
└── README.md                    # This file
```

**Total:** 106+ files organized in clear, scalable architecture

---

## 🎨 **Tech Stack**

### **Core**
- **React 18.2** - UI library
- **TypeScript 5.3** - Type safety
- **Vite 5.0** - Build tool & dev server

### **State Management**
- **Zustand 4.4** - Lightweight state management
- **React Query** - Server state management

### **Styling**
- **Tailwind CSS 3.4** - Utility-first CSS
- **Framer Motion 10.18** - Animations
- **Lucide React** - Icon library

### **Machine Learning**
- **TensorFlow.js 4.16** - Deep learning
- **Brain.js 2.0** - Neural networks

### **Data Visualization**
- **Recharts 2.10** - React charts
- **Plotly.js 2.28** - Advanced plots
- **Three.js 0.160** - 3D visualization

### **Utilities**
- **React Router 6.21** - Routing
- **i18next 23.7** - Internationalization
- **date-fns 3.0** - Date formatting
- **PapaParse 5.4** - CSV parsing
- **SheetJS 0.18** - Excel handling
- **jsPDF 2.5** - PDF generation

---

## 🌟 **Key Features**

### **🤖 Machine Learning**
- Real-time churn prediction with TensorFlow.js
- Batch prediction processing
- Model performance monitoring
- Feature importance visualization
- SHAP values for explainability

### **📊 Analytics Dashboard**
- Real-time KPI tracking
- Interactive charts and graphs
- Customer segmentation
- Cohort analysis
- Trend analysis

### **👥 Customer Management**
- Customer list with advanced filtering
- Individual customer profiles
- Risk level assessment
- Churn probability tracking
- Customer journey visualization

### **🎯 Clustering**
- K-means clustering
- Customer segmentation
- Cluster analysis
- Similarity scoring

### **📈 Reports**
- Customizable report generation
- Export to multiple formats (CSV, Excel, PDF)
- Power BI integration
- Tableau integration
- Scheduled reports

### **🎨 UI/UX**
- Dark/Light theme support
- Responsive design (mobile-first)
- Progressive Web App (PWA)
- Offline support
- 11 language support

---

## 🔧 **Configuration**

### **Environment Variables**

Create a `.env` file based on `.env.example`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_CLUSTERING=true
VITE_ENABLE_AUTOML=true
VITE_ENABLE_REPORTS=true

# Analytics
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X

# ML Models
VITE_ML_MODEL_VERSION=1.0.0
VITE_CONFIDENCE_THRESHOLD=0.7
```

### **API Proxy**

The development server proxies API requests to avoid CORS issues:

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true
    }
  }
}
```

---

## 📱 **PWA Features**

The application is a Progressive Web App with:

- **Offline support** - Service worker caching
- **Installable** - Add to home screen
- **App-like experience** - No browser chrome
- **Auto-updates** - Background updates
- **Push notifications** - (optional)

---

## 🌍 **Internationalization (i18n)**

Supports 11 languages:

- 🇺🇸 English
- 🇪🇸 Spanish
- 🇧🇷 Portuguese
- 🇫🇷 French
- 🇸🇦 Arabic
- 🇮🇱 Hebrew
- 🇨🇳 Chinese
- 🇷🇺 Russian
- 🇹🇷 Turkish
- 🇰🇷 Korean
- 🇯🇵 Japanese

Change language in Settings or use `useTranslation` hook:

```tsx
import { useTranslation } from '@/hooks';

function Component() {
  const { t, setLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button onClick={() => setLanguage('es')}>Español</button>
    </div>
  );
}
```

---

## 🎯 **Performance Optimization**

### **Code Splitting**

Automatic code splitting by route and vendor:

```ts
// vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'ml-vendor': ['@tensorflow/tfjs', 'brain.js'],
  'chart-vendor': ['recharts', 'plotly.js']
}
```

### **Lazy Loading**

Pages and heavy components are lazy loaded:

```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Predictions = lazy(() => import('./pages/Predictions'));
```

### **Image Optimization**

- WebP format with fallbacks
- Lazy loading images
- Responsive images with `srcset`

---

## 🧪 **Testing**

### **Unit Tests**

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
```

### **E2E Tests** (Coming Soon)

```bash
# Run Playwright tests
npm run test:e2e
```

---

## 📦 **Build & Deployment**

### **Production Build**

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Output in `dist/` directory.

### **Deployment Options**

#### **Vercel**
```bash
vercel --prod
```

#### **Netlify**
```bash
netlify deploy --prod
```

#### **Docker**
```bash
docker build -t telecom-x-frontend .
docker run -p 80:80 telecom-x-frontend
```

#### **Static Hosting**
Upload `dist/` folder to any static hosting service.

---

## 🔒 **Security**

- **CSP Headers** - Content Security Policy
- **XSS Protection** - Input sanitization
- **HTTPS Only** - Secure connections
- **Environment Variables** - No secrets in code
- **Dependency Scanning** - Regular updates

---

## 📊 **Bundle Analysis**

Analyze bundle size:

```bash
npm run build -- --mode analyze
```

View interactive bundle visualization.

---

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### **Code Style**

- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic

---

## 📝 **License**

MIT License - see [LICENSE](../LICENSE) file for details

---

## 👤 **Author**

**Elizabeth Díaz Familia**

- Email: lizzyfamilia@gmail.com
- GitHub: [@Lizzy0981](https://github.com/Lizzy0981)

---

## 🙏 **Acknowledgments**

- React team for the amazing framework
- TensorFlow.js team for bringing ML to the browser
- Tailwind CSS for the utility-first approach
- All open-source contributors

---

## 📚 **Documentation**

- [API Documentation](../backend/README.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

---

## 🐛 **Known Issues**

See [Issues](https://github.com/Lizzy0981/telecom-x-churn-analysis/issues) for a list of known issues and feature requests.

---

## 🔮 **Roadmap**

- [ ] Real-time collaboration features
- [ ] Advanced AutoML capabilities
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Enhanced 3D visualizations
- [ ] AI-powered insights
- [ ] Multi-tenancy support

---

## 💬 **Support**

For support, email lizzyfamilia@gmail.com or open an issue on GitHub.

---

**Built with 💜 by Elizabeth Díaz Familia**

**Powered by React, TypeScript, TensorFlow.js, and ☕**
