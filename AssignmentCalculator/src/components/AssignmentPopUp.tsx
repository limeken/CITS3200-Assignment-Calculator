import {XMarkIcon,ChevronLeftIcon,ChevronRightIcon} from "@heroicons/react/24/solid";
import {useState} from "react";
import {type AssignmentType} from "../App.tsx"

// Component function for pop-ups associated with particular assignments added to calendar
export default function AssignmentPopUp({type,steps}:AssignmentType){
    // Holds the state corresponding to the current page to show for an assignment guide
    const [pagenumber,setPageNumber] = useState<number>(0);

    // Holds the state used to decide if the pop-up should be displayed
    // Note: Set default to true for testing purposes
    const [showpopup, setPopUp] = useState<Boolean>(true);

    // Component that creates the visual dots to show the current page
    function CreatePageDots({dots}:{dots:Number}){
        return (
            <div className = "flex flex-row justify-center w-1/2 h-1/10 gap-2 absolute bottom-0 left-1/2 transform -translate-x-1/2">
                {[...Array(dots)].map((_,index)=><span className={index===pagenumber?"bg-slate-600 rounded-full size-4":"bg-black rounded-full size-3"} key={index}/>)}
            </div>
        );
    }
    
    // Component for the current page of the study guide, shows details regarding a particular step
    function CurrentPage(){
        // Stores the page we currently need to display
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

    // Combines the current page of the study guide with the navigation buttons
    function DisplayBody(){
        return (
                <div className="flex flex-row justify-center w-full h-4/5">
                    {/* Left Navigation Button*/}
                    <button className = "size-15 basis-1/10 self-center" onClick = {() => setPageNumber((prev)=>{return prev===0?prev:prev-1;})}>
                        <ChevronLeftIcon/>
                    </button>

                    <CurrentPage/>
                    
                    {/*Right Navigation Button*/}
                    <button className = "size-15 basis-1/10 self-center" onClick = {() => setPageNumber((prev)=>{return prev===steps.length-1?prev:prev+1;})}>
                        <ChevronRightIcon/>
                    </button>
                </div>
            )
    }

    // Button to close the assignment pop-up
    function PopClose(){
        return (
                <button className="bg-uwaBlue absolute right-5 w-10 h-10 rounded-lg flex items-center justify-center flex-none hover:bg-blue-950" onClick={()=>setPopUp(false)}>
                    <XMarkIcon className = "h-8 w-8 text-white" />
                </button>
        )
    }

    return (
        // Toggles between shown and not shown, depending on the variable "showpopup"
        <div className={showpopup===true?"bg-stone-800/50 text-gray-900 size-full z-50 fixed top-0 left-0 flex items-center justify-center":"hidden"}>
            <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-1/3 h-3/4 relative">
                <div className="flex flex-row justify-center relative h-1/10 w-full">
                    <h2>Heading Placeholder</h2>
                    {/* Close Button*/}
                    <PopClose/>
                </div>
                <hr/>
                {/* Main Page */}
                <DisplayBody/>
                {/* Display Dots */}
                <CreatePageDots dots={steps.length}/>
            </div>
        </div>
    );
}