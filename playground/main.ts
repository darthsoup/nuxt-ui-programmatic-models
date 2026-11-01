import ui from '@nuxt/ui/vue-plugin'
import { nuxtUiModals, useModalStore } from 'nuxt-ui-modals'
import { createApp, defineComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

// @nuxt/ui's UButton/ULink use vue-router's useRoute(); a real Vue app has a
// router, so the playground sets up a minimal one.
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:catchAll(.*)',
      component: defineComponent({
        render: () => null,
      }),
    },
  ],
})

// Documented integration: close every modal on navigation.
router.beforeEach(() => {
  useModalStore().closeAll()
})

// `?mode=auto` exercises the plugin's auto-injected detached container;
// anything else uses the manual <ModalContainer/> placed in App.vue.
const autoInject = new URLSearchParams(window.location.search).get('mode') === 'auto'

createApp(App)
  .use(router)
  .use(ui)
  .use(nuxtUiModals, { container: autoInject })
  .mount('#app')
