import type { Plan } from "../types/phases";
import { PlanSchema } from "../types/schema";

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

const SYSTEM_PROMPT = `You are an AI *planner*, not a code generator* for a VS Code extension.
Your job: break down a developer's request into an executable PLAN - Not Code.

RULES:
- Reply with ONLY valid JSON, nothing else (no markdown, no prose).
- Don't just spit out the code but give the planning layer I mean you need to plan the output not spit out the code
- The JSON must match this schema:

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

- "kind" must be one of the allowed values.
- For kind "file-edit": payload = { "filePath": string, "contents": string }
- For kind "shell": payload = { "command": string }
- For kind "git": payload = { "commands": string[] }
- For kind "test": payload = { "command": string }
- For kind "manual": payload = { "instructions": string }

OUTPUT STRICTLY JSON, NO MARKDOWN, NO COMMENTS.
### IMPORTANT BEHAVIOR
- You are **not** allowed to output actual source code, HTML, JSX, or CSS.
- Instead, describe the *intent* of the edit (e.g. “Add component skeleton”).
- Example payloads:

  - For kind "file-edit": { "filePath": "src/components/Button.tsx", "contents": "TODO: implement Button component" }
  - For kind "shell": { "command": "mkdir -p src/components" }
  - For kind "manual": { "instructions": "Verify that the Button appears in the app." }

### Example
User: "Create a card component"

Output:
{
  "id": "plan-1",
  "title": "Create a card component",
  "phases": [
    { "id": "phase1", "title": "Ensure component directory exists", "kind": "shell", "payload": { "command": "mkdir -p src/components" }},
    { "id": "phase2", "title": "Add Card.tsx file", "kind": "file-edit", "payload": { "filePath": "src/components/Card.tsx", "contents": "TODO: define Card component" }},
    { "id": "phase3", "title": "Reference Card in App.tsx", "kind": "file-edit", "payload": { "filePath": "src/App.tsx", "contents": "TODO: import and render Card" }}
  ]
}

### Final Reminder
- Do not output any real code.
- Every phase must express an *action*, not implementation details.
- You are planning the work, not writing it.
`;

const USER_PROMPT = (query: string, projectContext: string) => `
Create a plan for the following request:
"${query}"

PROJECT CONTEXT:
${projectContext}

Analyze the project context first — detect:
- the language and framework used (React, Node.js, Python, etc.)
- folder structure (e.g., src/, webview-ui/, components/, etc.)
- styling conventions (Tailwind, CSS modules, etc.)
- coding language preference (JS or TS)

Then generate a plan that fits **this specific project**.
Keep file paths and syntax consistent with the detected stack.
`;

export async function getPlanFromGemini(
  client: ReturnType<typeof import("./client").getGeminiClient>,
  query: string,
  maxRetries = 2,
  projectContext: string
): Promise<Plan> {
  let lastError: unknown;

  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: SYSTEM_PROMPT + "\n" + USER_PROMPT(query, projectContext) }],
          },
        ],
        generationConfig: { temperature: 0.2 },
      });

      const text =
        resp.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
      console.log("Gemini raw response:", text);

      let parsedPlan;
      try {
        parsedPlan = JSON.parse(text);
      } catch {
        const block = extractJsonBlock(text);
        if (block) parsedPlan = JSON.parse(block);
      }

      if (!parsedPlan) throw new Error("No valid JSON block found");

      const check = PlanSchema.safeParse(parsedPlan);
      if (check.success) return check.data;

      lastError = check.error;
    } catch (err) {
      lastError = err;
    }

    console.warn(`Attempt ${attempt + 1} failed. Retrying...`);
  }

  throw new Error("Failed to parse plan from Gemini: " + String(lastError));
}
