import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Deployed to GitHub Pages at https://cyb3rsoldier.github.io/FlameScout/
  base: '/FlameScout/',
})
