import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from "electron";
import { join } from "path";
import { is } from "./lib/env";
import { scanFolder } from "./lib/scan";
import { openInEditor, type EditorTarget } from "./lib/open-editor";
import {
  runProject,
  stopProject,
  getStatus,
  getUrl,
  setStatusChangeListener,
  setUrlChangeListener,
  stopAllProjects,
} from "./lib/run-project";
import { listImprovements, addImprovement, removeImprovement } from "./lib/improvements";
import type { TechId } from "./lib/types";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    show: false,
    frame: false,
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: "#0d0f14",
    title: "DevBoard",
    icon: join(__dirname, "../../resources/icon.png"),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.on("before-input-event", (_event, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "Escape") {
      mainWindow.setFullScreen(false);
    } else if (input.key === "F11") {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  mainWindow.on("enter-full-screen", () => {
    mainWindow.webContents.send("devboard:fullscreen-changed", true);
  });
  mainWindow.on("leave-full-screen", () => {
    mainWindow.webContents.send("devboard:fullscreen-changed", false);
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  app.setAppUserModelId("com.devboard.desktop");

  ipcMain.handle("devboard:get-auto-start", () => {
    if (!app.isPackaged) return false;
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle("devboard:set-auto-start", (_event, enabled: boolean) => {
    if (!app.isPackaged) return false;
    app.setLoginItemSettings({ openAtLogin: enabled, path: process.execPath });
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle("devboard:scan-folder", async (_event, root: string) => {
    return scanFolder(root);
  });

  ipcMain.handle(
    "devboard:open-editor",
    async (event, payload: { path: string; editor: EditorTarget; solutionPath: string | null }) => {
      // O fullscreen do Electron no Windows ocupa a tela inteira de forma
      // exclusiva e pode impedir QUALQUER outra janela (Fork, Explorador,
      // etc.) de aparecer por cima. Sai do fullscreen antes de abrir uma
      // ferramenta externa pra garantir que a janela dela apareça.
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win?.isFullScreen()) {
        win.setFullScreen(false);
      }
      return openInEditor(payload);
    }
  );

  ipcMain.handle("devboard:choose-folder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      title: "Escolha a pasta com seus projetos",
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.on("devboard:window-minimize", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.on("devboard:window-toggle-fullscreen", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.setFullScreen(!win.isFullScreen());
  });

  ipcMain.on("devboard:window-close", (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  ipcMain.handle("devboard:window-is-fullscreen", (event) => {
    return BrowserWindow.fromWebContents(event.sender)?.isFullScreen() ?? false;
  });

  setStatusChangeListener((projectPath, status) => {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send("devboard:project-status-changed", { path: projectPath, status });
    }
  });

  setUrlChangeListener((projectPath, url) => {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send("devboard:project-url-changed", { path: projectPath, url });
    }
  });

  ipcMain.handle("devboard:run-project", (_event, payload: { path: string; technologies: TechId[] }) => {
    return runProject(payload.path, payload.technologies);
  });

  ipcMain.handle("devboard:stop-project", (_event, payload: { path: string }) => {
    return stopProject(payload.path);
  });

  ipcMain.handle("devboard:project-status", (_event, payload: { path: string }) => {
    return { status: getStatus(payload.path) };
  });

  ipcMain.handle("devboard:project-url", (_event, payload: { path: string }) => {
    return { url: getUrl(payload.path) };
  });

  ipcMain.handle("devboard:list-improvements", (_event, payload: { path: string; name: string }) => {
    return listImprovements(payload.path, payload.name);
  });

  ipcMain.handle(
    "devboard:add-improvement",
    (_event, payload: { path: string; name: string; text: string }) => {
      return addImprovement(payload.path, payload.name, payload.text);
    }
  );

  ipcMain.handle(
    "devboard:remove-improvement",
    (_event, payload: { path: string; name: string; index: number }) => {
      return removeImprovement(payload.path, payload.name, payload.index);
    }
  );

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopAllProjects();
});
