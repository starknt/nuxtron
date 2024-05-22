import type { IpcMain } from 'electron/main'
import { useElectron } from './useElectron'

export function useIpcMain() {
  if (import.meta.client)
    throw new Error('IpcMain is not supported in client')

  const { ipcMain } = useElectron()

  return {
    ...ipcMain,
    handle(channel, listener) {
      // @ts-expect-error private field
      if (ipcMain._invokeHandlers.has(channel))
        // @ts-expect-error private field
        return ipcMain._invokeHandlers.set(channel, listener)

      return ipcMain.handle(channel, listener)
    },
  } satisfies IpcMain
}
