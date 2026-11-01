# API Reference

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

## `useModal(options)`

```ts
const modal = useModal({
  component: MyDialog, // rendered inside <UModal>
  attrs: { // props/events bound to MyDialog (fully typed)
    userId: 42,
    onOpened: () => {}, // fires after the OPEN animation completes
    onClosed: () => {}, // fires after the CLOSE animation completes
  },
  modalProps: { // props for the <UModal> wrapper itself
    title: 'Edit user',
    dismissible: true,
  },
  slot: 'content', // which UModal slot to render into (default: 'content')
  defaultOpen: false,
})
```

Returns:

| Method | Description |
| --- | --- |
| `open(patchAttrs?)` | Open the modal. Resolves **after** the close transition, with the value passed to `close(result)`. |
| `close()` | Close gracefully. Resolves when the close transition finishes. |
| `destroy()` | Remove immediately (no animation). Settles any pending `open()`/`close()`. |
| `patchOptions(patch)` | Reactively merge `attrs`/`slots`/`modalProps`/`component`/`slot` into the live entry. |
| `options` | Readonly, reactive view of the current options. |

## `useModalContext()`

Call inside a modal component to close it and resolve `open()` with a value:

```ts
const { close } = useModalContext()
close(true) // open() resolves with `true`
```

## `useModalStore()`

```ts
const { stack, hasOpenModals, openCount, closeAll, destroyAll } = useModalStore()
```

- `stack` / `hasOpenModals` / `openCount` are reactive (`ComputedRef`).
- `closeAll()` closes every modal in parallel and resolves when the last finishes (`Promise.all` over `close()`).
- `destroyAll()` removes every modal instantly.

## `useModalSlot(options)`

```ts
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

## Behaviour notes

- `open()` resolves **after** the close transition (mapped to `<UModal>`'s `after:leave`); `onOpened` maps to `after:enter`.
- `close()` resolves when the close transition finishes; `destroy()` is synchronous and skips it.
- `closeAll()` is `Promise.all(...)` over the individual `close()` calls.
- `persistent` is out of scope for v1 — use `destroy()` for forced teardown.
