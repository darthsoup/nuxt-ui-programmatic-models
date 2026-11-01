<script lang="ts">
import type { Component, PropType, VNode } from 'vue'
import type {
  InternalModalEntry,
  ModalContext,
  ModalSlotDefinition,
  ModalSlots,
  UseModalOptions,
} from '../types.js'
import { defineComponent, h, provide } from 'vue'
import { MODAL_CONTEXT_KEY } from '../composables/useModalContext.js'
import { closeById, destroyById, setResult, settle } from '../store.js'

type SlotContent = ModalSlots[string]

function isSlotDefinition(value: unknown): value is ModalSlotDefinition {
  return typeof value === 'object' && value !== null && 'component' in value
}

function renderSlot(content: SlotContent, slotProps: Record<string, unknown>): unknown {
  if (!content)
    return undefined
  if (isSlotDefinition(content)) {
    return h(content.component, {
      ...(content.attrs as Record<string, unknown> | undefined),
      ...slotProps,
    })
  }
  return content(slotProps)
}

/**
 * Renders a single stack entry as a `<UModal>`. Lives one component deep so it
 * can `provide()` a per-modal context and own the `after:enter`/`after:leave`
 * wiring without races between concurrent modals.
 */
export default defineComponent({
  name: 'ModalHost',
  props: {
    entry: { type: Object as PropType<InternalModalEntry>, required: true },
    modalComponent: {
      type: [Object, Function] as PropType<Component>,
      required: true,
    },
  },
  setup(props): () => VNode {
    const { entry } = props

    function close(result?: unknown): void {
      setResult(entry.id, result)
      void closeById(entry.id)
    }
    function destroy(): void {
      destroyById(entry.id)
    }

    function patchOptions(patch: Partial<UseModalOptions<Component>>): void {
      if (patch.component)
        entry.component = patch.component
      if (patch.attrs)
        Object.assign(entry.attrs, patch.attrs as Record<string, unknown>)
      if (patch.modalProps) {
        entry.modalProps = {
          ...entry.modalProps,
          ...patch.modalProps,
        }
      }
      if (patch.slots) {
        entry.slots = {
          ...entry.slots,
          ...patch.slots,
        }
      }
      if (patch.slot)
        entry.slot = patch.slot
    }

    const context: ModalContext = {
      id: entry.id,
      close,
      destroy,
      patchOptions,
    }
    provide(MODAL_CONTEXT_KEY, context)

    return function renderModal(): VNode {
      const UModal = props.modalComponent
      const slots: Record<string, (slotProps: Record<string, unknown>) => unknown> = {}

      // The main component renders into the chosen slot (default 'content').
      // It accesses `close(result)` via useModalContext(); UModal's value-less
      // slot `close` is also passed through for convenience.
      const mainSlot = entry.slot || 'content'
      slots[mainSlot] = slotProps => h(entry.component, {
        ...entry.attrs,
        ...slotProps,
      })

      // Additional named slots (header/footer/title/...). These override the
      // main slot only if explicitly targeting the same name.
      if (entry.slots) {
        for (const name of Object.keys(entry.slots)) {
          const content = entry.slots[name]
          if (!content)
            continue
          slots[name] = slotProps => renderSlot(content, slotProps) as VNode | VNode[]
        }
      }

      return h(
        UModal,
        {
          ...(entry.modalProps as Record<string, unknown> | undefined),
          'open': entry.visible,
          'onUpdate:open': (value: boolean) => {
            entry.visible = value
          },
          'onAfter:enter': () => {
            entry.onOpened?.()
          },
          'onAfter:leave': () => {
            settle(entry)
          },
        },
        slots,
      )
    }
  },
})
</script>
