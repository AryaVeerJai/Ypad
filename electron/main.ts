
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain
} from "electron";

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;

// --------------------------------------------------
// Create application window
// --------------------------------------------------

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
      preload: path.join(__dirname, "preload.mjs"),

      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    // Development mode
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Production mode
    mainWindow.loadFile(
      path.join(__dirname, "../dist/index.html")
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// --------------------------------------------------
// File filters
// --------------------------------------------------

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

// --------------------------------------------------
// Open file
// --------------------------------------------------

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

// --------------------------------------------------
// Save file
// --------------------------------------------------

ipcMain.handle(
  "file:save",
  async (
    _event,
    filePath: string | null,
    content: string,
    saveAs: boolean
  ) => {

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

    if (
      typeof destination !== "string" ||
      destination.trim().length === 0
    ) {
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

// --------------------------------------------------
// Application lifecycle
// --------------------------------------------------

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
