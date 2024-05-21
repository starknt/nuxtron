import { Readable } from 'node:stream'
import { IncomingMessage } from '../mock-env/request'
import { ServerResponse } from '../mock-env/response'
import { Socket } from '../mock-env/socket'
import type { RequestListener } from '../types'
import { formatOutgoingHttpHeaders } from '../utils/http'
import type { ServerHandler, ServerHandlerResponse } from './types'

export function handler(handler: RequestListener): ServerHandler {
  const serverhandler: ServerHandler = async (request: Request) => {
    const uri = new URL(request.url)
    const host = uri.host
    const scheme = uri.protocol.replace(/:$/, '')

    const socket = new Socket()
    const req: IncomingMessage = new IncomingMessage(socket)
    if (request.body) {
      // @ts-expect-error ignore it
      const readable = Readable.fromWeb(request.body)
      readable.pipe(socket)
    }

    // replace protocol and host in url
    req.url = request.url
      .replace(`${scheme}://${host}`, '')
      .replace(/\/$/, '')
    req.method = request.method
    const headers: Record<string, string> = {}
    for (const [key, value] of request.headers.entries())
      headers[key.toLowerCase()] = value
    req.headers = headers

    const res = new ServerResponse(req)
    handler(req, res)

    const response = new Response(res.passThrough as any, {
      status: res.statusCode,
      statusText: res.statusMessage,
      headers: {
        ...formatOutgoingHttpHeaders(res.getHeaders()),
      },
    }) as ServerHandlerResponse

    response.originalRequest = req
    response.originalResponse = res

    return response
  }

  return serverhandler
}
