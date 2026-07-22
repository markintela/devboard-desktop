import { exec, execFile, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { shell } from "electron";

export type EditorTarget = "vscode" | "visualstudio" | "fork" | "explorer" | "powershell";

interface OpenPayload {
  path: string;
  editor: EditorTarget;
  solutionPath: string | null;
}

interface OpenResult {
  ok: boolean;
  error?: string;
}

function run(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function runFile(file: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(file, args, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

// Lança um processo destacado (sobrevive ao fechamento do DevBoard) e só
// resolve quando o SO confirma que o processo realmente subiu — spawn()
// não lança exceção síncrona em falhas como ENOENT, então sem isso o
// erro passava despercebido e a chamada reportava sucesso mesmo sem abrir nada.
function spawnDetached(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      detached: true,
      stdio: "ignore",
      windowsHide: false,
    });
    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}

function resolveForkExecutable(): string | null {
  if (process.platform !== "win32") return null;

  const candidates: string[] = [];
  const localAppData = process.env["LOCALAPPDATA"];
  const programFiles = process.env["ProgramFiles"];
  const programFilesX86 = process.env["ProgramFiles(x86)"];

  if (localAppData) {
    const forkDir = path.join(localAppData, "Fork");
    candidates.push(path.join(forkDir, "Fork.exe"));
    // Layout padrão do instalador do Fork: %LOCALAPPDATA%\Fork\current\Fork.exe
    candidates.push(path.join(forkDir, "current", "Fork.exe"));
    try {
      const entries = fs.readdirSync(forkDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith("app-")) {
          candidates.push(path.join(forkDir, entry.name, "Fork.exe"));
        }
      }
    } catch {
      // Fork não instalado em %LOCALAPPDATA%\Fork — segue tentando os outros caminhos.
    }
  }
  if (programFiles) candidates.push(path.join(programFiles, "Fork", "Fork.exe"));
  if (programFilesX86) candidates.push(path.join(programFilesX86, "Fork", "Fork.exe"));

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

export async function openInEditor(payload: OpenPayload): Promise<OpenResult> {
  const { path: projectPath, editor, solutionPath } = payload;

  if (!projectPath || !fs.existsSync(projectPath)) {
    return { ok: false, error: "Pasta do projeto não encontrada." };
  }

  if (editor === "vscode") {
    try {
      // `code` (VS Code CLI) precisa estar no PATH — no VS Code:
      // Ctrl+Shift+P → "Shell Command: Install 'code' command in PATH".
      await run(`code "${projectPath}"`);
      return { ok: true };
    } catch {
      return {
        ok: false,
        error:
          "Não foi possível abrir o VS Code. Verifique se o comando 'code' está instalado no PATH (Ctrl+Shift+P → 'Shell Command: Install code command in PATH').",
      };
    }
  }

  if (editor === "visualstudio") {
    if (process.platform !== "win32") {
      return { ok: false, error: "O Visual Studio só pode ser aberto a partir do Windows." };
    }
    if (!solutionPath || !fs.existsSync(solutionPath)) {
      return { ok: false, error: "Nenhum arquivo .sln foi encontrado nesta pasta." };
    }
    try {
      // Usa a associação de arquivo padrão do Windows para .sln (normalmente o devenv.exe).
      const errorMessage = await shell.openPath(solutionPath);
      if (errorMessage) return { ok: false, error: errorMessage };
      return { ok: true };
    } catch {
      return { ok: false, error: "Não foi possível abrir o Visual Studio." };
    }
  }

  if (editor === "fork") {
    const forkExe = resolveForkExecutable();
    try {
      if (forkExe) {
        await spawnDetached(forkExe, [projectPath], projectPath);
      } else {
        // Sem instalação encontrada em %LOCALAPPDATA%\Fork ou Program Files:
        // tenta o comando "fork" do PATH (Preferences → Integration → Install Command Line Tool).
        await runFile("fork", [projectPath]);
      }
      return { ok: true };
    } catch {
      return {
        ok: false,
        error:
          "Não foi possível abrir o Fork. Verifique se ele está instalado, ou habilite a ferramenta de linha de comando em Preferences → Integration → Install Command Line Tool.",
      };
    }
  }

  if (editor === "explorer") {
    try {
      const errorMessage = await shell.openPath(projectPath);
      if (errorMessage) return { ok: false, error: errorMessage };
      return { ok: true };
    } catch {
      return { ok: false, error: "Não foi possível abrir o Explorador de Arquivos." };
    }
  }

  if (editor === "powershell") {
    if (process.platform !== "win32") {
      return { ok: false, error: "O PowerShell só pode ser aberto a partir do Windows." };
    }
    try {
      const escapedPath = projectPath.replace(/'/g, "''");
      await spawnDetached(
        "powershell.exe",
        ["-NoExit", "-Command", `Set-Location -LiteralPath '${escapedPath}'`],
        projectPath
      );
      return { ok: true };
    } catch {
      return { ok: false, error: "Não foi possível abrir o PowerShell." };
    }
  }

  return { ok: false, error: "Editor desconhecido." };
}
