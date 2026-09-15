import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 端口分配见 chaos-knots/60-工具资源/端口记录.md：前端 30047，后端 30048
    port: 30047,
    strictPort: true,
    // 前端统一请求 /api，由 Vite 代理到 chaos-nestjs，免 CORS
    proxy: {
      '/api': {
        target: 'http://localhost:30048',
        changeOrigin: true,
      },
    },
  },
})
