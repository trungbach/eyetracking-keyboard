const { app, BrowserWindow, ipcMain } = require('electron')
const url = require('url')
const path = require('path')
let mainWindow

// Electron window params, we can config this to better fit the use of our app.
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            // enableRemoteModule: true
        },
    })

    // Load html from environment variable, else from html dist file.
    mainWindow.loadURL(
        process.env.ELECTRON_START_URL ||
        url.format({
            pathname: path.join(__dirname, '../build/index.html'),
            protocol: 'file:',
            slashes: true,
        })
    )

    mainWindow.on('closed', () => {
        mainWindow = null
    })

     // Open the DevTools.
     mainWindow.webContents.openDevTools()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

/**
 * Register IPC hooks.
 */
require('./ipc/eyetracking');
require('./ipc/calibrate');