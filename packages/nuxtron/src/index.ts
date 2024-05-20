import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import type { RequestListener as NitroRequestListener, OutgoingHttpHeaders } from 'node:http'
import mime from 'mime'
import { app, protocol } from 'electron'
import defu from 'defu'
import { ServerResponse } from './mock-env/response'
import { IncomingMessage } from './mock-env/request'

interface RequestListener {
  (req: IncomingMessage, res: ServerResponse): void | Promise<void>
}

class ProtocolServer {
  constructor(private handler: RequestListener, private options: ServerOptions) {}

  async listen(request: Request) {
    const url = new URL(request.url)

    // TODO: better assets file handler
    if (/\..*$/.test(url.pathname)) {
      // TODO: get file path from builder
      const path = dirname(fileURLToPath(import.meta.url))
      const filepath = join(path, this.options.assetDir!, url.pathname)
      const file = readFileSync(filepath, 'utf-8')

      return new Response(file, {
        headers: {
          'Content-Type': mime.getType(extname(filepath)) ?? 'text/plain',
        },
      })
    }

    const req = new IncomingMessage()
    req.url = request.url.slice('nitro://starknt.com'.length)
    req.method = request.method
    const headers: Record<string, string> = {}
    for (const [key, value] of request.headers.entries())
      headers[key.toLowerCase()] = value

    req.headers = headers
    const res = new ServerResponse(req)

    await this.handler(req, res)
    // eslint-disable-next-line node/prefer-global/buffer
    return new Response(Buffer.concat(res.buffers.map(b => b.chunk)), {
      status: res.statusCode,
      statusText: res.statusMessage,
      headers: formatOutgoingHttpHeaders(res.getHeaders()),
    })
  }
}

function formatOutgoingHttpHeaders(headers: OutgoingHttpHeaders): HeadersInit {
  const out: HeadersInit = {}
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      const v = value.join(', ')
      out[key] = v
    }
    else {
      out[key] = String(value)
    }
  }
  return out
}

export interface ServerOptions {
  /**
   * Electron protocol scheme
   * @default 'nitro'
   * @link https://www.electronjs.org/docs/latest/api/protocol#protocolregisterschemesasprivilegedcustomschemes
   */
  scheme?: string

  /**
   * Electron protocol privileges
   * @link https://www.electronjs.org/docs/latest/api/protocol#protocolregisterschemesasprivilegedcustomschemes
   */
  privileges?: Electron.Privileges

  /**
   *
   */
  extraSchemes?: Electron.CustomScheme[]

  /**
   * Assets file path
   * @default ./public
   */
  assetDir: string
}

// TODO: refactor api
export async function createServer(handler: NitroRequestListener, options: ServerOptions) {
  const _options = defu({
    assetDir: './public',
    scheme: 'nitro',
    privileges: {

    },
    extraSchemes: [],
  }, options)
  protocol.registerSchemesAsPrivileged([
    {
      scheme: _options.scheme,
      privileges: {
        standard: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true,
        bypassCSP: true,
        ...options.privileges,
      },
    },
    ...(options?.extraSchemes ?? []),
  ])

  const server = new ProtocolServer(handler, _options)
  app.whenReady().then(() => {
    protocol.handle('nitro', request => server.listen(request))
  })
}
