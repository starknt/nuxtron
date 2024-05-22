import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  telemetry: false,

  modules: [
    'renuxtron/nuxt',
    '@unocss/nuxt',
  ],

  experimental: {
    componentIslands: {
      selectiveClient: true,
    },
  },

  nuxtron: {
    entry: './desktop/main.ts',
    serverOptions: {},
  },

  nitro: {
    minify: false,
  },
})
