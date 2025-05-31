import MillionLint from '@million/lint';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [MillionLint.vite({
      enabled: false
    }), react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // Provide a polyfill for process.env with all environment variables
      'process.env': Object.keys(env).reduce((prev, key) => {
        return {
          ...prev,
          [key]: JSON.stringify(env[key])
        };
      }, {})
    },
  };
});
