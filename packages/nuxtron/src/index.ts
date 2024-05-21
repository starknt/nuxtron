import type { RequestListener as NitroRequestListener } from 'node:http'
import { app, protocol, session } from 'electron'
import defu from 'defu'
import type { ServerOptions } from './types'
import { ProtocolServer } from './server'

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
  })

  // handle multi sessions
  app.on('session-created', (session) => {
    session.protocol.handle(_options.scheme, request => server.listen(request))
  })
}
