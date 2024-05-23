import type { Handler, HandlerOptions, ProtocolServerHandler, ServerRequest } from './types'

const handler: Handler = async (request: ServerRequest, options: HandlerOptions) => {
  return options.nitroHandler(request)
}

export const nitroHandler: ProtocolServerHandler = {
  fallback: true,
  handler,
}
