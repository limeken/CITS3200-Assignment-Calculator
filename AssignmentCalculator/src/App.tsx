import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import "./index.css";
import {testRows} from "./components/testdata.ts";

// Import webiste components from components subfolder
import AssignmentCalendar from "./components/AssignmentCalendar.tsx";
import UniversityBanner from "./components/UniversityBanner.tsx"
import InstructionsPage from "./components/InstructionsPage.tsx"
import ApplicationHeading from "./components/ApplicationHeading.tsx"
import StudyPlanInputFields from "./components/StudyPlanInputFields.tsx"
import Calendar, {type CalendarRef} from "./components/Calendar.tsx";
import {type Assignment, parseIcsCalendar, validateCalendar} from "./components/CalendarTypes.ts";
import {PlusIcon} from "@heroicons/react/24/solid";

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
        </>
    );
}
