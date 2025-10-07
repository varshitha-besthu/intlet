import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import { inputState, loadingState, planState, errorState } from "../recoil/atom";
import { vscode } from "../utils/vscode";
import SendButton from "../svg/send";

export default function InputBar() {
    const [input, setInput] = useRecoilState(inputState);
    const loading = useRecoilValue(loadingState);
    const setLoading = useSetRecoilState(loadingState);
    const setPlan = useSetRecoilState(planState);
    const setError = useSetRecoilState(errorState);

    const sendQuery = () => {
        if (loading) return;
        if (!input.trim()) return;

        setError(null);
        setPlan(null);
        setLoading(true);

        vscode.postMessage({
            type: "generatePlan",
            id: Date.now().toString(),
            query: input,
        });

        setInput("");
    };

    return (
        <div className="p-2 flex items-center justify-center text-white">
            <div className="relative w-full max-w-md">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={`w-full border border-neutral-400 bg-transparent text-neutral-300 px-3 pr-20 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 placeholder-neutral-400 ${loading ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                    placeholder="Describe your task"
                    disabled={loading}
                />
                <button
                    onClick={sendQuery}
                    disabled={loading}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 border border-neutral-400 text-neutral-300 rounded-xl px-2 py-1 text-sm hover:bg-neutral-800 hover:text-black transition-all ${loading ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                >
                    {loading ? "..." : <SendButton />}
                </button>
            </div>
        </div>

    );
}
