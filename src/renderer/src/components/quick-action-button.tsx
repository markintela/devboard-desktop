import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function QuickActionButton({
  label,
  icon: Icon,
  loading,
  disabled,
  onClick,
  active = false,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={active ? "flex-1 border-primary/40 bg-primary/10 text-primary" : "flex-1"}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
