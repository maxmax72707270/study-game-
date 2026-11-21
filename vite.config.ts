import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 코어 분리
          'vendor-react': ['react', 'react-dom'],
          // Three.js 분리 (가장 큰 패키지)
          'vendor-three': ['three'],
          // Supabase 분리
          'vendor-supabase': ['@supabase/supabase-js'],
          // Lucide 아이콘 분리
          'vendor-lucide': ['lucide-react'],
        }
      }
    }
  }
});
