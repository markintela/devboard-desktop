import { spawn, exec, type ChildProcess } from "child_process";
import fs from "fs";
import path from "path";
import { shell } from "electron";
import type { AppError, TechId } from "./types";

export type ProjectStatus = "starting" | "running" | "stopped";

interface RunningEntry {
  child: ChildProcess;
  status: "starting" | "running";
  startupTimer: ReturnType<typeof setTimeout>;
}

// Se o processo não imprimir uma URL reconhecível nesse tempo (ex.: um
// programa Go sem servidor HTTP), assumimos que ele já subiu mesmo assim
// — senão o status ficaria preso em "starting" pra sempre.
const STARTUP_FALLBACK_MS = 12000;

const running = new Map<string, RunningEntry>();
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

// Vite (e a maioria dos dev servers) colore a saída do terminal com códigos
// ANSI, e costuma inserir um desses códigos (ex.: negrito) bem no meio da
// URL — entre "localhost:" e a porta. Sem remover isso antes do regex, a
// URL capturada vinha com os códigos de escape misturados dentro dela.
function stripAnsiCodes(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

// Checa se o projeto .NET tem o Swashbuckle (pacote padrão de Swagger/OpenAPI
// do ASP.NET Core) referenciado no .csproj, pra só abrir o Swagger sozinho
// quando ele realmente existir — senão o navegador abriria um 404.
function hasSwaggerConfigured(projectPath: string): boolean {
  try {
    const entries = fs.readdirSync(projectPath);
    const csprojFile = entries.find(e => e.toLowerCase().endsWith(".csproj"));
    if (!csprojFile) return false;
    const content = fs.readFileSync(path.join(projectPath, csprojFile), "utf-8");
    return /swashbuckle|swagger/i.test(content);
  } catch {
    return false;
  }
}

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
  return running.get(projectPath)?.status ?? "stopped";
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

  const isDotnetProject = technologies.includes("dotnet") || technologies.includes("csharp");
  const swaggerEnabled = isDotnetProject && hasSwaggerConfigured(projectPath);

  const child = spawn(command.command, command.args, {
    cwd: projectPath,
    shell: true,
    // No POSIX, o processo vira líder de um novo grupo — matamos o grupo
    // inteiro ao parar (senão o dev server sobrevive como órfão do shell).
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  const markRunning = () => {
    const entry = running.get(projectPath);
    if (entry && entry.status === "starting") {
      entry.status = "running";
      clearTimeout(entry.startupTimer);
      onStatusChange?.(projectPath, "running");
    }
  };

  const startupTimer = setTimeout(markRunning, STARTUP_FALLBACK_MS);

  running.set(projectPath, { child, status: "starting", startupTimer });
  onStatusChange?.(projectPath, "starting");

  const scanForUrl = (chunk: Buffer) => {
    if (detectedUrls.has(projectPath)) return;
    const text = stripAnsiCodes(chunk.toString("utf-8"));
    const match = text.match(URL_PATTERN);
    if (match) {
      const url = match[0].replace(/[/.,;]+$/, "");
      detectedUrls.set(projectPath, url);
      markRunning();
      onUrlChange?.(projectPath, url);
      if (swaggerEnabled) {
        shell.openExternal(`${url}/swagger`);
      }
    }
  };
  child.stdout?.on("data", scanForUrl);
  child.stderr?.on("data", scanForUrl);

  const clear = () => {
    const entry = running.get(projectPath);
    if (entry && entry.child === child) {
      clearTimeout(entry.startupTimer);
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
  const entry = running.get(projectPath);
  if (!entry || entry.child.pid == null) {
    running.delete(projectPath);
    detectedUrls.delete(projectPath);
    return { ok: true };
  }

  clearTimeout(entry.startupTimer);

  if (process.platform === "win32") {
    // taskkill /t mata a árvore inteira — spawn com shell:true cria um
    // cmd.exe intermediário, e child.kill() sozinho não derruba os netos.
    exec(`taskkill /pid ${entry.child.pid} /t /f`);
  } else {
    try {
      process.kill(-entry.child.pid, "SIGTERM");
    } catch {
      entry.child.kill("SIGTERM");
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
