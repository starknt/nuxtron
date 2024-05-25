import { join } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { BrowserWindow, app } from 'electron'
import type { NitroApp } from 'nitropack'

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

export function handler(req: IncomingMessage, res: ServerResponse, _nitroApp: NitroApp) {
  let action = req.url!.slice('/_nuxtron'.length)
  if (action.startsWith('/'))
    action = action.slice(1)

  try {
    switch (action) {
      case 'page:reload':
        BrowserWindow.getAllWindows().forEach(w => w.reload())
        break
    }

    return res.end(`ok:with:${action}`)
  }
  catch (error) {
    return res.end(`fail:with:${action}`)
  }
}
