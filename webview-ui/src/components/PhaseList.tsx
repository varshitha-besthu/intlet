import type { PhaseSchema } from "../recoil/atom";
import PhaseItem from "./PhaseItem";

interface Props {
  phases: PhaseSchema["phases"];
  planId: string;
}

export default function PhaseList({ phases, planId }: Props) {
  return (
    <div className="p-6 rounded-2xl border border-white/10  backdrop-blur-md shadow-lg transition-all hover:border-white/20 overflow-x-auto">
      {phases.map((phase, index) => (
        <PhaseItem key={index} phase={phase} planId={planId} />
      ))}
    </div>
  );
}
