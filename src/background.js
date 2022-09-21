'use strict';
import { app, protocol, BrowserWindow, ipcMain, dialog, screen, clipboard } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import Fs from 'fs';
import path from 'path';
import lodash from 'lodash';
import axios from 'axios';
import Store from 'electron-store';
import findProcess from 'find-process';
import killPort from 'kill-port';
const store = new Store();
const os = require('os');
const ProxyChain = require('./plugins/proxy-chain/dist');

const { networkInterfaces } = require('os');
const isDevelopment = process.env.NODE_ENV !== 'production';
process.setMaxListeners(Infinity); // <== Important line
let win = null;
let ipLocal = null;
let ipPublic = null;
let listServerLocal = [];

protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: {
            secure: true,
            standard: true,
        },
    },
]);

//=================================
function getPricateIp() {
    let nets = networkInterfaces();
    let resultsGetIpLocal = Object.create(null); // Or just '{}', an empty object
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!resultsGetIpLocal[name]) {
                    resultsGetIpLocal[name] = [];
                }
                resultsGetIpLocal[name].push(net.address);
            }
        }
    }
    return resultsGetIpLocal['Ethernet'][0];
}

async function getPubicIp() {
    let res = await axios.get('http://lumtest.com/myip.json', {
        timeout: 10 * 1000,
    });
    if (res && res.status === 200 && res.data && res.data.ip && res.data.geo && res.data.geo.tz) {
        return res.data.ip;
    }
    return null;
}

function logApp(name, value) {
    console.log(name, value ? value : '');
    if (win) {
        win.webContents.send('writeLog', name + (value ? value : ''));
    }
}

async function killServerRunning(portLocal) {
    let indexOfCurrentServer = listServerLocal.findIndex(item => {
        if (item.portLocal === portLocal) {
            return true;
        }
        return false;
    })
    if (indexOfCurrentServer != -1) {
        await listServerLocal[indexOfCurrentServer].server.close(true, () => {
            console.log('Proxy server was closed.');
        });
        indexOfCurrentServer = listServerLocal.findIndex(item => {
            if (item.portLocal === portLocal) {
                return true;
            }
            return false;
        })
        listServerLocal.splice(indexOfCurrentServer, 1);
    }
}

function listenActions() {
    ipcMain.on('create-server-proxy', async function (event, arg) {
        await killServerRunning(arg.portLocal);
        let server = new ProxyChain.Server({
            port: arg.portLocal,
            verbose: true,
            prepareRequestFunction: ({ request, username, password, hostname, port, isHttp, connectionId }) => {
                return {
                    upstreamProxyUrl: arg.proxyUpstream,
                    failMsg: 'Bad username or password, please try again.',
                };
            },
        });
        server.listen(() => {
            listServerLocal.push({
                server,
                portLocal: arg.portLocal,
            })
            event.returnValue = {
                portLocal: arg.portLocal,
                proxyLocal: ipLocal + ':' + arg.portLocal,
            };
        });
    });
    ipcMain.on('reset-server-proxy', async function (event, arg) {
        console.log(' ### reset-server-proxy arg: ', arg);
        await killServerRunning(arg.portLocal);
        let server = new ProxyChain.Server({
            port: arg.portLocal,
            verbose: true,
            prepareRequestFunction: ({ request, username, password, hostname, port, isHttp, connectionId }) => {
                return {
                    upstreamProxyUrl: arg.proxyUpstream,
                    failMsg: 'Bad username or password, please try again.',
                };
            },
        });
        server.listen(() => {
            listServerLocal.push({
                server,
                portLocal: arg.portLocal,
            })
            event.returnValue = {
                portLocal: arg.portLocal,
                proxyLocal: ipLocal + ':' + arg.portLocal
            };
        });
    });

    ipcMain.on('get-private-ip', (event, arg)=> {
        event.returnValue = ipLocal;
    })


}

async function initApp() {
    try {
        logApp(' =================== init App ================== ');
        let appPath = isDevelopment ? __dirname : __static.replace('app.asar', '');
        let fileAudioSuccess = path.join(isDevelopment ? __dirname.replace('dist_electron', '') : appPath, 'Success.mp3');
        ipLocal = getPricateIp();
        listenActions();
    } catch (error) {
        console.log(' =========== initApp Error ========== ');
        logApp(error);
        console.log(error);
        writeError(' 9999 error: ', error.toString());
    }
}

async function initControlFile(mainWindow) {
    ipcMain.on('File-OpenFile', async function (event, arg) {
        let result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                {
                    name: 'Database',
                    extensions: ['db'],
                },
            ],
        });
        if (result.canceled === false) {
            return (event.returnValue = result.filePaths[0]);
        }
        return (event.returnValue = '');
    });
    ipcMain.on('File-OpenFolder', async function (event, arg) {
        let result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
            // filters: [{ name: 'Database bacnt2412', extensions: ['bacnt2412'] }],
        });
        if (result.canceled === false) {
            return (event.returnValue = result.filePaths[0]);
        }
        return (event.returnValue = '');
    });
}

async function createWindow() {
    ipPublic = await getPubicIp();
    // Create the browser window.
    win = new BrowserWindow({
        width: 1600,
        height: 1200,
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            // contextIsolation: process.env.ELECTRON_NODE_INTEGRATION,
            nodeIntegration: true, // This value is fetched from vue.config.js
            contextIsolation: false,
            nodeIntegrationInWorker: true,
        },
        icon: 'app-icon.ico',
        autoHideMenuBar: true,
        title: 'DTProxy Tool'
    });
    // win.setMenu(null);
    // win.setAutoHideMenuBar(true);
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
        createProtocol('app');
        // Load the index.html when not in development
        await win.loadURL('app://./index.html');
    }
    // init
    await initControlFile(win);
    await initApp();
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS, {
                allowFileAccess: true,
            });
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString());
        }
    }
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit();
            }
        });
    } else {
        process.on('SIGTERM', () => {
            app.quit();
        });
    }
}

// autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
// 	const dialogOpts = {
// 		type: 'info',
// 		buttons: ['Ok'],
// 		title: 'Application Update',
// 		message: process.platform === 'win32' ? releaseNotes : releaseName,
// 		detail: 'A new version is being downloaded.'
// 	}
// 	dialog.showMessageBox(dialogOpts, (response) => {

// 	});
// })

// autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
// 	const dialogOpts = {
// 		type: 'info',
// 		buttons: ['Restart', 'Later'],
// 		title: 'Application Update',
// 		message: process.platform === 'win32' ? releaseNotes : releaseName,
// 		detail: 'A new version has been downloaded. Restart the application to apply the updates.'
// 	};
// 	dialog.showMessageBox(dialogOpts).then((returnValue) => {
// 		if (returnValue.response === 0) autoUpdater.quitAndInstall()
// 	})
// });