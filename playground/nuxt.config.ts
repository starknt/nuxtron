import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  telemetry: false,

  modules: [
    'renuxtron/nuxt',
    '@unocss/nuxt',
    // '@nuxt/image',
  ],

  // TODO: prerendering support
  // routeRules: {
  //   '/prerender': { prerender: true },
  // },

  experimental: {
    componentIslands: {
      selectiveClient: true,
    },
    appManifest: true,
  },

  nuxtron: {
    entry: './desktop.ts',
    outDir: './desktop',
    serverOptions: {},
  },

  nitro: {
    minify: true,

    commonJS: {
      transformMixedEsModules: true,
    },
  },
})
