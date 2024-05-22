let electron: typeof import('electron') | undefined

if (import.meta.server && !electron) {
  if (import.meta.dev)
    // eslint-disable-next-line ts/no-require-imports
    electron = require('electron')
  else
    import('electron').then(e => electron = e)
}

export function useElectron() {
  if (import.meta.client && !electron) {
    if (typeof window.require === 'function') {
      electron = window.require('electron')
    }
    else {
      if (import.meta.dev)
        console.warn('If you want to use electron in client, you need to open `nodeIntegration`, but i not recommend it.')
      return undefined!
    }
  }
  return electron!
}
