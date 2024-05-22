import { type OutgoingHttpHeader, type OutgoingHttpHeaders, OutgoingMessage } from 'node:http'
import { Buffer } from 'node:buffer'
import type { Socket } from 'node:net'
import { PassThrough } from 'node:stream'
import type { IncomingMessage } from './request'
import type { Callback } from './types'

export class ServerResponse extends OutgoingMessage {
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
  public socket: Socket | null = null

  public buffers: Array<Buffer> = []

  public req: IncomingMessage
  public outcomingMessage = new PassThrough()

  constructor(req: IncomingMessage) {
    super()
    this.req = req
    // compat h3
    this.socket = req.socket
    this.sendDate = true
  }

  write(chunk: any, callback?: ((error: Error | null | undefined) => void) | undefined): boolean
  write(chunk: any, encoding: BufferEncoding, callback?: ((error: Error | null | undefined) => void) | undefined): boolean
  write(chunk: unknown, encoding?: unknown, callback?: unknown): boolean {
    // @ts-expect-error ignore
    this.buffers.push(Buffer.from(chunk))
    if (typeof callback === 'function')
      // @ts-expect-error ignore
      return this.outcomingMessage.write(chunk, encoding, cb)
    else
    // @ts-expect-error ignore
      return this.outcomingMessage.write(chunk, encoding)
  }

  end(cb?: (() => void) | undefined): this
  end(chunk: any, cb?: (() => void) | undefined): this
  end(chunk: any, encoding: BufferEncoding, cb?: (() => void) | undefined): this
  end(chunk?: unknown, encoding?: unknown, callback?: unknown): this {
    // @ts-expect-error ignore
    this.buffers.push(Buffer.from(chunk))
    if (typeof callback === 'function')
      // @ts-expect-error ignore
      this.outcomingMessage.end(chunk, encoding, callback)
    else
    // @ts-expect-error ignore
      this.outcomingMessage.end(chunk, encoding)
    return this
  }

  writeContinue(_cb: Callback): void {
    /** empty */
  }

  addTrailers(
    _headers: OutgoingHttpHeaders | ReadonlyArray<[string, string]>,
  ): void {
    /** empty */
  }

  writeEarlyHints(_headers: OutgoingHttpHeaders, cb: () => void): void {
    if (typeof cb === 'function')
      cb()
  }

  assignSocket(socket: Socket): void {
    // @ts-expect-error private
    socket._httpMessage = this
    this.socket = socket
    this.emit('socket', socket)
    this._flush()
  }

  _flush() {
    this.flushHeaders()
  }

  _implicitHeader() {
    this.writeHead(this.statusCode)
    return false
  }

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
      let k: any
      if (Array.isArray(headers)) {
        if (headers.length % 2 !== 0)
          throw new Error('headers must be an even number of arguments')

        for (let n = 0; n < headers.length; n += 2) {
          k = headers[n + 0]
          this.removeHeader(k)
        }

        for (let n = 0; n < headers.length; n += 2) {
          k = headers[n + 0]
          if (k)
            this.appendHeader(k, headers[n + 1] as any)
        }
      }
      else {
        const keys = Object.keys(headers)
        for (let i = 0; i < keys.length; i++) {
          k = keys[i]
          if (k)
            this.setHeader(k, headers[k] as any)
        }
      }
    }
    this.headersSent = true
    return this
  }

  _finish(): void {
    this._finish()
  }
}
