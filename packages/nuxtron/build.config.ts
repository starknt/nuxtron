import { execSync } from 'node:child_process'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { input: 'src/index', outDir: 'dist', format: 'esm' },
    { input: 'src/dev/index', outDir: 'dist', name: 'dev', format: 'esm' },
    { input: 'src/runtime', outDir: 'dist/runtime', builder: 'mkdist' },
    { input: './src/nuxt/module', outDir: 'dist/nuxt', format: 'esm' },
  ],
  declaration: true,
  externals: [
    'electron',
    'nuxt',
    '@nuxt/schema',
    'nuxt/schema',
    'nitropack',
    'rollup',
    'esbuild',
    'mlly',
    'defu',
    'chokidar',
    'get-port',

    'consola',
  ],

  hooks: {
    'build:done': () => {
      // move runtime
      execSync('npx tsx ./scripts/move-runtime.ts')
    },
  },
})
