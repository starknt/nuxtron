import { defineNuxtModule } from '@nuxt/kit'
import type { NuxtronOptions } from './types'

export default defineNuxtModule<NuxtronOptions>({
  meta: {
    name: 'nuxtron',
    configKey: 'nuxtron',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },

  defaults: {},

  hooks: {
    'vite:extendConfig': (vite, { isClient }) => {
      if (isClient)
        return
      vite.ssr = {
        external: Array.isArray(vite.ssr?.external) ? [...vite.ssr.external, 'electron'] : ['electron'],
      }
    },

    'nitro:build:before': (nitro) => {
      nitro.options = {
        ...nitro.options,
        experimental: {
          ...nitro.options.experimental,
          websocket: false,
          typescriptBundlerResolution: true,
        },
        noExternals: true,
        preset: 'node',
        inlineDynamicImports: true,
        minify: true,
        sourceMap: false,
        externals: {
          ...nitro.options.externals,
          external: ['electron'],
        },
      }
    },
  },
})
