import { Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useProjectRuntime } from "@/hooks/use-project-runtime";
import { useTranslation } from "@/lib/i18n/context";
import { translateAppError } from "@/lib/translate-error";
import type { ProjectInfo } from "@/lib/types";

export function RunStatusButton({
  project,
  onError,
}: {
  project: ProjectInfo;
  onError?: (message: string) => void;
}) {
  const { status, busy, toggle } = useProjectRuntime(project);
  const { t } = useTranslation();
  const isRunning = status === "running";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "relative flex-1",
            isRunning && "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          )}
          onClick={() => toggle(error => onError?.(translateAppError(t, error)))}
          disabled={busy}
          aria-label={isRunning ? t(d => d.run.stopAria) : t(d => d.run.runAria)}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isRunning ? (
            <Square className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          <span
            className={cn(
              "absolute right-1 top-1 h-1.5 w-1.5 rounded-full",
              isRunning ? "bg-emerald-400" : "bg-muted-foreground/40"
            )}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isRunning ? t(d => d.run.runningTooltip) : t(d => d.run.stoppedTooltip)}</TooltipContent>
    </Tooltip>
  );
}
