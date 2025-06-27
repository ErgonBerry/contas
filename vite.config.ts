import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    // Permite apenas o host do Render quando em preview (Docker)
    allowedHosts: command === 'serve' 
      ? ['localhost', '127.0.0.1']  // Modo dev (npm run dev)
      : ['contas-9q4q.onrender.com'] // Modo preview (npm run preview)
  }
}));