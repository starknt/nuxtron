import type { RequestListener, ServerOptions } from './types'
import type { HandlerOptions } from './handlers/types'
import { handlers } from './handlers'
import { IncomingMessage } from './mock-env/request'
import { ServerResponse } from './mock-env/response'
import { formatOutgoingHttpHeaders } from './utils/http'

export class ProtocolServer {
  private handlerOptions: HandlerOptions

  constructor(handler: RequestListener, options: ServerOptions) {
    this.handlerOptions = {
      ...options,
      nitroHandler: async (request: Request) => {
        const uri = new URL(request.url)
        const host = uri.host
        const scheme = uri.protocol.replace(/:$/, '')

        const req = new IncomingMessage()
        // replace protocol and host in url
        req.url = request.url
          .replace(`${scheme}://${host}`, '')
          .replace(/\/$/, '')
        req.method = request.method
        const headers: Record<string, string> = {}
        for (const [key, value] of request.headers.entries())
          headers[key.toLowerCase()] = value
        req.headers = headers

        // TODO: handle stream
        const res = new ServerResponse(req)
        await handler(req, res)

        // eslint-disable-next-line node/prefer-global/buffer
        const response = new Response(Buffer.concat(res.buffers.map(b => b.chunk)), {
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: formatOutgoingHttpHeaders(res.getHeaders()),
        })

        return {
          response,
          originalRequest: req,
          originalResponse: res,
        }
      },
    }
  }

  async listen(request: Request) {
    const url = request.url

    const _handlers = handlers
      .filter((h) => {
        if (h.regex)
          return h.regex.test(url)

        if (h.filter)
          return h.filter(request)

        if (h.fallback)
          return true

        return false
      })
      .sort((a, b) => {
        if (a.fallback && !b.fallback)
          return 1
        if (!a.fallback && b.fallback)
          return -1
        return 0
      })

    for (const handler of _handlers) {
      const response = await handler.handler(request, this.handlerOptions)
      if (response)
        return response
    }

    return new Response(null, { status: 404 })
  }
}
