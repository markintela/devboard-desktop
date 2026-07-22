import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TechIcon, TECH_META } from "@/components/tech-icon";
import {
  FolderGit2,
  GitBranch,
  Clock,
  Code2,
  Layers,
  ChevronDown,
  ExternalLink,
  Loader2,
  GitFork,
  FolderOpen,
  SquareTerminal,
} from "lucide-react";
import type { ProjectInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

type QuickAction = "fork" | "explorer" | "powershell";

function timeAgo(iso: string | null): string {
  if (!iso) return "sem atividade registrada";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} m`;
  return `há ${Math.floor(months / 12)} a`;
}

export function ProjectCard({ project }: { project: ProjectInfo }) {
  const [branchesOpen, setBranchesOpen] = useState(false);
  const [opening, setOpening] = useState<"vscode" | "visualstudio" | QuickAction | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const primaryTech = project.technologies[0];
  const accentColor = TECH_META[primaryTech]?.color ?? "#F5A623";

  async function openIn(editor: "vscode" | "visualstudio" | QuickAction) {
    setOpening(editor);
    setFeedback(null);
    try {
      const data = await window.devboard.openEditor({
        path: project.path,
        editor,
        solutionPath: project.solutionPath,
      });
      if (!data.ok) {
        setFeedback(data.error ?? "Não foi possível abrir o editor.");
      }
    } catch {
      setFeedback("Falha de comunicação com o processo principal do DevBoard.");
    } finally {
      setOpening(null);
    }
  }

  return (
    <Card className="card-enter group relative flex flex-col overflow-hidden border-border/80 bg-card/80 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:glow-primary">
      {/* terminal-style title bar */}
      <div className="flex items-center justify-between border-b border-border/70 bg-black/20 px-4 py-2">
        <div className="terminal-dots flex gap-1.5">
          <span style={{ backgroundColor: "#F87171" }} />
          <span style={{ backgroundColor: "#FBBF24" }} />
          <span style={{ backgroundColor: "#34D399" }} />
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          {project.git.isRepo ? (
            <>
              <FolderGit2 className="h-3 w-3" />
              repo
            </>
          ) : (
            <>
              <Layers className="h-3 w-3" />
              pasta local
            </>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-mono text-base font-semibold" title={project.name}>
            {project.name}
          </h3>
        </div>
        <p className="truncate font-mono text-xs text-muted-foreground" title={project.path}>
          {project.path}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 pb-4">
        {/* technologies */}
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="outline" className="gap-1.5 bg-background/40 py-1">
              <TechIcon tech={tech} className="h-3.5 w-3.5" />
              <span>{TECH_META[tech]?.label ?? tech}</span>
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            atualizado {timeAgo(project.updatedAt)}
          </div>

          {project.git.isRepo && (
            <div>
              <button
                onClick={() => setBranchesOpen((v) => !v)}
                className="flex w-full items-center gap-1.5 rounded-md py-1 text-left transition-colors hover:text-foreground"
              >
                <GitBranch className="h-3.5 w-3.5 text-secondary" />
                <span className="font-mono text-foreground">{project.git.currentBranch ?? "—"}</span>
                <span className="text-muted-foreground">
                  · {project.git.branches.length} branch{project.git.branches.length !== 1 ? "es" : ""}
                </span>
                <ChevronDown
                  className={cn("ml-auto h-3.5 w-3.5 transition-transform", branchesOpen && "rotate-180")}
                />
              </button>

              {branchesOpen && (
                <div className="mt-1 max-h-32 overflow-y-auto scrollbar-thin rounded-md border border-border/70 bg-background/40 p-2">
                  <ul className="flex flex-col gap-1 font-mono text-[11px]">
                    {project.git.branches.map((branch) => (
                      <li
                        key={branch}
                        className={cn(
                          "flex items-center gap-1.5 rounded px-1.5 py-0.5",
                          branch === project.git.currentBranch && "bg-primary/10 text-primary"
                        )}
                      >
                        <GitBranch className="h-3 w-3 shrink-0" />
                        <span className="truncate">{branch}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {feedback && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
            {feedback}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1 gap-1.5"
            onClick={() => openIn("vscode")}
            disabled={opening !== null}
          >
            {opening === "vscode" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Code2 className="h-3.5 w-3.5" />}
            VS Code
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => openIn("visualstudio")}
            disabled={opening !== null || !project.hasSolution}
            title={!project.hasSolution ? "Nenhum arquivo .sln encontrado" : undefined}
          >
            {opening === "visualstudio" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ExternalLink className="h-3.5 w-3.5" />
            )}
            Visual Studio
          </Button>
        </div>

        <div className="flex gap-2">
          <QuickActionButton
            label="Abrir no Fork"
            icon={GitFork}
            loading={opening === "fork"}
            disabled={opening !== null || !project.git.isRepo}
            onClick={() => openIn("fork")}
          />
          <QuickActionButton
            label="Abrir no Explorador de Arquivos"
            icon={FolderOpen}
            loading={opening === "explorer"}
            disabled={opening !== null}
            onClick={() => openIn("explorer")}
          />
          <QuickActionButton
            label="Abrir PowerShell aqui"
            icon={SquareTerminal}
            loading={opening === "powershell"}
            disabled={opening !== null}
            onClick={() => openIn("powershell")}
          />
        </div>
      </CardContent>

      <div
        className="absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: accentColor }}
      />
    </Card>
  );
}

function QuickActionButton({
  label,
  icon: Icon,
  loading,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
