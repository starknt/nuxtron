import type { IpcMain } from 'electron/main'
import { useElectron } from './useElectron'

export function useIpcMain() {
  if (import.meta.client)
    throw new Error('IpcMain is not supported in client')

  const { ipcMain } = useElectron()
  // TODO: improve impl
  return {
    ...ipcMain,
    on(channel, listener) {
      // ensure dispose handler
      ipcMain.removeAllListeners(channel)

      return ipcMain.on(channel, listener)
    },
    handle(channel, listener) {
      // ensure dispose handler
      ipcMain.removeHandler(channel)

      return ipcMain.handle(channel, listener)
    },
    addListener(eventName, listener) {
      // ensure dispose handler
      ipcMain.removeAllListeners(eventName as string)

      return ipcMain.addListener(eventName, listener)
    },
  } satisfies IpcMain
}
