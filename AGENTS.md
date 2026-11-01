# Repository Guidelines

## Project Structure & Module Organization

This repository publishes `nuxt-ui-modals`, a TypeScript library for programmatic Nuxt UI v4 modals in Vue 3 applications.

- `src/composables/`: public `useModal`, `useConfirm`, `useAlert`, and related helpers.
- `src/components/`: `ModalContainer.vue` and `ModalHost.vue` handle rendering and transitions.
- `src/store.ts`, `src/types.ts`, and `src/plugin.ts`: shared state, API types, and Vue plugin setup. Expose public APIs through `src/index.ts`.
- `tests/`: store and composable unit tests.
- `playground/`: standalone Vite demo, including styles in `assets/main.css`; imports library source directly for HMR.
- `docs/`: VitePress guides, API documentation, and demo components.
- `dist/`: generated library bundles and declarations; do not edit directly.

## Build, Test, and Development Commands

Use Node.js 24 (`.node-version`) and pnpm. Run commands from the repository root:

- `pnpm install`: install dependencies across the workspace.
- `pnpm playground`: start the interactive Vue demo.
- `pnpm build`: generate ESM/CJS bundles and TypeScript declarations.
- `pnpm type-check`: check library TypeScript and Vue components.
- `pnpm lint` / `pnpm lint:fix`: check or automatically fix code with ESLint.
- `pnpm test`: run Vitest once; `pnpm test:watch` starts watch mode.
- `pnpm docs:dev`: serve documentation locally.
- `pnpm docs:build` / `pnpm docs:preview`: build or preview documentation.

## Coding Style & Naming Conventions

Follow `.editorconfig`: two-space indentation, UTF-8, LF endings, and a final newline. Use `@antfu/eslint-config` via `eslint.config.mjs` for formatting, import sorting, and Vue/TypeScript rules. Use single quotes, no semicolons, explicit types at API boundaries, and type-only imports where appropriate. Use PascalCase Vue component filenames and camelCase composables prefixed with `use`. Generated component and auto-import declarations are excluded from linting.

## Testing Guidelines

Place Vitest tests in `tests/**/*.test.ts`. Tests run in Node without DOM rendering; use stub components and call `settle(entry)` to simulate completed leave transitions. Reset shared state with `destroyAll()` between tests. Cover changed Promise settlement, lifecycle, and stack behavior. No coverage threshold is configured. Run lint, tests, type checking, and the build before submitting; verify visual changes in the playground.

## Commit & Pull Request Guidelines

History currently contains only `init commit` and `wip`; no formal commit convention is established. Use concise, imperative commit subjects. PRs should describe the behavior change, link relevant issues, list validation performed, and include screenshots for visual changes. Update README/API documentation when public behavior changes.

## Architecture Constraints

Keep Vue, Nuxt UI, and their configured peer dependencies external to library bundles. Preserve transition timing: `open()` resolves after closing finishes, while `destroy()` removes immediately and settles pending Promises. Keep navigation integration consumer-controlled.
