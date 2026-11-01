import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    typescript: true,
    vue: true,
    ignores: ['**/auto-imports.d.ts', '**/components.d.ts'],
  },
  {
    files: ['pnpm-workspace.yaml'],
    rules: {
      // Keep package-manager policy changes separate from code formatting.
      'pnpm/yaml-enforce-settings': 'off',
    },
  },
)
