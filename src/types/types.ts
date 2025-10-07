export type PlanSchema = {
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

