import type { ServerOptions } from '../types'
import type { RollupConfig } from './builder/types'

export interface NuxtronUserOptions {
  /**
   * @description entry file path
   */
  entry: string

  /**
   * @description only in production mode
   * @description entry file output directory
   * @default nitro.output.dir
   */
  outDir?: string

  /**
   * @description only in development mode
   * @description dev server options
   * @default 5174
   */
  port?: number

  /**
   * @description only in production mode
   * @description electron server options
   */
  serverOptions?: Partial<ServerOptions>
}

export interface NuxtronOptions extends NuxtronUserOptions {
  rollupConfig?: RollupConfig
}
