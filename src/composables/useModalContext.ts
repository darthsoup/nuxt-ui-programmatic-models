import type { InjectionKey } from 'vue'
import type { ModalContext } from '../types.js'
import { inject } from 'vue'

/** Injection key for the per-modal context provided by `<ModalContainer/>`. */
export const MODAL_CONTEXT_KEY: InjectionKey<ModalContext> = Symbol('nuxt-ui-modal-context')

/**
 * Access the surrounding modal's context from inside a component rendered by
 * `useModal()`. Use `close(result)` to close the modal and resolve its
 * `open()` Promise with `result`.
 *
 * @throws if called outside a modal rendered by this library.
 */
export function useModalContext(): ModalContext {
  const context = inject(MODAL_CONTEXT_KEY, null)
  if (!context) {
    throw new Error(
      '[nuxt-ui-modals] useModalContext() must be called from a component rendered by useModal().',
    )
  }
  return context
}
