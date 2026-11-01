import type { Component } from 'vue'
import type { ModalSlotDefinition } from '../types.js'

/**
 * Typed helper for passing a component (with props/events) into a modal slot
 * without losing inference. The returned definition is rendered by
 * `<ModalContainer/>` as `h(component, { ...attrs, ...slotProps })`, so the
 * component also receives the slot props the underlying `<UModal>` exposes
 * (e.g. `{ close }`).
 */
export function useModalSlot<C extends Component>(
  options: ModalSlotDefinition<C>,
): ModalSlotDefinition<C> {
  return { component: options.component, attrs: options.attrs }
}
