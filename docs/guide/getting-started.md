# Getting Started

`nuxt-ui-modals` gives [Nuxt UI v4](https://ui.nuxt.com)'s
[`<UModal>`](https://ui.nuxt.com/components/modal) a programmatic API: open a modal from anywhere and
`await` the result.

```ts
const confirm = useConfirm({ component: ConfirmDialog })
if (await confirm.open()) {
  // user confirmed
}
```

## Requirements

This library renders Nuxt UI's `<UModal>`, so your app must already have **@nuxt/ui v4** set up
(its Vite plugin and Vue plugin). In a plain Vue 3 + Vite app:

```ts
import ui from '@nuxt/ui/vite'
// vite.config.ts
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    ui()
  ]
})
```

```ts
import ui from '@nuxt/ui/vue-plugin'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css' // @import "tailwindcss"; @import "@nuxt/ui";

createApp(App).use(ui).mount('#app')
```

::: tip Why this matters
`<UModal>` can't be imported and bundled standalone — it depends on virtual modules only the
`@nuxt/ui` Vite plugin resolves. This library resolves `UModal` at **runtime** via
`resolveComponent('UModal')`, which works because `app.use(ui)` registers Nuxt UI's components
globally. You can also supply it explicitly via the plugin's `modalComponent` option.
:::

## Install

```bash
pnpm add nuxt-ui-modals
# peers (you almost certainly have these already):
pnpm add @nuxt/ui vue
```

## Setup

Mount `<ModalContainer />` once. Pick **one** mode.

### Mode A — Manual (recommended)

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ModalContainer } from 'nuxt-ui-modals'
</script>

<template>
  <UApp>
    <RouterView />
    <ModalContainer />
  </UApp>
</template>
```

### Mode B — Plugin auto-inject

```ts
// main.ts
import { nuxtUiModals } from 'nuxt-ui-modals'

createApp(App).use(ui).use(nuxtUiModals).mount('#app')
```

Pass `{ container: false }` to skip auto-inject, or `{ modalComponent: UModal }` to supply the
component explicitly. For SSR/Nuxt, prefer Mode A with `{ container: false }`.

## Basic usage

Open a confirmation and read the result. Inside the modal component, call `close(result)` from
`useModalContext()`:

```vue
<!-- ConfirmDialog.vue -->
<script setup lang="ts">
import { useModalContext } from 'nuxt-ui-modals'

defineProps<{ title?: string, description?: string }>()
const { close } = useModalContext()
</script>

<template>
  <UCard>
    <template #header>
      {{ title }}
    </template>
    <p>{{ description }}</p>
    <template #footer>
      <UButton variant="ghost" @click="close(false)">
        Cancel
      </UButton>
      <UButton color="error" @click="close(true)">
        Confirm
      </UButton>
    </template>
  </UCard>
</template>
```

```ts
import { useConfirm } from 'nuxt-ui-modals'
import ConfirmDialog from './ConfirmDialog.vue'

const confirm = useConfirm({
  component: ConfirmDialog,
  attrs: { title: 'Delete item?', description: 'This cannot be undone.' },
})

if (await confirm.open()) {
  // confirmed
}
```

- `attrs` are bound to **your component** and typed from it.
- `modalProps` configures the **`<UModal>`** wrapper (`title`, `dismissible`, `fullscreen`, `ui`, …).
- `onOpened` / `onClosed` (in `attrs`) map to `<UModal>`'s `after:enter` / `after:leave`.

## Closing modals on navigation

Navigation integration is yours — no router is bundled. Wire `closeAll()` wherever routes change:

```ts
// Vue Router
import { useModalStore } from 'nuxt-ui-modals'

router.beforeEach(() => {
  useModalStore().closeAll()
})
```

```ts
// Inertia.js
import { router } from '@inertiajs/vue3'
import { useModalStore } from 'nuxt-ui-modals'

router.on('navigate', () => {
  useModalStore().closeAll()
})
```

```ts
// Vanilla / history API
window.addEventListener('popstate', () => {
  useModalStore().closeAll()
})
```

Next: the full [API Reference](/guide/api).
