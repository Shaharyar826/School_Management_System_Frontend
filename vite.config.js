import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      hmr: process.env.USE_TUNNEL === 'true' ? false : {},
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
          secure: false,
        },
      },
      // Dev-only: allow tunnel hosts via env var
      allowedHosts: process.env.VITE_ALLOWED_HOSTS
        ? process.env.VITE_ALLOWED_HOSTS.split(',')
        : ['localhost'],
    },
    build: {
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
            ui: ['@headlessui/react', 'react-icons', 'react-toastify', 'framer-motion'],
            charts: ['chart.js', 'react-chartjs-2', 'recharts'],
            stripe: ['@stripe/react-stripe-js', '@stripe/stripe-js'],
            pdf: ['jspdf'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
      sourcemap: !isProduction,
    },
  }
})
