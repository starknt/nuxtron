import { join } from 'node:path'
import { app } from 'electron'

/**
 * ! Warning: this file is only used in development,
 * ! Please do not use it in production
 * ! Do not import external files
 */

function setupInject() {
  app.on('session-created', (session) => {
    const preloads = session.getPreloads()
    const __dirname = process.env.__dirname
    session.setPreloads([
      ...preloads,
      join(__dirname!, './nuxtron/runtime/globals.mjs'),
    ])
  })
}

export async function setupNuxtron() {
  setupInject()
}
