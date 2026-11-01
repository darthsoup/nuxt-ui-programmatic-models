<script setup lang="ts">
import { useModalContext } from 'nuxt-ui-modals'

defineProps<{
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: string
}>()

// close(result) closes the modal AND resolves the open() Promise with `result`.
const { close } = useModalContext()
</script>

<template>
  <UCard data-test="demo-dialog">
    <template #header>
      <h3 class="text-base font-semibold">
        {{ title }}
      </h3>
    </template>

    <p class="text-sm text-muted">
      {{ description }}
    </p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          v-if="cancelLabel"
          color="neutral"
          variant="ghost"
          data-test="demo-cancel"
          @click="close(false)"
        >
          {{ cancelLabel }}
        </UButton>
        <UButton
          :color="(confirmColor as any) ?? 'primary'"
          data-test="demo-confirm"
          @click="close(cancelLabel ? true : undefined)"
        >
          {{ confirmLabel ?? 'OK' }}
        </UButton>
      </div>
    </template>
  </UCard>
</template>
