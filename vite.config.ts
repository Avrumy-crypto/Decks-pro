import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Decks-pro/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    globals: true,
  },
})
