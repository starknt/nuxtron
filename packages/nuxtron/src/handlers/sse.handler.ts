import type { Handler, HandlerOptions, ProtocolServerHandler } from './types'

const handler: Handler = async (_request: Request, _options: HandlerOptions) => {
  // eslint-disable-next-line no-console
  console.log('SSE')
}

export const sseHandler: ProtocolServerHandler = {
  filter: request => request.headers.get('accept')?.includes('text/event-stream') ?? false,
  handler,
}
