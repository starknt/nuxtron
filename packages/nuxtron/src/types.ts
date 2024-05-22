import type { InputOptions, OutputOptions } from 'rollup'
import type { IncomingMessage } from './mock-env/request'
import type { ServerResponse } from './mock-env/response'

export type RollupConfig = InputOptions & {
  output: OutputOptions
}

export enum Action {
  PageReload = 'page:reload',
}

export interface Sender {
  send: (action: Action) => Promise<boolean>
}

export interface RequestListener {
  (req: IncomingMessage, res: ServerResponse): void | Promise<void>
}

export interface ServerOptions {
  /**
   * Electron protocol scheme
   * @default 'nitro'
   * @link https://www.electronjs.org/docs/latest/api/protocol#protocolregisterschemesasprivilegedcustomschemes
   */
  scheme?: string

  /**
   * The partition where the protocol should be installed, if not using Electron's default partition.
   */
  partition?: string

  /**
   * Electron protocol privileges
   * @link https://www.electronjs.org/docs/latest/api/protocol#protocolregisterschemesasprivilegedcustomschemes
   */
  privileges?: Electron.Privileges

  /**
   * Electron protocol extra schemes, because the `registerSchemesAsPrivileged` API only call onces when the app before the ready
   * @link https://www.electronjs.org/docs/latest/api/protocol#protocolregisterschemesasprivilegedcustomschemes
   */
  extraSchemes?: Electron.CustomScheme[]

  /**
   * Assets file path
   * @default ./public
   */
  assetDir: string
}

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
