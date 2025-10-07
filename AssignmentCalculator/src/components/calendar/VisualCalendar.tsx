import React from "react";
import {type AssignmentCalendar, type AssignmentEvent, type CalendarColor, downloadIcs, exportAssignmentCalendar, sem2} from "./CalendarTypes.ts";
import clsx from "clsx";
import {Popover, PopoverButton, PopoverPanel} from "@headlessui/react";
import {ArrowDownOnSquareIcon} from "@heroicons/react/24/outline";
import { pageSection } from "../../styles/tailwindStyles.ts";

const DAYS_MS = 24 * 60 * 60 * 1000;
const WEEK_DAYS = 7;

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
                "aspect-square rounded-xl border border-slate-200/70 transition-transform duration-200 ease-out hover:-translate-y-[1px]",
                event
                    ? [BG200[color], "shadow-[0_22px_40px_-26px_rgba(15,23,42,0.45)]", "bg-opacity-90"]
                    : [BG100[color], "shadow-[0_16px_32px_-25px_rgba(15,23,42,0.32)]", "bg-opacity-60", "backdrop-blur"]
            )}
            style={{ width: "var(--day-size)" }}
        />
    )

    if (!event) return square;

    // TODO: Fix popup spacing
    return (
        <Popover className="relative">
            <PopoverButton as="div">
                {square}
            </PopoverButton>
            <PopoverPanel
                anchor={"top"}
                transition
                className="flex max-w-xs rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 text-left shadow-[0_24px_45px_-28px_rgba(15,23,42,0.4)] transition duration-200 ease-out data-closed:-translate-y-1 data-closed:scale-95 data-closed:opacity-0"
            >
                <p data-hover className="text-sm font-medium text-slate-700">{event.summary}</p>
            </PopoverPanel>
        </Popover>
    )
};


/* The events row gets passed baby */
const TIMELINE_DIMENSIONS = "[--day-size:3rem] [--day-gap:0.375rem] sm:[--day-size:3.5rem] sm:[--day-gap:0.5rem] md:[--day-size:4rem]";
const GRID_COLUMN_GAP = "2.5rem";

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
        <div
            className={clsx("flex min-w-max items-center", TIMELINE_DIMENSIONS)}
            style={{ gap: "var(--day-gap)" }}
        >
            {Array.from({length: sem2.length}, (_, i) => {
                const d = dateAtIndex(i);
                const ev = eventForDate(d);
                return ( <AssignmentDate uid={i} color={assignment.color} event={ev}/> )
            })}
        </div>
    )
};

const buildWeekSegments = (totalDays: number, daysPerWeek: number): number[] => {
    const segments: number[] = [];
    for (let start = 0; start < totalDays; start += daysPerWeek) {
        const remaining = totalDays - start;
        segments.push(Math.min(daysPerWeek, remaining));
    }
    return segments;
};

const WEEK_SEGMENTS = buildWeekSegments(sem2.length, WEEK_DAYS);

const LABEL_COLUMN_WIDTH = "11.5rem";

const RowLabel: React.FC<{
    code?: string,
    assignment: AssignmentCalendar,
    height: number,
    className?: string,
    style?: React.CSSProperties,
}> = ({ code, assignment, height, className, style }) => {
    // Equivalent rem sizes for tailwind sizing, used to make sure heading boxes grow correctly
    const gap = (height-1) * 0.75;
    const boxsize = height * 4;

    //handle calendar download
    function handleClick() {
        const ics= exportAssignmentCalendar(assignment);
        downloadIcs(assignment.name && `${assignment.unitCode}-${assignment.name}` || "New Assignment", ics);
    }

    return (
        <div
            className={clsx(
                "group rounded-2xl border border-white/50 bg-opacity-95 transition-transform duration-200 hover:-translate-y-[2px] hover:scale-[0.99] hover:shadow-[0_22px_45px_-28px_rgba(15,23,42,0.45)]",
                "pointer-events-auto",
                BG200[assignment.color],
                className
            )}
            style={{
                height: `${boxsize + gap}rem`,
                width: LABEL_COLUMN_WIDTH,
                marginRight: GRID_COLUMN_GAP,
                ...style
            }}
            onClick={handleClick}
        >
            <div
                className={clsx(
                    "flex h-full w-full items-center gap-2 rounded-2xl px-4 font-semibold text-white",
                    "transition-all duration-300 ease-out justify-center group-hover:justify-between"
                )}
            >
                <span className="text-lg uppercase tracking-wide transition-all duration-300 ease-out group-hover:scale-95 group-hover:opacity-0">
                    {code ?? ""}
                </span>
                <ArrowDownOnSquareIcon className="h-7 w-7 opacity-0 transition-all duration-300 ease-out group-hover:scale-110 group-hover:opacity-100" />
            </div>
        </div>
    );
}

/* it should render with the assignments array */
const VisualCalendar: React.FC<{show: boolean, assignments: Record<string, AssignmentCalendar[]>}> = ({ show, assignments }) => {
    const codes = Object.keys(assignments);

    const gridChildren: React.ReactNode[] = [
        <div key="label-placeholder" aria-hidden />,
        <div
            key="week-row"
            className={clsx("flex min-w-max items-center", TIMELINE_DIMENSIONS)}
            style={{ gap: "var(--day-gap)" }}
        >
            {WEEK_SEGMENTS.map((daysInWeek, i) => (
                <div
                    key={i}
                    className="box-border flex h-14 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 px-3 text-center text-sm font-semibold text-slate-600 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.35)] sm:h-16 sm:px-4 sm:text-base"
                    style={{
                        minWidth: `calc(var(--day-size) * ${daysInWeek} + var(--day-gap) * ${Math.max(daysInWeek - 1, 0)})`,
                        flexGrow: daysInWeek,
                        flexBasis: 0
                    }}
                >
                    <span>Week {i + 1}</span>
                </div>
            ))}
        </div>
    ];

    if (codes.length === 0) {
        gridChildren.push(
            <div key="empty" className="col-span-2 px-2 text-sm font-medium text-[color:var(--color-text-muted)] sm:text-base">
                Nothing to show yet — add an assignment to populate the timeline.
            </div>
        );
    } else {
        codes.forEach(code => {
            const group = assignments[code];
            if (!group || group.length === 0) return;

            gridChildren.push(
                <RowLabel
                    key={`label-${code}`}
                    code={code}
                    assignment={group[0]}
                    height={group.length}
                    className="sticky left-0 top-0 z-10"
                    style={{ gridRow: `span ${group.length}` }}
                />
            );

            group.forEach((assignment, rowIndex) => {
                gridChildren.push(
                    <AssignmentRow key={`${code}-${rowIndex}`} assignment={assignment} />
                );
            });
        });
    }

    return (
        <div className={clsx(pageSection, "mt-6", !show && "hidden") }>
            <div className="surface-card overflow-visible px-4 py-6 sm:px-6">
                <div className="overflow-x-auto">
                    <div
                        className="grid min-w-full gap-y-5"
                        style={{
                            gridTemplateColumns: `${LABEL_COLUMN_WIDTH} minmax(0, 1fr)`,
                            columnGap: 0
                        }}
                    >
                        {gridChildren}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VisualCalendar;
