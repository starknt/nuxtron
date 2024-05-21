import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import mime from 'mime/lite'
import type { Handler, HandlerOptions, ProtocolServerHandler } from './types'

const handler: Handler = async (request: Request, options: HandlerOptions) => {
  const uri = new URL(request.url)
  const path = dirname(fileURLToPath(import.meta.url))
  const filepath = join(path, options.assetDir!, uri.pathname)

  const response = await options.nitroHandler(request)
  response.headers.set('Content-Type', mime.getType(extname(filepath)) ?? 'text/plain')

  return response
}

export const resourceHandler: ProtocolServerHandler = {
  regex: /\..*$/,
  handler,
}
