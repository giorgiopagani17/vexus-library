import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import pkg from './package.json'

export default defineConfig({
  plugins: [vue()],

  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_NAME__: JSON.stringify(pkg.libraryName),
    __APP_NAME_SHORT__: JSON.stringify(pkg.libraryNameShort)
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/css/variables.scss";
        `
      }
    }
  }
})