import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { useModal } from '../src/composables/useModal'
import { useModalStore } from '../src/composables/useModalStore'
import { findEntry, setResult, settle, store } from '../src/store'

// A no-op stub stands in for a real modal component. These tests exercise the
// store/Promise engine directly; the `after:leave` event that `<ModalContainer/>`
// would emit is simulated by calling `settle(entry)`.
const Stub = defineComponent({
  name: 'Stub',
  render: () => null,
})

beforeEach(() => {
  useModalStore().destroyAll()
})

describe('useModal', () => {
  it('open() pushes a visible entry; settle() resolves close() and open()', async () => {
    const modal = useModal({ component: Stub })
    const openPromise = modal.open()

    expect(store.stack).toHaveLength(1)
    const entry = store.stack[0]!
    expect(entry.visible).toBe(true)

    const closePromise = modal.close()
    expect(entry.visible).toBe(false)

    settle(entry) // simulate UModal @after:leave
    await expect(closePromise).resolves.toBeUndefined()
    await expect(openPromise).resolves.toBeUndefined()
    expect(store.stack).toHaveLength(0)
  })

  it('open() resolves with the value passed to close(result)', async () => {
    const modal = useModal({ component: Stub })
    const openPromise = modal.open()
    const entry = store.stack[0]!

    setResult(entry.id, 'confirmed') // what useModalContext().close('confirmed') does
    modal.close()
    settle(entry)

    await expect(openPromise).resolves.toBe('confirmed')
  })

  it('open() is idempotent while already open (returns the same Promise)', () => {
    const modal = useModal({ component: Stub })
    const first = modal.open()
    const second = modal.open()
    expect(first).toBe(second)
    expect(store.stack).toHaveLength(1)
  })

  it('can be reopened after closing (handle reuse)', async () => {
    const modal = useModal({ component: Stub })

    const firstOpen = modal.open()
    const firstEntry = store.stack[0]!
    const firstKey = firstEntry.key
    modal.close()
    settle(firstEntry)
    await firstOpen
    expect(store.stack).toHaveLength(0)

    const secondOpen = modal.open()
    expect(store.stack).toHaveLength(1)
    const secondEntry = store.stack[0]!
    expect(secondEntry.visible).toBe(true)
    expect(secondEntry.key).not.toBe(firstKey) // fresh vnode key

    modal.destroy()
    await expect(secondOpen).resolves.toBeUndefined()
  })

  it('destroy() settles synchronously and removes the entry', async () => {
    const modal = useModal({ component: Stub })
    const openPromise = modal.open()
    expect(store.stack).toHaveLength(1)

    modal.destroy()
    expect(store.stack).toHaveLength(0)
    await expect(openPromise).resolves.toBeUndefined()
  })

  it('defaultOpen opens immediately', () => {
    useModal({ component: Stub, defaultOpen: true })
    expect(store.stack).toHaveLength(1)
    expect(store.stack[0]!.visible).toBe(true)
  })

  it('attrs onOpened/onClosed are stripped from the rendered attrs', () => {
    const onOpened = (): void => {}
    const onClosed = (): void => {}
    const modal = useModal({
      component: Stub,
      attrs: { onOpened, onClosed, foo: 'bar' } as never,
    })
    modal.open()
    const entry = store.stack[0]!
    expect(entry.attrs).toEqual({ foo: 'bar' })
    expect(entry.onOpened).toBe(onOpened)
    expect(entry.onClosed).toBe(onClosed)
  })

  it('onClosed fires exactly once via settle, even if called twice', () => {
    let calls = 0
    const modal = useModal({
      component: Stub,
      attrs: {
        onClosed: () => (calls += 1),
      } as never,
    })
    modal.open()
    const entry = store.stack[0]!
    settle(entry)
    settle(entry) // idempotent
    expect(calls).toBe(1)
  })

  it('runs onClosed before removing the entry and resolving close() then open()', async () => {
    const events: string[] = []
    const modal = useModal({
      component: Stub,
      attrs: {
        onClosed() {
          events.push('onClosed')
          expect(store.stack).toHaveLength(1)
          setResult(store.stack[0]!.id, 'closed')
        },
      },
    })
    const openPromise = modal.open().then((result) => {
      events.push('open')
      return result
    })
    const closePromise = modal.close().then(() => {
      events.push('close')
    })

    settle(store.stack[0]!)

    expect(events).toEqual(['onClosed'])
    expect(store.stack).toHaveLength(0)
    await closePromise
    await expect(openPromise).resolves.toBe('closed')
    expect(events).toEqual(['onClosed', 'close', 'open'])
  })

  it('keeps patched lifecycle hooks out of attrs and preserves them when omitted', () => {
    let closedCalls = 0
    const modal = useModal({ component: Stub })
    modal.patchOptions({
      attrs: {
        title: 'Patched',
        onClosed() {
          closedCalls += 1
        },
      },
    })
    modal.open({ description: 'Opened', onClosed: undefined })

    expect(modal.options.attrs).toEqual({ title: 'Patched', description: 'Opened' })
    modal.destroy()
    expect(closedCalls).toBe(1)
  })

  it('patchOptions reactively merges into the live entry', () => {
    const modal = useModal({
      component: Stub,
      attrs: { a: 1 } as never,
    })
    modal.open()
    modal.patchOptions({
      attrs: { b: 2 },
      modalProps: { title: 'Hi' },
    })
    const entry = findEntry(store.stack[0]!.id)!
    expect(entry.attrs).toEqual({ a: 1, b: 2 })
    expect(entry.modalProps).toEqual({ title: 'Hi' })
  })
})

describe('useModalStore', () => {
  it('tracks openCount / hasOpenModals', () => {
    const { openCount, hasOpenModals } = useModalStore()
    expect(hasOpenModals.value).toBe(false)
    useModal({ component: Stub }).open()
    useModal({ component: Stub }).open()
    expect(openCount.value).toBe(2)
    expect(hasOpenModals.value).toBe(true)
  })

  it('stack exposes the public shape (no internal resolvers/timers)', () => {
    useModal({ component: Stub }).open()
    const { stack } = useModalStore()
    const entry = stack.value[0]!
    expect(Object.keys(entry).sort()).toEqual(
      [
        'attrs',
        'component',
        'id',
        'modalProps',
        'slot',
        'slots',
        'visible',
      ].sort(),
    )
  })

  it('closeAll() closes every modal and resolves once all settle', async () => {
    useModal({ component: Stub }).open()
    useModal({ component: Stub }).open()

    const all = useModalStore().closeAll()
    // every entry should now be closing
    expect(store.stack.every(e => !e.visible)).toBe(true)
    // simulate each UModal finishing its leave transition
    store.stack.slice().forEach(e => settle(e))

    await expect(all).resolves.toBeUndefined()
    expect(store.stack).toHaveLength(0)
  })

  it('destroyAll() removes everything instantly', () => {
    useModal({ component: Stub }).open()
    useModal({ component: Stub }).open()
    useModalStore().destroyAll()
    expect(store.stack).toHaveLength(0)
  })
})
