import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { input: 'src/index', format: 'esm' },
    { input: './src/nuxt/module', outDir: 'dist/nuxt', format: 'esm' },
  ],
  declaration: true,
  clean: true,
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

    // TODO: remove it
    'consola',
  ],
})
