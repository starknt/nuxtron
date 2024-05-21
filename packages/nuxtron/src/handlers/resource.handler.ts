import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import type { Handler, HandlerOptions, ProtocolServerHandler } from './types'

const handler: Handler = async (request: Request, options: HandlerOptions) => {
  const uri = new URL(request.url)
  const path = dirname(fileURLToPath(import.meta.url))
  const filepath = join(path, options.assetDir!, uri.pathname)

  return new Response(readFileSync(filepath), {
    status: 200,
  })
}

export const resourceHandler: ProtocolServerHandler = {
  regex: /\..*$/,
  handler,
}
