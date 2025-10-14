import { useMemo } from "react";
import clsx from "clsx";
import { differenceInCalendarDays, format } from "date-fns";
import { PencilSquareIcon, CalendarDaysIcon } from "@heroicons/react/24/solid";
import type { AssignmentCalendar, CalendarColor } from "./CalendarTypes";
import { useModal } from "../../providers/ModalProvider";
import { useAssignmentTypeLibrary } from "../../providers/assignmentTypeHooks.ts";
import { COLOR_ACCENT, COLOR_SOFT, COLOR_TEXT, COLOR_RING } from "./colorStyles";
import Submission from "../Submission";

type PriorityQueueProps = {
    newest: AssignmentCalendar | null;
    onUpdate: (oldAssignment: AssignmentCalendar, newAssignment: AssignmentCalendar) => void;
    onDelete: (assignment: AssignmentCalendar) => void;
    assignments: Record<string, AssignmentCalendar[]>;
};

const getDueBadge = (dueDate: Date) => {
    const days = differenceInCalendarDays(dueDate, new Date());
    if (days < 0) {
        const abs = Math.abs(days);
        return {
            label: `Overdue by ${abs} day${abs === 1 ? "" : "s"}`,
            className: "bg-rose-100 text-rose-700",
        };
    }
    if (days === 0) {
        return { label: "Due today", className: "bg-red-100 text-red-700" };
    }
    if (days === 1) {
        return { label: "Due tomorrow", className: "bg-orange-100 text-orange-700" };
    }
    if (days <= 5) {
        return { label: `Due in ${days} days`, className: "bg-amber-100 text-amber-700" };
    }
    if (days <= 14) {
        return { label: `Due in ${days} days`, className: "bg-yellow-100 text-yellow-700" };
    }
    return { label: `Due in ${days} days`, className: "bg-emerald-100 text-emerald-700" };
};

const PriorityQueue: React.FC<PriorityQueueProps> = ({ newest, onUpdate, onDelete, assignments }) => {
    const { open, close } = useModal();
    const { data: library } = useAssignmentTypeLibrary();

    const assignmentLabels = useMemo<Record<string, string>>(() => {
        const map: Record<string, string> = {};
        (library?.assignments ?? []).forEach((assignment) => {
            map[assignment.id] = assignment.name;
            map[assignment.name] = assignment.name;
            map[assignment.name.toLowerCase()] = assignment.name;
        });
        return map;
    }, [library]);

    const sortedAssignments = useMemo(() => {
        return Object.values(assignments)
            .flat()
            .slice()
            .sort((a, b) => a.end.getTime() - b.end.getTime());
    }, [assignments]);

    const openResubmission = (selected: AssignmentCalendar) => {
        open((id) => (
            <Submission
                submission={selected}
                isNew={false}
                assignments={assignments}
                onUpdate={async (oldAssignment, newAssignment) => {
                    await onUpdate(oldAssignment, newAssignment);
                    close(id);
                }}
                onDelete={async (assignment) => {
                    await onDelete(assignment);
                    close(id);
                }}
                onClose={() => close(id)}
            />
        ));
    };

    const hasAssignments = sortedAssignments.length > 0;

    if (!hasAssignments) {
        return null;
    }

    return (
        <section className="w-full max-w-6xl mx-auto transition-all duration-300">
            <div className="surface-card border border-slate-200/70 bg-white/85 p-5 shadow-[0_26px_60px_-30px_rgba(15,23,42,0.35)]">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
                        Priority Queue
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                        {hasAssignments ? `${sortedAssignments.length} assignment${sortedAssignments.length === 1 ? "" : "s"}` : "No assignments"}
                    </span>
                </header>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {sortedAssignments.map((assignment) => {
                            const unitColor = assignment.color as CalendarColor;
                            const typeKey = assignment.assignmentType ?? "";
                            const typeLabel = assignmentLabels[typeKey.toLowerCase()] ?? assignmentLabels[typeKey] ?? assignment.assignmentType;
                            const dueInfo = getDueBadge(assignment.end);
                            const isLatest = assignment === newest;

                            return (
                                <article
                                    key={`${assignment.unitCode ?? "unit"}-${assignment.name}-${assignment.end.getTime()}`}
                                    className={clsx(
                                        "relative flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.35)] transition-transform duration-200",
                                        isLatest && "ring-2 ring-indigo-200",
                                        "hover:-translate-y-1 hover:shadow-[0_26px_65px_-30px_rgba(79,70,229,0.35)]"
                                    )}
                                >
                                    <span className={clsx("absolute inset-y-0 left-0 w-1 rounded-l-2xl", COLOR_ACCENT[unitColor])} />

                                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        <span>{format(assignment.end, "EEE d MMM")}</span>
                                        <button
                                            type="button"
                                            onClick={() => openResubmission(assignment)}
                                            className="inline-flex items-center rounded-full bg-slate-100/80 p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                                            aria-label="Edit assignment"
                                        >
                                            <PencilSquareIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900">{assignment.name}</h3>
                                        <p className="mt-1 text-sm text-slate-500">{typeLabel}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={clsx(
                                                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                                                COLOR_SOFT[unitColor],
                                                COLOR_TEXT[unitColor]
                                            )}
                                        >
                                            {assignment.unitCode ?? "Unit"}
                                        </span>
                                        <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", dueInfo.className)}>
                                            {dueInfo.label}
                                        </span>
                                    </div>

                                    <div className={clsx("rounded-xl border border-slate-200/60 bg-slate-50 px-3 py-2 text-xs text-slate-500 ring-1", COLOR_RING[unitColor])}>
                                        <div className="flex justify-between">
                                            <span>Start {assignment.start ? format(assignment.start, "d MMM") : "—"}</span>
                                            <span>Due {format(assignment.end, "d MMM yyyy")}</span>
                                        </div>
                                    </div>
                                </article>
                            );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PriorityQueue;
