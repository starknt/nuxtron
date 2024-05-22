/* eslint-disable ts/no-require-imports */
/* eslint-disable ts/no-var-requires */
const { ipcRenderer, contextBridge } = require('electron')

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('_nuxtron', {
    // TODO: secure ipc channel
    ipcRenderer,
  })
}
else {
  // @ts-expect-error ignore
  window._nuxtron = {
    // @ts-expect-error ignore
    ...window._nuxtron,
    ipcRenderer,
  }
}
