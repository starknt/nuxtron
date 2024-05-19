import '#internal/nuxtron'
import { BrowserWindow, app } from 'electron'

let win: BrowserWindow

app.whenReady()
  .then(() => {
    win = new BrowserWindow()
    win.webContents.openDevTools({
      mode: 'detach',
    })
    if (import.meta.dev)
      win.loadURL('http://localhost:3000')
    else
      win.loadURL('nitro://localhost:3000')
  })
