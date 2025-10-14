// calendar element, all by me
import {useCallback, useEffect, useRef, useState} from "react";
import {type AssignmentCalendar, type AssignmentEvent, type CalendarColor, normalizeColor, calendarColors } from "./CalendarTypes.ts"
import TextCalendar from "./TextCalendar.tsx";
import VisualCalendar from "./VisualCalendar.tsx";
import CalendarOptions from "./CalendarOptions.tsx";
import PriorityQueue from "./PriorityQueue.tsx";
import { SubmissionButton } from "../Submission.tsx";
import { FALLBACK_SEMESTER_OPTIONS, type SemesterOption } from "./semesterOptions.ts";

const ASSIGNMENT_STORAGE_KEY = "assignment-calculator.assignments";

type StoredAssignmentEvent = {
    uid: string | null;
    summary: string | null;
    description: string | null;
    status: string | null;
    start: string | null;
    end: string | null;
    tzid: string | null;
};

type StoredAssignmentCalendar = {
    name: string;
    color: string;
    assignmentType: string;
    unitCode: string | null;
    start: string | null;
    end: string | null;
    events: StoredAssignmentEvent[];
};

type StoredAssignmentsMap = Record<string, StoredAssignmentCalendar[]>;

const toISOString = (date: Date | null | undefined): string | null =>
    date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;

const toDate = (value: unknown): Date | null => {
    if (typeof value === "string" || typeof value === "number") {
        const dt = new Date(value);
        if (!Number.isNaN(dt.getTime())) {
            return dt;
        }
    }
    return null;
};

const serializeAssignments = (assignments: Record<string, AssignmentCalendar[]>): StoredAssignmentsMap => {
    const result: StoredAssignmentsMap = {};
    for (const [unit, list] of Object.entries(assignments)) {
        result[unit] = list.map((assignment) => ({
            name: assignment.name,
            color: assignment.color,
            assignmentType: assignment.assignmentType,
            unitCode: assignment.unitCode ?? null,
            start: toISOString(assignment.start),
            end: toISOString(assignment.end),
            events: assignment.events.map((event) => ({
                uid: event.uid ?? null,
                summary: event.summary ?? null,
                description: event.description ?? null,
                status: event.status ?? null,
                start: toISOString(event.start),
                end: toISOString(event.end),
                tzid: event.tzid ?? null,
            })),
        }));
    }
    return result;
};

const deserializeAssignment = (raw: StoredAssignmentCalendar, fallbackUnit: string): AssignmentCalendar => {
    const events: AssignmentEvent[] = Array.isArray(raw.events)
        ? raw.events.map((event) => {
            const start = toDate(event.start) ?? new Date();
            const end = toDate(event.end) ?? start;
            return {
                uid: event.uid,
                summary: event.summary,
                description: event.description,
                status: event.status,
                start,
                end,
                tzid: event.tzid,
            };
        })
        : [];

    const fallbackStart = events.length > 0
        ? new Date(Math.min(...events.map((e) => e.start.getTime())))
        : new Date();
    const fallbackEnd = events.length > 0
        ? new Date(Math.max(...events.map((e) => e.end.getTime())))
        : fallbackStart;

    const start = toDate(raw.start) ?? fallbackStart;
    const end = toDate(raw.end) ?? fallbackEnd;

    return {
        name: raw.name,
        color: normalizeColor(raw.color),
        assignmentType: raw.assignmentType,
        unitCode: typeof raw.unitCode === "string" && raw.unitCode ? raw.unitCode : fallbackUnit,
        start,
        end,
        events,
    };
};

const deserializeAssignments = (json: string): Record<string, AssignmentCalendar[]> => {
    try {
        const parsed = JSON.parse(json) as StoredAssignmentsMap;
        if (!parsed || typeof parsed !== "object") return {};
        const result: Record<string, AssignmentCalendar[]> = {};
        for (const [unit, list] of Object.entries(parsed)) {
            if (!Array.isArray(list)) continue;
            const assignments = list
                .map((item) => deserializeAssignment(item, unit))
                .filter((assignment) => assignment.unitCode);
            if (assignments.length > 0) {
                result[unit] = assignments;
            }
        }
        return result;
    } catch (err) {
        console.warn("Failed to parse stored assignments", err);
        return {};
    }
};

const findMostRecentAssignment = (assignments: Record<string, AssignmentCalendar[]>): AssignmentCalendar | null => {
    const flattened = Object.values(assignments).flat();
    if (flattened.length === 0) return null;
    return flattened.reduce<AssignmentCalendar | null>((latest, current) => {
        const latestTime = latest?.end instanceof Date ? latest.end.getTime() : -Infinity;
        const currentTime = current.end ? current.end.getTime() : -Infinity;
        return currentTime >= latestTime ? current : latest;
    }, null);
};

const Calendar: React.FC = () => {
    const fallbackSemester = FALLBACK_SEMESTER_OPTIONS[0]!;
    const defaultSemester = FALLBACK_SEMESTER_OPTIONS[1] ?? fallbackSemester;

    const [assignments, setAssignments] = useState<Record<string, AssignmentCalendar[]>>({});
    const [newestAssignment, setNewestAssignment] = useState<AssignmentCalendar|null>(null);
    const [isVisual, setIsVisual] = useState<boolean>(true);
    const [activeSemester, setActiveSemester] = useState<SemesterOption>(defaultSemester);
    const hasHydrated = useRef(false);
    const colorCursor = useRef(0);
    const [, setUnitColors] = useState<Record<string, CalendarColor>>({});
    const unitColorsRef = useRef<Record<string, CalendarColor>>({});

    const commitUnitColor = useCallback((unitCode: string, color: CalendarColor) => {
        setUnitColors(prev => {
            if (prev[unitCode] === color) return prev;
            const next = { ...prev, [unitCode]: color };
            unitColorsRef.current = next;
            return next;
        });
    }, []);

    const selectColorForUnit = useCallback((unitCode: string): CalendarColor => {
        if (!unitCode) {
            return calendarColors[0];
        }

        const existing = unitColorsRef.current[unitCode];
        if (existing) {
            return existing;
        }

        const palette = calendarColors;
        const used = new Set(Object.values(unitColorsRef.current));

        for (let offset = 0; offset < palette.length; offset++) {
            const candidate = palette[(colorCursor.current + offset) % palette.length] as CalendarColor;
            if (!used.has(candidate)) {
                colorCursor.current = (colorCursor.current + offset + 1) % palette.length;
                commitUnitColor(unitCode, candidate);
                return candidate;
            }
        }

        const usage = new Map<CalendarColor, number>();
        for (const list of Object.values(assignments)) {
            for (const item of list) {
                const normalized = normalizeColor(item.color) as CalendarColor;
                usage.set(normalized, (usage.get(normalized) ?? 0) + 1);
            }
        }

        let best = palette[0] as CalendarColor;
        let bestCount = usage.get(best) ?? 0;
        palette.forEach((colorEntry) => {
            const color = colorEntry as CalendarColor;
            const count = usage.get(color) ?? 0;
            if (count < bestCount) {
                best = color;
                bestCount = count;
            }
        });

        commitUnitColor(unitCode, best);
        return best;
    }, [assignments, commitUnitColor]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        try {
            const raw = window.localStorage.getItem(ASSIGNMENT_STORAGE_KEY);
            if (raw) {
                const parsed = deserializeAssignments(raw);
                if (Object.keys(parsed).length > 0) {
                    setAssignments(parsed);
                    setNewestAssignment(findMostRecentAssignment(parsed));
                }
            }
        } catch (err) {
            console.warn("Failed to load assignments from storage", err);
        } finally {
            hasHydrated.current = true;
        }
    }, []);

    useEffect(() => {
        if (!hasHydrated.current || typeof window === "undefined") {
            return;
        }
        try {
            const payload = serializeAssignments(assignments);
            window.localStorage.setItem(ASSIGNMENT_STORAGE_KEY, JSON.stringify(payload));
        } catch (err) {
            console.warn("Failed to persist assignments", err);
        }
    }, [assignments]);

    useEffect(() => {
        const derived: Record<string, CalendarColor> = {};
        for (const [unit, list] of Object.entries(assignments)) {
            if (list.length > 0) {
                derived[unit] = normalizeColor(list[0].color);
            }
        }
        const prev = unitColorsRef.current;
        const prevKeys = Object.keys(prev);
        const derivedKeys = Object.keys(derived);
        const isSame =
            prevKeys.length === derivedKeys.length &&
            derivedKeys.every((key) => prev[key] === derived[key]);
        if (!isSame) {
            unitColorsRef.current = derived;
            setUnitColors(derived);
            colorCursor.current = derivedKeys.length % calendarColors.length;
        }
    }, [assignments]);

    // ASSIGNMENT MANIPULATION FUNCTIONS
    // ADD: Adds the specified assignment to the collection
    const addAssignment = useCallback((assignment: AssignmentCalendar, color?: string) => {
        const unitCode = assignment.unitCode;
        if (!unitCode) {
            return;
        }

        const existingColor = assignments[unitCode]?.[0]?.color;
        const assignedColor = normalizeColor(existingColor ?? color ?? selectColorForUnit(unitCode));

        if (!unitColorsRef.current[unitCode]) {
            commitUnitColor(unitCode, assignedColor);
        }

        const prepared: AssignmentCalendar = { ...assignment, color: assignedColor };

        setAssignments(prev => {
            const existing = prev[unitCode];
            if (existing && existing.length > 0) {
                return { ...prev, [unitCode]: [...existing, prepared] };
            }
            return { ...prev, [unitCode]: [prepared] };
        });

        setNewestAssignment(prepared);
    }, [assignments, selectColorForUnit, commitUnitColor]);

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
