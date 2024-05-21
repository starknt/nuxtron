import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { mimeTypes } from '../utils/mime'
import type { Handler, HandlerOptions, ProtocolServerHandler } from './types'

const handler: Handler = async (request: Request, options: HandlerOptions) => {
  const uri = new URL(request.url)
  const path = dirname(fileURLToPath(import.meta.url))
  const filepath = join(path, options.assetDir!, uri.pathname)
  const ext = extname(filepath)
  return new Response(readFileSync(filepath), {
    status: 200,
    headers: {
      'Content-Type': mimeTypes[ext] ?? 'text/plain',
    },
  })
}

export const resourceHandler: ProtocolServerHandler = {
  regex: /\..*$/,
  handler,
}
