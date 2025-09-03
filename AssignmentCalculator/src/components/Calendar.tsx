// calendar element, all by me
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from "react";
import ICAL from "ical.js";
import { type Assignment, sem2, parseIcsCalendar } from "./CalendarTypes.ts";

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
const Calendar =
    forwardRef<CalendarRef, {}> // this tells the compiler of the ref type, and the props type (no props)
    (function Calendar(_props, ref)//underscore hints that the variable is unused (_props says "no props")
    {

    const [assignments, setAssignments] = useState<Assignment[]>([]);

    // this function exposes a callback method
    const addAssignment = useCallback((a: Assignment) => {
        setAssignments((prev) => [...prev, a]);
    }, []) // <- this empty array is the dependency list, a change to any objects in here triggers a re-render

    /*  this hook decides what the ref exposes to the parent component
    *   we pass the ref, a function returning the object the parent sees on ref.current, and the dependencies */
    useImperativeHandle(ref, () => ({ addAssignment }), [addAssignment]);

    parseIcsCalendar("/fake_calendar.ics").then(
        calendar => {
            console.log(calendar)
        }
    )

    return(
        <div className={"overflow-x-auto"}>
            <div className="min-w-max space-y-3">
                <div className={"flex flex-col gap-2"}>
                    <CalendarWeeks />
                    {assignments.map((a, i) => (
                        <AssignmentRow key={a.name ?? i} assignment={a} />
                    ))}
                </div>
            </div>
        </div>
    )
});

export default Calendar;