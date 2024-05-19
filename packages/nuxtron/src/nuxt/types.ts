import type { ServerOptions } from '../index'

export interface NuxtronOptions {
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
   * @description only in production mode
   * @description electron server options
   */
  serverOptions?: Partial<ServerOptions>
}
