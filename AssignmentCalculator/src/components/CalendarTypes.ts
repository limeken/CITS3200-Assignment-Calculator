// Maxwell Slater 2025 CalendarTypes.ts
// This script defines all the types, interfaces, and constants used by the Calendar component
// Included are helper functions for unpacking data passed from other sources
import ICAL from "ical.js";
import { differenceInDays } from "date-fns";

/* TYPES INTERFACES AND CLASSES */
export class SemesterDates {
    start: Date;
    end: Date;
    length: number;

    constructor(start: Date, end: Date) {
        this.start = start;
        this.end = end;
        this.length = differenceInDays(end, start);
    }

    // get the start date of an assignment as the box # it appears in
    getAssignmentDates(ass: Assignment) {
        return [
            (ass.start ? differenceInDays(ass.start, this.start) : null),
            (ass.end && ass.start ? differenceInDays(ass.end, this.start) : null)
            ];
    }

}

export interface Assignment {
    name: string;
    color: CalendarColor;
    start: Date | null;
    end: Date | null;
    events: Array<{
        uid: string | null;
        summary: string | null;
        description: string | null;
        status: string | null;
        start: Date | null;
        end: Date | null;
        tzid: string | null;
    }>
    unitCode?: string;
}

/* FUNCTIONS */
export async function parseIcsCalendar(
    filePath: string,
    addAssignment?: (a: Assignment) => void
): Promise<Assignment> {
    // Normalize ical.js export shape across bundlers
    const mod = await import("ical.js");
    const ICAL: any = (mod as any).default ?? mod;

    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`Failed to fetch ${filePath}: HTTP ${res.status}`);
    const icsText = await res.text();

    // Parse the VCALENDAR
    const jcal = ICAL.parse(icsText);
    const vcal = new ICAL.Component(jcal);

    // ---- Calendar metadata (vendor-safe fallbacks) ----
    const nameProp =
        vcal.getFirstPropertyValue("name") ??
        vcal.getFirstPropertyValue("x-wr-calname") ??
        null;

    const colorProp =
        vcal.getFirstPropertyValue("color") ?? // RFC 7986
        vcal.getFirstPropertyValue("x-apple-calendar-color") ?? // Apple
        vcal.getFirstPropertyValue("x-wr-calcolor") ?? // Google (older)
        "#fff";

    // Calendar-level timezone
    const calTzid =
        vcal.getFirstPropertyValue("x-wr-timezone") ??
        vcal.getFirstSubcomponent("vtimezone")?.getFirstPropertyValue("tzid") ??
        null;

    // ---- Events ----
    const vevents = vcal.getAllSubcomponents("vevent");
    const events = vevents.map((ve: any) => {
        const e = new ICAL.Event(ve);
        const startTime = e.startDate ?? null; // ICAL.Time
        const endTime = e.endDate ?? null;     // ICAL.Time

        const eventTzid =
            startTime?.zone?.tzid ??
            endTime?.zone?.tzid ??
            calTzid ??
            null;

        return {
            uid: e.uid ?? null,
            summary: e.summary ?? null,
            description: e.description ?? null,
            status: ve.getFirstPropertyValue("status") ?? null,
            start: startTime ? startTime.toJSDate() : null,
            end: endTime ? endTime.toJSDate() : null,
            tzid: eventTzid,
        };
    });

    // Sort by start date (nulls last)
    events.sort((a, b) => {
        if (!a.start && !b.start) return 0;
        if (!a.start) return 1;
        if (!b.start) return -1;
        return a.start.getTime() - b.start.getTime();
    });

    // Compute calendar range from events
    const starts = events.map(e => e.start).filter((d): d is Date => d instanceof Date);
    const ends   = events.map(e => e.end).filter((d): d is Date => d instanceof Date);

    const assignment: Assignment = {
        name: nameProp ?? "Untitled",
        color: String(colorProp),
        start: starts.length ? new Date(Math.min(...starts.map(d => d.getTime()))) : null,
        end:   ends.length   ? new Date(Math.max(...ends.map(d => d.getTime())))   : null,
        events,
    };

    // Optionally push into your calendar immediately
    if (addAssignment) addAssignment(assignment);

    return assignment;
}

// lol i just realised the name for "assignment" and "calendar" have been used interchangeably. oops. will clean up in a later commit i promise xx
export function validateCalendar(cal: Assignment): Array<boolean> {
    return [
        !!cal.name,
        !!cal.start,
        !!cal.end,
    ];
}


/* CONSTANTS */
export const sem1 = new SemesterDates(new Date("2025-02-24"), new Date("2025-05-23"));
export const sem2 = new SemesterDates(new Date("2025-07-21"), new Date("2025-10-17"));

export const pickRandomColor = (): typeof calendarColors[number] =>
    calendarColors[Math.floor(Math.random() * calendarColors.length)];

export const calendarColors = ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"]
export type CalendarColor = typeof calendarColors[number];