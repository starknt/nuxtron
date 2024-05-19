let electron: typeof import('electron') | undefined

if (import.meta.server) {
  if (import.meta.dev)
    // eslint-disable-next-line ts/no-require-imports
    electron = require('electron')
  else
    import('electron').then(e => electron = e)
}

export function useElectron() {
  return electron!
}
