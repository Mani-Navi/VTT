import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  define: {
    global: 'window',
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-konva': ['konva', 'react-konva'],
          'vendor-livekit': ['livekit-client'],
          'vendor-stomp': ['@stomp/stompjs', 'sockjs-client'],
          'vendor-zustand': ['zustand'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['konva', 'react-konva', 'livekit-client', '@stomp/stompjs'],
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': 'http://localhost:8080',
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
      },
    },
  },
});