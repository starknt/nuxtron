import { join } from 'node:path'
import { app } from 'electron'
import { workDirname } from '../utils/path'

function setupInject() {
  app.on('session-created', (session) => {
    const preloads = session.getPreloads()
    session.setPreloads([
      ...preloads,
      join(workDirname, './nuxtron/runtime/globals.mjs'),
    ])
  })
}

export async function setupNuxtron() {
  setupInject()
}
