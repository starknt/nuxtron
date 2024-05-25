import { isAbsolute, join } from 'node:path'
import { addImportsDir, addTypeTemplate, addVitePlugin, createResolver, defineNuxtModule, useLogger, useNuxt } from '@nuxt/kit'
import { klona } from 'klona'
import type { NuxtronOptions, NuxtronUserOptions, Sender } from '../types'
import { build, watch } from './builder/build'
import { buildTemplate, devTemplate } from './builder/template'
import { generatePorts, getAvailablePort, toArray } from './helper'
import { noExternals } from './builder/plugins/no-externals'

declare module '@nuxt/schema' {
  interface Nuxt {
    nuxtron: NuxtronOptions
  }
}

const resolver = createResolver(import.meta.url)
const logger = useLogger('nuxtron')

export default defineNuxtModule<NuxtronUserOptions>({
  meta: {
    name: 'nuxtron',
    configKey: 'nuxtron',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },

  defaults: {
    entry: '',
    port: 5174,
    serverOptions: {
      assetDir: './public',
    },
  },

  hooks: {
    'vite:extendConfig': (vite) => {
      const nuxt = useNuxt()
      if (nuxt.options.dev)
        return

      vite.ssr = {
        external: Array.isArray(vite.ssr?.external) ? [...vite.ssr.external, 'electron'] : ['electron'],
      }
    },

    'nitro:config': (nitro) => {
      const nuxt = useNuxt()

      if (nuxt.options.dev) {
        nitro.inlineDynamicImports = false
        nitro.experimental = {
          ...nitro.experimental,
          websocket: false,
          typescriptBundlerResolution: true,
        }
      }
      else {
        // ensure preset is `node`
        nitro.preset = 'node'
        nitro.experimental = {
          ...nitro.experimental,
          websocket: false,
          typescriptBundlerResolution: true,
        }
        nitro.noExternals = true
        nitro.inlineDynamicImports = true
        nitro.sourceMap = nitro.debug || false
        nitro.serveStatic = false
      }
    },

    'nitro:init': (nitro) => {
      const nuxt = useNuxt()

      const sender: Sender = {
        async send(action) {
          return fetch(`http://localhost:${nuxt.nuxtron.port}/_nuxtron/${action}`)
            .then(res => res.text())
            .then(text => text === `ok:with:${action}`)
            .catch(() => false)
        },
      }

      nitro.options.virtual!['#internal/nuxtron/server-options'] = `
          export default ${JSON.stringify(nuxt.nuxtron.serverOptions)}
        `
      if (nitro.options.dev)
        nitro.options.virtual!['#internal/nuxtron'] = devTemplate(nuxt.nuxtron.port!)
      else
        nitro.options.virtual!['#internal/nuxtron'] = buildTemplate()

      nitro.hooks.hook('rollup:before', (nitro, rollupConfig) => {
        nuxt.nuxtron.rollupConfig = klona(rollupConfig)
        // remove inner no-externals plugin
        if (nitro.options.noExternals) {
          rollupConfig.plugins = toArray<any>(rollupConfig.plugins)!.filter(p => p.name !== 'no-externals')
          toArray(rollupConfig.plugins).push(noExternals(nitro))
        }

        // override preset related options
        if (nitro.options.dev)
          rollupConfig.input = resolver.resolve('./runtime/nitro-dev.ts')
        else
          rollupConfig.input = nuxt.nuxtron.entry
      })

      nitro.hooks.hook('compiled', async (nitro) => {
        if (nitro.options.dev) {
          await watch(nitro, {
            ...nuxt.nuxtron.rollupConfig,
            input: nuxt.nuxtron.entry,
            output: {
              ...nuxt.nuxtron.rollupConfig!.output,
              entryFileNames: 'dev.mjs',
            },
            external: Array.isArray(nuxt.nuxtron.rollupConfig!.external) ? [...nuxt.nuxtron.rollupConfig!.external, 'electron'] : ['electron'],
          }, sender)
        }
        else {
          await build(nitro, nuxt.nuxtron.rollupConfig!)
        }
      })
    },
  },

  async setup(options, nuxt) {
    addVitePlugin({
      name: 'nuxtron',
      enforce: 'pre',
      load(id) {
        if (id === 'electron' || id.startsWith('electron/')) {
          logger.log('Skip electron import in dev mode')
          return 'export default {}'
        }
      },
    })

    options.entry = isAbsolute(options.entry)
      ? options.entry
      : join(nuxt.options.rootDir, options.entry)
    options.port = await getAvailablePort({
      port: [options.port!, ...generatePorts(5175, 5180)],
    })
    nuxt.nuxtron = options

    // composables
    addImportsDir(resolver.resolve('./runtime/composables'))

    // inject types
    addTypeTemplate({
      filename: 'types/nuxtron.d.ts',
      getContents: () => `
        declare module '#internal/nuxtron' {

        }
      `,
    })
  },
})
