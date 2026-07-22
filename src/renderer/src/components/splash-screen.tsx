import { Logo } from "@/components/logo";
import { WindowControls } from "@/components/window-controls";

export function SplashScreen() {
  return (
    <div className="app-drag relative flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="absolute right-3 top-3">
        <WindowControls />
      </div>
      <Logo className="h-24 w-24 animate-pulse drop-shadow-[0_0_40px_rgba(123,92,250,0.35)]" />
      <h1 className="font-mono text-2xl font-semibold tracking-tight">
        Dev<span className="text-primary">Board</span>
      </h1>
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
      </div>
    </div>
  );
}
