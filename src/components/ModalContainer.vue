<script lang="ts">
import type { Component, PropType, VNode } from 'vue'
import { defineComponent, h, resolveComponent } from 'vue'
import { getModalComponent, store } from '../store.js'
import ModalHost from './ModalHost.vue'

/**
 * Renderless container that mounts every entry in the modal stack. Add it once
 * to your app (inside `<UApp>`), or let the `nuxtUiModals` plugin inject it.
 *
 * The `<UModal>` component is resolved at runtime — never imported/bundled —
 * because `@nuxt/ui`'s `Modal.vue` depends on virtual modules only the
 * consumer's `@nuxt/ui` Vite plugin can resolve. Resolution order:
 * explicit `modalComponent` prop -> plugin option -> `resolveComponent('UModal')`
 * (works because the consumer ran `app.use(ui)`).
 */
export default defineComponent({
  name: 'ModalContainer',
  props: {
    modalComponent: {
      type: [Object, Function] as PropType<Component>,
      required: false,
      default: undefined,
    },
  },
  setup(props): () => VNode[] {
    return function renderModals(): VNode[] {
      const modalComponent: Component
        = props.modalComponent
          ?? getModalComponent()
          ?? (resolveComponent('UModal') as Component)

      return store.stack.map(entry =>
        h(ModalHost, { key: entry.key, entry, modalComponent }),
      )
    }
  },
})
</script>
