import {XMarkIcon,ChevronLeftIcon,ChevronRightIcon} from "@heroicons/react/24/solid";
import {useState} from "react";

export interface AssignmentSteps {
    step:number,
    name:string,
    value:number,
    instructions:string[]
    resources:string[]
}

export interface AssignmentType{
    type:string,
    steps:AssignmentSteps[]
}

// Placeholder representing a written assessment
const writtenSteps: Array<AssignmentSteps> = [
    {step:1, name:"Read instructions",value:5,instructions:[
            "Read the full assignment instructions and any associated materials. Read the rubric!",
            "Pay attention to specific details such as number/type of sources needed, suggested structure, and referencing style",
            "Ask clarifying questions if you are unsure about the instructions"
        ],
        resources:[]},
    {step:2, name:"Break down question",value:5,instructions:[
            "Break down the assignment question and highlight key words",
            "Consider the task words (i.e. argue, summarise, describe) to determine exactly what you are being asked to do",
            "Think about the topic, and about refining the scope of what you will write about (the more refined the scope is, the easier it is to write and research)"
        ],
        resources:[
            "Come along to a drop-in or writing consultation [ASC-WEB] if you want advice on this step"
        ]},
    {step:3, name:"Do some general research",value:15,instructions:[
            "Consider what you already know about the topic, and what you need to find out",
            "Do some general reading on the topic (just enough to be able to have an informed view to enable you to start planning; dont read everything yet!)",
            "From this general reading you can start to form an idea of what position or stance you might choose to take in response to the question"
        ],
        resources:[
            "Come along to a drop-in or book a librarian for help with search strategies [LIB-BOOK]"
        ]},
    {step:4, name:"Brainstorm and plan your answer",value:15,instructions:[
            "Do some brainstorming on the topic/sub-topics",
            "Decide on your thesis or position (i.e. what is your answer to the assignment question).",
            "Consider how to further refine the scope of your position to make is as specific as possible (refine scope around time, cohort, location, aspect)",
            "Decide how you are going to substantiate your position; what will be your main points?",
            "Write out a plan detailing what each of your paragraphs will focus on (stick to one main point per paragraph)",
            "Do further, more targeted research to find specific evidence for each of your paragraphs"
        ],
        resources:[]},
    {step:5, name:"Alternate writing and further research",value:40,instructions:[
            "Begin writing, alternating between writing and research",
            "Continue doing targeted research while you are writing to ensure each paragraph is supported if you deviate from your plan or go in a slightly different direction",
            "Structure your introduction and conclusion using the general > specific principle",
            "Make sure each of your paragraphs is roughly similar in length and covers one main point which is indicated by the topic sentence",
            "Ensure you are integrating evidence into each paragraph using quotes and paraphrasing"
        ],
        resources:[
            "Check out the Academic Skills Guides for advice on writing [ASC-GUID]",
            "Reference as you go, to ensure you dont miss anything [LIB-BOOK]"
        ]},
    {step:6, name:"Edit and redraft",value:20,instructions:[
            "Edit and redraft, focusing on macro features first (structure, flow, sources)",
            "Check that your paragraph structure is sufficiently linked back to your overall position or stance, and that you have answered the assignment question [ASC-WEB]",
            "Once you are happy with the structure, edit for micro features (wording, references, grammar)",
            "Double check your references according to the UWA Style Guide [LIB-REF]",
            "Do a final proofread (try reading out aloud)",
            "Check against the rubric that you have completed all requirements"
        ],
        resources:[]},
    {step:7, name:"Submit",value:0,instructions:[
            "You are now ready to submit your assignment. Congratulations!",
            "Please check for a submission receipt to make sure your submission worked"

        ],
        resources:[]}

]

// Component function for pop-ups associated with particular assignments added to calendar
const AssignmentPopUp: React.FC<AssignmentType> = ({
        type = "Written Assessment",
        steps = writtenSteps,
})=> {
    // Holds the state corresponding to the current page to show for an assignment guide
    const [pagenumber,setPageNumber] = useState<number>(0);

    // Stores the page we currently need to display
    const currentStep = steps[pagenumber];

    // Holds the state used to decide if the pop-up should be displayed
    // Note: Set default to true for testing purposes
    const [showpopup, setPopUp] = useState<boolean>(true);

    // Component that creates the visual dots to show the current page
    function CreatePageDots({dots}:{dots:number}){
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
                    <button className = {pagenumber === 0? "invisible basis-1/10":"basis-1/10 self-center transition duration-200 ease-in-out hover:scale-120"} onClick = {() => setPageNumber((prev)=>{return prev===0?prev:prev-1;})}>
                        <ChevronLeftIcon className="w-10 h-10"/>
                    </button>

                    <CurrentPage/>
                    
                    {/*Right Navigation Button*/}
                    <button className = {pagenumber === steps.length-1? "invisible basis-1/10":"basis-1/10 self-center transition duration-200 ease-in-out hover:scale-120"} onClick = {() => setPageNumber((prev)=>{return prev===steps.length-1?prev:prev+1;})}>
                        <ChevronRightIcon className="w-10 h-10"/>
                    </button>
                </div>
            )
    }

    // Button to close the assignment pop-up
    function PopClose(){
        return (
                <button className="bg-red-600 absolute right-2 w-10 h-10 rounded-lg flex items-center justify-center shadow-sm shadow-black/50 hover:bg-red-900 transition duration-300 ease-in-out hover:scale-110" onClick={()=>setPopUp(false)}>
                    <XMarkIcon className = "h-8 w-8 text-white" />
                </button>
        )
    }

    // Displayed when there are additional resources available
    function NotificationDot(){
        if(currentStep.resources.length !== 0){
            return (
                <>
                <div className="bg-red-400 rounded-full size-3 absolute top-[-3px] right-[-3px] animate-ping"></div>
                <div className="bg-red-500 rounded-full size-3 absolute top-[-3px] right-[-3px]"></div>
                </>
            )
        }
    }
    // Used to display the side menu, which contains external resources
    function AdditionalResources(){
        const [infoVisible, setInfoVisible] = useState<boolean>(false);
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
                <button className="basis-1/10 bg-uwaBlue h-1/8 rounded-r-md top-2 text-white font-bold relative" onClick={()=>{setInfoVisible(!infoVisible)}}>
                    <NotificationDot/>
                    ?
                </button>
            </div>
        )
    }

    return (
        // Toggles between shown and not shown, depending on the variable "showpopup"
        <div className={showpopup===true?"bg-stone-800/50 text-gray-900 size-full z-50 fixed top-0 left-0 flex flex-row items-center justify-center":"hidden"}>
            <div className="bg-slate-200 text-gray-900 rounded-xl shadow-2xl p-0 relative w-1/3 h-3/4 z-51">
                <div className="flex flex-row items-center justify-center relative h-1/10 w-full bg-uwaBlue py-2 rounded-t-xl shadow-sm shadow-black">
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

export default AssignmentPopUp;