import { Buffer } from 'node:buffer'
import { IncomingMessage } from '../mock-env/request'
import { ServerResponse } from '../mock-env/response'
import { Socket } from '../mock-env/socket'
import type { RequestListener } from '../types'
import { HttpStatusCode, formatOutgoingHttpHeaders } from '../utils/http'
import type { ServerHandler, ServerHandlerResponse } from './types'

export function handler(handler: RequestListener): ServerHandler {
  const serverhandler: ServerHandler = async (request: Request): Promise<ServerHandlerResponse> => {
    const uri = new URL(request.url)
    const host = uri.host
    const scheme = uri.protocol.replace(/:$/, '')

    const socket = new Socket()
    const req: IncomingMessage = new IncomingMessage(socket)
    if (request.body) {
      // @ts-expect-error ignore it
      // compat h3, but not support it, because it's work on the http2 server
      req.body = request.body
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

    let resolved = false
    function guard(fn: () => void) {
      if (resolved)
        return
      resolved = true
      fn()
    }

    return new Promise((resolve) => {
      res.outcomingMessage.once('error', () => {
        guard(() => {
          const response = new Response(null, { status: HttpStatusCode.INTERNAL_SERVER_ERROR }) as ServerHandlerResponse
          response.originalRequest = req
          response.originalResponse = res
          resolve(response)
        })
      })

      res.outcomingMessage.once('finish', () => {
        guard(() => {
          const response = new Response(Buffer.concat(res.buffers), {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: {
              ...formatOutgoingHttpHeaders(res.getHeaders()),
            },
          }) as ServerHandlerResponse

          response.originalRequest = req
          response.originalResponse = res
          resolve(response)
        })
      })

      res.once('pipe', () => {
        guard(() => {
          const response = new Response(res.outcomingMessage as any, {
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: {
              ...formatOutgoingHttpHeaders(res.getHeaders()),
            },
          }) as ServerHandlerResponse

          response.originalRequest = req
          response.originalResponse = res
          resolve(response)
        })
      })
    })
  }

  return serverhandler
}
