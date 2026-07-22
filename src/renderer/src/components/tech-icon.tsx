import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiPython,
  SiDjango,
  SiFlask,
  SiDotnet,
  SiSharp,
  SiOpenjdk,
  SiSpring,
  SiKotlin,
  SiGo,
  SiRust,
  SiPhp,
  SiLaravel,
  SiRuby,
  SiRubyonrails,
  SiDocker,
  SiHtml5,
  SiCss,
  SiTailwindcss,
  SiFlutter,
  SiSwift,
  SiCplusplus,
  SiC,
} from "react-icons/si";
import { FileQuestion } from "lucide-react";
import type { TechId } from "@/lib/types";
import type { IconType } from "react-icons";

interface TechMeta {
  label: string;
  icon: IconType | typeof FileQuestion;
  color: string;
}

export const TECH_META: Record<TechId, TechMeta> = {
  javascript: { label: "JavaScript", icon: SiJavascript, color: "#F0DB4F" },
  typescript: { label: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  react: { label: "React", icon: SiReact, color: "#61DAFB" },
  nextjs: { label: "Next.js", icon: SiNextdotjs, color: "#FFFFFF" },
  vue: { label: "Vue", icon: SiVuedotjs, color: "#42B883" },
  angular: { label: "Angular", icon: SiAngular, color: "#DD0031" },
  svelte: { label: "Svelte", icon: SiSvelte, color: "#FF3E00" },
  node: { label: "Node.js", icon: SiNodedotjs, color: "#5FA04E" },
  express: { label: "Express", icon: SiExpress, color: "#FFFFFF" },
  nestjs: { label: "NestJS", icon: SiNestjs, color: "#E0234E" },
  python: { label: "Python", icon: SiPython, color: "#FFD43B" },
  django: { label: "Django", icon: SiDjango, color: "#0C4B33" },
  flask: { label: "Flask", icon: SiFlask, color: "#FFFFFF" },
  csharp: { label: "C#", icon: SiSharp, color: "#68217A" },
  dotnet: { label: ".NET", icon: SiDotnet, color: "#512BD4" },
  java: { label: "Java", icon: SiOpenjdk, color: "#EA2D2E" },
  spring: { label: "Spring", icon: SiSpring, color: "#6DB33F" },
  kotlin: { label: "Kotlin", icon: SiKotlin, color: "#7F52FF" },
  go: { label: "Go", icon: SiGo, color: "#00ADD8" },
  rust: { label: "Rust", icon: SiRust, color: "#F74C00" },
  php: { label: "PHP", icon: SiPhp, color: "#777BB4" },
  laravel: { label: "Laravel", icon: SiLaravel, color: "#FF2D20" },
  ruby: { label: "Ruby", icon: SiRuby, color: "#CC342D" },
  rails: { label: "Rails", icon: SiRubyonrails, color: "#CC0000" },
  docker: { label: "Docker", icon: SiDocker, color: "#2496ED" },
  html: { label: "HTML", icon: SiHtml5, color: "#E34F26" },
  css: { label: "CSS", icon: SiCss, color: "#1572B6" },
  tailwind: { label: "Tailwind", icon: SiTailwindcss, color: "#38BDF8" },
  flutter: { label: "Flutter", icon: SiFlutter, color: "#02569B" },
  swift: { label: "Swift", icon: SiSwift, color: "#F05138" },
  cpp: { label: "C++", icon: SiCplusplus, color: "#00599C" },
  c: { label: "C", icon: SiC, color: "#A8B9CC" },
  unknown: { label: "Genérico", icon: FileQuestion, color: "#8A8F98" },
};

export function TechIcon({ tech, className }: { tech: TechId; className?: string }) {
  const meta = TECH_META[tech] ?? TECH_META.unknown;
  const Icon = meta.icon;
  return <Icon className={className} style={{ color: meta.color }} title={meta.label} />;
}
