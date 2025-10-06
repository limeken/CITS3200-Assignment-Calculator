import React, { useState } from "react";
import type { AssignmentCalendar } from "./CalendarTypes.ts";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import { assignmentTypes } from "../testdata.ts";
import type { Assignment } from "./CalendarTypes.ts";
import { pageSection } from "../../styles/tailwindStyles.ts";


// This component displays the steps for valid assignments, in top-down order
const AssignmentStepsComponent: React.FC<{assignmentTypes:Record<string,Assignment>, assignment:AssignmentCalendar|null}> = ({assignmentTypes, assignment}) => {
    const assignmentType = assignment ? assignmentTypes[assignment.assignmentType] : null;
    if(assignment != null){
        return (
            <div className="flex w-full flex-col items-center gap-5 rounded-2xl border border-slate-200/70 bg-white/90 p-5 text-center shadow-[0_24px_55px_-32px_rgba(15,23,42,0.35)] sm:w-4/5 lg:w-3/4">
                <h1 className="text-base font-semibold text-slate-900 sm:text-lg">{assignment.unitCode} - {assignment.name}</h1>
                <div className="flex w-full flex-col items-center gap-3 sm:w-3/4">
                    {assignmentType!.events.map((step, index)=>
                        <div
                            key={`${assignment.unitCode}-${assignment.name}-${index}`}
                            className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-4 py-2 text-left text-sm font-medium text-slate-600 transition hover:-translate-y-[1px] hover:border-slate-300 sm:text-base"
                        >
                            <span>Step {index+1}: {step.name}</span>
                            <ChevronDownIcon className="h-5 w-5 text-slate-400"/>
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
        <section className={`${pageSection} mt-6 ${show ? "" : "hidden"}`}>
            <div className="surface-card flex flex-col items-center gap-6 px-4 py-6 sm:px-6">
                <TabGroup className="flex w-full flex-col gap-5">
                    <TabList className="grid w-full grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] sm:grid-cols-2 lg:grid-cols-4">
                        {Object.keys(assignments).map((code)=> 
                            <Tab
                                key={code}
                                className="group flex h-12 w-full items-center justify-between rounded-xl border border-transparent bg-white/75 px-4 text-sm font-semibold text-slate-600 transition hover:border-slate-200/70 hover:text-slate-700 data-selected:border-transparent data-selected:bg-gradient-to-r data-selected:from-uwaBlue data-selected:via-indigo-500 data-selected:to-purple-500 data-selected:text-white data-selected:shadow-[0_24px_50px_-28px_rgba(79,70,229,0.65)] sm:text-base"
                            >
                                {({ selected }) => (
                                    <>
                                        <span className="font-semibold tracking-wide">{code}</span>
                                        <CheckIcon className={`ml-2 h-5 w-5 transition-opacity duration-200 ${selected ? 'opacity-100' : 'opacity-0'}`} />
                                    </>
                                )}
                            </Tab>
                        )}
                    </TabList>

                    <TabPanels className="w-full">
                        {Object.keys(assignments).map((code)=> 
                            <TabPanel key={code} className="grid w-full grid-cols-1 gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-[0_20px_45px_-30px_rgba(15,23,42,0.35)] sm:grid-cols-2 lg:grid-cols-3">
                                {assignments[code].map((assignment)=>
                                    <button
                                        key={`${code}-${assignment.name}`}
                                        className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200/60 bg-white/90 px-4 text-sm font-semibold text-slate-600 transition hover:-translate-y-[1px] hover:border-slate-300 hover:text-uwaBlue sm:text-base"
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
            </div>
        </section>
    )
}
export default TextCalendar;
