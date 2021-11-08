const {
    app,
    BrowserWindow,
    ipcMain,
    Menu,
    globalShortcut,
    shell,
    dialog
} = require('electron');
const path = require('path');
const electronReload = require ('electron-reload')
require('electron-reload')(__dirname,{
    electron: require(`${__dirname}/node_modules/electron`)
});
const os = require('os');
const fs = require('fs')
const Store = require('./Store')

const preferences = new Store({
    configName:'user-preferences',
    defaults:{
        destination: path.join(os.homedir(),'files')
    }
})

let destination = preferences.get("destination")
const isDev =
    process.env.NODE_ENV !== undefined && process.env.NODE_ENV === "dev" ?
    true :
    false;

const isMac = process.platform === 'darwin' ? true : false;

function createPreferenceWindow() {
    const preferenceWindow = new BrowserWindow({
        width: isDev ? 950 : 500,
        height: 150,
        resizable: isDev ? true : false,
        backgroundColor: "#234",
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, "assets", "icons", "icon.png"),
    });

    preferenceWindow.loadFile('./src/preferences/index.html')

    preferenceWindow.once('ready-to-show', () => {
        preferenceWindow.show();
        if (isDev) {
            preferenceWindow.webContents.openDevTools();
        }
        preferenceWindow.webContents.send("dest-path-update", destination)
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: isDev ? 950 : 500,
        height: 300,
        resizable: isDev ? true : false,
        backgroundColor: "#234",
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, "assets", "icons", "icon.png"),
    });


    win.loadFile("./src/mainWindow/index.html");
    win.webContents.openDevTools();
    if (isDev) {
        win.webContents.openDevTools();
        console.log("Ok")
    }


    win.once('ready-to-show', () => {
        win.show();
    })
    const menuTemplate = [{
        label: app.name,
        submenu: [{
                label: "Preferences",
                click: () => {
                    createPreferenceWindow()
                }
            },
            {
                label: "Open destination folder",
                click: () => {
                    shell.openPath(destination)
                }
            },
            {
                label: 'File',
                submenu: [
                    isMac ? {
                        role: 'close'
                    } : {
                        role: 'quit'
                    }
                ]
            }
        ]
    }];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu)

}


app.whenReady().then(() => {
    createWindow();
})

app.on('will-quit', () => {})

app.on('window-all-closed', () => {
    console.log('All windows close');
    if (!isMac) {
        app.quit();
    }

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })

});

ipcMain.on('open_new_window', () => {
    createWindow();
})

ipcMain.on("save_buffer", (e, Buffer) => {
    const filePath = path.join(destination, `${Date.now()}`)
    fs.writeFileSync(`${filePath}.webm`, Buffer)
})

ipcMain.handle("show-dialog", async (event) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    const dirPath = result.filePaths[0];
    preferences.set("destination", dirPath)
    destination = preferences.get("destination")
    return destination
})