import fs from "fs";
import path from "path";
import { detectTechnologies } from "./detect-tech";
import { readGitInfo } from "./git";
import type { ProjectInfo, ScanResult } from "./types";

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".vscode",
  ".idea",
  "dist",
  "build",
  "bin",
  "obj",
  "__pycache__",
  ".venv",
  "venv",
  "target",
]);

export async function scanFolder(root: string): Promise<ScanResult> {
  if (!root) {
    return {
      root: "",
      scannedAt: new Date().toISOString(),
      projects: [],
      error: { code: "emptyRoot" },
    };
  }

  const normalizedRoot = path.normalize(root);

  if (!fs.existsSync(normalizedRoot)) {
    return {
      root: normalizedRoot,
      scannedAt: new Date().toISOString(),
      projects: [],
      error: { code: "folderNotFound", params: { path: normalizedRoot } },
    };
  }

  let rootEntries: fs.Dirent[];
  try {
    rootEntries = fs.readdirSync(normalizedRoot, { withFileTypes: true });
  } catch {
    return {
      root: normalizedRoot,
      scannedAt: new Date().toISOString(),
      projects: [],
      error: { code: "folderReadFailed", params: { path: normalizedRoot } },
    };
  }

  const projectDirs = rootEntries.filter(
    (entry) => entry.isDirectory() && !IGNORE_DIRS.has(entry.name) && !entry.name.startsWith(".")
  );

  const projects: ProjectInfo[] = [];

  for (const dirEntry of projectDirs) {
    const projectPath = path.join(normalizedRoot, dirEntry.name);

    let entries: string[];
    try {
      entries = fs.readdirSync(projectPath);
    } catch {
      continue;
    }

    const technologies = detectTechnologies(projectPath, entries);
    const git = readGitInfo(projectPath);

    let updatedAt: string | null = null;
    try {
      updatedAt = fs.statSync(projectPath).mtime.toISOString();
    } catch {
      updatedAt = null;
    }

    const slnName = entries.find((e) => e.toLowerCase().endsWith(".sln"));

    projects.push({
      name: dirEntry.name,
      path: projectPath,
      technologies,
      git,
      updatedAt: git.lastCommitDate ?? updatedAt,
      sizeHint: entries.length,
      hasSolution: Boolean(slnName),
      solutionPath: slnName ? path.join(projectPath, slnName) : null,
    });
  }

  projects.sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });

  return { root: normalizedRoot, scannedAt: new Date().toISOString(), projects };
}
