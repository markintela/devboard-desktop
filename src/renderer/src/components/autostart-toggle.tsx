import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";

export function AutostartToggle() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    window.devboard.getAutoStart().then(setEnabled);
  }, []);

  async function toggle() {
    const next = await window.devboard.setAutoStart(!enabled);
    setEnabled(next);
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggle}
          aria-pressed={enabled}
          className={cn(
            "app-no-drag flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
            enabled
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/70 text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Rocket className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{enabled ? t(d => d.autostart.enabled) : t(d => d.autostart.disabled)}</TooltipContent>
    </Tooltip>
  );
}
