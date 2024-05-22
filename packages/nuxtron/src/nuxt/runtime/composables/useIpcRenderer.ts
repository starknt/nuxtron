import type { IpcRenderer } from 'electron/renderer'

export function useIpcRenderer(): IpcRenderer {
  if (import.meta.server)
    throw new Error('IpcRenderer is not supported in client')

  if (typeof window.require === 'function') {
    return window.require('electron').ipcRenderer
  }
  else {
    // @ts-expect-error injected through globals preload script
    if (window.__NUXTRON__)
      // @ts-expect-error injected through globals preload script
      return window.__NUXTRON__.ipcRenderer
    else
      throw new Error('IpcRenderer is not supported in current environment')
  }
}
