import type { Plugin } from 'rollup'

export function importEnv(): Plugin {
  return {
    name: 'nuxtron:import-env',
    renderChunk(code: string, chunk: any) {
      const isEntry = chunk.isEntry

      if (!isEntry)
        return

      return `globalThis._importMeta_={url:import.meta.url,env:process.env};${code}`
    },
  }
}
