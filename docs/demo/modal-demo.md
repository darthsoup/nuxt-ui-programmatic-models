# Interactive Demo

A real `<UModal>` opened **programmatically** with `useConfirm()` / `useAlert()` — no trigger
component, no template plumbing. Click a button: `open()` resolves after the close animation with the
value the dialog passes to `close(result)`.

<script setup>
import ModalDemo from '../components/ModalDemo.vue'
</script>

<ClientOnly>
  <ModalDemo />
</ClientOnly>

## How it works

The demo component calls the composables and renders nothing but trigger buttons — the modal itself
is rendered by the global `<ModalContainer />` (mounted once in the site theme):

<<< ../components/ModalDemo.vue

The component shown **inside** the modal closes it (and resolves `open()`) via `useModalContext()`:

<<< ../components/DemoDialog.vue
