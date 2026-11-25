import { ipcMain, app, BrowserWindow, dialog } from "electron";
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1250,
    height: 820,
    minWidth: 800,
    minHeight: 550,
    title: "Ypad",
    backgroundColor: "#ffffff",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname$1, "../dist/index.html")
    );
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
const fileFilters = [
  {
    name: "Text Files",
    extensions: ["txt"]
  },
  {
    name: "JavaScript",
    extensions: ["js", "jsx"]
  },
  {
    name: "TypeScript",
    extensions: ["ts", "tsx"]
  },
  {
    name: "JSON",
    extensions: ["json"]
  },
  {
    name: "HTML",
    extensions: ["html", "htm"]
  },
  {
    name: "CSS",
    extensions: ["css"]
  },
  {
    name: "Markdown",
    extensions: ["md", "markdown"]
  },
  {
    name: "All Files",
    extensions: ["*"]
  }
];
ipcMain.handle("file:open", async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Open File",
    properties: ["openFile"],
    filters: fileFilters
  });
  if (result.canceled || !result.filePaths.length) {
    return null;
  }
  const filePath = result.filePaths[0];
  try {
    const content = await readFile(filePath, "utf8");
    return {
      path: filePath,
      name: path.basename(filePath),
      content
    };
  } catch (error) {
    console.error("File read error:", error);
    throw new Error("Unable to open the selected file.");
  }
});
ipcMain.handle(
  "file:save",
  async (_event, filePath, content, saveAs) => {
    if (typeof content !== "string") {
      throw new Error("Invalid file content.");
    }
    let destination = saveAs ? null : filePath;
    if (!destination) {
      if (!mainWindow) return null;
      const result = await dialog.showSaveDialog(mainWindow, {
        title: "Save File",
        defaultPath: "Untitled.txt",
        filters: fileFilters
      });
      if (result.canceled || !result.filePath) {
        return null;
      }
      destination = result.filePath;
    }
    if (typeof destination !== "string" || destination.trim().length === 0) {
      throw new Error("Invalid destination.");
    }
    try {
      await writeFile(destination, content, "utf8");
      return {
        path: destination,
        name: path.basename(destination)
      };
    } catch (error) {
      console.error("File save error:", error);
      throw new Error("Unable to save the file.");
    }
  }
);
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
