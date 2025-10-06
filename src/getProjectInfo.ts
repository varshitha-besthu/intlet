import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

interface ProjectContext {
  workspace: string;
  techStack: string[];
  languages: string[];
  mainFiles: string[];
  structure: string[];
  notes: string[];
}

export async function getProjectContext(): Promise<ProjectContext> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return {
      workspace: "❌ No workspace open",
      techStack: [],
      languages: [],
      mainFiles: [],
      structure: [],
      notes: ["No folder is open in VSCode."],
    };
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const entries = fs.readdirSync(rootPath, { withFileTypes: true });

  const files = entries.filter(e => e.isFile()).map(e => e.name);
  const folders = entries.filter(e => e.isDirectory()).map(e => e.name);

  const context: ProjectContext = {
    workspace: path.basename(rootPath),
    techStack: [],
    languages: [],
    mainFiles: [],
    structure: folders,
    notes: [],
  };

  if (files.includes("package.json")) {
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

  if (files.includes("requirements.txt") || files.includes("pyproject.toml")) {
    context.techStack.push("Python");
    context.languages.push("Python");
    const reqFile = files.includes("requirements.txt")
      ? "requirements.txt"
      : "pyproject.toml";
    const content = fs.readFileSync(path.join(rootPath, reqFile), "utf8");
    if (content.match(/flask/i)) context.techStack.push("Flask");
    if (content.match(/django/i)) context.techStack.push("Django");
    if (content.match(/fastapi/i)) context.techStack.push("FastAPI");
  }

  if (files.includes("pom.xml") || files.includes("build.gradle")) {
    context.techStack.push("Java");
    context.languages.push("Java");
    if (fs.readFileSync(path.join(rootPath, files.find(f => f.includes("pom") || f.includes("gradle"))!), "utf8").match(/spring/i))
      context.techStack.push("Spring Boot");
  }

  if (folders.includes("src")) {
    const srcEntries = fs.readdirSync(path.join(rootPath, "src"));
    if (srcEntries.some(f => f.endsWith(".jsx") || f.endsWith(".tsx"))) context.languages.push("React");
    if (srcEntries.some(f => f.endsWith(".js"))) context.languages.push("JavaScript");
    if (srcEntries.some(f => f.endsWith(".py"))) context.languages.push("Python");
    if (srcEntries.some(f => f.endsWith(".java"))) context.languages.push("Java");
  }

  if (files.includes("Cargo.toml")) context.techStack.push("Rust");
  if (files.includes("go.mod")) context.techStack.push("Go");
  if (files.includes("Gemfile")) context.techStack.push("Ruby on Rails");
  if (files.includes("composer.json")) context.techStack.push("PHP / Laravel");

  if (files.includes("Dockerfile")) context.notes.push("🚢 Docker project detected");
  if (files.includes(".github")) context.notes.push("⚙️ GitHub Actions present");

  context.techStack = [...new Set(context.techStack)];
  context.languages = [...new Set(context.languages)];

  return context;
}
