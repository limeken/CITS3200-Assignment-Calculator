import TextualFormat from "./TextualFormat.tsx";
import React, {forwardRef, useCallback, useImperativeHandle, useState} from "react";
import {type AssignmentCalendar, parseIcsCalendar} from "./CalendarTypes.ts";
import type { CalendarRef } from "./Calendar.tsx";

interface CalendarProps {
    show: boolean;
}

const VisualFormat = forwardRef<CalendarRef, CalendarProps>(({show},ref) => {
    const [assignments, setAssignments] = useState<AssignmentCalendar[]>([]);

    // this function exposes a callback method
    const addAssignment = useCallback((a: AssignmentCalendar) => {
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
            <CalendarFormat show={show}/>
            <TextualFormat show={show}/>
        </>
        );
    });
    export default VisualFormat;