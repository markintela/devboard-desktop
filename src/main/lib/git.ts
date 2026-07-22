import fs from "fs";
import path from "path";
import type { GitInfo } from "./types";

function safeReadText(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function walkRefs(dir: string, base = ""): string[] {
  let result: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return result;
  }
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      result = result.concat(walkRefs(path.join(dir, entry.name), rel));
    } else {
      result.push(rel);
    }
  }
  return result;
}

function parseRemoteUrl(config: string | null): string | null {
  if (!config) return null;
  const match = config.match(/\[remote "origin"\][^[]*url\s*=\s*(.+)/i);
  return match ? match[1].trim() : null;
}

function parseLastCommitDate(logHead: string | null): string | null {
  if (!logHead) return null;
  const lines = logHead.trim().split("\n");
  const lastLine = lines[lines.length - 1];
  if (!lastLine) return null;
  // format: <old> <new> <name> <email> <unix-ts> <tz>\t<message>
  const beforeTab = lastLine.split("\t")[0];
  const tokens = beforeTab.trim().split(/\s+/);
  // second-to-last token is the unix timestamp, last is the timezone offset
  const ts = Number(tokens[tokens.length - 2]);
  if (!ts || Number.isNaN(ts)) return null;
  return new Date(ts * 1000).toISOString();
}

export function readGitInfo(projectPath: string): GitInfo {
  const gitDir = path.join(projectPath, ".git");

  if (!fs.existsSync(gitDir)) {
    return { isRepo: false, currentBranch: null, branches: [], remoteUrl: null, lastCommitDate: null };
  }

  // Some projects use a `.git` FILE (worktrees / submodules) pointing elsewhere.
  let resolvedGitDir = gitDir;
  const gitDirStat = fs.statSync(gitDir);
  if (gitDirStat.isFile()) {
    const content = safeReadText(gitDir) ?? "";
    const match = content.match(/gitdir:\s*(.+)/);
    if (match) {
      resolvedGitDir = path.isAbsolute(match[1].trim())
        ? match[1].trim()
        : path.resolve(projectPath, match[1].trim());
    }
  }

  const headContent = safeReadText(path.join(resolvedGitDir, "HEAD")) ?? "";
  let currentBranch: string | null = null;
  const refMatch = headContent.match(/ref:\s*refs\/heads\/(.+)/);
  if (refMatch) {
    currentBranch = refMatch[1].trim();
  } else if (headContent.trim()) {
    currentBranch = `${headContent.trim().slice(0, 7)} (detached)`;
  }

  const branchSet = new Set<string>();

  // Loose refs under refs/heads/**
  const headsDir = path.join(resolvedGitDir, "refs", "heads");
  for (const ref of walkRefs(headsDir)) {
    branchSet.add(ref.replace(/\\/g, "/"));
  }

  // Packed refs (created after `git gc` / clone)
  const packedRefs = safeReadText(path.join(resolvedGitDir, "packed-refs"));
  if (packedRefs) {
    for (const line of packedRefs.split("\n")) {
      const m = line.match(/^[0-9a-f]{40,64}\s+refs\/heads\/(.+)$/);
      if (m) branchSet.add(m[1].trim());
    }
  }

  if (currentBranch && !currentBranch.includes("detached")) {
    branchSet.add(currentBranch);
  }

  const config = safeReadText(path.join(resolvedGitDir, "config"));
  const remoteUrl = parseRemoteUrl(config);

  const logHead = safeReadText(path.join(resolvedGitDir, "logs", "HEAD"));
  const lastCommitDate = parseLastCommitDate(logHead);

  return {
    isRepo: true,
    currentBranch,
    branches: Array.from(branchSet).sort((a, b) => a.localeCompare(b)),
    remoteUrl,
    lastCommitDate,
  };
}
