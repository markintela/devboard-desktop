import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className={cn(
        "app-no-drag flex h-9 w-9 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors",
        "hover:bg-accent hover:text-foreground"
      )}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
