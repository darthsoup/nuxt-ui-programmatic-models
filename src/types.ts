import type { Component } from 'vue'
import type { ComponentProps } from 'vue-component-type-helpers'

/**
 * Lifecycle callbacks invoked by the library from the underlying `<UModal>`'s
 * `after:enter` (opened) and `after:leave` (closed) events.
 */
export interface ModalLifecycleAttrs {
  /** Called once the open transition has finished. */
  onOpened?: () => void
  /** Called once the close transition has finished (and the modal is removed). */
  onClosed?: () => void
}

/**
 * Props/events forwarded to the user's modal component, plus the optional
 * lifecycle hooks above. `onOpened`/`onClosed` are intercepted by the library
 * and never reach the component.
 */
export type ModalAttrs<T extends Component> = ComponentProps<T> & ModalLifecycleAttrs

/**
 * Curated subset of Nuxt UI `<UModal>` props (mirrors `@nuxt/ui` `Modal.vue`
 * `defineProps`, minus `open`/`defaultOpen` which the library controls).
 *
 * Defined explicitly rather than derived from `ComponentProps<typeof UModal>`
 * so the public surface never inherits UModal's `class: any`.
 */
export interface UModalProps {
  title?: string
  description?: string
  content?: Record<string, unknown>
  overlay?: boolean
  scrollable?: boolean
  transition?: boolean
  fullscreen?: boolean
  portal?: boolean | string
  close?: boolean | Record<string, unknown>
  closeIcon?: string
  dismissible?: boolean
  modal?: boolean
  ui?: Record<string, unknown>
  class?: string | string[] | Record<string, boolean>
}

/** A component packaged with its props for rendering into a `<UModal>` slot. */
export interface ModalSlotDefinition<C extends Component = Component> {
  component: C
  attrs?: ComponentProps<C>
}

/**
 * Render-function form of a slot. Receives the slot props the underlying
 * `<UModal>` exposes for that slot (e.g. `{ close }`).
 */
export type ModalSlotRender = (slotProps: Record<string, unknown>) => unknown

/** Map of `<UModal>` slot name -> content (a packaged component or a render fn). */
export type ModalSlots = Record<string, ModalSlotDefinition | ModalSlotRender | undefined>

/** Which `<UModal>` slot the main `component` renders into. */
export type ModalSlotName = 'content' | 'body' | (string & {})

export interface UseModalOptions<T extends Component> {
  /** The component rendered inside the modal. */
  component: T
  /** Props/events bound to `component`, plus `onOpened`/`onClosed` lifecycle hooks. */
  attrs?: ModalAttrs<T>
  /** Props for the wrapping `<UModal>` itself (title, dismissible, fullscreen, ui, ...). */
  modalProps?: UModalProps
  /** Extra `<UModal>` named slots (header/footer/title/...). */
  slots?: ModalSlots
  /** Which `<UModal>` slot `component` renders into. @defaultValue 'content' */
  slot?: ModalSlotName
  /** Open immediately when the modal is created. @defaultValue false */
  defaultOpen?: boolean
}

export interface UseModalReturn {
  /**
   * Open the modal. Resolves **after** the close transition completes, with the
   * value passed to `close(result)` from inside the modal (or `undefined`).
   */
  open: (patchAttrs?: Record<string, unknown>) => Promise<unknown>
  /** Close gracefully. Resolves after the close transition completes. */
  close: () => Promise<void>
  /** Remove immediately with no animation. Settles any pending `open()`/`close()` Promise. */
  destroy: () => void
  /** Reactively merge `attrs`/`slots`/`modalProps`/`component`/`slot` into the live entry. */
  patchOptions: (patch: Partial<UseModalOptions<Component>>) => void
  /** Readonly, reactive view of the current options. */
  readonly options: Readonly<UseModalOptions<Component>>
}

/** Public, consumer-facing entry shape (no internal resolvers/timers). */
export interface ModalEntry {
  id: symbol
  component: Component
  attrs: Record<string, unknown>
  modalProps?: UModalProps
  slots?: ModalSlots
  slot: ModalSlotName
  visible: boolean
}

/** Internal entry stored in the reactive stack. Adds render-only runtime fields. */
export interface InternalModalEntry extends ModalEntry {
  /** Regenerated on each `open()` so Vue mounts a fresh `<UModal>` vnode. */
  key: symbol
  /** True once the entry has been resolved + removed (idempotency guard). */
  settled: boolean
  onOpened?: () => void
  onClosed?: () => void
  defaultOpen?: boolean
  timeoutId?: ReturnType<typeof setTimeout>
}

/** Provided to child modal components so they can close with a result. */
export interface ModalContext {
  id: symbol
  /** Close the modal; `result` becomes the resolved value of `open()`. */
  close: (result?: unknown) => void
  /** Destroy the modal immediately (no animation). */
  destroy: () => void
  /** Patch the live modal options. */
  patchOptions: (patch: Partial<UseModalOptions<Component>>) => void
}

export interface NuxtUiModalsOptions {
  /** A `UModal` component to use instead of `resolveComponent('UModal')`. */
  modalComponent?: Component
  /** Auto-inject a detached `<ModalContainer/>` on `app.use()`. @defaultValue true */
  container?: boolean
  /**
   * Optional safety timeout (ms). If set and the `after:leave` event never
   * arrives, pending close/open Promises are resolved after this delay (the
   * modal is NOT unmounted). @defaultValue off
   */
  closeTimeoutMs?: number
}
