import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Detectar si estamos en GitHub Pages
  const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'
  
  // Base path dinámico:
  // - GitHub Pages: /telecom-x-churn-analysis/
  // - Vercel/otros: /
  const base = isGitHubPages ? '/telecom-x-churn-analysis/' : '/'

  return {
    base,
    
    plugins: [
      react()
    ],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@store': path.resolve(__dirname, './src/store')
      }
    },
    
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ml-vendor': ['@tensorflow/tfjs', 'brain.js'],
            'chart-vendor': ['recharts', 'plotly.js', 'react-plotly.js']
          }
        }
      }
    }
  }
})
