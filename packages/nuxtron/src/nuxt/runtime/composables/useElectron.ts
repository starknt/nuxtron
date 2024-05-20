let electron: typeof import('electron') | undefined

if (import.meta.server) {
  if (import.meta.dev)
    // eslint-disable-next-line ts/no-require-imports
    electron = require('electron')
  else
    import('electron').then(e => electron = e)
}

if (import.meta.client) {
  if (typeof window.require === 'function')
    electron = window.require('electron')
  else
    throw new Error('If you want to use electron in client, you need to open `nodeIntegration`, but i not recommend it.')
}

export function useElectron() {
  return electron!
}
