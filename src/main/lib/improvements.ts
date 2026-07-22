import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

// Documents/devboard_improvments é a mesma coisa em Windows (%USERPROFILE%\Documents)
// e macOS (~/Documents) — os.homedir() resolve o usuário certo nos dois.
const IMPROVEMENTS_DIR = path.join(os.homedir(), "Documents", "devboard_improvments");

function ensureDir(): void {
  if (!fs.existsSync(IMPROVEMENTS_DIR)) {
    fs.mkdirSync(IMPROVEMENTS_DIR, { recursive: true });
  }
}

function sanitize(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, "_").trim();
  return cleaned.length > 0 ? cleaned : "projeto";
}

function fileFor(projectPath: string, projectName: string): string {
  const hash = crypto.createHash("md5").update(projectPath).digest("hex").slice(0, 8);
  return path.join(IMPROVEMENTS_DIR, `${sanitize(projectName)}_${hash}.txt`);
}

function parse(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map(line => line.match(/^\d+\.\s*(.*)$/))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map(match => match[1].trim())
    .filter(text => text.length > 0);
}

function serialize(projectName: string, projectPath: string, items: string[]): string {
  const header = `# DevBoard - Melhorias futuras\n# Projeto: ${projectName}\n# Caminho: ${projectPath}\n\n`;
  const body = items.map((item, index) => `${index + 1}. ${item}`).join("\n");
  return header + body + (body.length > 0 ? "\n" : "");
}

export function listImprovements(projectPath: string, projectName: string): string[] {
  const file = fileFor(projectPath, projectName);
  if (!fs.existsSync(file)) return [];
  return parse(fs.readFileSync(file, "utf-8"));
}

export function addImprovement(projectPath: string, projectName: string, text: string): string[] {
  ensureDir();
  const items = listImprovements(projectPath, projectName);
  const trimmed = text.trim();
  if (trimmed.length > 0) {
    items.push(trimmed);
  }
  fs.writeFileSync(fileFor(projectPath, projectName), serialize(projectName, projectPath, items), "utf-8");
  return items;
}

export function removeImprovement(projectPath: string, projectName: string, index: number): string[] {
  ensureDir();
  const items = listImprovements(projectPath, projectName);
  if (index >= 0 && index < items.length) {
    items.splice(index, 1);
  }
  fs.writeFileSync(fileFor(projectPath, projectName), serialize(projectName, projectPath, items), "utf-8");
  return items;
}
