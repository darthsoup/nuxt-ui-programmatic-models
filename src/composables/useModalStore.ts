import type { ComputedRef } from 'vue'
import type { ModalEntry } from '../types.js'
import { closeById, destroyById, hasOpenModals, openCount, publicStack, store } from '../store.js'

export interface UseModalStoreReturn {
  /** Reactive, readonly view of the modal stack. */
  stack: ComputedRef<readonly ModalEntry[]>
  /** Whether any modal is currently visible. */
  hasOpenModals: ComputedRef<boolean>
  /** Number of currently-visible modals. */
  openCount: ComputedRef<number>
  /**
   * Gracefully close every modal in parallel (respecting close animations).
   * Resolves once the last modal has finished its close transition.
   */
  closeAll: () => Promise<void>
  /** Instantly destroy every modal (no animations). */
  destroyAll: () => void
}

/**
 * Globally-accessible view of the modal stack plus bulk controls. Wire
 * `closeAll()` to your navigation system (Vue Router, Inertia.js, popstate...).
 */
export function useModalStore(): UseModalStoreReturn {
  function closeAll(): Promise<void> {
    return Promise.all(store.stack.map(entry => closeById(entry.id))).then(() => undefined)
  }

  function destroyAll(): void {
    store.stack.slice().forEach(entry => destroyById(entry.id))
  }

  return {
    stack: publicStack,
    hasOpenModals,
    openCount,
    closeAll,
    destroyAll,
  }
}
