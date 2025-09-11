import {XMarkIcon,ChevronLeftIcon,ChevronRightIcon} from "@heroicons/react/24/solid";
import {useState} from "react";
interface AssignmentSteps{
    step:number,
    name:string,
    value:number,
    instructions:string[]
    resources:string[]
}
interface AssignmentType{
    type:string,
    steps:AssignmentSteps[]
}



export default function AssignmentPopUp({type,steps}:AssignmentType){
    const [pagenumber,setPageNumber] = useState<number>(0);
    // Set default to true for testing purposes
    const [showpopup, setPopUp] = useState<Boolean>(true);

    function CreatePageDots({dots}:{dots:Number}){
        return (
            <div className = "flex flex-row justify-center w-1/2 h-1/10 gap-2 absolute bottom-0 left-1/2 transform -translate-x-1/2">
                {[...Array(dots)].map((_,index)=><span className={index===pagenumber?"bg-slate-600 rounded-full size-4":"bg-black rounded-full size-3"} key={index}/>)}
            </div>
        );
    }

    function CurrentPage(){
        const currentStep = steps[pagenumber];
        return (
                <div className="basis-4/5">
                    <h3 className="text-center my-5">{type}</h3>
                    <div className="bg-white rounded-xl shadow-soft p-2 h-8/10 my-5 overflow-y-auto">
                        <h3 className="font-semibold mb-5">{currentStep.step}. {currentStep.name}:</h3>
                        <ul className="list-disc pl-4 flex flex-col gap-4">{currentStep.instructions.map((instruction)=><li>{instruction}</li>)}</ul>
                    </div>
                </div>
        )
    }
    function DisplayBody(){
        return (
                <div className="flex flex-row justify-center w-full h-4/5">
                    <button className = "size-15 basis-1/10 self-center" onClick = {() => setPageNumber((prev)=>{return prev===0?prev:prev-1;})}>
                        <ChevronLeftIcon/>
                    </button>

                    <CurrentPage/>

                    <button className = "size-15 basis-1/10 self-center" onClick = {() => setPageNumber((prev)=>{return prev===steps.length-1?prev:prev+1;})}>
                        <ChevronRightIcon/>
                    </button>
                </div>
            )
    }
    return (
        <div className={showpopup===true?"bg-stone-800/50 text-gray-900 size-full z-50 fixed top-0 left-0 flex items-center justify-center":"hidden"}>
            <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-1/3 h-3/4 relative">
                <div className="flex flex-row justify-center relative h-1/10 w-full">
                    <h2>Heading Placeholder</h2>
                    <button className="bg-uwaBlue absolute right-5 w-10 h-10 rounded-lg flex items-center justify-center flex-none hover:bg-blue-950" onClick={()=>setPopUp(false)}>
                        <XMarkIcon className = "h-8 w-8 text-white" />
                    </button>
                </div>
                <hr/>
                <DisplayBody/>
                <CreatePageDots dots={steps.length}/>
            </div>
        </div>
    );
}