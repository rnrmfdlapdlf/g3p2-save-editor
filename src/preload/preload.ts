import { contextBridge, ipcRenderer, webUtils } from "electron";
import type { SaveEditRequest, SaveInfo } from "../shared/saveFormat.js";

export type SaveWriteResult = {
  save: SaveInfo;
  backupPath: string;
};

export type SaveEditorApi = {
  openSave: () => Promise<SaveInfo | null>;
  openSavePath: (filePath: string) => Promise<SaveInfo>;
  getPathForFile: (file: File) => string;
  writeEditedOriginal: (request: { filePath: string; edits: SaveEditRequest }) => Promise<SaveWriteResult>;
  onOpenSaveRequest: (callback: () => void) => () => void;
  onSaveRequest: (callback: () => void) => () => void;
};

const api: SaveEditorApi = {
  openSave: () => ipcRenderer.invoke("save:open"),
  openSavePath: (filePath) => ipcRenderer.invoke("save:openPath", filePath),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  writeEditedOriginal: (request) => ipcRenderer.invoke("save:writeEditedOriginal", request),
  onOpenSaveRequest: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("menu:openSave", listener);
    return () => ipcRenderer.removeListener("menu:openSave", listener);
  },
  onSaveRequest: (callback) => {
    const listener = () => callback();
    ipcRenderer.on("menu:save", listener);
    return () => ipcRenderer.removeListener("menu:save", listener);
  }
};

contextBridge.exposeInMainWorld("g3p2SaveEditor", api);
