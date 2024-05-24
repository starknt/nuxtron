import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  telemetry: false,

  modules: [
    'renuxtron/nuxt',
    '@unocss/nuxt',
    // '@nuxt/image',
  ],

  experimental: {
    componentIslands: {
      selectiveClient: true,
    },
    appManifest: true,
  },

  nuxtron: {
    entry: './desktop/main.ts',
    serverOptions: {},
  },

  nitro: {
    minify: false,
  },
})
