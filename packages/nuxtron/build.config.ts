import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    { input: 'src/index', format: 'esm' },
    { input: './src/nuxt/module', outDir: 'dist/nuxt', format: 'esm' },
    { input: './src/nuxt/runtime', outDir: 'dist/runtime', builder: 'mkdist' },
  ],
  declaration: true,
  clean: true,
  externals: ['electron', 'nuxt', 'nuxt/schema'],
})
