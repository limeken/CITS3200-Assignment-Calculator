// calendar element, all by me
import {useCallback, useState} from "react";
import {type AssignmentCalendar, pickRandomColor, normalizeColor } from "./CalendarTypes.ts"
import TextCalendar from "./TextCalendar.tsx";
import VisualCalendar from "./VisualCalendar.tsx";
import CalendarOptions from "./CalendarOptions.tsx";
import PriorityQueue from "./PriorityQueue.tsx";
import { SubmissionButton } from "../Submission.tsx";
import { FALLBACK_SEMESTER_OPTIONS, type SemesterOption } from "./semesterOptions.ts";

const Calendar: React.FC = () => {
    const fallbackSemester = FALLBACK_SEMESTER_OPTIONS[0]!;
    const defaultSemester = FALLBACK_SEMESTER_OPTIONS[1] ?? fallbackSemester;

    const [assignments, setAssignments] = useState<Record<string, AssignmentCalendar[]>>({});
    const [newestAssignment, setNewestAssignment] = useState<AssignmentCalendar|null>(null);
    const [isVisual, setIsVisual] = useState<boolean>(true);
    const [activeSemester, setActiveSemester] = useState<SemesterOption>(defaultSemester);

    // ASSIGNMENT MANIPULATION FUNCTIONS
    // ADD: Adds the specified assignment to the collection
    const addAssignment = useCallback((assignment: AssignmentCalendar, color?: string) => {
        let prepared: AssignmentCalendar = assignment;
        setAssignments(prev => {
            const unitCode = assignment.unitCode;
            if (!unitCode) {
                return prev;
            }

            const existing = prev[unitCode];
            if (existing && existing.length > 0) {
                prepared = { ...assignment, color: existing[0].color };
                return { ...prev, [unitCode]: [...existing, prepared] };
            }

            const nextColor = normalizeColor(color) ?? pickRandomColor();
            prepared = { ...assignment, color: nextColor };
            return { ...prev, [unitCode]: [prepared] };
        });

        setNewestAssignment(prepared);
    }, []);

    const removeAssignment = useCallback((assignment: AssignmentCalendar) => {
        let wasRemoved = false;
        setAssignments(prev => {
            const unitCode = assignment.unitCode;
            if (!unitCode) {
                return prev;
            }

            const existing = prev[unitCode];
            if (!existing || existing.length === 0) {
                return prev;
            }

            if (existing.length === 1) {
                const rest = { ...prev };
                delete rest[unitCode];
                wasRemoved = true;
                return rest;
            }

            const filtered = existing.filter(item => item !== assignment);
            if (filtered.length === existing.length) {
                return prev;
            }

            wasRemoved = true;
            return { ...prev, [unitCode]: filtered };
        });

        if (wasRemoved) {
            setNewestAssignment(current => (current === assignment ? null : current));
        }

        return wasRemoved;
    }, []);

    // DELETE: Wipes the stored assignment specified
    const deleteAssignment = useCallback(async (assignment: AssignmentCalendar) => {
        removeAssignment(assignment);
    }, [removeAssignment]);

    // UPDATE: Wipes memory of old assignment & adds the new assignment
    const updateAssignment = useCallback(async (oldAssignment: AssignmentCalendar, newAssignment: AssignmentCalendar) => {
        removeAssignment(oldAssignment);
        addAssignment(newAssignment, oldAssignment.color);
    }, [addAssignment, removeAssignment]);

    return (
        <div className="flex flex-col gap-4 items-center">
            {/* Button which triggers the assignment submission modal */}
            <SubmissionButton onSubmit={addAssignment} assignments={assignments}/>
            <CalendarOptions
                isCalendarFormat={isVisual}
                changeFormat={setIsVisual}
                activeSemester={activeSemester}
                onSemesterChange={setActiveSemester}
            />
            <PriorityQueue newest={newestAssignment} onUpdate={updateAssignment} onDelete={deleteAssignment} assignments={assignments}/>
            <VisualCalendar show={isVisual} assignments={assignments} semester={activeSemester.semester} />
            <TextCalendar show={!isVisual} assignments={assignments}/>
        </div>
    );
};

export default Calendar;
