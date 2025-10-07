
// export type PhaseID = string;
// export type RunID = string;
// export type ISOTime = string; 

// export type PhaseStatus =
//   | 'idle'
//   | 'queued'
//   | 'running'
//   | 'success'
//   | 'failed'
//   | 'skipped'
//   | 'dry-run';

// export type PhaseKind = 'shell' | 'git' | 'npm' | 'test' | 'composite' | 'manual';

// export interface BasePhase {
//   id: PhaseID;
//   title: string;
//   description?: string;
//   kind: PhaseKind;
//   dependsOn?: PhaseID[];
//   timeoutMs?: number;
//   metadata?: Record<string, unknown>;
// }

// export interface ShellPhase extends BasePhase {
//   kind: 'shell';
//   payload: {
//     command: string;         
//     cwd?: string;
//     env?: Record<string, string>;
//     shell?: 'bash' | 'sh' | 'powershell' | 'cmd';
//   };
// }

// export interface GitPhase extends BasePhase {
//   kind: 'git';
//   payload: {
//     commands: string[];      
//     repoPath?: string;
//     branch?: string;
//   };
// }

// export interface TestPhase extends BasePhase {
//   kind: 'test';
//   payload: {
//     command?: string;        
//     coverageRequired?: number; 
//   };
// }

// export interface CompositePhase extends BasePhase {
//   kind: 'composite';
//   payload: {
//     phases: Phase[];         
//   };
// }

// export interface ManualPhase extends BasePhase {
//   kind: 'manual';
//   payload?: { instructions?: string };
// }

// export type Phase = ShellPhase | GitPhase | TestPhase | CompositePhase | ManualPhase;

// export interface Plan {
//   id: string;
//   title?: string;
//   description?: string;
//   phases: Phase[];
//   createdAt?: ISOTime;
//   source?: { model?: string; promptHash?: string };
// }



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

export type PhaseKind = 'shell' | 'git' | 'npm' | 'test' | 'composite' | 'manual';

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

export type Phase = ShellPhase | GitPhase | TestPhase | CompositePhase | ManualPhase;

export interface Plan {
  id: string;
  title?: string;
  description?: string;
  phases: Phase[];
  createdAt?: ISOTime;
  source?: { model?: string; promptHash?: string };
}


export type UIToExtMsg =
  | { type: 'generatePlan'; id: string; query: string; options?: { dryRun?: boolean } }
  | { type: 'executePlan'; runId: RunID; planId: string; dryRun?: boolean }
  | { type: 'executePhase'; runId: RunID; planId: string; phaseId: PhaseID; dryRun?: boolean }
  | { type: 'requestLog'; runId: RunID; fromLine?: number }
  | { type: 'revertRun'; runId: RunID; reason?: string };

export type ExtToUIMsg =
  | { type: 'planGenerated'; id: string; plan?: Plan; error?: string }
  | { type: 'phaseUpdate'; runId: RunID; phaseId: PhaseID; status: PhaseStatus; logChunk?: string; output?: string }
  | { type: 'executionFinished'; runId: RunID; success: boolean; summary?: string }
  | { type: 'logChunk'; runId: RunID; chunk: string };