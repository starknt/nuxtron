import type { InputOptions, OutputOptions } from 'rollup'

export type RollupConfig = InputOptions & {
  output: OutputOptions
}
