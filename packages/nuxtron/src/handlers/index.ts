import { nitroHandler } from './nitro.handler'
import { resourceHandler } from './resource.handler'
import type { ProtocolServerHandler } from './types'

export const handlers: Array<ProtocolServerHandler> = [
  resourceHandler,
  nitroHandler,
]
