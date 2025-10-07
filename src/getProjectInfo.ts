import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { readFile, listDir, searchInFiles, gitStatus, phaseLog } from "./tools/projectTools";

export interface ProjectContext {
  workspace: string;
  techStack: string[];
  languages: string[];
  mainFiles: string[];
  structure: string[];
  notes: string[];
  tools?: {
    gitStatus: any;
    phaseLog: any;
    files: string[];
  };
  executedPhases?: {
    phaseId: string;
    status: "pending" | "success" | "failed";
    output?: string;
  }[];
}

// 🔹 Recursively gather file tree up to a safe depth
function walkDir(dir: string, depth = 0, maxDepth = 3): string[] {
  if (depth > maxDepth) return [];
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(fullPath);
      results.push(...walkDir(fullPath, depth + 1, maxDepth));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

export async function getProjectContext(): Promise<ProjectContext & { tools: any }> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {

    //@ts-ignore
    return {
      workspace: "❌ No workspace open",
      techStack: [],
      languages: [],
      mainFiles: [],
      structure: [],
      notes: ["No folder is open in VSCode."],
      tools: {}
    };
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const allFiles = walkDir(rootPath);

  const context: ProjectContext = {
    workspace: path.basename(rootPath),
    techStack: [],
    languages: [],
    mainFiles: [],
    structure: [],
    notes: [],
  };

  // ---- Detect tech stack ----
  const files = allFiles.map(f => path.basename(f));
  const detect = (file: string) => files.includes(file);

  if (detect("package.json")) {
    context.techStack.push("Node.js");
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(rootPath, "package.json"), "utf8"));
      const deps = Object.keys(pkg.dependencies || {});
      const devDeps = Object.keys(pkg.devDependencies || {});
      const allDeps = [...deps, ...devDeps];
      if (allDeps.some(d => d.includes("react"))) context.techStack.push("React");
      if (allDeps.some(d => d.includes("vite"))) context.techStack.push("Vite");
      if (allDeps.some(d => d.includes("next"))) context.techStack.push("Next.js");
      if (allDeps.some(d => d.includes("express"))) context.techStack.push("Express");
      if (allDeps.some(d => d.includes("typescript"))) context.languages.push("TypeScript");
      else context.languages.push("JavaScript");
    } catch {
      context.notes.push("⚠️ Could not parse package.json");
    }
  }

  if (detect("requirements.txt") || detect("pyproject.toml")) {
    context.techStack.push("Python");
    context.languages.push("Python");
  }

  if (detect("pom.xml") || detect("build.gradle")) {
    context.techStack.push("Java");
    context.languages.push("Java");
  }

  if (detect("Cargo.toml")) context.techStack.push("Rust");
  if (detect("go.mod")) context.techStack.push("Go");
  if (detect("Gemfile")) context.techStack.push("Ruby on Rails");
  if (detect("composer.json")) context.techStack.push("PHP / Laravel");
  if (detect("Dockerfile")) context.notes.push("🚢 Docker project detected");
  if (detect(".github")) context.notes.push("⚙️ GitHub Actions present");

  context.techStack = [...new Set(context.techStack)];
  context.languages = [...new Set(context.languages)];

  return {
    ...context,
    tools: {
      gitStatus: gitStatus(),
      phaseLog: phaseLog(),
      files: allFiles.slice(0, 50), 
      readFile: (relPath: string) => readFile(path.join(rootPath, relPath)),
      listDir: (relPath: string) => listDir(path.join(rootPath, relPath)),
      searchInFiles: (term: string) => searchInFiles(term),
    },
  };
}
