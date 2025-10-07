export type PlanSchema = {
  id: string;
  title: string;
  description?: string;
  phases: {
    id: string;
    title: string;
    kind: string;
    status: string;
    dependsOn?: string[];
    payload?: {
      filePath?: string;
      contents?: string;
      command?: string;
    };
  }[];
};

import {atom} from "recoil";
export const inputState = atom<string>({
  key: "inputState",
  default: "",
});

export const outputState = atom< PlanSchema | null>({
  key: "outputState",
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
