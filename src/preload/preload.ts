import { contextBridge, ipcRenderer, webUtils } from "electron";
import type { SaveEditRequest, SaveInfo } from "../shared/saveFormat.js";

export type SaveEditorApi = {
  openSave: () => Promise<SaveInfo | null>;
  openSavePath: (filePath: string) => Promise<SaveInfo>;
  getPathForFile: (file: File) => string;
  writeEditedOriginal: (request: { filePath: string; edits: SaveEditRequest }) => Promise<SaveInfo>;
};

const api: SaveEditorApi = {
  openSave: () => ipcRenderer.invoke("save:open"),
  openSavePath: (filePath) => ipcRenderer.invoke("save:openPath", filePath),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  writeEditedOriginal: (request) => ipcRenderer.invoke("save:writeEditedOriginal", request)
};

contextBridge.exposeInMainWorld("g3p2SaveEditor", api);
