import { dirname, isAbsolute, join, relative, win32 } from 'node:path'
import fsp from 'node:fs/promises'
import { type Nitro, scanHandlers, writeTypes } from 'nitropack'
import type { RollupError } from 'rollup'
import rollup from 'rollup'
import type { OnResolveResult, PartialMessage } from 'esbuild'
import defu from 'defu'
import { resolvePathSync } from 'mlly'
import { copy } from 'fs-extra'
import type { RollupConfig, Sender } from '../../types'

function resolveModule(path: string) {
  try {
    const modulePath = resolvePathSync(path)
    if (process.platform === 'win32')
      return win32.normalize(modulePath)
    return modulePath
  }
  catch {
    return undefined
  }
}

async function copyRuntimeFiles(nitro: Nitro, rollupConfig: RollupConfig) {
  const runtimeDir = join(dirname(resolveModule('renuxtron') ?? ''), 'runtime')
  const outputDir = rollupConfig.output.dir || nitro.options.output.dir
  const destRuntimeDir = join(outputDir, './nuxtron/runtime')
  await fsp.mkdir(destRuntimeDir, { recursive: true })

  for (const file of await fsp.readdir(runtimeDir)) {
    if (file.endsWith('.d.ts'))
      continue

    await fsp.copyFile(join(runtimeDir, file), join(destRuntimeDir, file))
  }
}

function startRollupWatcher(nitro: Nitro, rollupConfig: RollupConfig, _sender: Sender) {
  const watcher = rollup.watch(
    defu(rollupConfig, {
      watch: {
        chokidar: nitro.options.watchOptions,
      },
    }),
  )
  let start: number

  watcher.on('event', (event) => {
    switch (event.code) {
      // The watcher is (re)starting
      case 'START': {
        return
      }

      // Building an individual bundle
      case 'BUNDLE_START': {
        start = Date.now()
        return
      }

      // Finished building all bundles
      case 'END': {
        // send page:reload action for dev server
        // sender.send(Action.PageReload)

        // reload electron
        nitro.hooks.callHook('dev:reload')

        if (nitro.options.logging.buildSuccess) {
          nitro.logger.success(
            `Nuxtron server built`,
            start ? `in ${Date.now() - start} ms` : '',
          )
        }

        return
      }

      // Encountered an error while bundling
      case 'ERROR': {
        nitro.logger.error(formatRollupError(event.error))
      }
    }
  })
  return watcher
}

export async function watch(nitro: Nitro, rollupConfig: RollupConfig, sender: Sender) {
  let rollupWatcher: rollup.RollupWatcher

  async function load() {
    if (rollupWatcher)
      await rollupWatcher.close()

    await scanHandlers(nitro)
    rollupWatcher = startRollupWatcher(nitro, rollupConfig, sender)
    await writeTypes(nitro)
  }
  const reload = debounce(load)

  nitro.hooks.hook('close', () => {
    rollupWatcher.close()
  })

  nitro.hooks.hook('rollup:reload', () => reload())

  // copy runtime files
  await copyRuntimeFiles(nitro, rollupConfig)

  await load()
}

export async function build(nitro: Nitro, rollupConfig: RollupConfig) {
  // copy runtime files
  const runtimeDir = join(dirname(resolveModule('renuxtron') ?? ''), 'runtime')
  const outputDir = rollupConfig.output.dir || nitro.options.output.dir
  const destRuntimeDir = join(outputDir, './nuxtron/runtime')
  await fsp.mkdir(destRuntimeDir, { recursive: true })

  for (const file of await fsp.readdir(runtimeDir)) {
    if (file.endsWith('.d.ts'))
      continue

    await fsp.copyFile(join(runtimeDir, file), join(destRuntimeDir, file))
  }

  // move public files
  const publicDir = nitro.options.output.publicDir
  const destPublicDir = join(nitro.options.output.serverDir, './public')
  await copy(publicDir, destPublicDir, {
    recursive: true,
  })
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

function debounce(fn: () => void) {
  let timer: ReturnType<typeof setTimeout>
  return function () {
    clearTimeout(timer)
    timer = setTimeout(fn, 50)
  }
}
