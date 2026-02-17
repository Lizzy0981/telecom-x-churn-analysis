// frontend/src/App.tsx
/**
 * Main Application Component
 * Telecom X - Customer Churn Analysis Platform
 * 
 * Features:
 * - Error boundary for graceful error handling
 * - Suspense for lazy loading
 * - Theme initialization
 * - Store initialization
 * - Routing with React Router v6
 */

import { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { initializeStores } from './store'

// Layout Components
import { Layout } from './components/Layout'
import { Footer } from './components/Footer/Footer'

// Error & Loading Components
import ErrorFallback from './components/ErrorFallback'
import LoadingSpinner from './components/LoadingSpinner'

// Pages
import Landing from './pages/Landing'
import Overview from './pages/Overview'
import Dashboard from './pages/Dashboard'
import DataSources from './pages/DataSources'
import Upload from './pages/Upload'
import Reports from './pages/Reports'
import MLPrediction from './pages/MLPrediction'
import Clustering from './pages/Clustering'
import Settings from './pages/Settings'

/**
 * Main App Component
 */
function App() {
  // Initialize stores (theme, auth session, etc.)
  useEffect(() => {
    initializeStores();
  }, []);

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log to error tracking service (Sentry, etc.)
        console.error('Application Error:', error, errorInfo);
      }}
      onReset={() => {
        // Reset app state
        window.location.href = '/';
      }}
    >
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Router>
          <div className="app">
            <Routes>
              {/* Landing page (no layout) */}
              <Route path="/" element={<Landing />} />
              
              {/* App routes (with layout) */}
              <Route element={<Layout />}>
                <Route path="/overview" element={<Overview />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/data-sources" element={<DataSources />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/ml/prediction" element={<MLPrediction />} />
                <Route path="/ml/clustering" element={<Clustering />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* 404 - Not Found */}
                <Route 
                  path="*" 
                  element={
                    <div className="flex flex-col items-center justify-center min-h-screen">
                      <h1 className="text-4xl font-bold mb-4">404</h1>
                      <p className="text-gray-400 mb-8">Page not found</p>
                      <a href="/" className="btn btn-primary">
                        Go Home
                      </a>
                    </div>
                  } 
                />
              </Route>
            </Routes>
            
            <Footer />
          </div>
        </Router>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App