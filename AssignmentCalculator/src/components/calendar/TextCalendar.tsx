import React, { useState, Fragment} from "react";
import type { AssignmentCalendar } from "./CalendarTypes.ts";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { assignmentTypes } from "../testdata.ts";
import type { Assignment } from "./CalendarTypes.ts";


// This component displays the steps for valid assignments, in top-down order
const AssignmentStepsComponent: React.FC<{assignmentTypes:Record<string,Assignment>, assignment:AssignmentCalendar|null}> = ({assignmentTypes, assignment}) => {
    const assignmentType = assignment ? assignmentTypes[assignment.assignmentType] : null;
    if(assignment != null){
        return (
            <div className={`flex flex-col items-center bg-slate-200 rounded-xl shadow-soft p-4 w-4/5`}>
                <h1 className="font-bold">{assignment.unitCode} - {assignment.name}</h1>
                <div className = "flex flex-col gap-4 items-center w-3/4">
                {assignmentType!.events.map((step, index)=>
                    <div className="bg-slate-300 rounded-xl w-full h-10 flex items-center justify-center gap-2">
                        <span className="font-bold">Step {index+1}: {step.name}</span>
                        <ChevronDownIcon className="w-5 h-5"/>
                    </div>
                )}
                </div>
            </div>
        )
    }
    // Error case when there exists no assignment to show
    else{
        return null;
    }
}

// Main component representing the textual unit format
const TextCalendar: React.FC<{show:boolean; assignments:Record<string, AssignmentCalendar[]>}> = ({show, assignments}) => {
    const[currentAssignment, setCurrentAssignment] = useState<AssignmentCalendar|null>(null);
    return(
        <section className={`flex flex-col items-center gap-5 mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6 ${show?"":"hidden"}`}>
            {/* Tab group for unit selection */}
            <TabGroup className="w-full flex flex-col gap-5 justify-center mx-auto w-full">
                {/* Lists buttons for each unit*/}
                <TabList className="bg-slate-200 rounded-xl shadow-soft p-4 grid grid-cols-4 gap-4 w-full">
                    {Object.keys(assignments).map((code)=> 
                        <Tab key={code}
                            className="w-full h-12 bg-uwaBlue rounded-lg text-white px-4 flex items-center justify-between data-selected:bg-blue-800"
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
                        <TabPanel key={code} className="bg-slate-200 rounded-xl shadow-soft p-4 grid grid-cols-4 gap-4 w-full">
                            {/* Tab group for assessments associated with a unit */}
                            {assignments[code].map((assignment)=>
                            <button 
                                className="w-full h-12 bg-white rounded-lg px-4 flex items-center justify-between"
                                onClick={()=>setCurrentAssignment(assignment)}
                                >
                                {assignment.name}
                            </button>
                            )}
                        </TabPanel>
                    )}
                </TabPanels>
            </TabGroup>
            <AssignmentStepsComponent assignmentTypes={assignmentTypes} assignment={currentAssignment}/>
        </section>
    )
}
export default TextCalendar;