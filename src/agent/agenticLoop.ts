import * as vscode from "vscode";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { Phase, Plan } from "../types/phases";
import { ProjectContext } from "../getProjectInfo";
import { getPlanFromGemini } from "../gemini/getPlanFromGemini";


export async function executePhase(phase: Phase, context: ProjectContext) {
  try {
    switch (phase.kind) {
      case "shell":
        await new Promise<void>((resolve, reject) => {
          exec(
            phase.payload.command,
            { cwd: vscode.workspace.rootPath },
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        break;

      case "manual":
        console.log("Manual step:", phase.payload?.instructions);
        break;

      case "git":
        for (const cmd of phase.payload.commands) {
          await new Promise<void>((resolve, reject) => {
            exec(cmd, { cwd: vscode.workspace.rootPath }, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
        break;

      case "composite":
        for (const subPhase of phase.payload.phases) {
          const success = await executePhase(subPhase, context);
          if (!success) throw new Error(`Sub-phase ${subPhase.id} failed`);
        }
        break;

      case "test":
        if (phase.payload.command) {
          await new Promise<void>((resolve, reject) => {
            exec(phase.payload.command!, { cwd: vscode.workspace.rootPath }, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
        break;

    }

    context.executedPhases?.push({ phaseId: phase.id, status: "success" });
    console.log(context.executedPhases);
    return true;
  } catch (err) {
    context.executedPhases?.push({
      phaseId: phase.id,
      status: "failed",
      output: String(err),
    });
    return false;
  }
}


export async function runPlan(plan: Plan, context: ProjectContext, client: any) {
  context.executedPhases = [];

  for (const phase of plan.phases) {
    const success = await executePhase(phase, context);

    if (!success) {
      console.log(`Phase ${phase.id} failed. Asking Gemini to replan...`);
      const newPlan = await getPlanFromGemini(client, "Refine plan after failure", 2, JSON.stringify(context));
      return runPlan(newPlan, context, client);
    }
  }

  return context;
}
