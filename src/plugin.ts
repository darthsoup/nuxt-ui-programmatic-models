import type { App, VNode } from 'vue'
import type { NuxtUiModalsOptions } from './types.js'
import { createApp, h } from 'vue'
import ModalContainer from './components/ModalContainer.vue'
import { configure } from './store.js'

/**
 * Vue plugin. Two responsibilities:
 *
 *  1. Stores config (a `UModal` override, `closeTimeoutMs`) and globally
 *     registers `<ModalContainer/>` so manual placement works.
 *  2. Unless `container: false`, auto-injects a detached `<ModalContainer/>`
 *     mounted on `document.body`. The detached app shares the host app's
 *     context so `useAppConfig()` and `resolveComponent('UModal')` resolve.
 *
 * For SSR/Nuxt, prefer placing `<ModalContainer/>` manually inside `<UApp>`
 * and passing `{ container: false }`.
 */
export const nuxtUiModals = {
  install(app: App, options: NuxtUiModalsOptions = {}): void {
    configure(options)
    app.component('ModalContainer', ModalContainer)

    if (options.container === false || typeof document === 'undefined')
      return

    const host = document.createElement('div')
    host.setAttribute('data-nuxt-ui-modals', '')
    document.body.appendChild(host)

    const detached = createApp({
      name: 'NuxtUiModalsRoot',
      render(): VNode {
        return h(ModalContainer, { modalComponent: options.modalComponent })
      },
    })

    // Share the host app's context (provides, global components, app config) so
    // <UModal>'s useAppConfig() and resolveComponent('UModal') work in the
    // detached app. Uses Vue's internal _context — intentional and documented.
    detached._context = app._context

    detached.mount(host)
  },
}
