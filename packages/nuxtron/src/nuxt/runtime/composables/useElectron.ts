let electron: typeof import('electron') | undefined

if (import.meta.server)
  // eslint-disable-next-line ts/no-require-imports
  electron = require('electron')

export function useElectron() {
  return electron!
}
