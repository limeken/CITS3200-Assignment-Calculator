import React from "react";
import {type AssignmentCalendar, type AssignmentEvent, type CalendarColor, downloadIcs, exportAssignmentCalendar, sem2} from "./CalendarTypes.ts";
import clsx from "clsx";
import {Popover, PopoverButton, PopoverPanel} from "@headlessui/react";
import {ArrowDownOnSquareIcon} from "@heroicons/react/24/outline";

const DAYS_MS = 24 * 60 * 60 * 1000;

// TODO: this is a terrible way to do this
const BG100: Record<CalendarColor, string> = {
    red: "bg-red-100", orange: "bg-orange-100", amber: "bg-amber-100",
    yellow: "bg-yellow-100", lime: "bg-lime-100", green: "bg-green-100",
    emerald: "bg-emerald-100", teal: "bg-teal-100", cyan: "bg-cyan-100",
    sky: "bg-sky-100", blue: "bg-blue-100", indigo: "bg-indigo-100",
    violet: "bg-violet-100", purple: "bg-purple-100", fuchsia: "bg-fuchsia-100",
    pink: "bg-pink-100", rose: "bg-rose-100",
};

// TODO: this is a terrible way to do this
const BG200: Record<CalendarColor, string> = {
    red: "bg-red-200", orange: "bg-orange-200", amber: "bg-amber-200",
    yellow: "bg-yellow-200", lime: "bg-lime-200", green: "bg-green-200",
    emerald: "bg-emerald-200", teal: "bg-teal-200", cyan: "bg-cyan-200",
    sky: "bg-sky-200", blue: "bg-blue-200", indigo: "bg-indigo-200",
    violet: "bg-violet-200", purple: "bg-purple-200", fuchsia: "bg-fuchsia-200",
    pink: "bg-pink-200", rose: "bg-rose-200",
};

// TODO: im sure you get the idea by now
const SHADOWS: Record<CalendarColor, string> = {
    red: "shadow-red-50", orange: "shadow-orange-50", amber: "shadow-amber-50",
    yellow: "shadow-yellow-50", lime: "shadow-lime-50", green: "shadow-green-50",
    emerald: "shadow-emerald-50", teal: "shadow-teal-50", cyan: "shadow-cyan-50",
    sky: "shadow-sky-50", blue: "shadow-blue-50", indigo: "shadow-indigo-50",
    violet: "shadow-violet-50", purple: "shadow-purple-50", fuchsia: "shadow-fuchsia-50",
    pink: "shadow-pink-50", rose: "shadow-rose-50",
};

interface AssignmentDateProps {
    uid: number;
    color: CalendarColor;
    event?: AssignmentEvent;
}

/* Now we're able to pass the event to the actual box itself */
/* Non-event boxes don't have anything to read from */
const AssignmentDate: React.FC<AssignmentDateProps> = ({ uid, color, event }) => {

    const square = (
        <div
            key={uid}
            className={clsx(
                `${event ? BG200[color] : BG100[color]}`,
                `aspect-square w-16 rounded-md ${BG100[color]} shadow-md ${SHADOWS[color]} transition-transform duration-150 ease-out hover:scale-95`
            )}
        />
    )

    if (!event) return square;

    // TODO: Fix popup spacing
    return (
        <Popover className="relative">
            <PopoverButton as="div">
                {square}
            </PopoverButton>
            <PopoverPanel anchor={"top"} transition
                className="flex rounded-md bg-white p-2 shadow-lg transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0">
            <p data-hover className="text-sm text-gray-900">{event.summary}</p>
        </PopoverPanel>
        </Popover>
    )
};


/* The events row gets passed baby */
const AssignmentRow: React.FC<{ assignment: AssignmentCalendar }> = ({ assignment }) => {

    const dateAtIndex = (i: number): Date => {
        return new Date(sem2.start.getTime() + i * DAYS_MS)
    }

    const eventForDate = (d: Date) => {
        const n = assignment.events.length;
        if ( n == 0 ) return null;
        const t0 = assignment.start.getTime();
        const t1 = assignment.end.getTime();
        const t = d.getTime();

        if (t < t0 || t > t1) return null;
        const span = t1 - t0;
        if (span === 0 ) return assignment.events[n-1]

        const fraction = (t - t0) / span;
        const idx = Math.min(n - 1, Math.floor(fraction * n));
        return assignment.events[idx];
    }

    return(
        <div className="flex flex-row gap-2 min-w-max">
            {Array.from({length: sem2.length}, (_, i) => {
                const d = dateAtIndex(i);
                const ev = eventForDate(d);
                return ( <AssignmentDate uid={i} color={assignment.color} event={ev}/> )
            })}
        </div>
    )
};

const RowLabel: React.FC<{ code?: string, assignment: AssignmentCalendar, height: number}> = ({ code, assignment, height }) => {
    // Equivalent rem sizes for tailwind sizing, used to make sure heading boxes grow correctly
    const gap = (height-1) * 0.75;
    const boxsize = height * 4;

    //handle calendar download
    function handleClick() {
        const ics= exportAssignmentCalendar(assignment);
        downloadIcs(assignment.name && `${assignment.unitCode}-${assignment.name}` || "New Assignment", ics);
    }

    return (
        <div className={`w-36 shrink-0 mr-2 ${BG200[assignment.color]} rounded-md`} style={{ height: `${boxsize + gap}rem` }} onClick={handleClick}>
            <div className={clsx(
                "w-full h-full flex items-center rounded-md border-2 font-semibold text-white gap-2 group",
                    "transition-all duration-300 ease-out justify-center group-hover:justify-between"
                )}>
                <span className={"absolute transition-all duration-300 ease-out scale-100 group-hover:opacity-0 group-hover:scale-95"}>{code ?? ""}</span>
                <ArrowDownOnSquareIcon className={"h-8 transition-all duration-300 ease-out opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100" }/>
            </div>
        </div>
    );
}

/* it should render with the assignments array */
const VisualCalendar: React.FC<{show: boolean, assignments: Record<string, AssignmentCalendar[]>}> = ({ show, assignments }) => (

    <div className={`w-4/5 mx-auto bg-slate-100 px-4 py-6 rounded-lg inset-shadow-sm inset-shadow-indigo-100 grid grid-cols-[9rem_1fr] items-start ${!show ? 'hidden' : ''}`}>
        {/* Left gutter: non-scrolling labels */}
        <div className="space-y-3">
            {/* header spacer to align with weeks row height */}
            <div className="w-36 h-16 mr-2" />
            {Object.keys(assignments).length === 0 ? null : Object.keys(assignments).map((code, i) => (
                <RowLabel key={code ?? i} code={code} assignment={assignments[code][0]} height={assignments[code].length}/>
            ))}
        </div>

        <div className="overflow-x-auto ml-2">
            <div className="min-w-max space-y-3 pb-4">

                {/* display the weeks as a grid */}
                <div className="flex flex-row gap-2 items-center">

                    {/* TODO: Use a "current semester" object */}
                    {Array.from({ length: sem2.length / 7 }, (_, i) => (
                        <div key={i} className="
                    shrink-0 box-border rounded-md h-16
                    bg-uwaBlue shadow-md shadow-gray-100
                    w-[calc(theme(width.16)*7+theme(spacing.2)*6)]
                    flex justify-center items-center
                  ">
                            <span className="p-3 text-lg font-semibold text-white">Week {i + 1}</span>
                        </div>
                    ))}
                </div>

                {Object.keys(assignments).length === 0 ? (
                    <p className="text-gray-400 px-2">nothing to show...</p>
                ) : (
                    Object.keys(assignments).flatMap((code: string) => (
                        assignments[code].map((assignment, i) => (
                            <AssignmentRow key={i} assignment={assignment} />
                        ))
                    ))
                )}
            </div>
        </div>
    </div>
)

export default VisualCalendar;
