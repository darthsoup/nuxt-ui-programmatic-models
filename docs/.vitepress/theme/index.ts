/* eslint-disable perfectionist/sort-imports -- Declare CSS layers before loading the default theme. */
import './style.css'
import type { Theme } from 'vitepress'
import ui from '@nuxt/ui/vue-plugin'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // Install synchronously (before mount) so @nuxt/ui's components are globally
    // registered and ModalContainer's resolveComponent('UModal') resolves.
    // Client-only: the live demos are wrapped in <ClientOnly>, and skipping the
    // server keeps `vitepress build` from SSR-rendering @nuxt/ui.
    if (!import.meta.env.SSR) {
      app.use(ui)
    }
  },
} satisfies Theme
