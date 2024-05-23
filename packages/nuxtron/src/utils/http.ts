import type { OutgoingHttpHeaders } from 'node:http'
import type { ServerRequest } from '../handlers/types'

export function formatOutgoingHttpHeaders(headers: OutgoingHttpHeaders): HeadersInit {
  const out: HeadersInit = {}
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      const v = value.join(', ')
      out[key] = v
    }
    else {
      out[key] = String(value)
    }
  }
  return out
}

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  PARTIAL_CONTENT = 206,

  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,

  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  METHOD_NOT_ALLOWED = 405,
}

export function rewriteURL(request: Request, url: string): ServerRequest {
  (request as ServerRequest).$url = url
  return request as ServerRequest
}
