import type { RequestListener, ServerOptions } from './types'
import type { HandlerOptions } from './handlers/types'
import { handlers, handler as serverhandler } from './handlers'

export class ProtocolServer {
  private handlerOptions: HandlerOptions

  constructor(handler: RequestListener, options: ServerOptions) {
    this.handlerOptions = {
      ...options,
      nitroHandler: serverhandler(handler),
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
