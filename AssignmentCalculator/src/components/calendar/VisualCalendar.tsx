import React, {useEffect, useState} from "react";
import {type AssignmentCalendar, type AssignmentEvent, type CalendarColor, type Semester, downloadIcs, exportAssignmentCalendar, normalizeColor} from "./CalendarTypes.ts";
import clsx from "clsx";
import {Popover, PopoverButton, PopoverPanel} from "@headlessui/react";
import {ArrowDownOnSquareIcon, DocumentArrowDownIcon} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useNotification } from "../../providers/NotificationProvider.tsx";
import { exportAssignmentPdf } from "../../services/assignmentExport";
import { COLOR_ACCENT, COLOR_BG100, COLOR_BG300 } from "./colorStyles";

const DAYS_MS = 24 * 60 * 60 * 1000;


const HoverIconButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ icon, label, onClick }) => (
    <div className="relative pointer-events-auto">
        <button
            type="button"
            onClick={onClick}
            className="peer flex items-center justify-center rounded-full bg-white/90 p-2 text-slate-700 shadow-md transition hover:bg-white focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-uwaBlue"
            aria-label={label}
        >
            {icon}
        </button>
        <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition duration-150 ease-out peer-hover:translate-y-1 peer-hover:opacity-100 peer-focus-visible:translate-y-1 peer-focus-visible:opacity-100">
            {label}
        </div>
    </div>
);

interface AssignmentDateProps {
    color: CalendarColor;
    date: Date;
    event?: AssignmentEvent | null;
}

/* Now we're able to pass the event to the actual box itself */
/* Non-event boxes don't have anything to read from */
const AssignmentDate: React.FC<AssignmentDateProps> = ({ color, date, event }) => {
    const hasEvent = Boolean(event);
    const formattedDate = format(date, "EEE d MMM");
    const descriptionLines = hasEvent && event?.description
        ? event.description.split(/[;\n]/).map(line => line.trim()).filter(Boolean)
        : [];

    const square = (
        <div
            className={clsx(
                `${hasEvent ? COLOR_BG300[color] : COLOR_BG100[color]}`,
                "group/date relative aspect-square w-16 rounded-md shadow-md transition-all duration-150 ease-out",
                hasEvent
                    ? "cursor-pointer hover:scale-95 hover:ring-2 hover:ring-uwaBlue hover:brightness-110"
                    : "hover:scale-95 hover:brightness-105"
            )}
        />
    );

    return (
        <Popover className="relative">
            <PopoverButton as="div">
                {square}
            </PopoverButton>
            <PopoverPanel
                anchor={"top"}
                transition
                className="z-40 flex pb-2 transition duration-150 ease-out data-[closed]:translate-y-1 data-[closed]:scale-95 data-[closed]:opacity-0"
            >
                <div className="w-56 rounded-xl border border-slate-200 bg-white/95 p-3 text-left shadow-xl shadow-slate-300/60 backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formattedDate}</p>
                    <h4 className="mt-1 text-sm font-semibold text-slate-900">
                        {hasEvent ? event?.summary ?? "Milestone" : ""}
                    </h4>
                    {hasEvent && descriptionLines.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-slate-600">
                            {descriptionLines.map((line, idx) => (
                                <li key={idx} className="leading-snug">{line}</li>
                            ))}
                        </ul>
                    )}
                    {hasEvent && event?.start && event?.end && (
                        <p className="mt-3 text-[11px] font-medium text-slate-400">
                            {format(event.start, "MMM d")} – {format(event.end, "MMM d")}
                        </p>
                    )}
                </div>
            </PopoverPanel>
        </Popover>
    );
};

/* The events row gets passed baby */
// Horizontal layout component (existing)
const AssignmentRow: React.FC<{ assignment: AssignmentCalendar; semester: Semester; dayCount: number }> = ({ assignment, semester, dayCount }) => {
    const dateAtIndex = (i: number): Date => {
        return new Date(semester.start.getTime() + i * DAYS_MS);
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
            {Array.from({length: dayCount}, (_, i) => {
                const d = dateAtIndex(i);
                const ev = eventForDate(d);
                return <AssignmentDate key={i} color={assignment.color} date={d} event={ev ?? null}/>;
            })}
        </div>
    );
};

// NEW: Vertical layout component (rotated 90° clockwise)
const AssignmentColumn: React.FC<{ assignment: AssignmentCalendar; semester: Semester; dayCount: number }> = ({ assignment, semester, dayCount }) => {
    const dateAtIndex = (i: number): Date => {
        return new Date(semester.start.getTime() + i * DAYS_MS);
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
            {Array.from({length: dayCount}, (_, i) => {
                const d = dateAtIndex(i);
                const ev = eventForDate(d);
                return <AssignmentDate key={i} color={assignment.color} date={d} event={ev ?? null}/>;
            })}
        </div>
    );
};

const RowLabel: React.FC<{ code?: string, assignment: AssignmentCalendar, height: number}> = ({ code, assignment, height }) => {
    // Equivalent rem sizes for tailwind sizing, used to make sure heading boxes grow correctly
    const gap = (height-1) * 0.75;
    const boxsize = height * 4;
    const { notify } = useNotification();
    const unitColor = normalizeColor(assignment.color) as CalendarColor;

    function handleDownloadIcs(event: React.MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        const ics = exportAssignmentCalendar(assignment);
        downloadIcs(assignment.name && `${assignment.unitCode}-${assignment.name}` || "New Assignment", ics);
    }

    async function handleDownloadPdf(event: React.MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        try {
            await exportAssignmentPdf(assignment);
        } catch (err) {
            console.error("Failed to download assignment PDF", err);
            notify("Failed to download assignment PDF. Please try again.", { success: false });
        }
    }

    return (
        <div className={`relative w-36 shrink-0 mr-2 ${COLOR_BG300[unitColor]} rounded-md group`} style={{ height: `${boxsize + gap}rem` }}>
            <span className={clsx("absolute inset-y-2 left-1 w-1 rounded-full bg-white/70", COLOR_ACCENT[unitColor])} />
            <div className={clsx(
                "relative w-full h-full flex items-center rounded-md border-2 font-semibold text-white",
                "transition-all duration-300 ease-out justify-center"
            )}>
                <span className={"transition-all duration-300 ease-out scale-100 group-hover:opacity-0 group-hover:scale-95"}>{code ?? ""}</span>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
                    <HoverIconButton
                        icon={<ArrowDownOnSquareIcon className="h-5 w-5" />}
                        label="Download as Calendar"
                        onClick={handleDownloadIcs}
                    />
                    <HoverIconButton
                        icon={<DocumentArrowDownIcon className="h-5 w-5" />}
                        label="Download as PDF"
                        onClick={handleDownloadPdf}
                    />
                </div>
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
    const { notify } = useNotification();
    const unitColor = normalizeColor(assignment.color) as CalendarColor;

    function handleDownloadIcs(event: React.MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        const ics = exportAssignmentCalendar(assignment);
        downloadIcs(assignment.name && `${assignment.unitCode}-${assignment.name}` || "New Assignment", ics);
    }

    async function handleDownloadPdf(event: React.MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        try {
            await exportAssignmentPdf(assignment);
        } catch (err) {
            console.error("Failed to download assignment PDF", err);
            notify("Failed to download assignment PDF. Please try again.", { success: false });
        }
    }

    return (
        <div 
            className={`relative h-36 shrink-0 mb-2 ${COLOR_BG300[unitColor]} rounded-md group`} 
            style={{ width: `${totalWidth}rem` }} 
        >
            <span className={clsx("absolute inset-x-2 top-1 h-1 rounded-full bg-white/70", COLOR_ACCENT[unitColor])} />
            <div className={clsx(
                "relative w-full h-full flex items-center justify-center rounded-md border-2 font-semibold text-white",
                "transition-all duration-300 ease-out"
            )}>
                <span className={"transition-all duration-300 ease-out scale-100 group-hover:opacity-0 group-hover:scale-95"}>{code ?? ""}</span>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:opacity-100">
                    <HoverIconButton
                        icon={<ArrowDownOnSquareIcon className="h-5 w-5" />}
                        label="Download as Calendar"
                        onClick={handleDownloadIcs}
                    />
                    <HoverIconButton
                        icon={<DocumentArrowDownIcon className="h-5 w-5" />}
                        label="Download as PDF"
                        onClick={handleDownloadPdf}
                    />
                </div>
            </div>
        </div>
    );
};

// Decides how many default rows and actual rows need to be displayed
const CalendarRows: React.FC<{assignments:Record<string,AssignmentCalendar[]>; semester: Semester; dayCount: number}> = ({assignments, semester, dayCount}) => {
    const rows = Object.keys(assignments).length;
    const temporaryRows = 4 - rows > 0 ? 4 - rows : 0;
    
    return (
        <>
            {Object.keys(assignments).flatMap((code: string) => (
                assignments[code].map((assignment, i) => (
                    <AssignmentRow key={`${code}-${i}`} assignment={assignment} semester={semester} dayCount={dayCount} />
                ))
            ))}
            {Array.from({length: temporaryRows}).map((_, idx) => (
                <div key={`empty-row-${idx}`} className="flex flex-row gap-2 min-w-max">
                    {Array.from({length: dayCount}, (_, i) => 
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
const CalendarColumns: React.FC<{assignments:Record<string,AssignmentCalendar[]>; semester: Semester; dayCount: number}> = ({assignments, semester, dayCount}) => {
    const cols = Object.keys(assignments).length;
    const temporaryCols = 4 - cols > 0 ? 4 - cols : 0;
    
    return (
        <>
            {Object.keys(assignments).flatMap((code: string) => (
                assignments[code].map((assignment, i) => (
                    <AssignmentColumn key={`${code}-${i}`} assignment={assignment} semester={semester} dayCount={dayCount} />
                ))
            ))}
            {Array.from({length: temporaryCols}).map((_, idx) => (
                <div key={`empty-col-${idx}`} className="flex flex-col gap-2 min-h-max">
                    {Array.from({length: dayCount}, (_, i) => 
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

const VisualCalendar: React.FC<{show: boolean, assignments: Record<string, AssignmentCalendar[]>; semester: Semester}> = ({ show, assignments, semester }) => {
    const rawDays = Math.max(semester.length, 1);
    const numWeeks = Math.max(1, Math.ceil(rawDays / 7));
    const dayCount = numWeeks * 7;
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
                        <CalendarRows assignments={assignments} semester={semester} dayCount={dayCount}/>
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
                                <CalendarColumns assignments={assignments} semester={semester} dayCount={dayCount}/>
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
