import type { ServerOptions } from '../types'

export interface HandlerOptions extends ServerOptions {
  nitroHandler: (request: Request) => Promise<Response> | Response
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
