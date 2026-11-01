import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // The unit tests exercise the store/composable logic only (no SFC
    // rendering, no DOM), so the lightweight node environment is enough.
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
