import { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { planState, errorState, loadingState, subPhaseState } from "../recoil/atom";
import Header from "./Header";
import PhaseList from "./PhaseList";
import InputBar from "./InputBar";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import SubPhase from "./SubPhase";

export default function View() {
  const [plan, setPlan] = useRecoilState(planState);
  const [subPhase, setSubPhase] = useRecoilState(subPhaseState)
  const error = useRecoilValue(errorState);
  const loading = useRecoilValue(loadingState);
  const setError = useSetRecoilState(errorState);
  const setLoading = useSetRecoilState(loadingState);

  useEffect(() => {
    console.log("Listener attached");

    const handler = (event: MessageEvent) => {
      const msg = event.data;
      console.log("Message received:", msg);

      if (msg.type === "planGenerated") {
        setLoading(false);
        if (msg.error) {
          setError(msg.error);
        } else {
          setPlan(msg.plan);
          setError(null);
        }
      }

      if(msg.type === "subPhaseGenerated"){
        setLoading(false);
        if(msg.error){
          setError(msg.error);
        }else{
          console.log("message is", msg);
          console.log("subPhase is", msg.subPhase)
          
          setSubPhase(msg.subPhase);
          setError(null);
        }
      }
    };

    window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }, [setPlan, setError, setLoading]);

    return (

      <div className="h-screen text-white flex flex-col justify-between">
        <div className="flex-1 overflow-y-auto p-4">
          {
            !subPhase ? (loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-300 font-medium mb-3">Generating plan...</div>
                  <div className="mx-auto w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            ) : error ? (
              <ErrorState message={error} />
            ) : plan ? (
              <div>
                <Header title={plan.title} description={plan.description} />
                <PhaseList phases={plan.phases} planId={plan.id} />
              </div>
            ) : (
              <EmptyState />
            )
          ): (
          <div> 
            <SubPhase SubPhase={subPhase } />
          </div>
        )}
        </div>

        <InputBar />
      </div>
    );
}

