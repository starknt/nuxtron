import { builtinModules } from 'node:module'
import type { Plugin } from 'rollup'
import type { Nitro } from 'nitropack'
import { resolvePath } from 'mlly'

export function noExternals(nitro: Nitro): Plugin {
  return {
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
  }
}
