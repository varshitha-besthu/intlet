
import type { PlanSchema } from "../recoil/atom";
import PhaseItem from "./PhaseItem";

interface Props {
  phases: PlanSchema["phases"];
  planId: string;
}

export default function PhaseList({ phases, planId }: Props) {
  return (
    <div className="border-1 border-neutral-300 text-left p-4 rounded overflow-x-auto">
      {phases.map((phase, index) => (
        <PhaseItem key={index} phase={phase} planId={planId} />
      ))}
    </div>
  );
}
