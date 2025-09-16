// calendar element, all by me
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from "react";
import ICAL from "ical.js";
import { type Assignment, sem2, parseIcsCalendar, validateCalendar } from "./CalendarTypes.ts";
import {PlusIcon} from "@heroicons/react/24/solid";

/* CalendarWeeks prop */
const CalendarWeeks = () => {
    return (
        <div className="flex flex-row gap-2">
            {Array.from({length: sem2.length / 7}, (_, i) => {
                return (
                    <div key={i} className="
                        shrink-0 box-border rounded-md border h-16
                        bg-white border-gray-300
                        w-[calc(theme(width.16)*7+theme(spacing.2)*6)]"
                    >
                        <div className="p-3 font-medium text-center">Week {i + 1}</div>
                    </div>
                );
            })}
        </div>
    );
};

/* Each assignment is declared by it's "Assignment Row" */
/* By default, we'll render the whole semester */
const AssignmentRow: React.FC<{assignment: Assignment}> = ({ assignment }) => {

    const [start, end] = sem2.getAssignmentDates(assignment);

    useEffect(() => {
        console.log(`${start}, ${end}`)
    },[])

    return (
        <div className="flex flex-row gap-2 min-w-max">
            {Array.from({length: sem2.length}, (_, i) => {
                const bgColor = (i >= start && i <= end ) ? assignment.color : "#fff";
                return(
                    <div key={i} className={`
                        aspect-square rounded-md border w-16
                        border-gray-300
                        transition-transform duration-150 ease-out hover:scale-95`}
                         style={{backgroundColor: bgColor}}
                    >
                    </div>
                )
            })}
        </div>
    )
}

export type CalendarRef = {
    // this is called when a new assignment finishes loading
    addAssignment: (a: Assignment) => void;
}

/*  this initialisation is a bit confusing, so let me explain
*   we want to access our calendar element from the top-level App component (meaning we need a ref)
*   normally React ref's only work on DOM elements (div's, class components, etc...)
*   so we wrap our component in a forwardRef */
const Calendar = forwardRef<CalendarRef>((_, ref) => {

    const [assignments, setAssignments] = useState<Assignment[]>([]);

    // this function exposes a callback method
    const addAssignment = useCallback((a: Assignment) => {
        setAssignments((prev) => [...prev, a]);
    }, []) // <- this empty array is the dependency list, a change to any objects in here triggers a re-render

    /* since we need an object API node, we expose this handle to addAssignment and it's API */
    useImperativeHandle(ref, () => ({ addAssignment }), [addAssignment]);

    async function handleLoad(path: string) {
        await parseIcsCalendar(path, (a) => {
            addAssignment(a)
        })
    }

    return (
        <>
            <button type="button"
                    className="flex items-center rounded border px-3 py-2 border-gray-300 bg-white transition hover:bg-gray-50 mb-2"
                    onClick={() => handleLoad("/fake_calendar.ics")}>
                <PlusIcon className="h-5 w-5 text-gray-600"/>
            </button>
        <div className={"overflow-x-auto"}>
            <div className="min-w-max space-y-3">
                <div className={"flex flex-col gap-2"}>
                    {/* Weekly headings, unfilled flavor text, and assignment rows. */}
                    <CalendarWeeks/>
                    {assignments.length == 0 ? <p className="text-gray-400 px-2">nothing to show...</p> : null}
                    {assignments.map((a, i) => (
                        <AssignmentRow key={a.name ?? i} assignment={a}/>
                    ))}
                </div>
            </div>
        </div>
        </>
    )
});

export default Calendar;