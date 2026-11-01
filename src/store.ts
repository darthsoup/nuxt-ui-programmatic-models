import type { Component, ComputedRef } from 'vue'
import type { InternalModalEntry, ModalEntry, NuxtUiModalsOptions } from './types.js'
import { computed, reactive } from 'vue'

/**
 * Module-level reactive store. A single flat stack shared by every composable
 * call and both mount modes (manual `<ModalContainer/>` and the auto-injected
 * detached app). Wrapped in an object so the array reference stays stable.
 */
export const store: { stack: InternalModalEntry[] } = reactive<{ stack: InternalModalEntry[] }>({
  stack: [],
})

/**
 * Promise machinery lives OFF the reactive entry (in this plain Map keyed by
 * entry id) so that Promise objects are never wrapped in a reactive proxy.
 */
interface PromiseState {
  openPromise?: Promise<unknown>
  openResolve?: (value: unknown) => void
  closePromise?: Promise<void>
  closeResolve?: () => void
  result?: unknown
}

const promiseStates = new Map<symbol, PromiseState>()

function getOrCreatePromiseState(id: symbol): PromiseState {
  let state = promiseStates.get(id)
  if (!state) {
    state = {}
    promiseStates.set(id, state)
  }
  return state
}

let configuredModalComponent: Component | undefined
let closeTimeoutMs: number | undefined

export function configure(options: NuxtUiModalsOptions): void {
  if (options.modalComponent)
    configuredModalComponent = options.modalComponent
  if (options.closeTimeoutMs != null)
    closeTimeoutMs = options.closeTimeoutMs
}

export function getModalComponent(): Component | undefined {
  return configuredModalComponent
}

export function findEntry(id: symbol): InternalModalEntry | undefined {
  return store.stack.find(entry => entry.id === id)
}

export function pushEntry(entry: InternalModalEntry): void {
  if (!store.stack.includes(entry))
    store.stack.push(entry)
}

export function removeEntry(id: symbol): void {
  const index = store.stack.findIndex(entry => entry.id === id)
  if (index !== -1)
    store.stack.splice(index, 1)
}

/** Begin tracking an `open()` Promise for `id`. Returns the new Promise. */
export function beginOpen(id: symbol): Promise<unknown> {
  const state = getOrCreatePromiseState(id)
  const promise = new Promise<unknown>((resolve) => {
    state.openResolve = resolve
  })
  state.openPromise = promise
  return promise
}

export function getOpenPromise(id: symbol): Promise<unknown> | undefined {
  return promiseStates.get(id)?.openPromise
}

/** Store the value `open()` will resolve with (set by `close(result)`). */
export function setResult(id: symbol, result: unknown): void {
  getOrCreatePromiseState(id).result = result
}

export function clearPromiseState(id: symbol): void {
  promiseStates.delete(id)
}

/**
 * The single resolution point. Idempotent. Resolves any pending `close()` and
 * `open()` Promises, fires `onClosed`, and removes the entry from the stack.
 * Called from `<UModal>`'s `after:leave` (animated close) and synchronously
 * from `destroy()`.
 */
export function settle(entry: InternalModalEntry): void {
  if (entry.settled)
    return
  entry.settled = true
  if (entry.timeoutId !== undefined) {
    clearTimeout(entry.timeoutId)
    entry.timeoutId = undefined
  }
  entry.onClosed?.()
  resolvePending(entry)
  promiseStates.delete(entry.id)
  removeEntry(entry.id)
}

/**
 * Resolve pending Promises without removing the entry. The safety timeout
 * uses this without cutting short an animation; `settle()` handles removal.
 */
function resolvePending(entry: InternalModalEntry): void {
  const state = promiseStates.get(entry.id)
  if (!state)
    return
  state.closeResolve?.()
  state.openResolve?.(state.result)
}

/** Graceful close: drives the close animation; resolves on `after:leave`. */
export function closeById(id: symbol): Promise<void> {
  const entry = findEntry(id)
  if (!entry || !entry.visible)
    return Promise.resolve()
  const state = getOrCreatePromiseState(id)
  if (state.closePromise)
    return state.closePromise
  const closePromise = new Promise<void>((resolve) => {
    state.closeResolve = resolve
  })
  state.closePromise = closePromise
  entry.visible = false
  if (closeTimeoutMs != null) {
    entry.timeoutId = setTimeout(resolvePending, closeTimeoutMs, entry)
  }
  return closePromise
}

/** Immediate teardown with no animation. Settles any pending Promises. */
export function destroyById(id: symbol): void {
  const entry = findEntry(id)
  if (!entry)
    return
  settle(entry)
}

function toPublicEntry(entry: InternalModalEntry): ModalEntry {
  return {
    id: entry.id,
    component: entry.component,
    attrs: entry.attrs,
    modalProps: entry.modalProps,
    slots: entry.slots,
    slot: entry.slot,
    visible: entry.visible,
  }
}

/** Reactive, public-shaped view of the stack (no internal resolvers/timers). */
export const publicStack: ComputedRef<readonly ModalEntry[]> = computed(() =>
  store.stack.map(toPublicEntry),
)

export const hasOpenModals: ComputedRef<boolean> = computed(() =>
  store.stack.some(entry => entry.visible),
)

export const openCount: ComputedRef<number> = computed(
  () => store.stack.filter(entry => entry.visible).length,
)
