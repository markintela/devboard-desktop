import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TechIcon, TECH_META } from "@/components/tech-icon";
import { QuickActionButton } from "@/components/quick-action-button";
import { RunStatusButton } from "@/components/run-status-button";
import { RunningUrlLink } from "@/components/running-url-link";
import { canRunProject } from "@/lib/run-support";
import { timeAgo } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/context";
import { translateAppError } from "@/lib/translate-error";
import {
  ArrowLeft,
  FolderGit2,
  Layers,
  GitBranch,
  Clock,
  Code2,
  ExternalLink,
  Loader2,
  GitFork,
  FolderOpen,
  ListChecks,
  Plus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import type { ProjectInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

type QuickAction = "fork" | "explorer";

export function ProjectDetailsPage({ project, onBack }: { project: ProjectInfo; onBack: () => void }) {
  const { t } = useTranslation();
  const [opening, setOpening] = useState<"vscode" | "visualstudio" | QuickAction | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [branchesOpen, setBranchesOpen] = useState(false);

  const [improvements, setImprovements] = useState<string[]>([]);
  const [loadingImprovements, setLoadingImprovements] = useState(true);
  const [newImprovement, setNewImprovement] = useState("");
  const [savingImprovement, setSavingImprovement] = useState(false);

  useEffect(() => {
    setLoadingImprovements(true);
    window.devboard
      .listImprovements(project.path, project.name)
      .then(setImprovements)
      .finally(() => setLoadingImprovements(false));
  }, [project.path, project.name]);

  async function openIn(editor: "vscode" | "visualstudio" | QuickAction) {
    setOpening(editor);
    setFeedback(null);
    try {
      const data = await window.devboard.openEditor({
        path: project.path,
        editor,
        solutionPath: project.solutionPath,
      });
      if (!data.ok && data.error) {
        setFeedback(translateAppError(t, data.error));
      }
    } catch {
      setFeedback(t(d => d.errors.communicationFailed));
    } finally {
      setOpening(null);
    }
  }

  async function addImprovement() {
    const text = newImprovement.trim();
    if (!text) return;
    setSavingImprovement(true);
    try {
      const updated = await window.devboard.addImprovement(project.path, project.name, text);
      setImprovements(updated);
      setNewImprovement("");
    } finally {
      setSavingImprovement(false);
    }
  }

  async function removeImprovement(index: number) {
    const updated = await window.devboard.removeImprovement(project.path, project.name, index);
    setImprovements(updated);
  }

  return (
    <div className="container flex flex-col gap-6 py-8">
      <button
        onClick={onBack}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t(d => d.details.back)}
      </button>

      <div className="overflow-hidden rounded-lg border border-border/80 bg-card/80">
        {/* terminal-style title bar */}
        <div className="flex items-center justify-between border-b border-border/70 bg-black/20 px-6 py-3">
          <div className="terminal-dots flex gap-2">
            <span style={{ backgroundColor: "#F87171" }} />
            <span style={{ backgroundColor: "#FBBF24" }} />
            <span style={{ backgroundColor: "#34D399" }} />
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
            {project.git.isRepo ? (
              <>
                <FolderGit2 className="h-3.5 w-3.5" />
                {t(d => d.card.repo)}
              </>
            ) : (
              <>
                <Layers className="h-3.5 w-3.5" />
                {t(d => d.card.localFolder)}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div>
            <h2 className="truncate font-mono text-2xl font-semibold" title={project.name}>
              {project.name}
            </h2>
            <p className="truncate font-mono text-sm text-muted-foreground" title={project.path}>
              {project.path}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {project.technologies.map(tech => (
              <Badge key={tech} variant="outline" className="gap-1.5 bg-background/40 py-1">
                <TechIcon tech={tech} className="h-3.5 w-3.5" />
                <span>{TECH_META[tech]?.label ?? tech}</span>
              </Badge>
            ))}
          </div>

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {t(d => d.card.updated, { time: timeAgo(project.updatedAt, t) })}
            </div>
            {project.git.isRepo && (
              <div>
                <button
                  onClick={() => setBranchesOpen(v => !v)}
                  className="flex items-center gap-1.5 rounded-md py-1 text-left transition-colors hover:text-foreground"
                >
                  <GitBranch className="h-4 w-4 text-secondary" />
                  <span className="font-mono text-foreground">{project.git.currentBranch ?? "—"}</span>
                  <span>
                    · {project.git.branches.length}{" "}
                    {project.git.branches.length !== 1 ? t(d => d.card.branchPlural) : t(d => d.card.branchSingular)}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", branchesOpen && "rotate-180")} />
                </button>

                {branchesOpen && (
                  <div className="mt-1 max-h-32 overflow-y-auto scrollbar-thin rounded-md border border-border/70 bg-background/40 p-2">
                    <ul className="flex flex-col gap-1 font-mono text-xs">
                      {project.git.branches.map(branch => (
                        <li
                          key={branch}
                          className={cn(
                            "flex items-center gap-1.5 rounded px-1.5 py-0.5",
                            branch === project.git.currentBranch && "bg-primary/10 text-primary"
                          )}
                        >
                          <GitBranch className="h-3.5 w-3.5 shrink-0" />
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
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
              {feedback}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1 gap-1.5"
              onClick={() => openIn("vscode")}
              disabled={opening !== null}
            >
              {opening === "vscode" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code2 className="h-4 w-4" />}
              {t(d => d.card.vscode)}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => openIn("visualstudio")}
              disabled={opening !== null || !project.hasSolution}
              title={!project.hasSolution ? t(d => d.card.noSolutionTitle) : undefined}
            >
              {opening === "visualstudio" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {t(d => d.card.visualStudio)}
            </Button>
          </div>

          <div className="flex gap-2">
            <QuickActionButton
              label={t(d => d.card.openFork)}
              icon={GitFork}
              loading={opening === "fork"}
              disabled={opening !== null || !project.git.isRepo}
              onClick={() => openIn("fork")}
            />
            <QuickActionButton
              label={t(d => d.card.openExplorer)}
              icon={FolderOpen}
              loading={opening === "explorer"}
              disabled={opening !== null}
              onClick={() => openIn("explorer")}
            />
            {canRunProject(project.technologies) && <RunStatusButton project={project} onError={setFeedback} />}
          </div>

          <RunningUrlLink project={project} />

          <Separator className="opacity-50" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ListChecks className="h-4 w-4 text-primary" />
              {t(d => d.details.futureImprovements)}
            </div>

            <div className="flex gap-2">
              <Input
                value={newImprovement}
                onChange={e => setNewImprovement(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addImprovement()}
                placeholder={t(d => d.details.addPlaceholder)}
                disabled={savingImprovement}
              />
              <Button
                onClick={addImprovement}
                disabled={savingImprovement || !newImprovement.trim()}
                className="gap-1.5"
              >
                {savingImprovement ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {t(d => d.details.add)}
              </Button>
            </div>

            {loadingImprovements ? (
              <p className="text-xs text-muted-foreground">{t(d => d.details.loading)}</p>
            ) : improvements.length === 0 ? (
              <p className="rounded-md border border-dashed border-border/70 py-6 text-center text-xs text-muted-foreground">
                {t(d => d.details.empty)}
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {improvements.map((item, index) => (
                  <li
                    key={`${index}-${item}`}
                    className="flex items-start gap-2 rounded-md border border-border/70 bg-background/40 px-3 py-2 text-sm"
                  >
                    <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground">{index + 1}.</span>
                    <span className="flex-1 break-words">{item}</span>
                    <button
                      onClick={() => removeImprovement(index)}
                      aria-label={t(d => d.details.removeAria)}
                      className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-[11px] text-muted-foreground">{t(d => d.details.savedLocally)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
