import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import { rename, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applySaveEdits, parseSave, SaveEditRequest } from "../shared/saveFormat.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1060,
    minWidth: 1500,
    minHeight: 620,
    backgroundColor: "#f7f9fa",
    title: "G3P2 Save Editor",
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (isDev) {
    await mainWindow.loadURL("http://localhost:5173");
  } else {
    await mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  createAppMenu();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});

function createAppMenu(): void {
  const fileMenu = Menu.buildFromTemplate([
    {
      label: "파일",
      submenu: [
        {
          label: "불러오기",
          accelerator: "CmdOrCtrl+O",
          click: () => mainWindow?.webContents.send("menu:openSave")
        },
        {
          label: "저장",
          accelerator: "CmdOrCtrl+S",
          click: () => mainWindow?.webContents.send("menu:save")
        },
        { type: "separator" },
        {
          label: "종료",
          role: "quit"
        }
      ]
    }
  ]);
  const defaultMenu = Menu.getApplicationMenu() ?? Menu.buildFromTemplate([]);
  const preservedItems = defaultMenu.items.slice(1).map((item) => item);

  Menu.setApplicationMenu(Menu.buildFromTemplate([...fileMenu.items, ...preservedItems]));
}

ipcMain.handle("save:open", async () => {
  const options = {
    title: "세이브 파일 열기",
    filters: [{ name: "G3P2 Save", extensions: ["sav"] }],
    properties: ["openFile"]
  } satisfies Electron.OpenDialogOptions;
  const result = mainWindow
    ? await dialog.showOpenDialog(mainWindow, options)
    : await dialog.showOpenDialog(options);

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const data = await readFile(filePath);
  return parseSave(data, filePath);
});

ipcMain.handle("save:openPath", async (_event, filePath: string) => {
  const data = await readFile(filePath);
  return parseSave(data, filePath);
});

ipcMain.handle(
  "save:writeEditedOriginal",
  async (_event, request: { filePath: string; edits: SaveEditRequest }) => {
    const source = await readFile(request.filePath);
    const data = new Uint8Array(source);
    applySaveEdits(data, request.edits);

    const targetPath = getCanonicalSavePath(request.filePath);
    const backupPath = `${targetPath}.${formatTimestamp(new Date())}`;

    try {
      await rename(targetPath, backupPath);
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
      if (code !== "ENOENT") {
        throw error;
      }
    }

    await writeFile(targetPath, data);
    return {
      save: parseSave(data, targetPath),
      backupPath
    };
  }
);

function getCanonicalSavePath(filePath: string): string {
  const match = filePath.match(/^(.*\.sav)(?:\.\d{14})?$/i);
  if (!match) {
    throw new Error("G3P_II*.sav 또는 .sav.년월일시분초 파일만 저장할 수 있습니다.");
  }
  return match[1];
}

function formatTimestamp(date: Date): string {
  const parts = [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  ];

  return `${parts[0]}${pad2(parts[1])}${pad2(parts[2])}${pad2(parts[3])}${pad2(parts[4])}${pad2(parts[5])}`;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
