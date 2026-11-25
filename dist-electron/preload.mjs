"use strict";
const electron = require("electron");
const desktopAPI = {
  openFile: () => {
    return electron.ipcRenderer.invoke("file:open");
  },
  saveFile: (filePath, content, saveAs) => {
    return electron.ipcRenderer.invoke(
      "file:save",
      filePath,
      content,
      saveAs
    );
  }
};
electron.contextBridge.exposeInMainWorld("desktop", desktopAPI);
