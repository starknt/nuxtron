import type { InputOptions, OutputOptions } from 'rollup'

export type RollupConfig = InputOptions & {
  output: OutputOptions
}

export enum Action {
  PageReload = 'page:reload',
}

export interface Sender {
  send: (action: Action) => Promise<boolean>
}
