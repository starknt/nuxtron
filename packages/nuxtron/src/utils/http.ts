import type { OutgoingHttpHeaders } from 'node:http'

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
