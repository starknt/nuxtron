import { PassThrough, Readable } from 'node:stream'
import { IncomingMessage } from '../mock-env/request'
import { ServerResponse } from '../mock-env/response'
import { Socket } from '../mock-env/socket'
import type { RequestListener } from '../types'
import { formatOutgoingHttpHeaders } from '../utils/http'
import type { ServerHandler } from './types'

export function handler(handler: RequestListener): ServerHandler {
  const serverhandler: ServerHandler = async (request: Request) => {
    const uri = new URL(request.url)
    const host = uri.host
    const scheme = uri.protocol.replace(/:$/, '')

    let req: IncomingMessage
    if (request.body) {
      // @ts-expect-error ignore its type
      const readable = Readable.fromWeb(request.body)
      const socket = new Socket()
      req = new IncomingMessage(socket)
      readable.pipe(socket)
    }
    else {
      req = new IncomingMessage()
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

    // TODO: handle stream
    const res = new ServerResponse(req)
    // TODO: response Content-Type
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
  }

  return serverhandler
}
