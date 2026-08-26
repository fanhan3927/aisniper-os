import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// AISniper OS — 纯前端单页「桌面」，无路由。
// base 由部署环境覆盖（见 README），本地默认 /。
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2021',
    chunkSizeWarningLimit: 1200,
  },
});
