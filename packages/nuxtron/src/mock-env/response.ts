import { Writable } from 'node:stream'
import type { OutgoingHttpHeader, OutgoingHttpHeaders } from 'node:http'
import type { Buffer } from 'node:buffer'
import type { IncomingMessage } from './request'
import type { Callback } from './types'

export class ServerResponse extends Writable {
  public statusCode: number = 200
  public statusMessage: string = ''
  public upgrading: boolean = false
  public chunkedEncoding: boolean = false
  public shouldKeepAlive: boolean = false
  public useChunkedEncodingByDefault: boolean = false
  public sendDate: boolean = false
  public finished: boolean = false
  public headersSent: boolean = false
  public strictContentLength = false
  public connection: any | null = null
  public socket: any | null = null

  public buffers: Array<{ chunk: Buffer, encoding: string, callback: Function }> = []

  public req: IncomingMessage

  _headers: Record<string, number | string | string[] | undefined> = {}

  constructor(req: IncomingMessage) {
    super()
    this.req = req
  }

  _write(chunk: Buffer, encoding: string, callback: Function) {
    this.buffers.push({ chunk, encoding, callback })
  }

  assignSocket(socket: any): void {
    socket._httpMessage = this
    // socket.on('close', onServerResponseClose)
    this.socket = socket
    this.connection = socket
    this.emit('socket', socket)
    this._flush()
  }

  _flush() {
    this.flushHeaders()
  }

  detachSocket(_socket: any): void {}

  writeContinue(_callback?: Callback): void {}

  writeHead(
    statusCode: number,
    arg1?: string | OutgoingHttpHeaders | OutgoingHttpHeader[],
    arg2?: OutgoingHttpHeaders | OutgoingHttpHeader[],
  ) {
    if (statusCode)
      this.statusCode = statusCode

    if (typeof arg1 === 'string') {
      this.statusMessage = arg1
      arg1 = undefined
    }
    const headers = arg2 || arg1
    if (headers) {
      if (Array.isArray(headers)) {
        // TODO: OutgoingHttpHeader[]
      }
      else {
        for (const key in headers as any) {
          // @ts-expect-error string | string[]
          this.setHeader(key, headers[key])
        }
      }
    }
    this.headersSent = true
    return this
  }

  writeProcessing(): void {}

  setTimeout(_msecs: number, _callback?: Callback): this {
    return this
  }

  appendHeader(name: string, value: string | string[]) {
    name = name.toLowerCase()
    const current = this._headers[name]
    const all = [
      ...(Array.isArray(current) ? current : [current]),
      ...(Array.isArray(value) ? value : [value]),
    ].filter(Boolean) as string[]
    this._headers[name] = all.length > 1 ? all : all[0]
    return this
  }

  setHeader(name: string, value: number | string | string[]): this {
    this._headers[name.toLowerCase()] = value
    return this
  }

  getHeader(name: string): number | string | string[] | undefined {
    return this._headers[name.toLowerCase()]
  }

  getHeaders(): OutgoingHttpHeaders {
    return this._headers
  }

  getHeaderNames(): string[] {
    return Object.keys(this._headers)
  }

  hasHeader(name: string): boolean {
    return name.toLowerCase() in this._headers
  }

  removeHeader(name: string): void {
    delete this._headers[name.toLowerCase()]
  }

  addTrailers(
    _headers: OutgoingHttpHeaders | ReadonlyArray<[string, string]>,
  ): void {}

  flushHeaders(): void {}

  writeEarlyHints(_headers: OutgoingHttpHeaders, cb: () => void): void {
    if (typeof cb === 'function')
      cb()
  }
}
