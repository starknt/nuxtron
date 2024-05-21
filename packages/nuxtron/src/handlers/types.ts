import type { IncomingMessage } from '../mock-env/request'
import type { ServerResponse } from '../mock-env/response'
import type { ServerOptions } from '../types'

export interface ServerHandlerResponse extends Response {
  originalRequest: IncomingMessage
  originalResponse: ServerResponse
}

export interface ServerHandler {
  (request: Request): Promise<ServerHandlerResponse> | ServerHandlerResponse
}

export interface HandlerOptions extends ServerOptions {
  nitroHandler: ServerHandler
}

export interface Handler {
  (request: Request, options: HandlerOptions): Response | Promise<Response>
}

export interface ProtocolServerHandler {
  regex?: RegExp
  filter?: (request: Request) => boolean
  fallback?: boolean
  handler: Handler
}
