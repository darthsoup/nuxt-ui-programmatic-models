<script setup lang="ts">
import { useModalContext } from 'nuxt-ui-modals'

defineProps<{ title?: string, description?: string }>()

// close(result) closes the modal AND resolves the open() Promise with `result`.
const { close } = useModalContext()
</script>

<template>
  <UCard data-test="confirm-dialog">
    <template #header>
      <h2 class="text-lg font-semibold">
        {{ title }}
      </h2>
    </template>

    <p class="text-sm text-(--ui-text-muted)">
      {{ description }}
    </p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" data-test="cancel" @click="close(false)">
          Cancel
        </UButton>
        <UButton color="error" data-test="ok" @click="close(true)">
          Delete
        </UButton>
      </div>
    </template>
  </UCard>
</template>
