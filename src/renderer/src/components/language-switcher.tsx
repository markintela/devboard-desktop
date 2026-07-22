import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FlagBR, FlagUS, FlagES } from "@/components/flags";
import { useTranslation, type Language } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

const OPTIONS: { code: Language; Flag: React.ComponentType<{ className?: string }> }[] = [
  { code: "pt", Flag: FlagBR },
  { code: "en", Flag: FlagUS },
  { code: "es", Flag: FlagES },
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
      {OPTIONS.map(({ code, Flag }) => (
        <Tooltip key={code}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setLanguage(code)}
              aria-label={labels[code]}
              aria-pressed={language === code}
              className={cn(
                "flex h-6 w-8 items-center justify-center overflow-hidden rounded-sm transition-all",
                language === code ? "opacity-100 ring-2 ring-primary" : "opacity-45 hover:opacity-80"
              )}
            >
              <Flag className="h-full w-full" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{labels[code]}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
