import { useState, useEffect } from "react";

declare function acquireVsCodeApi(): {
  postMessage: (msg: any) => void;
  getState: () => any;
  setState: (newState: any) => void;
};

const vscode = acquireVsCodeApi();

export default function View() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<any>(null);

  useEffect(() => {
    console.log("Re-rendering the things");
  }, [output])
  useEffect(() => {
    console.log("🔌listener attached");

    const handler = (event: MessageEvent) => {
      const msg = event.data;
      console.log("📩 message received:", msg);

      if (msg.type === "planGenerated") {
        if (msg.error) {
          setOutput("Error: " + msg.error);
        } else {
          setOutput(JSON.stringify(msg.plan, null, 2));
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const sendQuery = () => {
    if (input.trim() === "") return;

    console.log("📤 sending message");
    vscode.postMessage({
      type: "generatePlan",
      id: Date.now().toString(),
      query: input,
    });

    setInput("");
  };

  return (
    <div className="h-screen ">
      <div className="text-white">
        {output ? (
            <div>
              <h1>Hi</h1>
              <pre className="bg-black text-green-400 text-left p-2 m-2 rounded">
                {output}
              </pre>
            </div>
          ): 
          (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="font-bold text-2xl">
                  Complex Code Changes Made Simple
                </h1>
                <p>
                  Turn hours of coding into minutes with an AI that plans,
                  implements, and reviews every change.
                </p>
              </div>
            </div>
          )
}
        <div className="fixed bottom-2 flex flex-col w-full">
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border-1 w-full mx-1 border-white text-white px-2"
            />
            
            <button
              onClick={sendQuery}
              className="border-1 rounded-md px-2 border-white hover:bg-neutral-400"
            >
              Send
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
