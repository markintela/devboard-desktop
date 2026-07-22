import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation, type Language } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const OPTIONS: { code: Language; abbr: string }[] = [
  { code: "pt", abbr: "PT" },
  { code: "en", abbr: "EN" },
  { code: "es", abbr: "ES" },
];

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  const labels: Record<Language, string> = {
    pt: t(d => d.language.portuguese),
    en: t(d => d.language.english),
    es: t(d => d.language.spanish),
  };

  return (
    <div className="app-no-drag flex items-center gap-1 rounded-md border border-border/70 p-1">
      {OPTIONS.map(({ code, abbr }) => (
        <Tooltip key={code}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setLanguage(code)}
              aria-label={labels[code]}
              aria-pressed={language === code}
              className={cn(
                "flex h-6 w-8 items-center justify-center rounded-sm font-mono text-[11px] font-semibold transition-colors",
                language === code
                  ? "bg-primary/10 text-primary ring-1 ring-primary/40"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {abbr}
            </button>
          </TooltipTrigger>
          <TooltipContent>{labels[code]}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
