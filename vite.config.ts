import path from "path"
import react from "@vitejs/plugin-react"
import basicSsl from "@vitejs/plugin-basic-ssl"
import { defineConfig } from "vite"
import tailwindcss from '@tailwindcss/vite'

const useDevelopmentHttps = process.env.CASA_DEV_HTTPS === 'true'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(useDevelopmentHttps ? [basicSsl()] : []),
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['.ngrok-free.dev', 'diego.tail73afb5.ts.net'],
    proxy: {
      '/v1': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
