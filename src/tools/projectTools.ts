import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return `⚠️ Could not read file: ${filePath}`;
  }
}

export function listDir(dirPath: string): string[] {
  try {
    return fs.readdirSync(dirPath);
  } catch {
    return [`⚠️ Could not list directory: ${dirPath}`];
  }
}

export function searchInFiles(query: string): Record<string, number[]> {
  const results: Record<string, number[]> = {};
  const workspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspace) return {};

  function searchDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const fullPath = path.join(dir, e.name);
      if (e.isDirectory()) searchDir(fullPath);
      else if (e.isFile()) {
        const content = fs.readFileSync(fullPath, "utf8");
        const lines: number[] = [];
        content.split("\n").forEach((line, i) => {
          if (line.includes(query)) lines.push(i + 1);
        });
        if (lines.length > 0) results[fullPath] = lines;
      }
    }
  }

  searchDir(workspace);
  return results;
}

export function gitStatus(): string {
  const workspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspace) return "❌ No workspace open";
  try {
    return execSync("git status --short", { cwd: workspace }).toString();
  } catch {
    return "⚠️ Git not initialized or inaccessible";
  }
}

export function phaseLog(): any[] {
  const storage = path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "", ".intlet_phases.json");
  if (fs.existsSync(storage)) {
    return JSON.parse(fs.readFileSync(storage, "utf8"));
  }
  return [];
}

export function savePhaseLog(log: any[]) {
  const workspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspace) return;
  const storage = path.join(workspace, ".intlet_phases.json");
  fs.writeFileSync(storage, JSON.stringify(log, null, 2), "utf8");
}
