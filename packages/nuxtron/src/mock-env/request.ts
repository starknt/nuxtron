import { Readable } from 'node:stream'
import type { IncomingHttpHeaders } from 'node:http'
import type { HeadersObject } from './types'

export class IncomingMessage extends Readable {
  public aborted: boolean = false
  public httpVersion: string = '1.1'
  public httpVersionMajor: number = 1
  public httpVersionMinor: number = 1
  public complete: boolean = true
  public connection: any
  public socket: any
  public headers: IncomingHttpHeaders = {}
  public trailers = {}
  public method: string = 'GET'
  public url: string = '/'
  public statusCode: number = 200
  public statusMessage: string = ''
  public closed: boolean = false
  public errored: Error | null = null

  readable: boolean = false

  constructor(socket?: any) {
    super()
    this.socket = this.connection = socket
  }

  get rawHeaders() {
    return rawHeaders(this.headers)
  }

  get rawTrailers() {
    return []
  }

  setTimeout(_msecs: number, _callback?: () => void) {
    return this
  }

  get headersDistinct() {
    return _distinct(this.headers)
  }

  get trailersDistinct() {
    return _distinct(this.trailers)
  }
}

function _distinct(obj: Record<string, any>) {
  const d: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key) {
      d[key as string] = (Array.isArray(value) ? value : [value]).filter(
        Boolean,
      )
    }
  }
  return d
}

export function rawHeaders(headers: HeadersObject) {
  const rawHeaders: Array<any> = []
  for (const key in headers) {
    if (Array.isArray(headers[key])) {
      for (const h of headers[key] as any)
        rawHeaders.push(key, h)
    }
    else {
      rawHeaders.push(key, headers[key])
    }
  }
  return rawHeaders
}
