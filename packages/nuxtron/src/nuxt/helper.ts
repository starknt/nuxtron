import { mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import _getAvailablePort, { portNumbers } from 'get-port'

const isWindows = process.platform === 'win32'

export const generatePorts = portNumbers
export const getAvailablePort = _getAvailablePort

export function getAddress() {
  const socketName = 'nuxtron-dev.sock'
  if (isWindows) {
    return join('\\\\.\\pipe\\nitro', socketName)
  }
  else {
    const socketDir = join(tmpdir(), 'nitro')
    mkdirSync(socketDir, { recursive: true })
    return join(socketDir, socketName)
  }
}

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}
