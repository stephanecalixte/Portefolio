import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const mediaPort = Number(env.MEDIA_PORT || 3001)

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      proxy: {
        // Les routes servies par Cloudflare Pages Functions (port 8788) :
        // contact (Resend) et données D1. Ces entrées doivent rester avant "/api" :
        // Vite utilise la première correspondance.
        "/api/admin": "http://localhost:3000",
        "/api/contact": "http://localhost:8788",
        "/api/projects": "http://localhost:8788",
        "/api/skills": "http://localhost:8788",
        "/api": "http://localhost:3000",
        "/media": `http://127.0.0.1:${mediaPort}`,
      },
    },
  }
})
