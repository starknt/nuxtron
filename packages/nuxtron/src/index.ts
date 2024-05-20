import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import type { RequestListener as NitroRequestListener, OutgoingHttpHeaders } from 'node:http'
import mime from 'mime/lite'
import { app, protocol, session } from 'electron'
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
    // TODO: replace it
    req.url = url.pathname
    req.method = request.method
    const headers: Record<string, string> = {}
    for (const [key, value] of request.headers.entries())
      headers[key.toLowerCase()] = value
    req.headers = headers

    // TODO: handle stream
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
   * The partition where the protocol should be installed, if not using Electron's default partition.
   */
  partition?: string

  /**
   * Electron protocol privileges
   * @link https://www.electronjs.org/docs/latest/api/protocol#protocolregisterschemesasprivilegedcustomschemes
   */
  privileges?: Electron.Privileges

  /**
   * Electron protocol extra schemes, because the `registerSchemesAsPrivileged` API only call onces when the app before the ready
   * @link https://www.electronjs.org/docs/latest/api/protocol#protocolregisterschemesasprivilegedcustomschemes
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
  const _options = defu<Required<ServerOptions>, ServerOptions[]>({
    assetDir: './public',
    scheme: 'nitro',
    privileges: {},
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
    if (_options.partition)
      session.fromPartition(_options.partition)
    // else
    //   session.defaultSession.protocol.handle(_options.scheme, request => server.listen(request))
  })

  // handle multi sessions
  app.on('session-created', (session) => {
    session.protocol.handle(_options.scheme, request => server.listen(request))
  })
}
