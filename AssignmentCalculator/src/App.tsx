import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import "./index.css";
import {testRows} from "./components/testdata.ts";

// Import webiste components from components subfolder
import UniversityBanner from "./components/UniversityBanner.tsx"
import InstructionsPage from "./components/InstructionsPage.tsx"
import ApplicationHeading from "./components/ApplicationHeading.tsx"
import StudyPlanInputFields from "./components/StudyPlanInputFields.tsx"
import AssignmentPopUp from "./components/AssignmentPopUp.tsx";
import Calendar, {type CalendarRef} from "./components/Calendar.tsx";
import {type Assignment, parseIcsCalendar, validateCalendar} from "./components/CalendarTypes.ts";

export interface AssignmentSteps{
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
const writtenSteps:AssignmentSteps[] = [
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
const writtenAssessment:AssignmentType = {
    type:"Written Assessment",
    steps:writtenSteps

}
// Each assignment to be added to the assignment planner
type ScheduleItem = { task: string; date: string };

// Object type that stores compatible assignment types
type TaskMap = Record<string, string[]>;

export type StateFunctions = {
    setSelectedType: (name: string) => void,
    setStartDate: (start: Date) => void,
    setEndDate: (end: Date) => void,
}

// Store assignment breakdowns here
export const TASKS: TaskMap = {
    Essay: [
        "Understand the question",
        "Initial research & sources",
        "Draft outline",
        "Write body paragraphs",
        "Write intro & conclusion",
        "Edit & proofread",
    ]
};

/* a default (empty) assignment to fill the state with. Useful for instancing additional objects */
const DEFAULT: Assignment = () => ({
    name: "Essay", color: "#000", start: null, end: null, events: new Array<[]>
})


// Main application component
export default function App() {

    const [validAssignment, setValidAssignment] = useState<Assignment>(DEFAULT);
    const [errors, setErrors] = useState<Array<boolean>>([true, true, true]);
    const calRef = useRef<CalendarRef>(null);

    // Object that stores all state functions
    const stateFunctions: StateFunctions = {
        setSelectedType: (name: string) => {
            setValidAssignment(prev => ({...prev, name: name }));
            console.log(`set calendar name to: ${name}`);
        },
        setStartDate: (start: Date) => {
            setValidAssignment(prev => ({...prev, start: start }))
            console.log(`set calendar start to: ${start}`);
        },
        setEndDate: (end: Date) => {
            setValidAssignment(prev => ({...prev, end: end }))
            console.log(`set calendar end to: ${end}`);
        },
        //setHoursPerDay:setHoursPerDay,
    };

    const generateCalendar = useCallback(async () => {

        /* TODO: better validation (i.e. check for more than "not null") for each of these */
        /* simple validation check, realistically it should happen in the CalendarTypes.ts file */

        // validation function exists in CalendarTypes.ts
        const new_errors = validateCalendar(validAssignment);
        if( new_errors.some(f => !f)) {
            setErrors(new_errors);
            return;
        }

        /* check if the current assignment is valid */
        await setValidAssignment(prev => ({
            name: prev.name,
            color: "#aaa",
            start: prev.start,
            end: prev.end,
            events: [{
                uid: null,
                summary: "placeholder",
                description: "this is a placeholder event",
                status: null,
                start: prev.start,
                end: prev.end,
                tzid: "AWST",
            }],
        }));

        if( validAssignment ) {
            await calRef.current?.addAssignment(validAssignment);
        }

    }, [validAssignment]);
    

    // This returns the finalised webpage, including all key components
    return (
        <>
            {/* University Banner */}
            <UniversityBanner/>
            {/* Application Title Bar */}
            <ApplicationHeading/>
            {/* User Instructions Button & Page*/}
            <InstructionsPage/>
            {/* Section for Input Fields */}

            {/* TODO: We can define a parent component that dictates styling of children */}
            {/* Difficult to modularise, but all the elements in this component share a parent. */}
            <StudyPlanInputFields stateFunctions={stateFunctions} errors={errors} onImport={generateCalendar} onGenerate={generateCalendar}/>

            <section className={"mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6"}>
                <div className="bg-slate-200 rounded-xl shadow-soft p-4">
                    <Calendar ref={calRef}/>
                </div>
            </section>
            <AssignmentPopUp type = {writtenAssessment.type} steps = {writtenAssessment.steps}/>
        </>
    );
}
