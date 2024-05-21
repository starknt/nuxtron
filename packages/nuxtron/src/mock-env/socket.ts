import type * as net from 'node:net'
import consola from 'consola'
import { Duplex } from './duplex'
import type { Callback } from './types'

// Docs: https://nodejs.org/api/net.html#net_class_net_socket
export class Socket extends Duplex implements net.Socket {
  readonly bufferSize: number = 0
  readonly bytesRead: number = 0
  readonly bytesWritten: number = 0
  readonly connecting: boolean = false
  readonly destroyed: boolean = false
  readonly pending: boolean = false
  readonly localAddress: string = ''
  readonly localPort: number = 0
  readonly remoteAddress?: string = ''
  readonly remoteFamily?: string = ''
  readonly remotePort?: number = 0
  readonly autoSelectFamilyAttemptedAddresses = []
  readonly readyState: net.SocketReadyState = 'opening'

  constructor(_options?: net.SocketConstructorOpts) {
    super()
  }

  write(
    _buffer: Uint8Array | string,
    _arg1?: BufferEncoding | Callback<Error | undefined>,
    _arg2?: Callback<Error | undefined>,
  ): boolean {
    consola.log('write', _buffer, _arg1, _arg2)
    // @ts-expect-error ignore
    return super.write(_buffer, _arg1, _arg2)
  }

  connect(
    _arg1: number | string | net.SocketConnectOpts,
    _arg2?: string | Callback,
    _arg3?: Callback,
  ) {
    return this
  }

  end(
    _arg1?: Callback | Uint8Array | string,
    _arg2?: BufferEncoding | Callback,
    _arg3?: Callback,
  ) {
    // @ts-expect-error ignore
    return super.end(_arg1, _arg2, _arg3)
  }

  setEncoding(_encoding?: BufferEncoding): this {
    return this
  }

  pause() {
    return this
  }

  resume() {
    return this
  }

  setTimeout(_timeout: number, _callback?: Callback): this {
    return this
  }

  setNoDelay(_noDelay?: boolean): this {
    return this
  }

  setKeepAlive(_enable?: boolean, _initialDelay?: number): this {
    return this
  }

  address() {
    return {}
  }

  unref() {
    return this
  }

  ref() {
    return this
  }

  destroySoon() {
    this.destroy()
  }

  resetAndDestroy() {
    const err = new Error('ERR_SOCKET_CLOSED');
    (err as any).code = 'ERR_SOCKET_CLOSED'
    this.destroy(err)
    return this
  }
}

export class SocketAddress implements net.SocketAddress {
  address: string
  family: 'ipv4' | 'ipv6'
  port: number
  flowlabel: number
  constructor(options: net.SocketAddress) {
    this.address = options.address
    this.family = options.family
    this.port = options.port
    this.flowlabel = options.flowlabel
  }
}
