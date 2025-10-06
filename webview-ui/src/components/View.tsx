import { useState, useEffect } from "react";

type PlanSchema = {
  id: string;
  title: string;
  description: string;
  phases: {
    id: string;
    title: string;
    kind: string;
    dependsOn?: string[];
    payload: {
      filePath?: string;
      contents?: string;
      command?: string;
    };
  }[];
};

declare function acquireVsCodeApi(): {
  postMessage: (msg: any) => void;
  getState: () => any;
  setState: (newState: any) => void;
};

const vscode = acquireVsCodeApi();

export default function View() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<PlanSchema | null>(null);

  useEffect(() => {
    console.log("🔌 Listener attached");

    const handler = (event: MessageEvent) => {
      const msg = event.data;
      console.log("📩 Message received:", msg);

      if (msg.type === "planGenerated") {
        if (msg.error) {
          console.error("Error:", msg.error);
        } else {
          // ✅ store the object, not a string
          setOutput(msg.plan as PlanSchema);
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const sendQuery = () => {
    if (input.trim() === "") return;

    console.log("📤 Sending message");
    vscode.postMessage({
      type: "generatePlan",
      id: Date.now().toString(),
      query: input,
    });

    setInput("");
  };

  return (
    <div className="h-screen text-white flex flex-col justify-between">
      <div className="flex-1 overflow-y-auto p-4">
        {output ? (
          <div>
            <h1 className="text-2xl font-bold mb-2">{output.title}</h1>
            <p className="text-gray-300 mb-4">{output.description}</p>

            <div className="bg-black text-green-400 text-left p-4 rounded">
              {output.phases.map((phase, index) => (
                <div key={index} className="mb-4 border-b border-gray-600 pb-2">
                  <h2 className="font-semibold text-lg">{phase.title}</h2>
                  <p className="text-gray-400 mb-1">Kind: {phase.kind}</p>

                  {/* show dependsOn if exists */}
                  {phase.dependsOn && (
                    <p className="text-sm text-gray-500 mb-2">
                      Depends on: {phase.dependsOn.join(", ")}
                    </p>
                  )}

                  {/* render payload details */}
                  {phase.payload.command ? (
                    <div className="text-blue-400">
                      Command: {phase.payload.command}
                    </div>
                  ) : (
                    <>
                      <div className="text-blue-400">
                        File: {phase.payload.filePath}
                      </div>
                      <pre className="whitespace-pre-wrap text-sm bg-gray-900 p-2 rounded mt-1">
                        {phase.payload.contents}
                      </pre>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="font-bold text-2xl">
                Complex Code Changes Made Simple
              </h1>
              <p className="text-gray-300">
                Turn hours of coding into minutes with an AI that plans,
                implements, and reviews every change.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="p-2 bg-black flex items-center text-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-white bg-transparent text-white px-2 py-1 rounded mr-2"
          placeholder="Enter your query..."
        />
        <button
          onClick={sendQuery}
          className="border border-white rounded-md px-4 py-1 hover:bg-neutral-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
