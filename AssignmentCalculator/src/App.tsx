import React, { useMemo, useState } from "react";
import "./index.css";
import {testRows} from "./components/testdata.ts";

// Import webiste components from components subfolder
import AssignmentCalendar from "./components/AssignmentCalendar.tsx";
import UniversityBanner from "./components/UniversityBanner.tsx"
import InstructionsPage from "./components/InstructionsPage.tsx"
import ApplicationHeading from "./components/ApplicationHeading.tsx"
import StudyPlanInputFields from "./components/StudyPlanInputFields.tsx"

// Each assignment to be added to the assignment planner
type ScheduleItem = { task: string; date: string };

// Object type that stores compatible assignment types
type TaskMap = Record<string, string[]>;

// Object types for stor references to input field states & their associated functions
export type States = Record<string,any>;
export type StateFunctions = Record<string, (val:any) => void>;

// Store assignment breakdowns here
export const TASKS: TaskMap = {
    Essay: [
        "Understand the question",
        "Initial research & sources",
        "Draft outline",
        "Write body paragraphs",
        "Write intro & conclusion",
        "Edit & proofread",
    ]
};

// Main application component
export default function App() {
    // Controls
    const [selectedType, setSelectedType] = useState<keyof TaskMap>("Essay");
    const [startDate, setStartDate] = useState<string>("01 / 08 / 2025");
    const [dueDate, setDueDate] = useState<string>("31 / 08 / 2025");
    const [hoursPerDay, setHoursPerDay] = useState<number>(2);
    
    // Object that stores all field states
    const states:States = {
        selectedType:selectedType,
        startDate:startDate,
        dueDate:dueDate,
        hoursPerDay:hoursPerDay
    };
    
    // Object that stores all state functions
    const stateFunctions:StateFunctions = {
        setSelectedType:setSelectedType,
        setStartDate:setStartDate,
        setDueDate:setDueDate,
        setHoursPerDay:setHoursPerDay
    };

    // Output
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

    // Format date and memoise result for future renders
    const formatDate = useMemo(
        () =>
            new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }),
        []
    );

    const parseISO = (s: string): Date | null => {
        if (!s) return null;
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d;
    };

    const daysBetween = (a: Date, b: Date) => {
        const MS = 24 * 60 * 60 * 1000;
        const a0 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
        const b0 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
        return Math.max(0, Math.round((b0.getTime() - a0.getTime()) / MS));
    };
    const addDays = (d: Date, n: number) => {
        const c = new Date(d.getTime());
        c.setDate(c.getDate() + n);
        return c;
    };

    const generate = () => {
        const s = parseISO(startDate);
        const e = parseISO(dueDate);
        if (!s || !e || e < s) {
            setSchedule([]);
            return;
        }
        const tasks = TASKS[selectedType];
        const totalDays = Math.max(1, daysBetween(s, e));
        const steps = Math.max(1, tasks.length - 1);
        const gap = totalDays / steps;

        const plan: ScheduleItem[] = tasks.map((task, i) => {
            const offset = Math.round(i * gap);
            const when = addDays(s, Math.min(totalDays, offset));
            return { task: `${task} (${hoursPerDay}h)`, date: formatDate.format(when) };
        });

        setSchedule(plan);
    };
    
    // This section will hold the generated study plan visualisation
    function StudyPlanSection(){
        return (<section className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6">
                    <div className="bg-slate-200 rounded-xl shadow-soft p-4">
                        <h2 className="text-xl font-bold">Study Plan</h2>
                            <AssignmentCalendar rows={testRows}/>
                    </div>
                </section>
            )
        ;}

    // This returns the finalised webpage, including all key components
    return (
        <>
            {/* University Banner */}
            <UniversityBanner/>
            {/* Application Title Bar */}
            <ApplicationHeading/>
            {/* User Instructions Button & Page*/}
            <InstructionsPage/>
            {/* Section for Input Fields */}
            {/*Note: Difficult to modularise further! (can't move components to separate files)*/}
            <StudyPlanInputFields states = {states} stateFunctions = {stateFunctions}/>
            <StudyPlanSection/>
        </>
    );
}
