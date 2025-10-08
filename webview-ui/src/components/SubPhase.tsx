type SubPhaseItem = {
  id: string;
  title: string;
  kind: "shell" | "git" | "test" | "manual" | "file-edit" | "composite";
  payload: Record<string, any>; 
  dependsOn?: string[];
};

type SubPhase = {
  id: string;
  title: string;
  description?: string;
  phases: SubPhaseItem[];
};

interface Props {
    SubPhase: SubPhase
}

export default function SubPhase({ SubPhase }: Props) {
  return (
    <div className="p-6 rounded-2xl border border-white/10  backdrop-blur-md shadow-lg transition-all hover:border-white/20">
      <h1 className="text-2xl font-semibold text-gray-200 mb-3 tracking-wide">
        {SubPhase.title}
      </h1>

      <div className="text-gray-400 leading-relaxed mb-6">
        {SubPhase.description}
      </div>

      <div className="space-y-4">
        {SubPhase.phases.map((subPhaseItem) => (
          <div
            key={subPhaseItem.id}
            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
          >
            <h2 className="text-lg font-medium text-gray-100 mb-1">
              {subPhaseItem.title}
            </h2>
            <p className="text-sm text-gray-400 mb-2">
              {subPhaseItem.payload.contents}
            </p>
            {subPhaseItem.payload.filePath && (
              <div className="text-xs text-gray-500 italic break-all">
                {subPhaseItem.payload.filePath}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
