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

const SYSTEM_PROMPT = `You are an AI planner for a VS Code extension.
Your job: break down a developer's request into an executable PLAN.

RULES:
- Reply with ONLY valid JSON, nothing else (no markdown, no prose).
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

OUTPUT STRICTLY JSON, NO MARKDOWN, NO COMMENTS.`;

const USER_PROMPT = (query: string) =>
  `Create a plan for the following request: "${query}"`;

export async function getPlanFromGemini(
  client: ReturnType<typeof import("./client").getGeminiClient>,
  query: string,
  maxRetries = 2
): Promise<Plan> {
  let lastError: unknown;

  const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const resp = await model.generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: SYSTEM_PROMPT + "\n" + USER_PROMPT(query) }],
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
