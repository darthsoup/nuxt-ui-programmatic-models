import { fileURLToPath, URL } from 'node:url'
import ui from '@nuxt/ui/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// Standalone Vue 3 + Vite + @nuxt/ui playground. Demonstrates that the library
// works in a non-Nuxt app and lets us verify behaviour in a real browser.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [
    vue(),
    ui(),
  ],
  resolve: {
    alias: {
      // Use the library source directly (live HMR while developing the lib).
      'nuxt-ui-modals': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
  },
  server: {
    // Allow importing the parent ../src directory.
    fs: {
      allow: [
        fileURLToPath(new URL('..', import.meta.url)),
      ],
    },
  },
})
