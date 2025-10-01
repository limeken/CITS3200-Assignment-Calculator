// calendar element, all by me
import {forwardRef, useCallback, useImperativeHandle, useState} from "react";
import {type AssignmentCalendar, pickRandomColor } from "./CalendarTypes.ts";
import TextCalendar from "./TextCalendar.tsx";
import VisualCalendar from "./VisualCalendar.tsx";
import CalendarOptions from "./CalendarOptions.tsx";
import {SemesterSelector} from "./SemesterSelector.tsx";

// TODO: this is fine
export type CalendarRef = {
    // this is called when a new assignment finishes loading
    addAssignment: (a: AssignmentCalendar) => void;
}

// empty prop set to stop linting errors
type CalendarProps = {};

/*  this initialisation is a bit confusing, so let me explain
*   we want to access our calendar element from the top-level App component (meaning we need a ref)
*   normally React ref's only work on DOM elements (div's, class components, etc...)
*   so we wrap our component in a forwardRef */
const Calendar = forwardRef<CalendarRef, CalendarProps>((_props, ref) => {

    const [assignments, setAssignments] = useState<Record<string, AssignmentCalendar[]>>({});

    //  TODO: Explain why the visual settings are in <Calendar />
    const [isVisual, setIsVisual] = useState<boolean>(true);

    // this function exposes a callback method
    // TODO: This is good because it keeps assignment and state all internal to the component.
    const addAssignment = useCallback((a: AssignmentCalendar) => {

        // Check if the unit code is already in use. If so, reuse the existing associated color and append to the unit list
        if (a.unitCode! in assignments) {
            a.color = assignments[a.unitCode!][0].color
            setAssignments(prev => ({...prev, [a.unitCode!]: [...prev[a.unitCode!], a]}));
        }

        // If no such unit code exists yet, create a new color and associated unit list
        else{
            a.color = pickRandomColor();
            setAssignments(prev => ({...prev,[a.unitCode!]:[a]}))
        }

        console.log(a)
    }, [assignments]) // <- this empty array is the dependency list, a change to any objects in here triggers a re-render

    /* since we need an object API node, we expose this handle to addAssignment and it's API */
    useImperativeHandle(ref, () => ({ addAssignment }), [addAssignment]);

    return (
        <>
            <CalendarOptions isCalendarFormat={isVisual} changeFormat={setIsVisual}/>
            <VisualCalendar show={isVisual} assignments={assignments} />
            <TextCalendar show={!isVisual} assignments={assignments}/>
        </>
    );
});

export default Calendar;