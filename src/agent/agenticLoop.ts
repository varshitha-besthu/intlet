import { exec } from "child_process";
import { getPlanFromGemini } from "../gemini/getPlanFromGemini";
import { ProjectContext } from "../getProjectInfo";
import { Phase, Plan } from "../types/phases";
import * as vscode from "vscode";

export async function executePhase(
  phase: Phase,
  context: ProjectContext,
  client: any,
  onUpdate?: (context: ProjectContext) => void
) {
  try {
    console.log("Inside execute phase");
    if (phase.kind === 'file-edit') {
       const subPrompt = `
        You are continuing the previous planning session. 
        The parent phase is:

        ${JSON.stringify(phase, null, 2)}

        The previous reasoning and plan context are:
        ${context.llmHistory?.slice(-2).map(p => p.reasoning).join("\n\n")}

        Your goal:
        Break this phase into smaller sub-phases. 
        Each sub-phase should be specific and executable within the scope of this file-edit. 
        Do not repeat already completed tasks. Focus on detailed actionable edits.
        `;
      
        console.log("file edit")
        const subPhase: Plan = await getPlanFromGemini(
          client,
          subPrompt,
          2,
          JSON.stringify(context),
          true
        );

        console.log("This is subPhase", subPhase);

        context.executedPhases?.push({ phaseId: phase.id, status: 'pending', output: 'Sub-planning...' });
        if (onUpdate) onUpdate(context);

        console.log("executed phases till now", context.executedPhases)

        return subPhase;
      
    }

    if (phase.kind === 'shell') {

      await new Promise<void>((resolve, reject) => {
        exec(phase.payload.command, { cwd: vscode.workspace.rootPath }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }


    context.executedPhases?.push({ phaseId: phase.id, status: 'success' });
    if (onUpdate) onUpdate(context);
    

  } catch (err) {
    console.log("Got error while proceeding with the phase");
    context.executedPhases?.push({ phaseId: phase.id, status: 'failed', output: String(err) });
    if (onUpdate) onUpdate(context);
    
  }
}
