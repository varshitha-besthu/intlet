export default function View(){
    return <div className="h-screen">
        <div className=" text-white">
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="font-bold text-2xl">Complex Code Changes  Made Simple</h1>
                    <p>Turn hours of coding into minutes with an AI that plans, implements, and reviews every change.</p>
                </div>
            </div>
            <div className="fixed bottom-2 flex items-center w-full">
                <input type="text" className="border-1 w-full mx-1 border-white"/>
                <button className="border-1 rounded-md px-2  border-white">Send</button>
            </div>
        </div>
    </div>
}