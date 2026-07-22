import { exec, execFile, execFileSync, spawn } from "child_process";
import fs from "fs";
import path from "path";
import { shell } from "electron";
import type { AppError } from "./types";

export type EditorTarget = "vscode" | "visualstudio" | "fork" | "explorer";

interface OpenPayload {
  path: string;
  editor: EditorTarget;
  solutionPath: string | null;
}

interface OpenResult {
  ok: boolean;
  error?: AppError;
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

// Localiza o devenv.exe do Visual Studio 2022 especificamente. Com mais de
// uma versão instalada (ex.: 2022 + 2026), a associação de arquivo do
// Windows para .sln/.csproj pode apontar pra outra versão, ou nem estar
// registrada de forma confiável — por isso abrimos o executável direto
// em vez de depender do shell.openPath().
function resolveVisualStudio2022(): string | null {
  if (process.platform !== "win32") return null;

  const programFiles = process.env["ProgramFiles"];
  const programFilesX86 = process.env["ProgramFiles(x86)"];

  const vswhereCandidates = [programFilesX86, programFiles]
    .filter((root): root is string => Boolean(root))
    .map(root => path.join(root, "Microsoft Visual Studio", "Installer", "vswhere.exe"));

  for (const vswhere of vswhereCandidates) {
    if (!fs.existsSync(vswhere)) continue;
    try {
      // Faixa [17.0,18.0) é o Visual Studio 2022 (major version 17.x).
      const output = execFileSync(vswhere, ["-version", "[17.0,18.0)", "-property", "installationPath"], {
        encoding: "utf-8",
      }).trim();
      const installationPath = output.split(/\r?\n/)[0]?.trim();
      if (installationPath) {
        const devenv = path.join(installationPath, "Common7", "IDE", "devenv.exe");
        if (fs.existsSync(devenv)) return devenv;
      }
    } catch {
      // vswhere não encontrou nenhuma instalação do 2022 — segue pro fallback manual.
    }
  }

  const editions = ["Community", "Professional", "Enterprise", "BuildTools"];
  for (const root of [programFiles, programFilesX86].filter((r): r is string => Boolean(r))) {
    for (const edition of editions) {
      const devenv = path.join(root, "Microsoft Visual Studio", "2022", edition, "Common7", "IDE", "devenv.exe");
      if (fs.existsSync(devenv)) return devenv;
    }
  }

  return null;
}

export async function openInEditor(payload: OpenPayload): Promise<OpenResult> {
  const { path: projectPath, editor, solutionPath } = payload;

  if (!projectPath || !fs.existsSync(projectPath)) {
    return { ok: false, error: { code: "projectNotFound" } };
  }

  if (editor === "vscode") {
    try {
      // `code` (VS Code CLI) precisa estar no PATH — no VS Code:
      // Ctrl+Shift+P → "Shell Command: Install 'code' command in PATH".
      await run(`code "${projectPath}"`);
      return { ok: true };
    } catch {
      return { ok: false, error: { code: "vscodeNotFound" } };
    }
  }

  if (editor === "visualstudio") {
    if (process.platform !== "win32") {
      return { ok: false, error: { code: "visualstudioWindowsOnly" } };
    }
    if (!solutionPath || !fs.existsSync(solutionPath)) {
      return { ok: false, error: { code: "noSolutionFile" } };
    }
    const devenv = resolveVisualStudio2022();
    try {
      if (devenv) {
        await spawnDetached(devenv, [solutionPath], projectPath);
      } else {
        // Sem VS 2022 encontrado: cai pra associação de arquivo padrão do Windows.
        const errorMessage = await shell.openPath(solutionPath);
        if (errorMessage) return { ok: false, error: { code: "visualstudioOpenFailed" } };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: { code: "visualstudioOpenFailed" } };
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
      return { ok: false, error: { code: "forkOpenFailed" } };
    }
  }

  if (editor === "explorer") {
    try {
      const errorMessage = await shell.openPath(projectPath);
      if (errorMessage) return { ok: false, error: { code: "explorerOpenFailed" } };
      return { ok: true };
    } catch {
      return { ok: false, error: { code: "explorerOpenFailed" } };
    }
  }

  return { ok: false, error: { code: "unknownEditor" } };
}
