import { useEffect, useState } from "react";
import { Maximize2, Minimize2, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function WindowControls() {
  const [isFullscreen, setIsFullscreen] = useState(true);

  useEffect(() => {
    window.devboard.windowIsFullscreen().then(setIsFullscreen);
    return window.devboard.onFullscreenChange(setIsFullscreen);
  }, []);

  return (
    <div className="app-no-drag flex items-center gap-1">
      <button
        onClick={() => window.devboard.windowMinimize()}
        title="Minimizar"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-foreground"
        )}
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        onClick={() => window.devboard.windowToggleFullscreen()}
        title={isFullscreen ? "Reduzir tamanho" : "Tela cheia"}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-foreground"
        )}
      >
        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={() => window.devboard.windowClose()}
        title="Fechar"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
          "hover:bg-destructive hover:text-destructive-foreground"
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
