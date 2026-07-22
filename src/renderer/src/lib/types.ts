export type TechId =
  | "javascript"
  | "typescript"
  | "react"
  | "nextjs"
  | "vue"
  | "angular"
  | "svelte"
  | "node"
  | "express"
  | "nestjs"
  | "python"
  | "django"
  | "flask"
  | "csharp"
  | "dotnet"
  | "java"
  | "spring"
  | "kotlin"
  | "go"
  | "rust"
  | "php"
  | "laravel"
  | "ruby"
  | "rails"
  | "docker"
  | "html"
  | "css"
  | "tailwind"
  | "flutter"
  | "swift"
  | "cpp"
  | "c"
  | "unknown";

export interface GitInfo {
  isRepo: boolean;
  currentBranch: string | null;
  branches: string[];
  remoteUrl: string | null;
  lastCommitDate: string | null;
}

export interface ProjectInfo {
  name: string;
  path: string;
  technologies: TechId[];
  git: GitInfo;
  updatedAt: string | null;
  sizeHint: number;
  hasSolution: boolean;
  solutionPath: string | null;
}

export interface ScanResult {
  root: string;
  scannedAt: string;
  projects: ProjectInfo[];
  error?: string;
}
