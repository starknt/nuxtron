import { dirname, extname, join } from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import { createReadStream } from 'node:fs'
import fsp from 'node:fs/promises'
import type { Readable } from 'node:stream'
import { mimeTypes } from '../utils/mime'
import { HttpStatusCode } from '../utils/http'
import type { Handler, HandlerOptions, ProtocolServerHandler } from './types'

const blacklist = [
  '__nuxt',
]

const handler: Handler = async (request: Request, options: HandlerOptions) => {
  const uri = new URL(request.url)
  const path = dirname(fileURLToPath(import.meta.url))
  const filepath = join(path, options.assetDir!, uri.pathname)
  const ext = extname(filepath)

  let statusCode = HttpStatusCode.OK
  const headers = new Headers()
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Content-Type', mimeTypes[ext] || 'application/octet-stream')
  let outcomingMessage: Readable
  const rangesText = request.headers.get('range')

  try {
    // refer: https://github.com/electron/electron/issues/38749#issuecomment-1681531939
    const stats = await fsp.stat(filepath)
    if (rangesText) {
      const ranges = parseRangeRequests(rangesText, stats.size)
      const [start, end] = ranges[0]
      headers.set('Content-Range', `bytes ${start}-${end}/${stats.size}`)
      headers.set('Content-Length', String(end - start + 1))
      statusCode = HttpStatusCode.PARTIAL_CONTENT
      outcomingMessage = createReadStream(filepath, { start, end })
    }
    else {
      headers.set('Content-Length', String(stats.size))
      outcomingMessage = createReadStream(filepath)
    }

    // @ts-expect-error ignore stream type
    return new Response(outcomingMessage, {
      status: statusCode,
      headers,
    })
  }
  catch (error) {
    statusCode = HttpStatusCode.NOT_FOUND
    // skip cache
    headers.set('Cache-Control', 'no-cache')
    return new Response('Not Found', {
      status: statusCode,
      headers,
    })
  }
}

function parseRangeRequests(text: string, size: number) {
  const token = text.split('=')
  if (token.length !== 2 || token[0] !== 'bytes')
    return []

  return token[1]
    .split(',')
    .map(v => parseRange(v, size))
    .filter(([start, end]) => !Number.isNaN(start) && !Number.isNaN(end) && start <= end)
}

const NAN_ARRAY = [Number.NaN, Number.NaN]

function parseRange(text: string, size: number) {
  const token = text.split('-')
  if (token.length !== 2)
    return NAN_ARRAY

  const startText = token[0].trim()
  const endText = token[1].trim()

  if (startText === '') {
    if (endText === '') {
      return NAN_ARRAY
    }
    else {
      let start = size - Number(endText)
      if (start < 0)
        start = 0

      return [start, size - 1]
    }
  }
  else {
    if (endText === '') {
      return [Number(startText), size - 1]
    }
    else {
      let end = Number(endText)
      if (end >= size)
        end = size - 1

      return [Number(startText), end]
    }
  }
}

export const resourceHandler: ProtocolServerHandler = {
  filter: (request) => {
    if (blacklist.some(b => request.url.includes(b)))
      return false

    if (request.method !== 'GET')
      return false

    const { pathname } = new URL(request.url)

    return Object.keys(mimeTypes).some(ext => pathname.endsWith(ext))
  },
  handler,
}
