import { useElectron } from './useElectron'

export function useIpcRenderer() {
  if (import.meta.server)
    throw new Error('IpcRenderer is not supported in client')

  return useElectron().ipcRenderer
}
