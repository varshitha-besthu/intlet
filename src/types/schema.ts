
import { z } from "zod";

export const PhaseSchema: z.ZodType<any> = z.union([
  z.object({
    id: z.string(),
    title: z.string(),
    kind: z.literal("shell"),
    dependsOn: z.array(z.string()).optional(),
    payload: z.object({
      command: z.string(),
    }),
  }),
  z.object({
    id: z.string(),
    title: z.string(),
    kind: z.literal("git"),
    dependsOn: z.array(z.string()).optional(),
    payload: z.object({
      commands: z.array(z.string()),
    }),
  }),
  z.object({
    id: z.string(),
    title: z.string(),
    kind: z.literal("test"),
    dependsOn: z.array(z.string()).optional(),
    payload: z.object({
      command: z.string(),
    }),
  }),
  z.object({
    id: z.string(),
    title: z.string(),
    kind: z.literal("manual"),
    payload: z.object({
      instructions: z.string(),
    }),
  }),
  z.object({
    id: z.string(),
    title: z.string(),
    kind: z.literal("file-edit"),
    payload: z.object({
      filePath: z.string(),
      contents: z.string(),
    }),
  }),
]);

export const PlanSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  phases: z.array(PhaseSchema),
  createdAt: z.string().optional(),
});
