<script setup lang="ts">
import type { Component } from 'vue'
import { ModalContainer } from 'nuxt-ui-modals'
import DefaultTheme from 'vitepress/theme'
import { onMounted, shallowRef } from 'vue'

const { Layout } = DefaultTheme

// Supply <UModal> explicitly (the library's documented consumer path) instead of
// relying on global registration. Imported client-only so `vitepress build`
// never SSR-evaluates @nuxt/ui's Modal.vue (which needs browser/app context).
const UModal = shallowRef<Component | null>(null)
onMounted(async () => {
  UModal.value = (await import('@nuxt/ui/components/Modal.vue')).default
})
</script>

<template>
  <Layout>
    <!-- Mount the modal container once, globally. Client-only: UModal teleports. -->
    <template #layout-bottom>
      <ClientOnly>
        <UApp>
          <ModalContainer v-if="UModal" :modal-component="UModal" />
        </UApp>
      </ClientOnly>
    </template>
  </Layout>
</template>
