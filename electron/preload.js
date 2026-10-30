const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,
  scanDocument: (options) => ipcRenderer.invoke("scan-document", options),
});

