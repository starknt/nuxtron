import type { Handler, HandlerOptions, ProtocolServerHandler } from './types'

const handler: Handler = async (request: Request, options: HandlerOptions) => {
  return options.nitroHandler(request)
}

export const nitroHandler: ProtocolServerHandler = {
  fallback: true,
  handler,
}
