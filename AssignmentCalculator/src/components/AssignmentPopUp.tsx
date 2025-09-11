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
    stages:AssignmentSteps[]
}

const writtenStages:AssignmentSteps[] = [
    {step:1, name:"Read instructions",value:5,instructions:[
        "Read the full assignment instructions and any associated materials Read the rubric!", 
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
        "check out the Academic Skills Guides for advice on writing [ASC-GUID]",
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
const written:AssignmentType = {
    type:"Written Assessment",
    stages:writtenStages

}

export default function AssignmentPopUp(/*{type,stages}:AssignmentType*/){
    const [pagenumber,setPageNumber] = useState<number>(0);
    function CreatePageDots({dots}:{dots:Number}){
        return (
            <div className = "flex flex-row justify-center w-1/2 h-1/10 gap-2 absolute bottom-0 left-1/2 transform -translate-x-1/2">
                {[...Array(dots)].map((_,index)=><span className={index===pagenumber?"bg-slate-600 rounded-full size-4":"bg-black rounded-full size-3"} key={index}/>)}
            </div>
        );
    }
    function CurrentPage(){
        return (
                <div className="basis-4/5">
                    <h3>Assessment type</h3>
                    <div>
                        <h3></h3>
                        <p></p>
                    </div>
                    <div>
                        <h3></h3>
                        <p></p>
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


                    <button className = "size-15 basis-1/10 self-center" onClick = {() => setPageNumber((prev)=>{return prev===4?prev:prev+1;})}>
                        <ChevronRightIcon/>
                    </button>
                </div>
            )
    }
    return (
        <div className="bg-stone-800/50 text-gray-900 size-full z-50 fixed top-0 left-0 flex items-center justify-center">
            <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-1/3 h-3/4 relative">
                <div className="flex flex-row justify-center relative h-1/10 w-full">
                    <h2>Heading Placeholder</h2>
                    <button className="bg-uwaBlue absolute right-5 w-10 h-10 rounded-lg flex items-center justify-center flex-none hover:bg-blue-950">
                        <XMarkIcon className = "h-8 w-8 text-white" />
                    </button>
                </div>
                <hr/>
                <DisplayBody/>
                <CreatePageDots dots={5}/>
            </div>
        </div>
    );
}