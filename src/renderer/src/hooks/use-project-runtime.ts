import { useEffect, useState } from "react";
import type { AppError, ProjectInfo } from "@/lib/types";

export function useProjectRuntime(project: ProjectInfo) {
  const [status, setStatus] = useState<"starting" | "running" | "stopped">("stopped");
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.devboard.getProjectStatus(project.path).then(result => {
      if (!cancelled) setStatus(result.status);
    });
    window.devboard.getProjectUrl(project.path).then(result => {
      if (!cancelled) setUrl(result.url);
    });

    const unsubscribeStatus = window.devboard.onProjectStatusChange((path, newStatus) => {
      if (path !== project.path) return;
      setStatus(newStatus);
      if (newStatus !== "running") setUrl(null);
    });
    const unsubscribeUrl = window.devboard.onProjectUrlChange((path, newUrl) => {
      if (path === project.path) setUrl(newUrl);
    });

    return () => {
      cancelled = true;
      unsubscribeStatus();
      unsubscribeUrl();
    };
  }, [project.path]);

  async function toggle(onError?: (error: AppError) => void) {
    setBusy(true);
    try {
      if (status === "running" || status === "starting") {
        await window.devboard.stopProject(project.path);
        setUrl(null);
      } else {
        const result = await window.devboard.runProject(project.path, project.technologies);
        if (!result.ok && result.error) {
          onError?.(result.error);
        }
      }
    } catch {
      onError?.({ code: "communicationFailed" });
    } finally {
      setBusy(false);
    }
  }

  return { status, url, busy, toggle };
}
