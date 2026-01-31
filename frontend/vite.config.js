import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 5000,
    proxy: {
      '/api': 'http://localhost:3691',
      '/images/products': 'http://localhost:3691',
    },
  },
});
