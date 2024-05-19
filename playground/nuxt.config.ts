import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  telemetry: false,

  modules: [
    'renuxtron/nuxt',
    '@unocss/nuxt',
  ],

  renuxtron: {
    entry: './desktop/main.ts',
  },

  nitro: {
    $production: {
      experimental: {
        websocket: false,
        typescriptBundlerResolution: true,
      },
      noExternals: true,
      preset: 'node',
      inlineDynamicImports: true,
      minify: true,
      sourceMap: false,
    },
    rollupConfig: {
      external: ['electron'],
    },
  },
})
