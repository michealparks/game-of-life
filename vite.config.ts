import { defineConfig } from 'vite'
import env from './env'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  publicDir: 'public',
  server: {
    fs: {
      allow: ['.'],
    },
    port: 5172,
    strictPort: true,
  },
  define: env,
})
