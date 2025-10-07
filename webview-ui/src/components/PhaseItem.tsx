import { vscode } from "../utils/vscode";

export default function PhaseItem({ phase, planId }: any) {
  return (
    <div className="mb-4 border-b border-gray-600 pb-2">
      <h2 className="font-semibold text-lg">{phase.title}</h2>
      <p className="text-gray-400 mb-1">Kind: {phase.kind}</p>
      <p className="text-sm text-gray-500 mb-2">Status: {phase.status ?? "idle"}</p>

      <button
        className="border border-white px-2 py-1 rounded text-white hover:bg-neutral-600"
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

      {phase.payload?.command && (
        <div className="text-blue-400 mt-1">Command: {phase.payload.command}</div>
      )}
      {phase.payload?.filePath && (
        <>
          <div className="text-blue-400">File: {phase.payload.filePath}</div>
          <pre className="whitespace-pre-wrap text-sm bg-gray-900 p-2 rounded mt-1">
            {phase.payload.contents}
          </pre>
        </>
      )}
    </div>
  );
}
