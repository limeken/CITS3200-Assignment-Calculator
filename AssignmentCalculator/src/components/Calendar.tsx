// calendar element, all by me
import React, {forwardRef, useCallback, useImperativeHandle, useState} from "react";
import {type AssignmentCalendar, sem2, parseIcsCalendar, type CalendarColor} from "./CalendarTypes.ts";
import {PlusIcon} from "@heroicons/react/24/solid";
import clsx from "clsx";

const BG100: Record<CalendarColor, string> = {
    red: "bg-red-100", orange: "bg-orange-100", amber: "bg-amber-100",
    yellow: "bg-yellow-100", lime: "bg-lime-100", green: "bg-green-100",
    emerald: "bg-emerald-100", teal: "bg-teal-100", cyan: "bg-cyan-100",
    sky: "bg-sky-100", blue: "bg-blue-100", indigo: "bg-indigo-100",
    violet: "bg-violet-100", purple: "bg-purple-100", fuchsia: "bg-fuchsia-100",
    pink: "bg-pink-100", rose: "bg-rose-100",
};

const BG200: Record<CalendarColor, string> = {
    red: "bg-red-200", orange: "bg-orange-200", amber: "bg-amber-200",
    yellow: "bg-yellow-200", lime: "bg-lime-200", green: "bg-green-200",
    emerald: "bg-emerald-200", teal: "bg-teal-200", cyan: "bg-cyan-200",
    sky: "bg-sky-200", blue: "bg-blue-200", indigo: "bg-indigo-200",
    violet: "bg-violet-200", purple: "bg-purple-200", fuchsia: "bg-fuchsia-200",
    pink: "bg-pink-200", rose: "bg-rose-200",
};

const SHADOWS: Record<CalendarColor, string> = {
    red: "shadow-red-50", orange: "shadow-orange-50", amber: "shadow-amber-50",
    yellow: "shadow-yellow-50", lime: "shadow-lime-50", green: "shadow-green-50",
    emerald: "shadow-emerald-50", teal: "shadow-teal-50", cyan: "shadow-cyan-50",
    sky: "shadow-sky-50", blue: "shadow-blue-50", indigo: "shadow-indigo-50",
    violet: "shadow-violet-50", purple: "shadow-purple-50", fuchsia: "shadow-fuchsia-50",
    pink: "shadow-pink-50", rose: "shadow-rose-50",
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
                shrink-0 box-border rounded-md h-16
                bg-white shadow-md shadow-gray-100
                w-[calc(theme(width.16)*7+theme(spacing.2)*6)]
              ">
                <div className="p-3 font-medium text-center">Week {i + 1}</div>
            </div>
        ))}
    </div>
);


const RowLabel: React.FC<{ code?: string, color: CalendarColor }> = ({ code, color }) => (
    <div className={`w-36 h-16 shrink-0 mr-2 ${BG200[color]} rounded-md`}>
        <div className={"w-full h-full flex items-center justify-center rounded-md border-2 font-semibold text-white"}>
            {code ?? ""}
        </div>
    </div>
);

/* Each assignment is declared by it's "Assignment Row" */
/* By default, we'll render the whole semester */

const AssignmentRow: React.FC<{ assignment: AssignmentCalendar }> = ({ assignment }) => {
    const [start, end] = sem2.getAssignmentDates(assignment);
    const styleDefault = `aspect-square w-16 rounded-md ${BG100[assignment.color]} shadow-md ${SHADOWS[assignment.color]} transition-transform duration-150 ease-out hover:scale-95`
    const styleInRange = clsx(styleDefault, `${BG200[assignment.color]}`)

    return (
        <div className="flex flex-row gap-2 min-w-max">
            {Array.from({ length: sem2.length }, (_, i) => {
                const inRange = start !== null && end !== null && i >= start && i <= end;
                return (
                    <div
                        key={i}
                        className={inRange ? styleInRange : styleDefault }
                    />
                );
            })}
        </div>
    );
};

export type CalendarRef = {
    // this is called when a new assignment finishes loading
    addAssignment: (a: AssignmentCalendar) => void;
}

/*  this initialisation is a bit confusing, so let me explain
*   we want to access our calendar element from the top-level App component (meaning we need a ref)
*   normally React ref's only work on DOM elements (div's, class components, etc...)
*   so we wrap our component in a forwardRef */
const Calendar = forwardRef<CalendarRef>((_, ref) => {

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
        <div className="bg-slate-100 px-4 py-6 rounded-lg inset-shadow-sm inset-shadow-indigo-100">
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
                    <div className="min-w-max space-y-3 pb-4">
                        <CalendarWeeks withSpacer={false} />
                        {assignments.length === 0 ? (
                            <p className="text-gray-400 px-2">nothing to show...</p>
                        ) : (
                            assignments.map((a, i) => <AssignmentRow key={a.name ?? i} assignment={a} />)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default Calendar;