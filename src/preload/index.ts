import { contextBridge, ipcRenderer } from "electron";
import type { AppError, ScanResult, TechId } from "../main/lib/types";

export interface OpenEditorPayload {
  path: string;
  editor: "vscode" | "visualstudio" | "fork" | "explorer";
  solutionPath: string | null;
}

export interface OpenEditorResult {
  ok: boolean;
  error?: AppError;
}

export type ProjectStatus = "starting" | "running" | "stopped";

export interface RunProjectResult {
  ok: boolean;
  error?: AppError;
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
  runProject: (path: string, technologies: TechId[]): Promise<RunProjectResult> =>
    ipcRenderer.invoke("devboard:run-project", { path, technologies }),
  stopProject: (path: string): Promise<{ ok: boolean }> => ipcRenderer.invoke("devboard:stop-project", { path }),
  getProjectStatus: (path: string): Promise<{ status: ProjectStatus }> =>
    ipcRenderer.invoke("devboard:project-status", { path }),
  onProjectStatusChange: (callback: (path: string, status: ProjectStatus) => void): (() => void) => {
    const listener = (_event: unknown, payload: { path: string; status: ProjectStatus }) =>
      callback(payload.path, payload.status);
    ipcRenderer.on("devboard:project-status-changed", listener);
    return () => ipcRenderer.removeListener("devboard:project-status-changed", listener);
  },
  getProjectUrl: (path: string): Promise<{ url: string | null }> =>
    ipcRenderer.invoke("devboard:project-url", { path }),
  onProjectUrlChange: (callback: (path: string, url: string | null) => void): (() => void) => {
    const listener = (_event: unknown, payload: { path: string; url: string | null }) =>
      callback(payload.path, payload.url);
    ipcRenderer.on("devboard:project-url-changed", listener);
    return () => ipcRenderer.removeListener("devboard:project-url-changed", listener);
  },
  listImprovements: (path: string, name: string): Promise<string[]> =>
    ipcRenderer.invoke("devboard:list-improvements", { path, name }),
  addImprovement: (path: string, name: string, text: string): Promise<string[]> =>
    ipcRenderer.invoke("devboard:add-improvement", { path, name, text }),
  removeImprovement: (path: string, name: string, index: number): Promise<string[]> =>
    ipcRenderer.invoke("devboard:remove-improvement", { path, name, index }),
};

contextBridge.exposeInMainWorld("devboard", api);

export type DevboardApi = typeof api;
