import { spawn, exec, type ChildProcess } from "child_process";
import type { AppError, TechId } from "./types";

export type ProjectStatus = "running" | "stopped";

const running = new Map<string, ChildProcess>();
const detectedUrls = new Map<string, string>();

let onStatusChange: ((projectPath: string, status: ProjectStatus) => void) | null = null;
let onUrlChange: ((projectPath: string, url: string | null) => void) | null = null;

export function setStatusChangeListener(callback: (projectPath: string, status: ProjectStatus) => void): void {
  onStatusChange = callback;
}

export function setUrlChangeListener(callback: (projectPath: string, url: string | null) => void): void {
  onUrlChange = callback;
}

const JS_RUN_TECHS: TechId[] = ["react", "nextjs", "vue", "angular", "svelte", "node", "express", "nestjs"];

// Reconhece o endereço que Vite, Next.js, dotnet e a maioria dos dev
// servers imprimem ao subir (ex: "Local: http://localhost:5173/",
// "Now listening on: https://localhost:5001").
const URL_PATTERN = /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?[^\s"'<>]*/i;

function resolveRunCommand(technologies: TechId[]): { command: string; args: string[] } | null {
  if (technologies.includes("dotnet") || technologies.includes("csharp")) {
    return { command: "dotnet", args: ["run"] };
  }
  if (technologies.includes("go")) {
    return { command: "go", args: ["run", "."] };
  }
  if (technologies.some(tech => JS_RUN_TECHS.includes(tech))) {
    return { command: "npm", args: ["run", "dev"] };
  }
  return null;
}

export function canRun(technologies: TechId[]): boolean {
  return resolveRunCommand(technologies) != null;
}

export function getStatus(projectPath: string): ProjectStatus {
  return running.has(projectPath) ? "running" : "stopped";
}

export function getUrl(projectPath: string): string | null {
  return detectedUrls.get(projectPath) ?? null;
}

export function runProject(projectPath: string, technologies: TechId[]): { ok: boolean; error?: AppError } {
  if (running.has(projectPath)) {
    return { ok: true };
  }

  const command = resolveRunCommand(technologies);
  if (!command) {
    return { ok: false, error: { code: "runUnsupportedTech" } };
  }

  const child = spawn(command.command, command.args, {
    cwd: projectPath,
    shell: true,
    // No POSIX, o processo vira líder de um novo grupo — matamos o grupo
    // inteiro ao parar (senão o dev server sobrevive como órfão do shell).
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  running.set(projectPath, child);
  onStatusChange?.(projectPath, "running");

  const scanForUrl = (chunk: Buffer) => {
    if (detectedUrls.has(projectPath)) return;
    const match = chunk.toString("utf-8").match(URL_PATTERN);
    if (match) {
      const url = match[0].replace(/[/.,;]+$/, "");
      detectedUrls.set(projectPath, url);
      onUrlChange?.(projectPath, url);
    }
  };
  child.stdout?.on("data", scanForUrl);
  child.stderr?.on("data", scanForUrl);

  const clear = () => {
    if (running.get(projectPath) === child) {
      running.delete(projectPath);
      detectedUrls.delete(projectPath);
      onStatusChange?.(projectPath, "stopped");
      onUrlChange?.(projectPath, null);
    }
  };
  child.on("exit", clear);
  child.on("error", clear);

  return { ok: true };
}

export function stopProject(projectPath: string): { ok: boolean } {
  const child = running.get(projectPath);
  if (!child || child.pid == null) {
    running.delete(projectPath);
    detectedUrls.delete(projectPath);
    return { ok: true };
  }

  if (process.platform === "win32") {
    // taskkill /t mata a árvore inteira — spawn com shell:true cria um
    // cmd.exe intermediário, e child.kill() sozinho não derruba os netos.
    exec(`taskkill /pid ${child.pid} /t /f`);
  } else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }

  running.delete(projectPath);
  detectedUrls.delete(projectPath);
  onStatusChange?.(projectPath, "stopped");
  onUrlChange?.(projectPath, null);
  return { ok: true };
}

export function stopAllProjects(): void {
  for (const projectPath of Array.from(running.keys())) {
    stopProject(projectPath);
  }
}
