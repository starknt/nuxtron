import { useElectron } from './useElectron'

export function useIpcMain() {
  if (import.meta.client)
    throw new Error('IpcMain is not supported in client')

  return useElectron().ipcMain
}
