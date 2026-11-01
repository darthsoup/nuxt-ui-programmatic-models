# nuxt-ui-modals

A tiny, fully-typed **programmatic modal API** for [Nuxt UI v4](https://ui.nuxt.com)'s
[`<UModal>`](https://ui.nuxt.com/components/modal). Open modals from anywhere with a Promise that
resolves with the user's decision — no template plumbing, no trigger components.

```ts
const confirm = useConfirm({ component: ConfirmDialog })
if (await confirm.open()) {
  // user confirmed
}
```

Inspired by `vue-final-modal`, but intentionally simpler:

- **One flat `reactive()` store** — no Pinia, no `provide/inject` chains for state.
- **`open()` resolves _after_ the close animation**, with the value the dialog returns — exactly
  what you want when awaiting a user decision.
- **`close()` vs `destroy()`** is an explicit, clean distinction (animated vs immediate).
- **Router-agnostic** — `closeAll()` is wired to *your* navigation system in one line.
- **No bundled `@nuxt/ui`, no bundled router.** `@nuxt/ui` and `vue` are peer dependencies.

---

## Requirements

This library renders Nuxt UI's `<UModal>` — your app must already have **@nuxt/ui v4** set up
(including its Vite plugin and Vue plugin). In a plain Vue 3 + Vite app that means:

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

> **Why this matters:** `@nuxt/ui`'s `<UModal>` cannot be imported and bundled standalone — it
> depends on virtual modules that only the `@nuxt/ui` Vite plugin resolves. This library therefore
> resolves `UModal` at **runtime** via `resolveComponent('UModal')`, which works because
> `app.use(ui)` registers Nuxt UI's components globally. You can also pass a `UModal` explicitly
> (see below).

## Install

```bash
pnpm add nuxt-ui-modals
# peers (you almost certainly have these already):
pnpm add @nuxt/ui vue
```

## Setup

You need `<ModalContainer />` mounted once. Pick **one** of the two modes.

### Mode A — Manual (recommended)

Place it once in your root component, inside `<UApp>`:

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

This is the most robust option (full @nuxt/ui context, SSR-safe).

### Mode B — Plugin auto-inject

Register the plugin and it appends a detached `<ModalContainer />` to `document.body`:

```ts
// main.ts
import ui from '@nuxt/ui/vue-plugin'
import { nuxtUiModals } from 'nuxt-ui-modals'

createApp(App)
  .use(ui)
  .use(nuxtUiModals) // auto-injects the container (client-only, SSR-guarded)
  .mount('#app')
```

Pass `{ container: false }` to skip auto-inject (e.g. when you place `<ModalContainer />`
yourself), or `{ modalComponent: UModal }` to supply the component explicitly.

> For SSR/Nuxt, prefer **Mode A** with `app.use(nuxtUiModals, { container: false })`.

## Usage

### `useModal(options)`

```ts
import { useModal } from 'nuxt-ui-modals'
import MyDialog from './MyDialog.vue'

const modal = useModal({
  component: MyDialog, // rendered inside <UModal>
  attrs: { // props/events bound to MyDialog (fully typed)
    userId: 42,
    onOpened: () => {}, // fires after the OPEN animation completes
    onClosed: () => {}, // fires after the CLOSE animation completes
  },
  modalProps: { // props for the <UModal> wrapper itself
    title: 'Edit user',
    fullscreen: false,
    dismissible: true,
  },
  slot: 'content', // which UModal slot to render into (default: 'content')
  defaultOpen: false,
})

const result = await modal.open() // resolves AFTER close, with the returned value
await modal.close() // animate out, resolves when the animation ends
modal.destroy() // remove instantly, no animation
modal.patchOptions({
  attrs: { userId: 7 }
}) // reactively merge
modal.options // readonly, reactive view of the current options
```

- `attrs` are bound to **your component** and are typed from it (no `any`). `onOpened`/`onClosed`
  are intercepted by the library and never reach your component.
- `modalProps` are the **`<UModal>`** props (`title`, `description`, `overlay`, `transition`,
  `fullscreen`, `dismissible`, `ui`, …).

### Returning a value (`close(result)`)

Inside the modal component, use `useModalContext()` to close and resolve `open()`:

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
const confirm = useConfirm({
  component: ConfirmDialog,
  attrs: { title: 'Delete item?', description: 'This cannot be undone.' },
})

if (await confirm.open()) {
  // confirmed
}
```

### `useConfirm()` / `useAlert()`

Typed thin aliases over `useModal()` — identical behaviour, clearer intent:

```ts
const alert = useAlert({
  component: AlertDialog,
  attrs: { title: 'Done!', description: 'Your changes were saved.' },
})
await alert.open()
```

### `useModalSlot(options)`

Pass a component (with typed props) into one of `<UModal>`'s named slots:

```ts
import { useModalSlot } from 'nuxt-ui-modals'

useModal({
  component: MyDialog,
  slots: {
    footer: useModalSlot({
      component: MyFooter,
      attrs: { sticky: true }
    }),
  },
})
```

The slot component also receives the slot props `<UModal>` exposes (e.g. `{ close }`).

### `useModalStore()`

Inspect the stack and control everything at once:

```ts
import { useModalStore } from 'nuxt-ui-modals'

const { stack, hasOpenModals, openCount, closeAll, destroyAll } = useModalStore()

// stack / hasOpenModals / openCount are reactive (ComputedRef)
await closeAll() // close every modal in parallel; resolves when the last finishes
destroyAll() // remove every modal instantly
```

## Closing modals on navigation

Navigation integration is **100% yours** — this library bundles no router. Wire `closeAll()`
wherever your app changes route:

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
import { useModalStore } from 'nuxt-ui-modals'

window.addEventListener('popstate', () => {
  useModalStore().closeAll()
})
```

## API reference

| Export | Description |
| --- | --- |
| `useModal(options)` | Create and control a modal. Returns `{ open, close, destroy, patchOptions, options }`. |
| `useConfirm(options)` | Typed alias of `useModal` for confirmations. |
| `useAlert(options)` | Typed alias of `useModal` for alerts. |
| `useModalSlot(options)` | Package a component + props for a `<UModal>` slot. |
| `useModalContext()` | Inside a modal: `{ id, close, destroy, patchOptions }`. |
| `useModalStore()` | Stack inspection + `closeAll` / `destroyAll`. |
| `ModalContainer` | The renderless container component. |
| `nuxtUiModals` | The Vue plugin (`app.use(nuxtUiModals, options)`). |

### Behaviour notes

- `open()` resolves **after** the close transition (mapped to `<UModal>`'s `after:leave`), with the
  value passed to `close(result)`. `onOpened` maps to `after:enter`.
- `close()` resolves when the close transition finishes; `destroy()` is synchronous and skips it.
- `closeAll()` is `Promise.all(...)` over the individual `close()` calls.
- `persistent` is out of scope for v1 — use `destroy()` for forced teardown.

## License

MIT
