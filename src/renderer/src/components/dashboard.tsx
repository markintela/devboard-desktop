import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ProjectCard } from "@/components/project-card";
import { TechIcon, TECH_META } from "@/components/tech-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { AutostartToggle } from "@/components/autostart-toggle";
import { WindowControls } from "@/components/window-controls";
import { Logo } from "@/components/logo";
import { SplashScreen } from "@/components/splash-screen";
import type { ProjectInfo, ScanResult, TechId } from "@/lib/types";
import {
  FolderSearch,
  FolderOpen,
  RefreshCw,
  FolderGit2,
  Boxes,
  Search,
  TerminalSquare,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LAST_ROOT_KEY = "devboard-last-root";

export function Dashboard() {
  const [rootInput, setRootInput] = useState("");
  const [scannedRoot, setScannedRoot] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [scannedAt, setScannedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTech, setActiveTech] = useState<TechId | null>(null);

  async function scan(root: string) {
    setLoading(true);
    setError(null);
    try {
      const data: ScanResult = await window.devboard.scanFolder(root);
      if (data.error) {
        setError(data.error);
        setProjects([]);
        setScannedRoot(data.root || null);
        setScannedAt(data.scannedAt);
      } else {
        setProjects(data.projects);
        setScannedRoot(data.root);
        setScannedAt(data.scannedAt);
        localStorage.setItem(LAST_ROOT_KEY, data.root);
      }
    } catch {
      setError("Não foi possível conversar com o processo principal do DevBoard.");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  async function browseFolder() {
    const picked = await window.devboard.chooseFolder();
    if (picked) {
      setRootInput(picked);
      scan(picked);
    }
  }

  useEffect(() => {
    const savedRoot = localStorage.getItem(LAST_ROOT_KEY);
    if (savedRoot) {
      setRootInput(savedRoot);
      scan(savedRoot);
    } else {
      setInitialLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const techCounts = useMemo(() => {
    const counts = new Map<TechId, number>();
    for (const project of projects) {
      for (const tech of project.technologies) {
        counts.set(tech, (counts.get(tech) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesQuery = project.name.toLowerCase().includes(query.toLowerCase());
      const matchesTech = activeTech ? project.technologies.includes(activeTech) : true;
      return matchesQuery && matchesTech;
    });
  }, [projects, query, activeTech]);

  const repoCount = projects.filter((p) => p.git.isRepo).length;

  if (initialLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen">
      {/* header */}
      <header className="app-drag sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12 shrink-0" />
            <h1 className="font-mono text-3xl font-semibold tracking-tight">
              Dev<span className="text-primary">Board</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {scannedAt && (
              <p className="hidden font-mono text-xs text-muted-foreground sm:block">
                último scan: {new Date(scannedAt).toLocaleTimeString("pt-BR")}
              </p>
            )}
            <AutostartToggle />
            <ThemeToggle />
            <div className="h-6 w-px bg-border" />
            <WindowControls />
          </div>
        </div>
      </header>

      <main className="container flex flex-col gap-6 py-8">
        {/* scan control */}
        <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/60 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-md border border-border/70 bg-background/50 px-3">
            <FolderSearch className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              value={rootInput}
              onChange={(e) => setRootInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && scan(rootInput)}
              placeholder="C:\Users\voce\Projetos"
              className="border-0 bg-transparent px-0 font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button
            onClick={browseFolder}
            disabled={loading}
            variant="outline"
            className="gap-2 sm:w-auto"
          >
            <FolderOpen className="h-4 w-4" />
            Escolher pasta
          </Button>
          <Button onClick={() => scan(rootInput)} disabled={loading} className="gap-2 sm:w-auto">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Escanear pasta
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Boxes} label="Projetos encontrados" value={projects.length} />
          <StatCard icon={FolderGit2} label="Repositórios Git" value={repoCount} />
          <StatCard icon={TerminalSquare} label="Tecnologias distintas" value={techCounts.length} />
          <StatCard
            icon={FolderSearch}
            label="Pasta escaneada"
            value={scannedRoot ?? "—"}
            isPath
          />
        </div>

        {/* filters */}
        {projects.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 sm:w-72">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrar por nome..."
                className="border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveTech(null)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  activeTech === null
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                Todas
              </button>
              {techCounts.map(([tech, count]) => (
                <button
                  key={tech}
                  onClick={() => setActiveTech(tech === activeTech ? null : tech)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    activeTech === tech
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TechIcon tech={tech} className="h-3 w-3" />
                  {TECH_META[tech]?.label ?? tech}
                  <span className="text-muted-foreground">· {count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Separator className="opacity-50" />

        {/* grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.path} project={project} />
            ))}
          </div>
        ) : (
          !error && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border/70 py-20 text-center">
              <FolderSearch className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {scannedRoot === null
                  ? "Escolha uma pasta com seus projetos para começar."
                  : projects.length === 0
                  ? "Nenhum projeto encontrado nessa pasta ainda."
                  : "Nenhum projeto corresponde ao filtro atual."}
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  isPath = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  isPath?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-card/60 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-mono text-sm font-semibold",
            isPath && "text-xs text-muted-foreground"
          )}
          title={String(value)}
        >
          {value}
        </p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
