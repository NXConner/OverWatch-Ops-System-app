import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@blacktop/shared-types': path.resolve(__dirname, '../../libs/shared/types/src'),
      '@blacktop/shared-utils': path.resolve(__dirname, '../../libs/shared/utils/src'),
      '@blacktop/ui-components': path.resolve(__dirname, '../../libs/ui/components/src'),
      '@blacktop/theme': path.resolve(__dirname, '../../libs/ui/theme/src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
  define: {
    global: 'globalThis',
  },
})