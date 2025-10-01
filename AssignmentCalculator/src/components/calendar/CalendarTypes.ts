// Maxwell Slater 2025 CalendarTypes.ts
// This script defines all the types, interfaces, and constants used by the Calendar component
// Included are helper functions for unpacking data passed from other sources
import ICAL from "ical.js"
import { differenceInDays } from "date-fns";
import React from "react";

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
    getAssignmentDates(ass: AssignmentCalendar) {
        return [
            (ass.start ? differenceInDays(ass.start, this.start) : null),
            (ass.end && ass.start ? differenceInDays(ass.end, this.start) : null)
            ];
    }
}

/** This is how we statefully control the addition of new Assignments
 *  Technically they need an id, but I'll just key them based on index
 */
export interface Assignment {
    id: number;
    name: string; // The name of the assignment (e.g. essay, report, etc...)
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    events: Array<{
        name: string;
        percentage: number;
        instructions?: string[] | null;
        resources?: string[];
    }>
}

// shitty adaption of https://icalendar.org/iCalendar-RFC-5545/3-6-1-event-component.html
export interface AssignmentEvent {
    uid: string | null;
    summary: string | null;
    description: string | null;
    status: string | null;
    start: Date;
    end: Date;
    tzid: string | null;
}

/** This is an instance of Assignment that wraps together the calendar data and assignment data
 *  This *isn't* a class for the key reasons that we want to mutate, serialize, and compare it.
 */
export interface AssignmentCalendar {
    name: string;
    color: CalendarColor;
    start: Date;
    end: Date;
    events: AssignmentEvent[]; // this should be an ICAL.Event
    assignmentType: string;
    unitCode?: string;
}

export function mapEvents(a: Assignment, start: Date, end: Date): AssignmentEvent[] {

    const startTime = start.getTime();
    const endTime = end.getTime();
    const total = a.events.length;

    return a.events.map((e, i): AssignmentEvent => {
        const fractionStart = i / total;
        const fractionEnd = (i + 1 ) / total;

        const eStart = new Date(startTime + fractionStart * (endTime - startTime));
        const eEnd = new Date(startTime + fractionEnd * (endTime - startTime));

        return {
            uid: e.name,
            summary: e.name,
            description: e.instructions? e.instructions.join(";") : "None",
            status: null,
            start: eStart,
            end: eEnd,
            tzid: "+08:00",
        }
    });
}

/* FUNCTIONS */
export async function parseIcsCalendar(
    filePath: string,
    addAssignment?: (a: AssignmentCalendar) => void
): Promise<AssignmentCalendar> {
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
    const events: AssignmentEvent[] = vevents.map((ve: ICAL.Event) => {
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
            start: startTime ? startTime.toJSDate() : null,
            end: endTime ? endTime.toJSDate() : null,
            tzid: eventTzid,
        };
    });

    // Sort by start date (nulls last)
    events.sort((a: AssignmentEvent, b: AssignmentEvent) => {
        if (!a.start && !b.start) return 0;
        if (!a.start) return 1;
        if (!b.start) return -1;
        return a.start.getTime() - b.start.getTime();
    });

    // Compute calendar range from events
    const starts = events.map(e => e.start).filter((d): d is Date => d instanceof Date);
    const ends   = events.map(e => e.end).filter((d): d is Date => d instanceof Date);

    const assignment: AssignmentCalendar = {
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

export const createAssignmentCalendar = () => {
    const newCalendar:AssignmentCalendar = {name: "", color: "", start: null, end: null, events: new Array<AssignmentEvent>, assignmentType: "Essay"};
    return newCalendar;
}

// lol i just realised the name for "assignment" and "calendar" have been used interchangeably.
// oops. will clean up in a later commit i promise xx
export function validateCalendar(cal: AssignmentCalendar): Array<boolean> {

    // TODO 1: make sure start isn't after end

    // TODO 2: make sure end isn't before start

    // TODO 3: make sure name doesn't include invalid characters

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