import React, { useState, useEffect } from "react";
import type { AssignmentCalendar } from "./CalendarTypes.ts";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/24/solid";
import {DocumentIcon, XMarkIcon, TagIcon } from '@heroicons/react/24/outline';

import { assignmentTypes } from "../testdata.ts";

// This component displays the steps for valid assignments, in top-down order
const AssignmentStepsComponent: React.FC<{assignment:AssignmentCalendar|null}> = ({assignment}) => {
    // Keeps track of what step is currently open
    const [openStep, setOpenStep] = useState<number|null>(0);

    // Reset the step count every time a new assignment is shown
    useEffect(() => {setOpenStep(0);}, [assignment]);
    
    // This maps the selected assignment with its assignment type
    const assignmentType = assignment ? assignmentTypes[assignment.assignmentType] : null;
    if(assignment != null){
        return (
            <div className={`flex items-center justify-center bg-slate-200 rounded-xl shadow-soft p-4 w-4/5`}>
                <div className="size-full p-4 rounded-xl flex flex-col items-center border-3 border-slate-300 relative">
                    <h1 className="font-bold text-xl mb-4">{assignment.unitCode} - {assignment.name}</h1>
                    <div className = "flex flex-col gap-2 items-center w-3/4">
                    {/* This creates a descending sequence of step elements to show*/}
                    {assignmentType!.events.map((step, index)=>
                        <div key={index} className="flex flex-col w-full">
                            {/* Element that when clicked shows the dot points for a given step */}
                            {/* Panel that is shown for a given step when selected */}
                            <div className="flex flex-col gap-4 rounded-xl">
                                <button 
                                className="bg-uwaBlue text-white text-lg rounded-xl shadow-lg w-full h-10 flex items-center justify-left pl-4 gap-2 relative"
                                onClick={()=>openStep===index?setOpenStep(null):setOpenStep(index)}
                                >
                                    <span className="font-semibold">Step {index+1}: {step.name}</span>
                                    {index===openStep?<ChevronUpIcon className="w-5 h-5 absolute right-5"/>:<ChevronDownIcon className="w-5 h-5 absolute right-5"/>}
                                </button>
                                <div className={`flex flex-col gap-4 w-full transition-all duration-300 ease-in-out origin-top overflow-hidden
                                    ${index === openStep ? "max-h-500" : "max-h-0"}`}>
                                    <div className="p-5 bg-white rounded-xl">
                                        <ul className="flex list-disc flex-col gap-3 pl-4 text-md">
                                            {/* Lists all the dot points within a given step's panel */}
                                            {step.instructions && step.instructions.map((dotpoint,id)=>
                                                <li key={id}>{dotpoint}</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Only show additional resources when available */}
                                    {step.resources && step.resources.length > 0?
                                    <div className="p-5 bg-white rounded-xl">
                                        <h1 className="font-bold">Additional Resources:</h1>
                                        <ul className="mt-2 flex list-disc flex-col gap-3 pl-4 text-md">
                                            {/* Lists all Additional Resources */}
                                            {step.resources.map((resource,id)=>
                                                <li key={id}>{resource}</li>
                                            )}
                                        </ul>
                                    </div>
                                    :null}
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
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
            <section className={`flex flex-col items-center gap-5 w-full max-w-6xl px-4 sm:px-6 mt-6 ${show?"":"hidden"}`}>
                {/* Tab group for unit selection */}
                <TabGroup className="w-4/5 flex flex-row items-center gap-4 mx-auto">
                    <div className="bg-slate-100 flex flex-col gap-2 rounded-xl shadow-lg p-4 w-1/3">
                        <h1 className="font-bold text-lg flex flex-row gap-2">
                            <TagIcon className="w-5 h-5"/>
                            <span>Units:</span>
                        </h1>
                        <hr className="border-slate-300"/>
                        {/* Lists buttons for each unit*/}
                        <TabList className="flex flex-col overflow-y-auto gap-4 h-60">
                            {Object.keys(assignments).map((code)=> 
                                <Tab key={code}
                                    className={`w-full h-12 rounded-lg text-white px-4 flex flex-shrink-0 items-center justify-between ${"bg-"+assignments[code][0].color+"-200"} ${"data-selected:bg-"+assignments[code][0].color+"-200"}`}
                                >
                                    {({ selected }) => (
                                        <>
                                        <span className="font-bold">{code}</span>
                                        <div className={`w-3 h-3 bg-white rounded-full ${selected ? 'block' : 'hidden'}`}/>
                                        </>
                                    )}
                                </Tab>
                            )}
                        </TabList>
                    </div>

                    {/* Shows assessment buttons based on unit selected */}
                    <div className="bg-slate-100 flex flex-col gap-2 rounded-xl shadow-lg p-4 w-2/3">
                        <h1 className="font-bold text-lg flex flex-row gap-2">
                            <DocumentIcon className="w-5 h-5"/>
                            <span>Assignments:</span>
                        </h1>
                        <hr className="border-slate-300"/>
                        <TabPanels className="w-full h-60">
                            {Object.keys(assignments).map((code)=> 
                                <TabPanel key={code} className="flex flex-col overflow-y-auto gap-4 w-full">
                                    {/* Tab group for assessments associated with a unit */}
                                    {assignments[code].map((assignment)=>
                                    <button 
                                        className="w-full h-12 bg-white rounded-lg px-4 flex flex-shrink-0 items-center justify-between hover:bg-grey-100"
                                        onClick={()=>setCurrentAssignment(assignment)}
                                        >
                                        <span>{assignment.name}</span>
                                        <div className={`${assignment===currentAssignment?"block":"hidden"}`}>
                                            <CheckIcon className="w-6 h-6 ml-2 text-green-200"/>
                                        </div>
                                    </button>
                                    )}
                                </TabPanel>
                            )}
                        </TabPanels>
                    </div>
                </TabGroup>
                <AssignmentStepsComponent assignment={currentAssignment}/>
            </section>
        )
    }
    else{        
        return (
            <div className={`size-150 p-5 bg-slate-200 rounded-xl flex justify-center items-center shadow-xl ${show?"":"hidden"}`}>
                <div className="size-full rounded-xl flex flex-col gap-6 justify-center items-center border-3 border-slate-300 relative">
                    <div className="relative inline-block text-slate-300">
                        <DocumentIcon className="w-30 h-30" />
                        <XMarkIcon
                            className="w-50 h-50 absolute top-2/5 left-1/2 -translate-x-1/2 -translate-y-2/5 text-slate-200 z-0" strokeWidth={1.6}
                        />
                        <XMarkIcon
                            className="w-50 h-50 absolute top-2/5 left-1/2 -translate-x-1/2 -translate-y-2/5 text-red-300 z-10" strokeWidth={0.9}
                        />
                    </div>
                    <p className="font-semibold text-slate-400 text-xl"> No Assignments Available.</p>
                </div>
            </div>
        );
    }
}
export default TextCalendar;