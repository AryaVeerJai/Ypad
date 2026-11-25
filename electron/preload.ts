
import {
  contextBridge,
  ipcRenderer
} from "electron";

export interface OpenedFile {
  path: string;
  name: string;
  content: string;
}

export interface SavedFile {
  path: string;
  name: string;
}

const desktopAPI = {
  openFile: (): Promise<OpenedFile | null> => {
    return ipcRenderer.invoke("file:open");
  },

  saveFile: (
    filePath: string | null,
    content: string,
    saveAs: boolean
  ): Promise<SavedFile | null> => {
    return ipcRenderer.invoke(
      "file:save",
      filePath,
      content,
      saveAs
    );
  }
};

contextBridge.exposeInMainWorld("desktop", desktopAPI);
