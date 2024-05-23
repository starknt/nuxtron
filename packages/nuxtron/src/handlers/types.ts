import type { IncomingMessage } from '../mock-env/request'
import type { ServerResponse } from '../mock-env/response'
import type { RequestListener, ServerOptions } from '../types'

export type Nullable<T> = T | null | undefined | void

export interface ServerRequest extends Request {
  $url: string
}

export interface ServerHandlerResponse extends Response {
  originalRequest: IncomingMessage
  originalResponse: ServerResponse
}

export interface ServerHandler {
  (request: ServerRequest): Promise<ServerHandlerResponse> | ServerHandlerResponse
}

export interface HandlerOptions extends ServerOptions {
  rawHandler: RequestListener
  nitroHandler: ServerHandler
}

export interface Handler {
  (request: ServerRequest, options: HandlerOptions): Nullable<Response> | Promise<Nullable<Response>>
}

export interface ProtocolServerHandler {
  regex?: RegExp
  filter?: (request: ServerRequest) => boolean
  fallback?: boolean
  handler: Handler
}
