import type { IncomingMessage } from '../mock-env/request'
import type { ServerResponse } from '../mock-env/response'
import type { RequestListener, ServerOptions } from '../types'

export type Nullable<T> = T | null | undefined | void

export interface ServerHandlerResponse extends Response {
  originalRequest: IncomingMessage
  originalResponse: ServerResponse
}

export interface ServerHandler {
  (request: Request): Promise<ServerHandlerResponse> | ServerHandlerResponse
}

export interface HandlerOptions extends ServerOptions {
  rawHandler: RequestListener
  nitroHandler: ServerHandler
}

export interface Handler {
  (request: Request, options: HandlerOptions): Nullable<Response> | Promise<Nullable<Response>>
}

export interface ProtocolServerHandler {
  regex?: RegExp
  filter?: (request: Request) => boolean
  fallback?: boolean
  handler: Handler
}
