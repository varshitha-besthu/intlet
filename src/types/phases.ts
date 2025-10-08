import { extend } from "zod/mini";

export type PhaseID = string;
export type RunID = string;
export type ISOTime = string;

export type PhaseStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'success'
  | 'failed'
  | 'skipped'
  | 'dry-run';

export type PhaseKind = 'shell' | 'git' | 'npm' | 'test' | 'composite' | 'manual' | 'file-edit';

export interface BasePhase {
  id: PhaseID;
  title: string;
  description?: string;
  kind: PhaseKind;
  dependsOn?: PhaseID[];
  timeoutMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ShellPhase extends BasePhase {
  kind: 'shell';
  payload: {
    command: string;
    cwd?: string;
    env?: Record<string, string>;
    shell?: 'bash' | 'sh' | 'powershell' | 'cmd';
  };
}

export interface FileEditPhase extends BasePhase {
  kind: 'file-edit';
  payload: {
    filePath: string;      
    contents: string;      
  };
}


export interface GitPhase extends BasePhase {
  kind: 'git';
  payload: { commands: string[]; repoPath?: string; branch?: string };
}

export interface TestPhase extends BasePhase {
  kind: 'test';
  payload: { command?: string; coverageRequired?: number };
}

export interface CompositePhase extends BasePhase {
  kind: 'composite';
  payload: { phases: Phase[] };
}

export interface ManualPhase extends BasePhase {
  kind: 'manual';
  payload?: { instructions?: string };
}

export type Phase = ShellPhase | GitPhase | TestPhase | CompositePhase | ManualPhase | FileEditPhase;

export interface Plan {
  id: string;
  title?: string;
  description?: string;
  phases: Phase[];
  createdAt?: ISOTime;
  source?: { model?: string; promptHash?: string };
}
