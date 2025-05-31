import MillionLint from '@million/lint';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [MillionLint.vite({
      enabled: true
    }), react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // Make environment variables available to client code
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || ''),
    },
    server: {
      proxy: {
        // Proxy API requests during development
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});
