import type { Handler, HandlerOptions, ProtocolServerHandler } from './types'

const handler: Handler = async (request: Request, options: HandlerOptions) => {
  const { response } = await options.nitroHandler(request)
  return response
}

export const nitroHandler: ProtocolServerHandler = {
  fallback: true,
  handler,
}
