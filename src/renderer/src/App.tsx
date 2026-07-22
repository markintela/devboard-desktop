import { Dashboard } from "@/components/dashboard";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n/context";

export default function App() {
  return (
    <LanguageProvider>
      <TooltipProvider delayDuration={200}>
        <Dashboard />
      </TooltipProvider>
    </LanguageProvider>
  );
}
