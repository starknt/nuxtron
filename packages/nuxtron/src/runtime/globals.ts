/* eslint-disable ts/no-require-imports */

import type { IpcRenderer } from 'electron'

/* eslint-disable ts/no-var-requires */
const { ipcRenderer, contextBridge } = require('electron')

// TODO: secure ipc channel and clean impl
const implIpcRenderer = {
  invoke(channel, ...args) {
    return ipcRenderer.invoke(channel, ...args)
  },
  send(channel, ...args) {
    return ipcRenderer.send(channel, ...args)
  },
  sendSync(channel, ...args) {
    return ipcRenderer.sendSync(channel, ...args)
  },
  sendToHost(channel, ...args) {
    return ipcRenderer.sendToHost(channel, ...args)
  },
  on(channel, listener) {
    return ipcRenderer.on(channel, listener)
  },
  once(channel, listener) {
    return ipcRenderer.once(channel, listener)
  },
  removeListener(channel, listener) {
    return ipcRenderer.removeListener(channel, listener)
  },
  off(channel, listener) {
    return ipcRenderer.off(channel, listener)
  },
  removeAllListeners(channel) {
    return ipcRenderer.removeAllListeners(channel)
  },
  setMaxListeners(n) {
    return ipcRenderer.setMaxListeners(n)
  },
  addListener(channel, listener) {
    return ipcRenderer.addListener(channel, listener)
  },
  postMessage(channel, message, transfer) {
    return ipcRenderer.postMessage(channel, message, transfer)
  },
  prependListener(eventName, listener) {
    return ipcRenderer.prependListener(eventName, listener)
  },
  prependOnceListener(eventName, listener) {
    return ipcRenderer.prependOnceListener(eventName, listener)
  },
  getMaxListeners() {
    return ipcRenderer.getMaxListeners()
  },
  listenerCount(eventName, listener) {
    return ipcRenderer.listenerCount(eventName, listener)
  },
  listeners(eventName) {
    return ipcRenderer.listeners(eventName)
  },
  rawListeners(eventName) {
    return ipcRenderer.rawListeners(eventName)
  },
  emit(eventName, ...args) {
    return ipcRenderer.emit(eventName, ...args)
  },
  eventNames() {
    return ipcRenderer.eventNames()
  },
} satisfies IpcRenderer

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('__NUXTRON__', {
    ipcRenderer: implIpcRenderer,
  })
}
else {
  // @ts-expect-error ignore
  window.__NUXTRON__ = {
    // @ts-expect-error ignore
    ...window.__NUXTRON__,
    ipcRenderer: implIpcRenderer,
  }
}
