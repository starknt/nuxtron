import { join } from 'node:path'
import { app, protocol, session } from 'electron'
import defu from 'defu'
import type { RequestListener, ServerOptions } from './types'
import { ProtocolServer } from './server'
import { workDirname } from './utils/path'
import type { ServerRequest } from './handlers/types'

async function createProtocolServer(handler: RequestListener, options: ServerOptions) {
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
    session.protocol.handle(_options.scheme, request => server.handle(request as ServerRequest))
  })
}

function setupInject() {
  app.on('session-created', (session) => {
    const preloads = session.getPreloads()
    session.setPreloads([
      ...preloads,
      join(workDirname, './nuxtron/runtime/globals.mjs'),
    ])
  })
}

export async function setupNuxtron(handler: RequestListener, options: ServerOptions) {
  setupInject()
  await createProtocolServer(handler, options)
}
