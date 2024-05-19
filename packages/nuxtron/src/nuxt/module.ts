// fix TS2742 error
import type {} from 'nuxt/schema'
import { isAbsolute, join } from 'node:path'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { NuxtronOptions } from './types'
import type { RollupConfig } from './builder/types'
import { build } from './builder/build'

let ROLLUP_CONFIG: RollupConfig
const resolver = createResolver(import.meta.url)

export default defineNuxtModule<NuxtronOptions>({
  meta: {
    name: 'renuxtron',
    configKey: 'renuxtron',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },

  defaults: {
    entry: '',
  },

  hooks: {
    // 'vite:extendConfig': (vite, { isClient }) => {
    //   if (isClient)
    //     return

    //   vite.ssr = {
    //     external: Array.isArray(vite.ssr?.external) ? [...vite.ssr.external, 'electron'] : ['electron'],
    //   }
    // },

    'nitro:init': (nitro) => {
      nitro.hooks.hook('rollup:before', (nitro, config) => {
        ROLLUP_CONFIG = config
        // override preset related options
        if (nitro.options.dev)
          config.input = resolver.resolve('./runtime/nitro-dev.ts')
      })

      nitro.hooks.hookOnce('rollup:before', async (nitro) => {
        if (nitro.options.dev) {
          // const _nitro = {
          //   ...nitro,
          //   options: {
          //     ...nitro.options,
          //     inlineDynamicImports: false,
          //     entry: process.env.NUXTRON_DEV_ENTRY!,
          //   },
          // } satisfies Nitro

          // const rollupConfig = getRollupConfig(_nitro)
          // await _build(_nitro, {
          //   ...rollupConfig,
          //   output: {
          //     ...rollupConfig.output,
          //     entryFileNames: 'dev.mjs',
          //   },
          //   external: Array.isArray(rollupConfig.external) ? [...rollupConfig.external, 'electron'] : ['electron'],
          // })

          await build(nitro, {
            ...ROLLUP_CONFIG,

            input: process.env.NUXTRON_DEV_ENTRY,
            output: {
              ...ROLLUP_CONFIG.output,
              entryFileNames: 'dev.mjs',
            },
            external: Array.isArray(ROLLUP_CONFIG.external) ? [...ROLLUP_CONFIG.external, 'electron'] : ['electron'],
          })
        }
      })
    },

    'nitro:build:before': async (nitro) => {
      if (nitro.options.dev) {
        nitro.options = {
          ...nitro.options,
          inlineDynamicImports: false,
        }
        return
      }

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
          external: Array.isArray(nitro.options.externals.external) ? [...nitro.options.externals.external, 'electron'] : ['electron'],
        },
      }
    },
  },

  setup(options, nuxt) {
    process.env.NUXTRON_DEV_ENTRY = isAbsolute(options.entry) ? options.entry : join(nuxt.options.rootDir, options.entry)
  },
})
