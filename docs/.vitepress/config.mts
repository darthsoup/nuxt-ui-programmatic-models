import ui from '@nuxt/ui/vite'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'nuxt-ui-modals',
  description: 'Programmatic modal API for Nuxt UI v4’s UModal component',
  lang: 'en-US',
  base: '/nuxt-ui-programmatic-models/',
  cleanUrls: false,

  vite: {
    // Enables @nuxt/ui components (resolves the virtual #build/#imports modules
    // <UModal> needs). `router: false` — VitePress uses its own router, not vue-router.
    plugins: [
      ui({ router: false }),
    ],
  },

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/guide/api' },
      { text: 'Demo', link: '/demo/modal-demo' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'API Reference', link: '/guide/api' },
        ],
      },
      {
        text: 'Examples',
        items: [
          { text: 'Interactive Demo', link: '/demo/modal-demo' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/darthsoup/nuxt-ui-programmatic-models' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present',
    },
  },
})
