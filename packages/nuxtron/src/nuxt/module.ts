// fix TS2742 error
import type {} from 'nuxt/schema'
import { isAbsolute, join, relative } from 'node:path'
import { builtinModules } from 'node:module'
import { addImportsDir, addVitePlugin, createResolver, defineNuxtModule, useLogger, useNuxt } from '@nuxt/kit'
import { resolvePath } from 'mlly'
import type { NuxtronOptions } from './types'
import type { RollupConfig, Sender } from './builder/types'
import { build, watch } from './builder/build'
import { buildTemplate, devTemplate } from './builder/template'
import { generatePorts, getAvailablePort, toArray } from './helper'

let nuxtron: NuxtronOptions
let ROLLUP_CONFIG: RollupConfig
const resolver = createResolver(import.meta.url)
const logger = useLogger('nuxtron')

export default defineNuxtModule<NuxtronOptions>({
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
        // nitro.inlineDynamicImports = false
        nitro.virtual!['#internal/nuxtron'] = devTemplate(nuxtron.port!)
        nitro.externals = nitro.externals || {}
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
        nitro.sourceMap = false
        nitro.externals = nitro.externals || {}
      }
    },

    'nitro:init': (nitro) => {
      const sender: Sender = {
        async send(action) {
          return fetch(`http://localhost:${nuxtron.port}/_nuxtron/${action}`)
            .then(res => res.text())
            .then(text => text === `ok:with:${action}`)
            .catch(() => false)
        },
      }

      if (!nitro.options.dev) {
        nitro.options.virtual!['#internal/nuxtron'] = buildTemplate({
          handler_path: join(nitro.options.output.serverDir, 'index.mjs'),
          serverOptions: {
            ...nuxtron.serverOptions,
            assetDir:
            nuxtron.serverOptions?.assetDir
            ?? relative(nuxtron.outDir ?? nitro.options.output.dir, nitro.options.output.publicDir),
          },
        })
      }

      nitro.hooks.hook('rollup:before', (nitro, rollupConfig) => {
        ROLLUP_CONFIG = rollupConfig
        // override preset related options
        if (nitro.options.dev) {
          rollupConfig.input = resolver.resolve('./runtime/nitro-dev.ts')
        }
        else {
          // remove no-externals plugin
          rollupConfig.plugins = toArray<any>(rollupConfig.plugins)!.filter(p => p.name !== 'no-externals')
          rollupConfig.plugins.push({
            name: 'no-externals',
            async resolveId(id, from, options) {
              if (
                nitro.options.node
                && (id.startsWith('node:') || builtinModules.includes(id))
              )
                return { id, external: true }

              if (id === 'electron' || id.startsWith('electron/'))
                return { id, external: true }

              const resolved = await this.resolve(id, from, options)
              if (!resolved) {
                const _resolved = await resolvePath(id, {
                  url: nitro.options.nodeModulesDirs,
                  conditions: [
                    'default',
                    nitro.options.dev ? 'development' : 'production',
                    'node',
                    'import',
                    'require',
                  ],
                }).catch(() => null)
                if (_resolved)
                  return { id: _resolved, external: false }
              }
              if (!resolved || (resolved.external && !id.endsWith('.wasm'))) {
                throw new Error(
            `Cannot resolve ${JSON.stringify(id)} from ${JSON.stringify(
              from,
            )} and externals are not allowed!`,
                )
              }
            },
          })

          // remove env import meta plugin
          rollupConfig.plugins = toArray<any>(rollupConfig.plugins)!.filter(p => p.name !== 'import-meta')
        }
      })

      nitro.hooks.hook('compiled', async (nitro) => {
        if (nitro.options.dev) {
          await watch(nitro, {
            ...ROLLUP_CONFIG,
            input: nuxtron.entry,
            output: {
              ...ROLLUP_CONFIG.output,
              entryFileNames: 'dev.mjs',
            },
            external: Array.isArray(ROLLUP_CONFIG.external) ? [...ROLLUP_CONFIG.external, 'electron'] : ['electron'],
          }, sender)
        }
        else {
          // remove env import meta plugin
          // ROLLUP_CONFIG.plugins = toArray<any>(ROLLUP_CONFIG.plugins)!.filter(p => p.name !== 'import-meta')
          (ROLLUP_CONFIG.plugins as any[])!.push({
            name: 'nuxtron:import-env',
            renderChunk(code: string, chunk: any) {
              const isEntry = chunk.isEntry

              if (!isEntry)
                return

              return `globalThis._importMeta_={url:import.meta.url,env:process.env};${code}`
            },
          })
          await build(nitro, {
            ...ROLLUP_CONFIG,
            input: nuxtron.entry,
            output: {
              ...ROLLUP_CONFIG.output,
              dir: nuxtron.outDir ?? nitro.options.output.dir,
              entryFileNames: 'main.prod.mjs',
            },
            external: Array.isArray(ROLLUP_CONFIG.external) ? [...ROLLUP_CONFIG.external, 'electron'] : ['electron'],
          })
        }
      })
    },
  },

  async setup(options, nuxt) {
    if (nuxt.options.dev) {
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
    }

    // TODO: improve this
    options.entry = isAbsolute(options.entry) ? options.entry : join(nuxt.options.rootDir, options.entry)
    options.port = await getAvailablePort({
      port: [options.port!, ...generatePorts(5175, 5180)],
    })
    nuxtron = options

    // composables
    addImportsDir(resolver.resolve('./runtime/composables'))
  },
})
