import type { RequestListener, ServerOptions } from './types'
import type { HandlerOptions, ServerRequest } from './handlers/types'
import { handlers, handler as serverhandler } from './handlers'
import { HttpStatusCode, rewriteURL } from './utils/http'

export class ProtocolServer {
  private handlerOptions: HandlerOptions

  constructor(handler: RequestListener, options: ServerOptions) {
    this.handlerOptions = {
      ...options,
      nitroHandler: serverhandler(handler),
      rawHandler: handler,
    }
  }

  async handle(request: ServerRequest) {
    const uri = new URL(request.url)
    const host = uri.host
    const scheme = uri.protocol.replace(/:$/, '')
    const url = request.url
      .replace(`${scheme}://${host}`, '')
      .replace(/\/$/, '')
    request = rewriteURL(request, url)

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
      .map(h => h.handler)

    for (const handler of _handlers) {
      const response = await handler(request, this.handlerOptions)
      if (response)
        return response
    }

    return new Response(null, { status: HttpStatusCode.ACCEPTED })
  }
}
