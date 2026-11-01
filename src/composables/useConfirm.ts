import type { Component } from 'vue'
import type { UseModalOptions, UseModalReturn } from '../types.js'
import { useModal } from './useModal.js'

/**
 * Typed convenience alias over {@link useModal} for confirmation dialogs.
 * No extra logic — `open()` resolves with the value the dialog passes to
 * `close(result)` (e.g. `true`/`false`).
 */
export function useConfirm<T extends Component>(options: UseModalOptions<T>): UseModalReturn {
  return useModal(options)
}
