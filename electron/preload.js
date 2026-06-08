// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  startScan: () => ipcRenderer.invoke("scan:start"),
  stopScan: () => ipcRenderer.invoke("scan:stop"),
  pingHost: (host) => ipcRenderer.invoke("ping:host", host),
  runSpeedTest: () => ipcRenderer.invoke("speedtest:run"),
  openPermissionSettings: () => ipcRenderer.invoke("openPermissionSettings"),
  bonjourCheck: () => ipcRenderer.invoke("bonjour:check"),
  bonjourInstall: () => ipcRenderer.invoke("bonjour:install"),
  appsList: () => ipcRenderer.invoke("apps:list"),
  appsReveal: (name) => ipcRenderer.invoke("apps:reveal", name),
  openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
  onDeviceUpdate: (cb) =>
    ipcRenderer.on("device:update", (_e, data) => cb(data)),
  onDeviceJoin: (cb) => ipcRenderer.on("device:join", (_e, data) => cb(data)),
  onDeviceLeave: (cb) => ipcRenderer.on("device:leave", (_e, data) => cb(data)),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
