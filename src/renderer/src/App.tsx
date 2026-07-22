import { Dashboard } from "@/components/dashboard";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <Dashboard />
    </TooltipProvider>
  );
}
