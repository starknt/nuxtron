export function useIpcRenderer() {
  if (import.meta.server)
    throw new Error('IpcRenderer is not supported in client')

  if (typeof window.require === 'function') {
    return window.require('electron').ipcRenderer
  }
  else {
    // @ts-expect-error injected through globals preload script
    if (window._nuxtron)
      // @ts-expect-error injected through globals preload script
      return window._nuxtron.ipcRenderer
    else
      throw new Error('IpcRenderer is not supported in current environment')
  }
}
