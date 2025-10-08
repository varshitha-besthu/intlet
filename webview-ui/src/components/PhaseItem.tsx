import { vscode } from "../utils/vscode";

export default function PhaseItem({ phase, planId }: any) {
  return (
    <div className="mb-4 p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-md hover:border-white/20 transition-all">
      <h2 className="text-lg font-semibold text-gray-200 mb-1 tracking-wide">
        {phase.title ?? "Untitled Phase"}
      </h2>
      <p className="text-sm text-gray-400 mb-3">
        Kind: {phase.kind ?? "N/A"} | Status:{" "}
        <span className="text-gray-300">{phase.status ?? "idle"}</span>
      </p>

      {phase.payload?.command && (
        <div className="text-sm text-blue-400 mb-2">
          Command: <span className="text-gray-300">{phase.payload.command}</span>
        </div>
      )}

      {phase.payload?.filePath && (
        <div className="mb-3">
          <div className="text-sm text-blue-400 mb-1">
            File: <span className="text-gray-300">{phase.payload.filePath}</span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-white/5 border border-white/10 rounded-lg p-3 font-mono leading-relaxed overflow-x-auto">
            {phase.payload.contents}
          </pre>
        </div>
      )}

      <div className="flex justify-end mt-3">
        <button
          className="px-3 py-1.5 text-sm text-gray-100 border border-white/10 rounded-lg hover:bg-white/10 transition-all backdrop-blur-sm"
          onClick={() =>
            vscode.postMessage({
              type: "executePhase",
              runId: Date.now().toString(),
              planId,
              phaseId: phase.id,
            })
          }
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
