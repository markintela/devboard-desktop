import { Globe } from "lucide-react";
import { useProjectRuntime } from "@/hooks/use-project-runtime";
import type { ProjectInfo } from "@/lib/types";

export function RunningUrlLink({ project, className }: { project: ProjectInfo; className?: string }) {
  const { status, url } = useProjectRuntime(project);

  if (status !== "running" || !url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={
        className ??
        "flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1.5 font-mono text-xs text-emerald-400 transition-colors hover:bg-emerald-500/10"
      }
    >
      <Globe className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{url}</span>
    </a>
  );
}
