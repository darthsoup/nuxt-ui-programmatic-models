<script setup lang="ts">
import { ModalContainer, useAlert, useConfirm, useModalStore } from 'nuxt-ui-modals'
import { ref } from 'vue'
import MyAlertDialog from './MyAlertDialog.vue'
import MyConfirmDialog from './MyConfirmDialog.vue'

const autoInject = new URLSearchParams(window.location.search).get('mode') === 'auto'

const { openCount, closeAll } = useModalStore()
const lastResult = ref('—')

// A reusable confirm handle (open/close/reopen the same instance).
const confirm = useConfirm({
  component: MyConfirmDialog,
  attrs: { title: 'Delete item?', description: 'This action cannot be undone.' },
})

async function askDelete(): Promise<void> {
  const ok = await confirm.open()
  lastResult.value = ok ? 'confirmed ✅' : 'cancelled ❌'
}

async function showAlert(): Promise<void> {
  const alert = useAlert({
    component: MyAlertDialog,
    attrs: { title: 'Saved!', description: 'Your changes were saved.' },
  })
  await alert.open()
  lastResult.value = 'alert closed'
}

function openTwo(): void {
  useAlert({
    component: MyAlertDialog,
    attrs: { title: 'First modal' },
  }).open()
  useAlert({
    component: MyAlertDialog,
    attrs: { title: 'Second modal' },
  }).open()
}
</script>

<template>
  <UApp>
    <div class="min-h-screen p-10 space-y-6">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold">
          nuxt-ui-modals playground
        </h1>
        <p class="text-sm text-(--ui-text-muted)">
          Mount mode:
          <strong>{{ autoInject ? 'plugin auto-inject' : 'manual <ModalContainer/>' }}</strong>
          — switch with <code>?mode=auto</code> / <code>?mode=manual</code>
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton data-test="confirm" @click="askDelete">
          Confirm delete
        </UButton>
        <UButton data-test="alert" color="neutral" @click="showAlert">
          Show alert
        </UButton>
        <UButton data-test="open-two" variant="soft" @click="openTwo">
          Open two
        </UButton>
        <UButton data-test="close-all" color="error" variant="outline" @click="closeAll()">
          Close all
        </UButton>
      </div>

      <div class="text-sm space-y-1">
        <p>Open modals: <strong data-test="open-count">{{ openCount }}</strong></p>
        <p>Last result: <strong data-test="last-result">{{ lastResult }}</strong></p>
      </div>

      <!-- Mode A: manual container (omitted when the plugin auto-injects one). -->
      <ModalContainer v-if="!autoInject" />
    </div>
  </UApp>
</template>
