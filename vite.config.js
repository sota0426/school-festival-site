import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pagesではリポジトリ名のサブパスから配信される。
  base: process.env.GITHUB_PAGES === 'true' ? '/school-festival-site/' : '/',
  plugins: [react(), tailwindcss()],
})
