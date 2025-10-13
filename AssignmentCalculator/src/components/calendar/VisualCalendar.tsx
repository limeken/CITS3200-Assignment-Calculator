import React, {useEffect, useState} from "react";
import {type AssignmentCalendar, type AssignmentEvent, type CalendarColor, downloadIcs, exportAssignmentCalendar, sem2} from "./CalendarTypes.ts";
import clsx from "clsx";
import {Popover, PopoverButton, PopoverPanel} from "@headlessui/react";
import {ArrowDownOnSquareIcon} from "@heroicons/react/24/outline";

const DAYS_MS = 24 * 60 * 60 * 1000;

const BG100: Record<CalendarColor, string> = {
    red: "bg-red-100", orange: "bg-orange-100", amber: "bg-amber-100",
    yellow: "bg-yellow-100", lime: "bg-lime-100", green: "bg-green-100",
    emerald: "bg-emerald-100", teal: "bg-teal-100", cyan: "bg-cyan-100",
    sky: "bg-sky-100", blue: "bg-blue-100", indigo: "bg-indigo-100",
    violet: "bg-violet-100", purple: "bg-purple-100", fuchsia: "bg-fuchsia-100",
    pink: "bg-pink-100", rose: "bg-rose-100",
};

// TODO: this is a terrible way to do this
const BG300: Record<CalendarColor, string> = {
    red: "bg-red-300", orange: "bg-orange-300", amber: "bg-amber-300",
    yellow: "bg-yellow-300", lime: "bg-lime-300", green: "bg-green-300",
    emerald: "bg-emerald-300", teal: "bg-teal-300", cyan: "bg-cyan-300",
    sky: "bg-sky-300", blue: "bg-blue-300", indigo: "bg-indigo-300",
    violet: "bg-violet-300", purple: "bg-purple-300", fuchsia: "bg-fuchsia-300",
    pink: "bg-pink-300", rose: "bg-rose-300",
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
                `${event ? BG300[color] : BG100[color]}`,
                `aspect-square w-16 rounded-md shadow-md transition-all duration-150 ease-out`,
                `hover:scale-95 cursor-pointer`,
                event ? 'hover:ring-2 hover:ring-uwaBlue hover:brightness-110' : 'hover:brightness-105'
            )}
        />
    );

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
    );
};

/* The events row gets passed baby */
// Horizontal layout component (existing)
const AssignmentRow: React.FC<{ assignment: AssignmentCalendar}> = ({ assignment }) => {
    const dateAtIndex = (i: number): Date => {
        return new Date(sem2.start.getTime() + i * DAYS_MS);
    };

    const eventForDate = (d: Date) => {
        const n = assignment.events.length;
        if (n === 0) return null;
        const t0 = assignment.start.getTime();
        const t1 = assignment.end.getTime();
        const t = d.getTime();

        if (t < t0 || t > t1) return null;
        const span = t1 - t0;
        if (span === 0) return assignment.events[n - 1];

        const fraction = (t - t0) / span;
        const idx = Math.min(n - 1, Math.floor(fraction * n));
        return assignment.events[idx];
    };
    
    return (
        <div className="flex flex-row gap-2 min-w-max">
            {Array.from({length: sem2.length}, (_, i) => {
                const d = dateAtIndex(i);
                const ev = eventForDate(d);
                return <AssignmentDate key={i} uid={i} color={assignment.color} event={ev!}/>;
            })}
        </div>
    );
};

// NEW: Vertical layout component (rotated 90° clockwise)
const AssignmentColumn: React.FC<{ assignment: AssignmentCalendar}> = ({ assignment }) => {
    const dateAtIndex = (i: number): Date => {
        return new Date(sem2.start.getTime() + i * DAYS_MS);
    };

    const eventForDate = (d: Date) => {
        const n = assignment.events.length;
        if (n === 0) return null;
        const t0 = assignment.start.getTime();
        const t1 = assignment.end.getTime();
        const t = d.getTime();

        if (t < t0 || t > t1) return null;
        const span = t1 - t0;
        if (span === 0) return assignment.events[n - 1];

        const fraction = (t - t0) / span;
        const idx = Math.min(n - 1, Math.floor(fraction * n));
        return assignment.events[idx];
    };
    
    return (
        <div className="flex flex-col gap-2 min-h-max">
            {Array.from({length: sem2.length}, (_, i) => {
                const d = dateAtIndex(i);
                const ev = eventForDate(d);
                return <AssignmentDate key={i} uid={i} color={assignment.color} event={ev!}/>;
            })}
        </div>
    );
};

const RowLabel: React.FC<{ code?: string, assignment: AssignmentCalendar, height: number}> = ({ code, assignment, height }) => {
    // Equivalent rem sizes for tailwind sizing, used to make sure heading boxes grow correctly
    const gap = (height-1) * 0.75;
    const boxsize = height * 4;

    //handle calendar download
    function handleClick() {
        const ics = exportAssignmentCalendar(assignment);
        downloadIcs(assignment.name && `${assignment.unitCode}-${assignment.name}` || "New Assignment", ics);
    }

    return (
        <div className={`w-36 shrink-0 mr-2 ${BG300[assignment.color]} rounded-md group`} style={{ height: `${boxsize + gap}rem` }} onClick={handleClick}>
            <div className={clsx(
                "w-full h-full flex items-center rounded-md border-2 font-semibold text-white gap-2",
                "transition-all duration-300 ease-out justify-center group-hover:justify-between"
            )}>
                <span className={"absolute transition-all duration-300 ease-out scale-100 group-hover:opacity-0 group-hover:scale-95"}>{code ?? ""}</span>
                <ArrowDownOnSquareIcon className={"h-8 transition-all duration-300 ease-out opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"}/>
            </div>
        </div>
    );
};

// NEW: Column label for vertical layout
const ColumnLabel: React.FC<{ code?: string, assignment: AssignmentCalendar, width: number}> = ({ code, assignment, width }) => {
    // Each assignment column is w-16 (4rem)
    // Gap between assignment columns within the same unit is gap-3 (0.75rem)
    // Previous bug was caused by forgetting to account for gaps between boxes, just a bugfix.
    const totalWidth = width * 4 + (width - 1) * 0.75;

    function handleClick() {
        const ics = exportAssignmentCalendar(assignment);
        downloadIcs(assignment.name && `${assignment.unitCode}-${assignment.name}` || "New Assignment", ics);
    }

    return (
        <div 
            className={`h-36 shrink-0 mb-2 ${BG300[assignment.color]} rounded-md group`} 
            style={{ width: `${totalWidth}rem` }} 
            onClick={handleClick}
        >
            <div className={clsx(
                "w-full h-full flex items-center justify-center rounded-md border-2 font-semibold text-white gap-2",
                "transition-all duration-300 ease-out"
            )}>
                <span className={"transition-all duration-300 ease-out scale-100 group-hover:opacity-0 group-hover:scale-95"}>{code ?? ""}</span>
                <ArrowDownOnSquareIcon className={"h-8 absolute transition-all duration-300 ease-out opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"}/>
            </div>
        </div>
    );
};

// Decides how many default rows and actual rows need to be displayed
const CalendarRows: React.FC<{assignments:Record<string,AssignmentCalendar[]>}> = ({assignments}) => {
    const rows = Object.keys(assignments).length;
    const temporaryRows = 4 - rows > 0 ? 4 - rows : 0;
    
    return (
        <>
            {Object.keys(assignments).flatMap((code: string) => (
                assignments[code].map((assignment, i) => (
                    <AssignmentRow key={`${code}-${i}`} assignment={assignment} />
                ))
            ))}
            {Array.from({length: temporaryRows}).map((_, idx) => (
                <div key={`empty-row-${idx}`} className="flex flex-row gap-2 min-w-max">
                    {Array.from({length: sem2.length}, (_, i) => 
                        <div
                            key={i}
                            className={clsx("bg-white aspect-square w-16 rounded-md shadow-md transition-transform duration-150 ease-out hover:scale-95")}
                        />
                    )}
                </div>
            ))}
        </>
    );
};

// NEW: Calendar columns for vertical layout
const CalendarColumns: React.FC<{assignments:Record<string,AssignmentCalendar[]>}> = ({assignments}) => {
    const cols = Object.keys(assignments).length;
    const temporaryCols = 4 - cols > 0 ? 4 - cols : 0;
    
    return (
        <>
            {Object.keys(assignments).flatMap((code: string) => (
                assignments[code].map((assignment, i) => (
                    <AssignmentColumn key={`${code}-${i}`} assignment={assignment} />
                ))
            ))}
            {Array.from({length: temporaryCols}).map((_, idx) => (
                <div key={`empty-col-${idx}`} className="flex flex-col gap-2 min-h-max">
                    {Array.from({length: sem2.length}, (_, i) => 
                        <div
                            key={i}
                            className={clsx("bg-white aspect-square w-16 rounded-md shadow-md transition-transform duration-150 ease-out hover:scale-95")}
                        />
                    )}
                </div>
            ))}
        </>
    );
};

const VisualCalendar: React.FC<{show: boolean, assignments: Record<string, AssignmentCalendar[]>}> = ({ show, assignments }) => {
    const numWeeks = Math.ceil(sem2.length / 7);
    const [isEmpty, setIsEmpty] = useState(false);

    useEffect(() => {
        const totalAssignments = Object.values(assignments)
            .reduce((count, unitAssignments) => count + unitAssignments.length, 0);
        setIsEmpty(totalAssignments === 0);
    }, [assignments]);

    const nonEmptyAssignments = Object.entries(assignments)
        .filter(([, unitAssignments]) => unitAssignments.length > 0);

    return (
        <div className={`w-4/5 mx-auto bg-slate-100 px-4 py-6 rounded-lg inset-shadow-sm inset-shadow-indigo-100 ${!show ? 'hidden' : ''}`}>
            
            {/* HORIZONTAL LAYOUT (lg and above) */}
            <div className={clsx("hidden lg:grid lg:items-start", isEmpty ? "lg:grid-cols-1" : "lg:grid-cols-[9rem_1fr]") }>
                {/* Left gutter: non-scrolling labels */}
                {!isEmpty && (
                    <div className="space-y-3">
                        <div className="w-36 h-16 mr-2"/>
                        {nonEmptyAssignments.map(([code, unitAssignments], index) => (
                            <RowLabel
                                key={`${code}-${index}`}
                                code={code}
                                assignment={unitAssignments[0]}
                                height={unitAssignments.length}
                            />
                        ))}
                    </div>
                )}

                <div className={clsx("overflow-x-auto", { "ml-2": !isEmpty })}>
                    <div className="min-w-max space-y-3 pb-4">
                        <div className="flex flex-row gap-2 items-center">
                            {Array.from({ length: numWeeks }, (_, i) => (
                                <div key={i} className="
                                    shrink-0 box-border rounded-md h-16
                                    bg-blue-800 shadow-md shadow-gray-100
                                    w-[calc(theme(width.16)*7+theme(spacing.2)*6)]
                                    flex justify-center items-center
                                ">
                                    <span className="p-3 text-lg font-semibold text-white">Week {i + 1}</span>
                                </div>
                            ))}
                        </div>
                        <CalendarRows assignments={assignments}/>
                    </div>
                </div>
            </div>

            {/* VERTICAL LAYOUT (below lg) - rotated 90° clockwise with sticky headers */}
            <div className="lg:hidden relative h-[80vh] overflow-hidden">
                {/* Scrollable container for everything */}
                <div className="h-full overflow-auto">
                    <div className="relative">
                        {/* Sticky top header: Unit code labels */}
                        <div className="sticky top-0 z-10 bg-slate-100 pb-2">
                            <div className="flex flex-row space-x-3">
                                {nonEmptyAssignments.map(([code, unitAssignments], index) => (
                                    <ColumnLabel
                                        key={`${code}-${index}`}
                                        code={code}
                                        assignment={unitAssignments[0]}
                                        width={unitAssignments.length}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* Main content area with sticky right column */}
                        <div className="flex flex-row space-x-3 relative">
                            {/* Assignment columns */}
                            <div className="flex flex-row space-x-3">
                                <CalendarColumns assignments={assignments}/>
                            </div>

                            {/* Sticky right column: Week labels */}
                            <div className="sticky right-0 z-20 bg-slate-100 pl-3">
                                <div className="flex flex-col gap-2">
                                    {Array.from({ length: numWeeks }, (_, i) => (
                                        <div key={i} className="
                                            box-border rounded-md w-16
                                            bg-blue-800 shadow-md shadow-gray-100
                                            h-[calc(theme(width.16)*7+theme(spacing.2)*6)]
                                            flex justify-center items-center
                                        ">
                                            <span className="p-3 text-lg font-semibold text-white -rotate-90">Week {i + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualCalendar;
