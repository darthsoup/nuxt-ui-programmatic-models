---
layout: home

hero:
  name: nuxt-ui-modals
  text: Programmatic modals for Nuxt UI v4
  tagline: A tiny, fully-typed useModal() API over Nuxt UI's UModal. Open a modal from anywhere and await the user's decision.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /guide/api

features:
  - icon: 🎛️
    title: Programmatic API
    details: useModal / useConfirm / useAlert open modals from anywhere — no trigger components, no template plumbing.
  - icon: ⏳
    title: Resolves after close
    details: open() resolves once the close animation finishes, with the value the dialog returns — perfect for awaiting a decision.
  - icon: 🧭
    title: Router-agnostic
    details: closeAll() wires to Vue Router, Inertia.js, or plain history in one line. No router is bundled.
  - icon: 🔒
    title: Fully typed, zero magic
    details: A single flat reactive() store — no Pinia, no provide/inject chains — and no any in the public API.
---
