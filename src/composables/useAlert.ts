import type { Component } from 'vue'
import type { UseModalOptions, UseModalReturn } from '../types.js'
import { useModal } from './useModal.js'

/**
 * Typed convenience alias over {@link useModal} for simple alert dialogs.
 * No extra logic — exists for intent and readability.
 */
export function useAlert<T extends Component>(options: UseModalOptions<T>): UseModalReturn {
  return useModal(options)
}
