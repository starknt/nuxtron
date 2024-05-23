import { IncomingMessage } from '../mock-env/request'
import { ServerResponse } from '../mock-env/response'
import { formatOutgoingHttpHeaders } from '../utils/http'
import type { Handler, HandlerOptions, ProtocolServerHandler, ServerRequest } from './types'

const handler: Handler = async (request: ServerRequest, options: HandlerOptions) => {
  const req = new IncomingMessage()
  req.url = request.$url
  req.method = request.method
  for (const [key, value] of request.headers.entries())
    req.headers[key.toLowerCase()] = value

  const res = new ServerResponse(req)
  options.rawHandler(req, res)
  return new Promise((resolve) => {
    const response = new Response(res.outcomingMessage as any, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
      },
    })
    resolve(response)
  })
}

export const sseHandler: ProtocolServerHandler = {
  filter: request => request.headers.get('accept')?.includes('text/event-stream') ?? false,
  handler,
}
