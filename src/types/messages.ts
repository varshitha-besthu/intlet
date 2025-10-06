import type { Phase } from "./phases";

export type WebviewToExtension =
  | { type: "query"; query: string }
  | { type: "execute_phase"; phase: Phase }
  | { type: "execute_batch"; phases: Phase[] }
  | { type: "edit_phase"; phase: Phase };

export type ExtensionToWebview =
  | { type: "plan"; phases: Phase[] }
  | { type: "execution_result"; phaseId: string; success: boolean; output?: string }
  | { type: "error"; error: string };
