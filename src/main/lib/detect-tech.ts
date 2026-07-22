import fs from "fs";
import path from "path";
import type { TechId } from "./types";

function safeReadJson(filePath: string): any | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeReadText(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Inspects a project's top-level (and one level deep) files to guess which
 * technologies it uses. Intentionally shallow/fast: this runs once per
 * folder on every scan, so it avoids walking the whole tree.
 */
export function detectTechnologies(projectPath: string, entries: string[]): TechId[] {
  const found = new Set<TechId>();
  const has = (name: string) => entries.includes(name);

  // --- Node / JS / TS ecosystem -------------------------------------------------
  if (has("package.json")) {
    found.add("javascript");
    const pkg = safeReadJson(path.join(projectPath, "package.json"));
    const deps = {
      ...(pkg?.dependencies ?? {}),
      ...(pkg?.devDependencies ?? {}),
    };
    const depNames = Object.keys(deps);
    const hasDep = (name: string) => depNames.includes(name);

    if (has("tsconfig.json") || hasDep("typescript")) found.add("typescript");
    if (hasDep("next")) found.add("nextjs");
    if (hasDep("react") && !hasDep("next")) found.add("react");
    if (hasDep("vue") || hasDep("nuxt")) found.add("vue");
    if (hasDep("@angular/core")) found.add("angular");
    if (hasDep("svelte")) found.add("svelte");
    if (hasDep("@nestjs/core")) found.add("nestjs");
    else if (hasDep("express")) found.add("express");
    if (hasDep("tailwindcss")) found.add("tailwind");
    if (!found.has("react") && !found.has("nextjs") && !found.has("vue") && !found.has("angular") && !found.has("svelte")) {
      found.add("node");
    }
  }

  if (has("tsconfig.json")) found.add("typescript");

  // --- Python ---------------------------------------------------------------
  if (has("requirements.txt") || has("pyproject.toml") || has("Pipfile") || has("manage.py")) {
    found.add("python");
    const reqs =
      safeReadText(path.join(projectPath, "requirements.txt")) ??
      safeReadText(path.join(projectPath, "pyproject.toml")) ??
      "";
    if (has("manage.py") || /django/i.test(reqs)) found.add("django");
    if (/flask/i.test(reqs)) found.add("flask");
  }

  // --- .NET / C# --------------------------------------------------------------
  const slnFile = entries.find((e) => e.toLowerCase().endsWith(".sln"));
  const csprojFile = entries.find((e) => e.toLowerCase().endsWith(".csproj"));
  if (slnFile || csprojFile) {
    found.add("csharp");
    found.add("dotnet");
  }

  // --- Java / Kotlin ------------------------------------------------------
  if (has("pom.xml")) {
    found.add("java");
    const pom = safeReadText(path.join(projectPath, "pom.xml")) ?? "";
    if (/spring/i.test(pom)) found.add("spring");
  }
  if (has("build.gradle") || has("build.gradle.kts")) {
    found.add("java");
    if (entries.some((e) => e.endsWith(".kt"))) found.add("kotlin");
  }

  // --- Go -----------------------------------------------------------------
  if (has("go.mod")) found.add("go");

  // --- Rust -----------------------------------------------------------------
  if (has("Cargo.toml")) found.add("rust");

  // --- PHP ------------------------------------------------------------------
  if (has("composer.json")) {
    found.add("php");
    const composer = safeReadJson(path.join(projectPath, "composer.json"));
    const deps = { ...(composer?.require ?? {}) };
    if (Object.keys(deps).some((d) => d.startsWith("laravel/"))) found.add("laravel");
  }

  // --- Ruby -----------------------------------------------------------------
  if (has("Gemfile")) {
    found.add("ruby");
    const gemfile = safeReadText(path.join(projectPath, "Gemfile")) ?? "";
    if (/rails/i.test(gemfile)) found.add("rails");
  }

  // --- Flutter / Dart / Swift / C / C++ --------------------------------------
  if (has("pubspec.yaml")) found.add("flutter");
  if (entries.some((e) => e.endsWith(".xcodeproj")) || has("Package.swift")) found.add("swift");
  if (has("CMakeLists.txt") || entries.some((e) => e.endsWith(".cpp") || e.endsWith(".hpp"))) found.add("cpp");
  else if (entries.some((e) => e.endsWith(".c") || e.endsWith(".h"))) found.add("c");

  // --- Docker -----------------------------------------------------------------
  if (has("Dockerfile") || has("docker-compose.yml") || has("docker-compose.yaml")) {
    found.add("docker");
  }

  // --- Static HTML/CSS fallback ------------------------------------------------
  if (found.size === 0) {
    if (has("index.html")) {
      found.add("html");
      found.add("css");
    }
  }

  if (found.size === 0) found.add("unknown");

  return Array.from(found);
}
