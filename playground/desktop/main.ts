import '#internal/nuxtron'
import { BrowserWindow, app } from 'electron'

let win: BrowserWindow

app.whenReady()
  .then(() => {
    win = new BrowserWindow()
    win.webContents.openDevTools({
      mode: 'detach',
    })
    win.loadURL('http://localhost:3000')
  })
