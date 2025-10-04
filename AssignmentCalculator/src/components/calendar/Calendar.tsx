// calendar element, all by me
import {forwardRef, useCallback, useImperativeHandle, useState} from "react";
import {type AssignmentCalendar, pickRandomColor } from "./CalendarTypes.ts";
import TextCalendar from "./TextCalendar.tsx";
import VisualCalendar from "./VisualCalendar.tsx";
import CalendarOptions from "./CalendarOptions.tsx";
import {SemesterSelector} from "./SemesterSelector.tsx";
import PriorityQueue from "./PriorityQueue.tsx";

// TODO: this is fine
export type CalendarRef = {
    // this is called when a new assignment finishes loading
    addAssignment: (a: AssignmentCalendar) => void;
    deleteAssignment: (a: AssignmentCalendar) => void;
    updateAssignment: (o: AssignmentCalendar, n: AssignmentCalendar) => void;
}

// Pass down the assignment modal submission function
type CalendarProps = {onSubmit: (s: AssignmentCalendar, b: boolean, o: AssignmentCalendar) => void};

/*  this initialisation is a bit confusing, so let me explain
*   we want to access our calendar element from the top-level App component (meaning we need a ref)
*   normally React ref's only work on DOM elements (div's, class components, etc...)
*   so we wrap our component in a forwardRef */
const Calendar = forwardRef<CalendarRef, CalendarProps>(({onSubmit}, ref) => {
    
    const [assignments, setAssignments] = useState<Record<string, AssignmentCalendar[]>>({});
    const [newestAssignment, setNewestAssignment] = useState<AssignmentCalendar|null>(null);
    const [isVisual, setIsVisual] = useState<boolean>(true);

    // ASSIGNMENT MANIPULATION FUNCTIONS
    // ADD: Adds the specified assignment to the collection
    const addAssignment = useCallback((assignment: AssignmentCalendar, color?:string) => {
        setAssignments(prev => {
        // Check if the unit code is already in use. If so, reuse the existing associated color and append to the unit list
        if (assignment.unitCode! in prev) {
            assignment.color = prev[assignment.unitCode!][0].color;
            return {...prev, [assignment.unitCode!]: [...prev[assignment.unitCode!], assignment]};
        }

        // If no such unit code exists yet, create a new color (or inherit old color of edited assignment)
        else{
            assignment.color = color?color:pickRandomColor();
            return {...prev,[assignment.unitCode!]:[assignment]};
        }
        });

        setNewestAssignment(assignment);
        console.log(assignment)
    }, [assignments])

    // DELETE: Wipes the stored assignment specified
    const deleteAssignment = useCallback((assignment: AssignmentCalendar) => {
        // If the assignment was the only one present within a unit code, wipe the unit code branch
        if(assignments[assignment.unitCode!].length === 1){
            setAssignments(prev => {
                const updatedObject = {...prev};
                delete updatedObject[assignment.unitCode!];
                return updatedObject;
            })
        }

        // Otherwise, find the unit code branch, and remove the selected assignment from it
        else{
            const updatedAssignments = [...assignments[assignment.unitCode!]].filter(a => a !== assignment);
            setAssignments(prev => ({...prev,[updatedAssignments[0].unitCode!]:updatedAssignments}))
        }

    }, [assignments])

    // UPDATE: Wipes memory of old assignment & adds the new assignment
    const updateAssignment = useCallback((oldAssignment: AssignmentCalendar, newAssignment: AssignmentCalendar) => {
        deleteAssignment(oldAssignment);
        // Sends the old color through too incase the unit branch is deleted
        addAssignment(newAssignment,oldAssignment.color);
    },[assignments])

    /* since we need an object API node, we expose this handle to addAssignment and it's API */
    useImperativeHandle(ref, () => ({ addAssignment, deleteAssignment, updateAssignment}), [addAssignment,deleteAssignment, updateAssignment]);

    return (
        <div className="flex flex-col gap-4 items-center">
            <CalendarOptions isCalendarFormat={isVisual} changeFormat={setIsVisual}/>
            <PriorityQueue newest={newestAssignment} onSubmit={onSubmit}/>
            <VisualCalendar show={isVisual} assignments={assignments} />
            <TextCalendar show={!isVisual} assignments={assignments}/>
        </div>
    );
});

export default Calendar;