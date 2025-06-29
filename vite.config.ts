import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    // Permite o host do Render e qualquer subdomínio do Render
    allowedHosts: [
      'contas-staging.onrender.com',
      '.onrender.com' // Permite todos os subdomínios do Render
    ],
    // Adicional: Força o Vite a aceitar o host do Render
    host: '0.0.0.0',
    strictPort: true,
    port: 4173
  }
});