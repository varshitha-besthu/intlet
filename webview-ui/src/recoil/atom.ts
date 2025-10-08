export type PhaseSchema = {
  id: string;
  title: string;
  description: string;
  phases: {
    id: string;
    title: string;
    kind: string;
    status: string;
    dependsOn?: string[];
    payload: {
      filePath?: string;
      contents?: string;
      command?: string;
    };
  }[];
};


export type SubPhaseItem = {
  id: string;
  title: string;
  kind: "shell" | "git" | "test" | "manual" | "file-edit" | "composite";
  payload: Record<string, any>; 
  dependsOn?: string[];
};

export type SubPhase = {
  id: string;
  title: string;
  description?: string;
  phases: SubPhaseItem[];
};

// export type SubPhaseGeneratedMessage = {
//   type: string;
//   runId: string;
//   phaseId: string;
//   subPhase: SubPhase;
// };


import {atom} from "recoil";
export const inputState = atom<string>({
  key: "inputState",
  default: "",
});

export const subPhaseState = atom<SubPhase | null>({
  key: "subPhase",
  default: null,
})


export const planState = atom<PhaseSchema | null>({
  key: "planState",
  default: null,
});

export const loadingState = atom<boolean>({
  key: "loadingState",
  default: false,
});

export const errorState = atom<string | null>({
  key: "errorState",
  default: null,
});