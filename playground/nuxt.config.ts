import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  telemetry: false,

  modules: [
    'renuxtron/nuxt',
    '@unocss/nuxt',
  ],

  nuxtron: {
    entry: './desktop/main.ts',
    serverOptions: {},
  },

  nitro: {
    minify: true,
  },
})
