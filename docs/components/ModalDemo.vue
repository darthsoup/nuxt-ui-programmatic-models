<script setup lang="ts">
import { useAlert, useConfirm, useModalStore } from 'nuxt-ui-modals'
import { ref } from 'vue'
import DemoDialog from './DemoDialog.vue'

const lastResult = ref('—')
const { openCount } = useModalStore()

const confirm = useConfirm({
  component: DemoDialog,
  attrs: {
    title: 'Delete item?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    confirmColor: 'error',
  },
})

async function askConfirm() {
  lastResult.value = (await confirm.open())
    ? 'confirmed ✅'
    : 'cancelled ❌'
}

const alert = useAlert({
  component: DemoDialog,
  attrs: { title: 'Saved!', description: 'Your changes were saved.', confirmLabel: 'OK' },
})

async function showAlert() {
  await alert.open()
  lastResult.value = 'alert closed'
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 my-4">
    <UButton data-test="demo-open-confirm" @click="askConfirm">
      Confirm dialog
    </UButton>
    <UButton color="neutral" variant="subtle" data-test="demo-open-alert" @click="showAlert">
      Alert dialog
    </UButton>
    <span class="text-sm text-muted">
      open: <strong data-test="demo-open-count">{{ openCount }}</strong>
      · last: <strong data-test="demo-last-result">{{ lastResult }}</strong>
    </span>
  </div>
</template>
