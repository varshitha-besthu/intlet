import { analyzeFolder } from "../tools/projectAnalyzer";
import type { Plan } from "../types/phases";
import { PlanSchema } from "../types/schema";
import * as vscode from "vscode";

function extractJsonBlock(text: string): string | null {
  let start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") depth--;
    if (depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

const workspace = async() => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
    
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('Please open a folder or workspace first');
    return "no workspace folder";
  }
      
  const rootPath = workspaceFolders[0] .uri.fsPath;
  const folderSturcture =  await analyzeFolder(rootPath);

  return folderSturcture;
}
let folderStructure: string = "";

async function runPlanner() {
  folderStructure = await workspace(); 
  console.log("Folder Structure:", folderStructure);
}


const PhasePrompt = (query: string, projectContext: string, folderStructure: string) => `
You are an **AI Planner**, not a code generator, for a VS Code extension named *Intlet*.
Your job is to break down a developer's natural-language request into an executable **PLAN**, not actual source code.

---

## BEHAVIORAL INSTRUCTIONS

1. **Analyze** the given project structure and context deeply before planning.  
2. **Think like a senior engineer** reading a codebase for the first time:
   - Identify what type of project it is.
   - Infer the tech stack and architecture (React, Vite, Tailwind, etc.).
   - Understand the layout (src/components, pages, hooks, etc.).
   - Recognize how the user’s request would fit naturally into this structure.
3. Produce two parts in your output:
   - A Reasoning section that describes your understanding of the repo and what you plan to do. (Don't add heading)
   - A JSON Plan following the required schema.

---

## OUTPUT FORMAT
 
Output  section (plain text, not markdown). It must include:

- High-level understanding of the project (derived from folder structure + context)
- Key directories and their purposes (like components/, pages/, hooks/, etc.)
- Technologies inferred from context (from projectContext.techStack, projectContext.languages)
- Observations about patterns (for example, UI components in /components/ui or hooks in /hooks)
- A short explanation of *how* and *where* the user's feature request fits logically


Example:

I explored the repository and identified that this is a **React + TypeScript + Vite** web application structured around modular components. The folder structure indicates:
- \`src/components/ui/\` holds reusable UI primitives (button, input, progressBar).
- \`src/pages/\` contains route-level components such as LandingPage, Dashboard, etc.
- \`src/hooks/\` contains custom React hooks.
- \`src/lib/\` and \`src/utils/\` contain helper logic.
The project uses Tailwind CSS and probably ShadCN components (based on magicui and ui directories).  
To add a new “Card” component, it should live under \`src/components/\`, follow TypeScript naming conventions, and integrate into an existing page (likely Dashboard or LandingPage).


---

output **only** one valid JSON object, with no markdown or commentary, following this schema:

{
  "id": "string (unique plan id)",
  "title": "string",
  "description": "string (optional)",
  "phases": [
    {
      "id": "string (unique phase id)",
      "title": "string",
      "kind": "shell | git | test | manual | file-edit | composite",
      "dependsOn": ["string"],
      "payload": { ... }
    }
  ]
}

---

## PAYLOAD RULES

- For kind "file-edit": payload = { "filePath": string, "contents": string }
- For kind "shell": payload = { "command": string }
- For kind "git": payload = { "commands": string[] }
- For kind "test": payload = { "command": string }
- For kind "manual": payload = { "instructions": string }

---

## CRITICAL RULES

- **Do not output actual code, JSX, HTML, or CSS.**
- Every file-edit phase must describe *intent*, not implementation.
- Output should be **Reasoning** first, then **pure JSON**.
- Use the provided \`projectContext\` fields to enrich reasoning:
  - workspace → name of root folder
  - techStack → identify technologies used
  - languages → mention key languages (e.g., TypeScript, HTML)
  - structure → describe architecture (frontend/backend, components, pages)
  - notes → interpret and summarize purpose of project
- Optionally, leverage tools.gitStatus, tools.files, or executedPhases to justify the next logical step if provided.

---

## INPUT DATA

User Prompt: "${query}"

PROJECT CONTEXT:
${JSON.stringify(projectContext, null, 2)}

FOLDER STRUCTURE:
${folderStructure}

---

Now generate:
1. A concise, clear **Reasoning** section that reads like an engineer's thought process.  
2. A **valid JSON plan** that executes this reasoning step-by-step.
`;

const subPhasePrompt = (query: string, projectContext: string, folderStructure: string) => `
You are an **AI Planner** continuing from a previous plan inside a VS Code extension named *Intlet*.
Your role is to **extend or refine** an existing plan based on the latest user input.

---

## OBJECTIVE

The user has made a **follow-up request** related to a previously planned feature.  
You must:
1. Understand how the new request fits into the **existing plan**.
2. Produce **only the updated or additional phases** needed to accomplish this.
3. Keep the reasoning brief but clear.
4. Maintain the same schema and conventions used in the main plan.

---

## OUTPUT FORMAT

Briefly explain:
- What part of the project or plan this update affects.
- How it integrates with the previous plan.
- Which phases (if any) are replaced, modified, or newly added.


Output a **valid JSON object** matching this schema:

{
  "id": "string (unique subplan id)",
  "title": "string",
  "description": "string (optional)",
  "phases": [
    {
      "id": "string (unique phase id)",
      "title": "string",
      "kind": "shell | git | test | manual | file-edit | composite",
      "dependsOn": ["string"],
      "payload": { ... }
    }
  ]
}

---

## PAYLOAD RULES
- For "file-edit": payload = { "filePath": string, "contents": string (intent only, no real code) }
- For "shell": payload = { "command": string }
- For "git": payload = { "commands": string[] }
- For "test": payload = { "command": string }
- For "manual": payload = { "instructions": string }

---

## CONTEXT

User Follow-up Request: "${query}"

PROJECT CONTEXT:
${JSON.stringify(projectContext, null, 2)}

FOLDER STRUCTURE:
${folderStructure}

---

Now generate:
1. A short reasoning section describing your understanding of the update.(Don't add heading)
2. A valid JSON subplan representing the new or modified steps only.
`;

export async function getPlanFromGemini(
  client: any,
  query: string,
  maxRetries = 2,
  projectContext: string,
  isSubPhase: boolean
): Promise<Plan> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await runPlanner();
      console.log("openAiClient (raw):", client);
      console.log("openAiClient.chat:", client?.chat);
      let resp;

      if(isSubPhase){
        resp = await client.chat.completions.create({
          model: "deepseek/deepseek-chat",
          messages: [
            { role: "user", content: subPhasePrompt(query, projectContext, folderStructure) },
          ],
        });

      }else{
        resp = await client.chat.completions.create({
          model: "deepseek/deepseek-chat",
          messages: [
            { role: "user", content: PhasePrompt(query, projectContext, folderStructure) },
          ],
        });

      }

      const text = resp.choices?.[0]?.message?.content;
      console.log("LLM Raw Response:\n", text);

      if (!text) throw new Error("Empty response from AI");

      const jsonBlock = extractJsonBlock(text);
      if (!jsonBlock) throw new Error("No valid JSON block found");

      const parsedPlan = JSON.parse(jsonBlock);
      const parsedProjectContext = JSON.parse(projectContext);

      const reasoningText = text.split(jsonBlock)[0].trim();

      if (reasoningText) {
        parsedPlan.description = parsedPlan.description
          ? `${reasoningText}\n\n${parsedPlan.description}`
          : reasoningText;
      }

      console.log("Final Parsed Plan:", parsedPlan);
      
      parsedProjectContext.llmHistory?.push({
        query,
        reasoning: reasoningText,
        planJson: jsonBlock
      });

      const check = PlanSchema.safeParse(parsedPlan);
      if (check.success) return check.data;

      lastError = check.error;
    } catch (err) {
      lastError = err;
      console.log("error while connecting to the openRouter", err);
    }

    console.warn(`Attempt ${attempt + 1} failed. Retrying...`);
  }

  throw new Error("Failed to parse plan from Gemini: " + String(lastError));
}

