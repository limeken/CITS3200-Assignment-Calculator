// calendar element, all by me
import {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from "react";
import {type AssignmentCalendar, type AssignmentEvent, pickRandomColor } from "./CalendarTypes.ts";
import TextCalendar from "./TextCalendar.tsx";
import VisualCalendar from "./VisualCalendar.tsx";
import CalendarOptions from "./CalendarOptions.tsx";

// TODO: this is fine
export type CalendarRef = {
    // this is called when a new assignment finishes loading
    addAssignment: (a: AssignmentCalendar) => void;
}

// empty prop set to stop linting errors
type CalendarProps = Record<string, never>;

const STORAGE_KEY = "assignment-calendars";

type StoredAssignmentEvent = Omit<AssignmentEvent, "start" | "end"> & {
    start: string;
    end: string;
};

type StoredAssignmentCalendar = Omit<AssignmentCalendar, "start" | "end" | "events"> & {
    start: string | null;
    end: string | null;
    events: StoredAssignmentEvent[];
};

const serializeAssignments = (assignments: Record<string, AssignmentCalendar[]>): string => {
    const serializable: Record<string, StoredAssignmentCalendar[]> = {};
    for (const [unitCode, calendars] of Object.entries(assignments)) {
        serializable[unitCode] = calendars.map((calendar) => ({
            ...calendar,
            start: calendar.start ? calendar.start.toISOString() : null,
            end: calendar.end ? calendar.end.toISOString() : null,
            events: calendar.events.map((event) => ({
                ...event,
                start: event.start.toISOString(),
                end: event.end.toISOString(),
            })),
        }));
    }
    return JSON.stringify(serializable);
};

const deserializeAssignments = (raw: string): Record<string, AssignmentCalendar[]> => {
    const hydrated: Record<string, AssignmentCalendar[]> = {};
    const parsed = JSON.parse(raw) as Record<string, StoredAssignmentCalendar[]>;
    for (const [unitCode, calendars] of Object.entries(parsed)) {
        hydrated[unitCode] = calendars.map((calendar) => {
            const start = calendar.start ? new Date(calendar.start) : new Date();
            const end = calendar.end ? new Date(calendar.end) : start;
            const events = calendar.events.map((event) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end),
            }));

            return {
                ...calendar,
                start,
                end,
                events,
            } as AssignmentCalendar;
        });
    }
    return hydrated;
};

const getStoredAssignments = (): Record<string, AssignmentCalendar[]> => {
    if (typeof window === "undefined") return {};
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    try {
        return deserializeAssignments(stored);
    } catch (error) {
        console.warn("Failed to read stored assignments", error);
        return {};
    }
};

/*  this initialisation is a bit confusing, so let me explain
*   we want to access our calendar element from the top-level App component (meaning we need a ref)
*   normally React ref's only work on DOM elements (div's, class components, etc...)
*   so we wrap our component in a forwardRef */
const Calendar = forwardRef<CalendarRef, CalendarProps>((_props, ref) => {

    const [assignments, setAssignments] = useState<Record<string, AssignmentCalendar[]>>(() => getStoredAssignments());

    //  TODO: Explain why the visual settings are in <Calendar />
    const [isVisual, setIsVisual] = useState<boolean>(true);

    // this function exposes a callback method
    // TODO: This is good because it keeps assignment and state all internal to the component.
    const addAssignment = useCallback((assignment: AssignmentCalendar) => {
        setAssignments(prev => {
            const key = assignment.unitCode ?? "undefined";
            const existing = prev[key];
            const providedColor = assignment.color && assignment.color !== "" ? assignment.color : undefined;
            const color = existing?.[0]?.color ?? providedColor ?? pickRandomColor();
            const nextAssignment: AssignmentCalendar = {
                ...assignment,
                color,
            };

            if (existing) {
                return {
                    ...prev,
                    [key]: [...existing, nextAssignment],
                };
            }

            return {
                ...prev,
                [key]: [nextAssignment],
            };
        });
    }, []); // <- this empty array is the dependency list, a change to any objects in here triggers a re-render

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            window.localStorage.setItem(STORAGE_KEY, serializeAssignments(assignments));
        } catch (error) {
            console.warn("Failed to persist assignments", error);
        }
    }, [assignments]);

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
