import { defineConfig } from 'vite'
// Force Restart 1
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
