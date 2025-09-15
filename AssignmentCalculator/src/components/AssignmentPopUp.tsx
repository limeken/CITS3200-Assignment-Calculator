import {XMarkIcon,ChevronLeftIcon,ChevronRightIcon} from "@heroicons/react/24/solid";
import {useState} from "react";
import {type AssignmentType} from "../App.tsx"

// Component function for pop-ups associated with particular assignments added to calendar
export default function AssignmentPopUp({type,steps}:AssignmentType){
    // Holds the state corresponding to the current page to show for an assignment guide
    const [pagenumber,setPageNumber] = useState<number>(0);

    // Stores the page we currently need to display
    const currentStep = steps[pagenumber];

    // Holds the state used to decide if the pop-up should be displayed
    // Note: Set default to true for testing purposes
    const [showpopup, setPopUp] = useState<Boolean>(true);

    // Component that creates the visual dots to show the current page
    function CreatePageDots({dots}:{dots:Number}){
        return (
            <div className = "flex flex-row justify-center w-1/2 h-1/10 gap-2 absolute bottom-0 left-1/2 transform -translate-x-1/2">
                {[...Array(dots)].map((_,index)=><div className={index===pagenumber?"bg-slate-600 rounded-full size-4":"bg-black rounded-full size-3"} key={index}></div>)}
            </div>
        );
    }
    
    // Component for the current page of the study guide, shows details regarding a particular step
    function CurrentPage(){
        return (
                <div className="basis-4/5">
                    <h3 className="text-center my-5">{type}</h3>
                    <div className="bg-white rounded-xl shadow-md p-4 h-8/10 my-5 overflow-y-auto">
                        <h3 className="font-semibold mb-5">{currentStep.step}. {currentStep.name}:</h3>
                        <ul className="list-disc pl-4 flex flex-col gap-4 text-sm">{currentStep.instructions.map((instruction)=><li>{instruction}</li>)}</ul>
                    </div>
                </div>
        )
    }

    // Combines the current page of the study guide with the navigation buttons
    function DisplayBody(){
        return (
                <div className="flex flex-row justify-center w-full h-4/5">
                    {/* Left Navigation Button*/}
                    <button className = {pagenumber === 0? "invisible basis-1/10":"basis-1/10 self-center"} onClick = {() => setPageNumber((prev)=>{return prev===0?prev:prev-1;})}>
                        <ChevronLeftIcon className="w-10 h-10 hover:w-12 h-12"/>
                    </button>

                    <CurrentPage/>
                    
                    {/*Right Navigation Button*/}
                    <button className = {pagenumber === steps.length-1? "invisible basis-1/10":"basis-1/10 self-center"} onClick = {() => setPageNumber((prev)=>{return prev===steps.length-1?prev:prev+1;})}>
                        <ChevronRightIcon className="w-10 h-10 hover:w-12 h-12"/>
                    </button>
                </div>
            )
    }

    // Button to close the assignment pop-up
    function PopClose(){
        return (
                <button className="bg-red-600 absolute right-2 w-10 h-10 rounded-lg flex items-center justify-center flex-none hover:bg-red-900" onClick={()=>setPopUp(false)}>
                    <XMarkIcon className = "h-8 w-8 text-white hover:h-9 w-9" />
                </button>
        )
    }

    // Used to display the side menu, which contains external resources
    function AdditionalResources(){
        const [infoVisible, setInfoVisible] = useState<boolean>(currentStep.resources.length===0?false:true);
        return (
            <div className = "flex flex-row w-1/5 h-1/2">
                {/* Clever implementation where the main content becomes hidden, pushing the button against the main page*/}
                <div className={infoVisible?"bg-slate-300 text-gray-900 shadow-xl relative absolute rounded-r-sm basis-8/10 p-2":"hidden"}>
                    <h2 className = "text-center py-2 font-bold">Additional Resources</h2>
                    <hr/>
                    <ul className="list-disc p-4 flex flex-col gap-4 text-xs">
                        {currentStep.resources.map((resource)=><li>{resource}</li>)}
                    </ul>
                </div>
                {/* Toggles between true and false when clicked, dependent on previous state */}
                <button className="basis-1/10 bg-uwaBlue h-1/8 rounded-r-md relative top-2 text-white font-bold" onClick={()=>{setInfoVisible(!infoVisible)}}>
                ?
                </button>
            </div>
        )
    }

    return (
        // Toggles between shown and not shown, depending on the variable "showpopup"
        <div className={showpopup===true?"bg-stone-800/50 text-gray-900 size-full z-50 fixed top-0 left-0 flex flex-row items-center justify-center":"hidden"}>
            <div className="bg-slate-200 text-gray-900 rounded-xl shadow-2xl p-0 relative w-1/3 h-3/4 z-51">
                <div className="flex flex-row items-center justify-center relative h-1/10 w-full bg-uwaBlue py-2 rounded-t-xl shadow-xl">
                    <h2 className = "text-white font-bold">CITS3200 - Assignment 1</h2>
                    {/* Close Button*/}
                    <PopClose/>
                </div>
                {/* Main Page */}
                <DisplayBody/>
                {/* Display Dots */}
                <CreatePageDots dots={steps.length}/>
            </div>
            <AdditionalResources/>
        </div>
    );
}