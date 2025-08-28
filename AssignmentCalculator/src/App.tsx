import React, { useMemo, useState } from "react";
import "./index.css";
import {testRows} from "./components/testdata.ts";

// Import webiste components
import AssignmentCalendar from "./components/AssignmentCalendar.tsx";
import UniversityBanner from "./components/UniversityBanner.tsx"
import InstructionsPage from "./components/InstructionsPage.tsx"
import ApplicationHeading from "./components/ApplicationHeading.tsx"

type ScheduleItem = { task: string; date: string };
type TaskMap = Record<string, string[]>;

const TASKS: TaskMap = {
    Essay: [
        "Understand the question",
        "Initial research & sources",
        "Draft outline",
        "Write body paragraphs",
        "Write intro & conclusion",
        "Edit & proofread",
    ]
};

export default function App() {
    // Controls
    const [selectedType, setSelectedType] = useState<keyof typeof TASKS>("Essay");
    const [startDate, setStartDate] = useState<string>("01 / 08 / 2025");
    const [dueDate, setDueDate] = useState<string>("31 / 08 / 2025");
    const [hoursPerDay, setHoursPerDay] = useState<number>(2);

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

    // Component that declares the type of assessment
    function AssessmentTypeInput(){
        return  (
                    <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4">
                        <h2 className="text-lg font-semibold mb-3">Assessment Type</h2>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as keyof typeof TASKS)}
                            className="w-full rounded-xl px-4 py-3 bg-white/20"
                        >
                            {Object.keys(TASKS).map((k) => (
                                <option key={k} value={k}>
                                    {k}
                                </option>
                            ))}
                        </select>
                    </div>
                )
            ;}
    
    // Component that takes the start & end date for a given assignment
    function AssessmentDateInput(){
        return  (
                    <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4">
                        <h2 className="text-lg font-semibold mb-3">Dates</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium">Start date</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mt-1 w-full rounded-xl bg-white/20 px-3 py-2"
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium">Due date</span>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="mt-1 w-full rounded-xl bg-white/20 px-3 py-2"
                                />
                            </label>
                        </div>
                    </div>
                )  
            ;}

    // Component for entering number of hours dedicated to assignment (currently considered redundant)
    function AssessmentHoursInput(){
        return  (
                    <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4">
                        <h2 className="text-lg font-semibold mb-3">Plan Settings</h2>
                        <label className="block">
                            <span className="text-sm font-medium">Effort per day (hrs)</span>
                            <input
                                type="number"
                                step={0.5}
                                min={0.5}
                                value={Number.isFinite(hoursPerDay) ? hoursPerDay : 0}
                                onChange={(e) => setHoursPerDay(Number(e.target.value) || 0)}
                                className="mt-1 w-full rounded-xl bg-white/20 px-3 py-2"
                            />
                        </label>
                    </div>
                )
            ;}
    
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
            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6">
                <div className="grid lg:grid-cols-3 gap-4">
                    {/* Assessment Type */}
                    <AssessmentTypeInput/>
                    {/* Dates */}
                    <AssessmentDateInput/>
                    {/* Plan Settings */}
                    <AssessmentHoursInput/>
                    <button
                        onClick={generate}
                        className="mt-3 w-full rounded-xl bg-uwaBlue text-white font-semibold px-4 py-3"
                        >
                            Generate Plan
                    </button>
                </div> 
            </section>
            <StudyPlanSection/>
        </>
    );
}
