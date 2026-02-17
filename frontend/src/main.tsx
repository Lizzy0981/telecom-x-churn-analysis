// frontend/src/main.tsx
/**
 * Application Entry Point
 * Telecom X - Customer Churn Analysis Platform
 * 
 * Initializes:
 * - React application
 * - i18n internationalization
 * - Global styles (Tailwind + custom)
 * - Strict mode for development
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Import Tailwind CSS (includes variables, themes, globals)
import './styles/tailwind.css'

// Import i18n configuration
import './i18n'

// Get root element
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has <div id="root"></div>')
}

// Render app
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Hot Module Replacement (HMR)
if (import.meta.hot) {
  import.meta.hot.accept()
}
