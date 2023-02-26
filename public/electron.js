const { app, BrowserWindow } = require('electron')
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
            contextIsolation: false
        },
    })

    // In production, set the initial browser path to the local bundle generated
    // by the Create React App build process.
    // In development, set it to localhost to allow live/hot-reloading.
    const appURL = app.isPackaged
    ? url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
        })
    : "http://localhost:3000";
    
    mainWindow.loadURL(appURL);
    
    // if (!app.isPackaged) {
        mainWindow.webContents.openDevTools();
    // }

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    console.log('ok')
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

require('./ipc/calibration');
require('./ipc/eyetracking');
