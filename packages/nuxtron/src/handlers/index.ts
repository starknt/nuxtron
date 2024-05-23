import { nitroHandler } from './nitro.handler'
import { resourceHandler } from './resource.handler'
import { sseHandler } from './sse.handler'
import type { ProtocolServerHandler } from './types'

export { handler } from './basic.handler'

export const handlers: Array<ProtocolServerHandler> = [
  resourceHandler,
  sseHandler,
  nitroHandler,
]
