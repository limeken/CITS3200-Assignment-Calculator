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

// Semester interface which we use for data unpacking
export interface Semester {
    detail?: string;
    start: Date;
    end: Date;
    length: number;
    special_dates?: Array<{
        start: Date;
        end: Date;
    }>;
}

const dateString = (date: Date) =>  date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric"
});

// Function to create a new semester
export function createSemester(
    start: Date,
    end: Date,
    special_dates: Array<{ start: Date; end: Date }> = []
): Semester {
    const length = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); // days
    const detail = `${dateString(start)} to ${dateString(end)}`
    return { detail, start, end, length, special_dates };
}

/** This is how we statefully control the addition of new Assignments
 *  Technically they need an id, but I'll just key them based on index
 */
export interface Assignment {
    id: string;
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

export const createAssignmentCalendar = (): AssignmentCalendar => ({
    name: "",
    color: "",
    start: new Date(),
    end: new Date(),
    events: [],
    assignmentType: "essay",
});

export async function importCalendar(file: File): Promise<AssignmentCalendar> {
    const text = await file.text();
    const jcal = ICAL.parse(text);
    const vcal = new ICAL.Component(jcal);

    const nameValue =
        vcal.getFirstPropertyValue("x-wr-calname") ??
        vcal.getFirstPropertyValue("x-wr-cal-name") ??
        file.name;
    const name = typeof nameValue === "string" ? nameValue : file.name;

    const colorValue =
        vcal.getFirstPropertyValue("x-wr-color") ??
        vcal.getFirstPropertyValue("x-apple-calendar-color") ??
        "blue";
    const color = typeof colorValue === "string" ? colorValue : "blue";

    const typeValue = vcal.getFirstPropertyValue("x-wr-assignmenttype") ?? "Imported";
    const assignmentType = typeof typeValue === "string" ? typeValue : "Imported";

    const unitValue = vcal.getFirstPropertyValue("x-wr-unitcode");
    const unitCode = typeof unitValue === "string" ? unitValue : undefined;

    const vevents = vcal.getAllSubcomponents("vevent");
    const events: AssignmentEvent[] = vevents.map((vevent) => {
        const e = new ICAL.Event(vevent);
        const statusValue = vevent.getFirstPropertyValue("status");
        const status = typeof statusValue === "string" ? statusValue : null;
        const tzValue = vevent.getFirstPropertyValue("x-orig-tzid");
        const tzid = typeof tzValue === "string"
            ? tzValue
            : typeof e.startDate.zone?.tzid === "string"
                ? e.startDate.zone.tzid
                : null;

        return {
            uid: e.uid || null,
            summary: e.summary || null,
            description: e.description || null,
            status,
            start: e.startDate.toJSDate(),
            end: e.endDate.toJSDate(),
            tzid,
        };
    });

    const rawStart = vcal.getFirstPropertyValue("x-vc-start");
    const rawEnd = vcal.getFirstPropertyValue("x-vc-end");

    const metaStart = typeof rawStart === "string" || typeof rawStart === "number"
        ? rawStart
        : rawStart instanceof Date
            ? rawStart.toISOString()
            : null;

    const metaEnd = typeof rawEnd === "string" || typeof rawEnd === "number"
        ? rawEnd
        : rawEnd instanceof Date
            ? rawEnd.toISOString()
            : null;

    const start = metaStart !== null
        ? new Date(metaStart)
        : events.length
            ? new Date(Math.min(...events.map((e) => e.start.getTime())))
            : new Date();

    const end = metaEnd !== null
        ? new Date(metaEnd)
        : events.length
            ? new Date(Math.max(...events.map((e) => e.end.getTime())))
            : new Date();

    return {
        name,
        color,
        start,
        end,
        events,
        assignmentType,
        unitCode,
    };
}

export function exportAssignmentCalendar(ac: AssignmentCalendar): string {
    const vcal = new ICAL.Component("vcalendar");
    vcal.addPropertyWithValue("version", "2.0");
    vcal.addPropertyWithValue("prodid", "-//VisualCalendar//EN");
    vcal.addPropertyWithValue("calscale", "GREGORIAN");
    vcal.addPropertyWithValue("method", "PUBLISH");

    // Human name plus custom metadata
    const calName = ac.name ?? "Assignment";
    if (!ac.start || !ac.end) {
        throw new Error("Assignment calendar must have start and end dates before export");
    }

    vcal.addPropertyWithValue("X-WR-CALNAME", calName);
    vcal.addPropertyWithValue("X-WR-COLOR", ac.color);
    vcal.addPropertyWithValue("X-WR-ASSIGNMENTTYPE", ac.assignmentType);
    if (ac.unitCode) vcal.addPropertyWithValue("X-WR-UNITCODE", ac.unitCode);
    vcal.addPropertyWithValue("X-VC-START", ac.start.toISOString());
    vcal.addPropertyWithValue("X-VC-END", ac.end.toISOString());

    const now = ICAL.Time.fromJSDate(new Date(), true); // UTC

    for (const ev of ac.events) {
        const vevent = new ICAL.Component("vevent");
        const e = new ICAL.Event(vevent);

        e.uid = ev.uid ?? `${Date.now()}-${Math.random().toString(36).slice(2)}@visualcalendar`;
        e.summary = ac.name;
        if (ev.description) e.description = ev.description;

        // Time handling: write UTC for reliability, but keep original tzid as metadata
        e.startDate = ICAL.Time.fromJSDate(ev.start, true);
        e.endDate = ICAL.Time.fromJSDate(ev.end, true);

        // Fields not typed on ICAL.Event
        vevent.addPropertyWithValue("DTSTAMP", now);
        if (ev.status) {
            const s = ev.status.toUpperCase();
            if (s === "TENTATIVE" || s === "CONFIRMED" || s === "CANCELLED") {
                vevent.addPropertyWithValue("STATUS", s);
            }
        }
        if (ev.tzid) vevent.addPropertyWithValue("X-ORIG-TZID", ev.tzid);

        vcal.addSubcomponent(vevent);
    }

    return vcal.toString();
}

export function downloadIcs(filenameBase: string, icsText: string) {
    const safe = filenameBase.replace(/[^a-z0-9._-]+/gi, "_").slice(0, 80);
    const blob = new Blob([icsText], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safe.endsWith(".ics") ? safe : `${safe}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
