import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // ⭐ NUEVO: Base path para GitHub Pages
  base: '/telecom-x-churn-analysis/',
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.svg'],
      manifest: {
        name: 'Telecom X - Customer Churn Analysis',
        short_name: 'Telecom X',
        description: 'AI-Powered Customer Churn Predictive Analysis Platform',
        theme_color: '#667eea',
        background_color: '#1a1a2e',
        display: 'standalone',
        icons: [
          {
            // ⭐ ACTUALIZADO: Ruta con base path
            src: '/telecom-x-churn-analysis/logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            // ⭐ ACTUALIZADO: Ruta con base path
            src: '/telecom-x-churn-analysis/logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          }
        ]
      }
    })
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
})