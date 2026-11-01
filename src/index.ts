export { default as ModalContainer } from './components/ModalContainer.vue'
export { useAlert } from './composables/useAlert.js'
export { useConfirm } from './composables/useConfirm.js'
export { useModal } from './composables/useModal.js'
export { MODAL_CONTEXT_KEY, useModalContext } from './composables/useModalContext.js'
export { useModalSlot } from './composables/useModalSlot.js'

export { useModalStore, type UseModalStoreReturn } from './composables/useModalStore.js'
export { nuxtUiModals } from './plugin.js'

export type {
  ModalAttrs,
  ModalContext,
  ModalEntry,
  ModalLifecycleAttrs,
  ModalSlotDefinition,
  ModalSlotName,
  ModalSlotRender,
  ModalSlots,
  NuxtUiModalsOptions,
  UModalProps,
  UseModalOptions,
  UseModalReturn,
} from './types.js'
