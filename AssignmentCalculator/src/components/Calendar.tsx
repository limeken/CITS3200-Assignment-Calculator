// calendar element, all by me
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useState} from "react";
import ICAL from "ical.js";
import {type Assignment, sem2, parseIcsCalendar, validateCalendar, type CalendarColor} from "./CalendarTypes.ts";
import {PlusIcon} from "@heroicons/react/24/solid";
import clsx from "clsx";

const BG50: Record<CalendarColor, string> = {
    red: "bg-red-50", orange: "bg-orange-50", amber: "bg-amber-50",
    yellow: "bg-yellow-50", lime: "bg-lime-50", green: "bg-green-50",
    emerald: "bg-emerald-50", teal: "bg-teal-50", cyan: "bg-cyan-50",
    sky: "bg-sky-50", blue: "bg-blue-50", indigo: "bg-indigo-50",
    violet: "bg-violet-50", purple: "bg-purple-50", fuchsia: "bg-fuchsia-50",
    pink: "bg-pink-50", rose: "bg-rose-50",
};

const BG300: Record<CalendarColor, string> = {
    red: "bg-red-300", orange: "bg-orange-300", amber: "bg-amber-300",
    yellow: "bg-yellow-300", lime: "bg-lime-300", green: "bg-green-300",
    emerald: "bg-emerald-300", teal: "bg-teal-300", cyan: "bg-cyan-300",
    sky: "bg-sky-300", blue: "bg-blue-300", indigo: "bg-indigo-300",
    violet: "bg-violet-300", purple: "bg-purple-300", fuchsia: "bg-fuchsia-300",
    pink: "bg-pink-300", rose: "bg-rose-300",
};



/* CalendarWeeks prop */
const CalendarWeeks: React.FC<{ withSpacer?: boolean }> = ({ withSpacer = false }) => (
    <div className="flex flex-row gap-2 items-center">
        {withSpacer && (
            <div className="mr-2">
                <div className="w-36 h-16 shrink-0 rounded-md bg-transparent" />
            </div>
        )}
        {Array.from({ length: sem2.length / 7 }, (_, i) => (
            <div key={i} className="
        shrink-0 box-border rounded-md border h-16
        bg-white border-gray-300
        w-[calc(theme(width.16)*7+theme(spacing.2)*6)]
      ">
                <div className="p-3 font-medium text-center">Week {i + 1}</div>
            </div>
        ))}
    </div>
);


const RowLabel: React.FC<{ code?: string, color?: CalendarColor }> = ({ code, color }) => (
    <div className="w-36 h-16 shrink-0 mr-2">
        <div className={clsx("w-full h-full flex items-center justify-center",
                            "rounded-md border-2 font-semibold text-white",
                            "bg backdrop-blur-sm shadow-sm", BG300[color])}
        >
            {code ?? ""}
        </div>
    </div>
);

/* Each assignment is declared by it's "Assignment Row" */
/* By default, we'll render the whole semester */

const AssignmentRow: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
    const [start, end] = sem2.getAssignmentDates(assignment);

    return (
        <div className="flex flex-row gap-2 min-w-max">
            {Array.from({ length: sem2.length }, (_, i) => {
                const inRange = start !== null && end !== null && i >= start && i <= end;
                return (
                    <div
                        key={i}
                        className={clsx(
                            "aspect-square w-16 rounded-md border border-gray-300 transition-transform duration-150 ease-out hover:scale-95",
                            BG50[assignment.color],
                            inRange && BG300[assignment.color],
                        )}
                    />
                );
            })}xw
        </div>
    );
};

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
            <button
                type="button"
                className="flex items-center rounded border px-3 py-2 border-gray-300 bg-white transition hover:bg-gray-50 mb-2"
                onClick={() => handleLoad("/fake_calendar.ics")}
            >
                <PlusIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="grid grid-cols-[9rem_1fr] items-start">
                {/* Left gutter: non-scrolling labels */}
                <div className="space-y-3">
                    {/* header spacer to align with weeks row height */}
                    <div className="w-36 h-16 mr-2" />
                    {assignments.length === 0 ? null : assignments.map((a, i) => (
                        <RowLabel key={a.name ?? i} code={a.unitCode} color={a.color}/>
                    ))}
                </div>

                {/* Right pane: horizontally scrollable calendar */}
                <div className="overflow-x-auto ml-2">
                    <div className="min-w-max space-y-3">
                        <CalendarWeeks withSpacer={false} />
                        {assignments.length === 0 ? (
                            <p className="text-gray-400 px-2">nothing to show...</p>
                        ) : (
                            assignments.map((a, i) => <AssignmentRow key={a.name ?? i} assignment={a} />)
                        )}
                    </div>
                </div>
            </div>
        </>
    );
});

export default Calendar;