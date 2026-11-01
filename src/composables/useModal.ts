import type { Component } from 'vue'
import type {
  InternalModalEntry,
  ModalLifecycleAttrs,
  UseModalOptions,
  UseModalReturn,
} from '../types.js'
import { reactive, readonly } from 'vue'
import {
  beginOpen,
  clearPromiseState,
  closeById,
  destroyById,
  findEntry,
  getOpenPromise,
  pushEntry,
} from '../store.js'

interface SplitAttrs extends ModalLifecycleAttrs {
  componentAttrs: Record<string, unknown>
}

/** Pull the library-only lifecycle callbacks out of an attrs object. */
function splitAttrs(attrs: Record<string, unknown> | undefined): SplitAttrs {
  const { onOpened, onClosed, ...componentAttrs } = { ...attrs } as Record<string, unknown>
    & ModalLifecycleAttrs
  return { componentAttrs, onOpened, onClosed }
}

/**
 * Create a programmatically-controlled modal backed by a single reactive entry.
 *
 * `open()` resolves AFTER the close transition (with the value passed to the
 * injected `close(result)`), `close()` resolves once the close transition
 * finishes, and `destroy()` removes the modal immediately.
 */
export function useModal<T extends Component>(options: UseModalOptions<T>): UseModalReturn {
  const id = Symbol('nuxt-ui-modal')
  const initial = splitAttrs(options.attrs as Record<string, unknown> | undefined)

  // The reactive entry is the single source of truth for both rendering and
  // the readonly `options` view. Promise machinery is kept in the store's Map.
  const entry = reactive<InternalModalEntry>({
    id,
    key: Symbol('modal-instance'),
    component: options.component,
    attrs: initial.componentAttrs,
    modalProps: options.modalProps,
    slots: options.slots,
    slot: options.slot ?? 'content',
    visible: false,
    settled: false,
    onOpened: initial.onOpened,
    onClosed: initial.onClosed,
    defaultOpen: options.defaultOpen ?? false,
  }) as InternalModalEntry

  function applyAttrs(patch: Record<string, unknown>): void {
    const split = splitAttrs(patch)
    Object.assign(entry.attrs, split.componentAttrs)
    if (split.onOpened)
      entry.onOpened = split.onOpened
    if (split.onClosed)
      entry.onClosed = split.onClosed
  }

  function open(patchAttrs?: Record<string, unknown>): Promise<unknown> {
    if (patchAttrs)
      applyAttrs(patchAttrs)

    // Idempotent: while already open and unsettled, return the pending Promise
    // instead of overwriting it.
    if (entry.visible && !entry.settled) {
      const existing = getOpenPromise(id)
      if (existing)
        return existing
    }

    // Fresh open (covers reopen-after-close reuse of the same handle).
    entry.settled = false
    entry.key = Symbol('modal-instance')
    if (entry.timeoutId !== undefined) {
      clearTimeout(entry.timeoutId)
      entry.timeoutId = undefined
    }
    clearPromiseState(id)
    const promise = beginOpen(id)
    pushEntry(entry)
    entry.visible = true
    return promise
  }

  function close(): Promise<void> {
    return closeById(id)
  }

  function destroy(): void {
    destroyById(id)
  }

  function patchOptions(patch: Partial<UseModalOptions<Component>>): void {
    const live = findEntry(id) ?? entry
    if (patch.component)
      live.component = patch.component
    if (patch.attrs)
      applyAttrs(patch.attrs as Record<string, unknown>)
    if (patch.modalProps) {
      live.modalProps = {
        ...live.modalProps,
        ...patch.modalProps,
      }
    }
    if (patch.slots) {
      live.slots = {
        ...live.slots,
        ...patch.slots,
      }
    }
    if (patch.slot)
      live.slot = patch.slot
  }

  if (options.defaultOpen)
    open()

  return {
    open,
    close,
    destroy,
    patchOptions,
    options: readonly(entry) as unknown as Readonly<UseModalOptions<Component>>,
  }
}
