import { contextBridge, ipcRenderer } from "electron";
import type { ScanResult } from "../main/lib/types";

export interface OpenEditorPayload {
  path: string;
  editor: "vscode" | "visualstudio" | "fork" | "explorer" | "powershell";
  solutionPath: string | null;
}

export interface OpenEditorResult {
  ok: boolean;
  error?: string;
}

const api = {
  scanFolder: (root: string): Promise<ScanResult> => ipcRenderer.invoke("devboard:scan-folder", root),
  openEditor: (payload: OpenEditorPayload): Promise<OpenEditorResult> =>
    ipcRenderer.invoke("devboard:open-editor", payload),
  chooseFolder: (): Promise<string | null> => ipcRenderer.invoke("devboard:choose-folder"),
  windowMinimize: (): void => ipcRenderer.send("devboard:window-minimize"),
  windowToggleFullscreen: (): void => ipcRenderer.send("devboard:window-toggle-fullscreen"),
  windowClose: (): void => ipcRenderer.send("devboard:window-close"),
  windowIsFullscreen: (): Promise<boolean> => ipcRenderer.invoke("devboard:window-is-fullscreen"),
  getAutoStart: (): Promise<boolean> => ipcRenderer.invoke("devboard:get-auto-start"),
  setAutoStart: (enabled: boolean): Promise<boolean> => ipcRenderer.invoke("devboard:set-auto-start", enabled),
  onFullscreenChange: (callback: (isFullscreen: boolean) => void): (() => void) => {
    const listener = (_event: unknown, value: boolean) => callback(value);
    ipcRenderer.on("devboard:fullscreen-changed", listener);
    return () => ipcRenderer.removeListener("devboard:fullscreen-changed", listener);
  },
};

contextBridge.exposeInMainWorld("devboard", api);

export type DevboardApi = typeof api;
