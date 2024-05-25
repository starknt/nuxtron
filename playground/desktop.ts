import '#internal/nuxtron'
import { BrowserWindow, app } from 'electron'
import { isElevated } from 'native-is-elevated-rs'

let win: BrowserWindow

app.whenReady()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(isElevated())
    win = new BrowserWindow({
      webPreferences: {
        devTools: true,
      },
    })
    win.once('ready-to-show', () => {
      win.webContents.openDevTools({
        mode: 'detach',
      })
    })
    if (import.meta.dev)
      win.loadURL('http://localhost:3000')
    else
      win.loadURL('nitro://localhost:3000')
  })
