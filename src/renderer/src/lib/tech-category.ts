import type { TechId } from "@/lib/types";

const API_TECHS: TechId[] = [
  "node",
  "express",
  "nestjs",
  "python",
  "django",
  "flask",
  "csharp",
  "dotnet",
  "java",
  "spring",
  "kotlin",
  "go",
  "rust",
  "php",
  "laravel",
  "ruby",
  "rails",
];

const FRONTEND_TECHS: TechId[] = [
  "react",
  "nextjs",
  "vue",
  "angular",
  "svelte",
  "html",
  "css",
  "tailwind",
  "flutter",
  "swift",
];

export type TechCategory = "api" | "frontend";

export function matchesTechCategory(technologies: TechId[], category: TechCategory): boolean {
  const list = category === "api" ? API_TECHS : FRONTEND_TECHS;
  return technologies.some(tech => list.includes(tech));
}
