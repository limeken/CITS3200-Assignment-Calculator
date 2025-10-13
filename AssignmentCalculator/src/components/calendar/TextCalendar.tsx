import React, { useState, useEffect } from "react";
import type { AssignmentCalendar } from "./CalendarTypes.ts";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/24/outline";
import {DocumentIcon, ChevronRightIcon, TagIcon } from '@heroicons/react/24/outline';

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
                    <h1 className="font-bold text-3xl mb-4">{assignment.unitCode} - {assignment.name}</h1>
                    <div className = "flex flex-col gap-2 items-center w-3/4 py-4">
                    {/* This creates a descending sequence of step elements to show*/}
                    {assignmentType!.events.map((step, index)=>
                        <div key={index} className="flex flex-col w-full">
                            {/* Element that when clicked shows the dot points for a given step */}
                            {/* Panel that is shown for a given step when selected */}
                            <div className="flex flex-col gap-4 rounded-xl">
                                <button 
                                    className="bg-uwaBlue text-white text-lg rounded-xl shadow-lg w-full h-14 flex items-center justify-left pl-4 gap-2 relative transition-all duration-150 ease-out cursor-pointer hover:scale-95 hover:brightness-110"
                                    onClick={()=>openStep===index?setOpenStep(null):setOpenStep(index)}
                                >
                                    <span className="font-semibold">Step {index+1} : {step.name}</span>
                                    {index===openStep?<ChevronUpIcon className="w-6 h-6 absolute right-5" strokeWidth={2}/>:<ChevronDownIcon className="w-6 h-6 absolute right-5" strokeWidth={2}/>}
                                </button>
                                <div className={`
                                                flex flex-col gap-4 w-full overflow-hidden origin-top
                                                transition-all
                                                ${index === openStep
                                                ? "duration-1600 ease-[cubic-bezier(0.16,1,0.3,1)] max-h-[1000px] opacity-100 scale-y-100"
                                                : "duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] max-h-0 opacity-0 scale-y-95"
                                                }
                                                `}
                                            >
                                    <div className="p-5 bg-white rounded-xl">
                                        <h1 className="font-bold">{step.name}</h1>
                                        <ul className="mt-2 flex list-disc flex-col gap-3 pl-4 text-md">
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

    return(
        <section className={`flex flex-col items-center gap-5 w-full max-w-6xl px-4 sm:px-6 mt-6 ${show?"":"hidden"}`}>
            {/* Tab group for unit selection */}
            <TabGroup className="w-4/5 flex flex-row items-center gap-4 mx-auto">
                <div className="bg-slate-100 flex flex-col gap-2 rounded-xl shadow-lg p-4 w-1/3">
                    <h1 className="font-bold text-lg flex flex-row gap-2 items-center justify-left">
                        <TagIcon className="w-6 h-6"/>
                        <span>Units:</span>
                    </h1>
                    <hr className="border-slate-300"/>
                    {/* Lists buttons for each unit*/}
                    <TabList className="flex flex-col overflow-y-auto gap-4 h-60">
                        {Object.keys(assignments).map((code)=> 
                            <Tab
                                key={code}
                                className={({ selected }) => `
                                    w-full h-12 rounded-lg text-white px-4 flex flex-shrink-0 items-center justify-between
                                    bg-${assignments[code][0].color}-400
                                    transition-all duration-150 ease-out
                                    cursor-pointer
                                    hover:scale-95 hover:brightness-110
                                    ${selected ? 'border-2 border-white' : 'border border-transparent'}
                                `}
                            >
                                {({ selected }) => (
                                    <>
                                        <span className="font-bold">{code}</span>
                                        <ChevronRightIcon
                                            className={`w-6 h-6 text-white transition-all duration-200 ${selected ? 'opacity-100' : 'opacity-0'}`}
                                        />
                                    </>
                                )}
                            </Tab>
                        )}
                    </TabList>
                </div>

                {/* Shows assessment buttons based on unit selected */}
                <div className="bg-slate-100 flex flex-col gap-2 rounded-xl shadow-lg p-4 w-2/3">
                    <h1 className="font-bold text-lg flex flex-row gap-2 items-center justify-left">
                        <DocumentIcon className="w-6 h-6"/>
                        <span>Assignments:</span>
                    </h1>
                    <hr className="border-slate-300"/>
                    <TabPanels className="w-full h-60">
                        {Object.keys(assignments).map((code)=> 
                            <TabPanel key={code} className="flex flex-col overflow-y-auto gap-4 w-full">
                                {/* Tab group for assessments associated with a unit */}
                                {assignments[code].map((assignment)=>
                                <button 
                                    className={`
                                        w-full h-12 bg-white rounded-lg px-4 flex flex-shrink-0 items-center justify-between
                                        border-2 transition-all duration-150 ease-in-out hover:bg-blue-100
                                        ${assignment === currentAssignment
                                        ? "border-blue-500 shadow-sm"
                                        : "border-gray-200"}
                                    `}
                                    onClick={()=>setCurrentAssignment(assignment)}
                                    >
                                    <span>{assignment.name}</span>
                                    <div className={`${assignment===currentAssignment?"block":"hidden"}`}>
                                        <CheckIcon className="w-6 h-6 ml-2 text-uwaBlue" strokeWidth={3}/>
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
export default TextCalendar;