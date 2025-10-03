import React, { useState, useEffect } from "react";
import type { AssignmentCalendar } from "./CalendarTypes.ts";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon, MinusIcon} from "@heroicons/react/24/solid";
import {DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { assignmentTypes } from "../testdata.ts";

// This component displays the steps for valid assignments, in top-down order
const AssignmentStepsComponent: React.FC<{assignment:AssignmentCalendar|null}> = ({assignment}) => {
    // Keeps track of what step is currently open
    const [openStep, setOpenStep] = useState<number>(0);

    // Reset the step count every time a new assignment is shown
    useEffect(() => {setOpenStep(0);}, [assignment]);
    
    // This maps the selected assignment with its assignment type
    const assignmentType = assignment ? assignmentTypes[assignment.assignmentType] : null;
    if(assignment != null){
        return (
            <div className={`flex flex-col items-center bg-slate-200 rounded-xl shadow-soft p-4 w-full`}>
                <h1 className="font-bold text-xl">{assignment.unitCode} - {assignment.name}</h1>
                <hr className="w-4/5 my-5"/>
                <div className = "flex flex-col gap-2 items-center w-3/4">
                {/* This creates a descending sequence of step elements to show*/}
                {assignmentType!.events.map((step, index)=>
                    <div key={index} className="flex flex-col gap-4 w-full">
                        {/* Element that when clicked shows the dot points for a given step */}
                        <button 
                        className="bg-slate-300 rounded-xl w-full h-10 flex items-center justify-left pl-4 gap-2 relative"
                        onClick={()=>setOpenStep(index)}
                        >
                            <span className="font-bold">Step {index+1}: {step.name}</span>
                            {index===openStep?<MinusIcon className="w-5 h-5"/>:<ChevronDownIcon className="w-5 h-5"/>}
                        </button>

                        {/* Panel that is shown for a given step when selected */}
                        <div className="overflow-hidden rounded-xl">
                            <div className={`bg-white rounded-xl w-full transition-all duration-300 ease-in-out origin-top
                                ${index === openStep ? "max-h-50 p-5 overflow-y-scroll" : "max-h-0 p-0 overflow-hidden"}`}>
                                <ul className="mt-2 flex list-disc flex-col gap-3 pl-4 text-md">
                                    {/* Lists all the dot points within a given step's panel */}
                                    {step.instructions && step.instructions.map((dotpoint,id)=>
                                        <li key={id}>{dotpoint}</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        )
    }
    // Error case when there exists no assignment to show
    else{return null;}
}

// Main component representing the textual unit format
const TextCalendar: React.FC<{show:boolean; assignments:Record<string, AssignmentCalendar[]>}> = ({show, assignments}) => {
    const[currentAssignment, setCurrentAssignment] = useState<AssignmentCalendar|null>(null);

    // Rendered only when assignments are available
    if(Object.keys(assignments).length > 0){
        return(
            <section className={`flex flex-col items-center gap-5 mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6 ${show?"":"hidden"}`}>
                {/* Tab group for unit selection */}
                <TabGroup className="w-full flex flex-col justify-center mx-auto w-full bg-slate-300 rounded-xl overflow-hidden gap-2">
                    {/* Lists buttons for each unit*/}
                    <TabList className="bg-uwaBlue rounded-xl rounded-b-none shadow-soft p-4 grid grid-cols-4 gap-4 w-full">
                        {Object.keys(assignments).map((code)=> 
                            <Tab key={code}
                                className={`w-full h-12 rounded-lg text-white px-4 flex items-center justify-between ${"bg-"+assignments[code][0].color+"-200"} ${"data-selected:bg-"+assignments[code][0].color+"-200"}`}
                            >
                                {({ selected }) => (
                                    <>
                                    <span className="font-bold">{code}</span>
                                    <CheckIcon className={`w-5 h-5 ml-2 text-white ${selected ? 'block' : 'hidden'}`} />
                                    </>
                                )}
                            </Tab>
                        )}
                    </TabList>

                    {/* Shows assessment buttons based on unit selected */}
                    <TabPanels className="w-full">
                        {Object.keys(assignments).map((code)=> 
                            <TabPanel key={code} className="grid grid-cols-4 gap-4 w-full p-4">
                                {/* Tab group for assessments associated with a unit */}
                                {assignments[code].map((assignment)=>
                                <button 
                                    className="w-full h-12 bg-white rounded-lg px-4 flex items-center justify-between"
                                    onClick={()=>setCurrentAssignment(assignment)}
                                    >
                                    <span>{assignment.name}</span>
                                    <div className={`${assignment===currentAssignment?"block":"hidden"}`}>
                                        <CheckIcon className="w-5 h-5 ml-2"/>
                                    </div>
                                </button>
                                )}
                            </TabPanel>
                        )}
                    </TabPanels>
                </TabGroup>
                <AssignmentStepsComponent assignment={currentAssignment}/>
            </section>
        )
    }
    else{        
        return (
            <div className={`size-150 bg-slate-200 rounded-xl flex flex-col gap-2 justify-center items-center shadow-xl ${show?"":"hidden"}`}>
                <div className="relative size-45">
                    <DocumentTextIcon className="z-20 w-30 h-30 absolute left-1/2 top-1/2 text-slate-300 transform -translate-x-1/2 -translate-y-1/2"/>
                    <XMarkIcon className="z-21 w-50 h-50 absolute left-1/2 top-1/2 text-red-300 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={0.8}/>
                </div>
                <div className="font-semibold text-slate-400 text-lg">No assignments available</div>
                <button className="bg-uwaBlue w-1/3 h-15 text-white rounded-xl font-bold shadow-xl">Create</button>
            </div>
        );
    }
}
export default TextCalendar;