import type { TechId } from "@/lib/types";

const JS_RUN_TECHS: TechId[] = ["react", "nextjs", "vue", "angular", "svelte", "node", "express", "nestjs"];

// Espelha a lógica de src/main/lib/run-project.ts — só usada aqui para
// decidir se o botão de Rodar aparece; quem decide o comando de verdade
// é o processo principal.
export function canRunProject(technologies: TechId[]): boolean {
  if (technologies.includes("dotnet") || technologies.includes("csharp")) return true;
  if (technologies.includes("go")) return true;
  return technologies.some(tech => JS_RUN_TECHS.includes(tech));
}
