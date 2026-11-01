import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      bundleTypes: true,
      processor: 'vue',
      tsconfigPath: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
      include: ['src'],
    }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'NuxtUiModals',
      formats: ['es', 'cjs'],
      fileName: format => (format === 'es'
        ? 'index.js'
        : 'index.cjs'),
    },
    rolldownOptions: {
      // Peers (and their transitive peers) must never be bundled — that would
      // create duplicate Vue/Reka instances in the consumer's app.
      external: [
        'vue',
        /^@nuxt\/ui($|\/)/,
        '@vueuse/core',
        '@vueuse/shared',
        'reka-ui',
      ],
      output: {
        exports: 'named',
        globals: { vue: 'Vue' },
      },
    },
  },
})
