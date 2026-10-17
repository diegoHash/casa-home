import path from "path"
import react from "@vitejs/plugin-react"
import basicSsl from "@vitejs/plugin-basic-ssl"
import { defineConfig } from "vite"
import tailwindcss from '@tailwindcss/vite'
import { execFileSync } from 'node:child_process'

const useDevelopmentHttps = process.env.CASA_DEV_HTTPS === 'true'
const buildSha = process.env.VITE_CASA_BUILD_SHA
  || process.env.GITHUB_SHA
  || process.env.CF_PAGES_COMMIT_SHA
  || process.env.VERCEL_GIT_COMMIT_SHA
  || (() => {
    try {
      return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    } catch {
      return 'local'
    }
  })()

export default defineConfig({
  define: {
    __CASA_BUILD_SHA__: JSON.stringify(buildSha),
  },
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
