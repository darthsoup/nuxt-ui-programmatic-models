<script setup lang="ts">
import { useModalContext } from 'nuxt-ui-modals'

defineProps<{ title?: string, description?: string }>()

const { close } = useModalContext()
</script>

<template>
  <UCard data-test="alert-dialog">
    <template #header>
      <h2 class="text-lg font-semibold">
        {{ title }}
      </h2>
    </template>

    <p class="text-sm text-(--ui-text-muted)">
      {{ description ?? 'Done.' }}
    </p>

    <template #footer>
      <div class="flex justify-end">
        <UButton data-test="alert-ok" @click="close()">
          OK
        </UButton>
      </div>
    </template>
  </UCard>
</template>
