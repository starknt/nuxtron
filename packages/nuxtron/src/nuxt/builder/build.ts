import { isAbsolute, relative } from 'node:path'
import type { Nitro } from 'nitropack'
import type { RollupError } from 'rollup'
import rollup from 'rollup'
import type { OnResolveResult, PartialMessage } from 'esbuild'
import type { RollupConfig } from './types'

export function watch(_nitro: Nitro, _rollupConfig: RollupConfig) {
  // TODO: watch for entry file changes
}

export async function build(nitro: Nitro, rollupConfig: RollupConfig) {
  if (!nitro.options.static) {
    const build = await rollup.rollup(rollupConfig!).catch((error) => {
      nitro.logger.error(formatRollupError(error))
      throw error
    })

    await build.write(rollupConfig.output!)
  }

  // skip nitro json write

  if (!nitro.options.static) {
    if (nitro.options.logging.buildSuccess)
      nitro.logger.success(`nuxtron server built`)

    // if (nitro.options.logLevel > 1) {
    //   process.stdout.write(
    //     (await generateFSTree(nitro.options.output.serverDir, {
    //       compressedSizes: nitro.options.logging.compressedSizes,
    //     })) || '',
    //   )
    // }
  }
}

function formatRollupError(_error: RollupError | OnResolveResult) {
  try {
    const logs: string[] = [_error.toString()]
    const errors = (_error as any)?.errors || [_error as RollupError]
    for (const error of errors) {
      const id = (error as any).path || error.id || (_error as RollupError).id
      let path = isAbsolute(id) ? relative(process.cwd(), id) : id
      const location
        = (error as RollupError).loc || (error as PartialMessage).location
      if (location)
        path += `:${location.line}:${location.column}`

      const text
        = (error as PartialMessage).text || (error as RollupError).frame
      logs.push(
        `Rollup error while processing \`${path}\`${text}` ? `\n\n${text}` : '',
      )
    }
    return logs.join('\n')
  }
  catch {
    return _error?.toString()
  }
}
