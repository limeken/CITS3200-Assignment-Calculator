import React, { useMemo, useState } from "react";
import "./index.css";

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
    ],
    "Coding Project": [
        "Clarify requirements",
        "Design & plan",
        "Set up repo/project",
        "Implement core features",
        "Testing & bugfixing",
        "Docs & final polish",
    ],
    "Lab Sheet": [
        "Read lab brief",
        "Background theory",
        "Perform experiments",
        "Record results",
        "Analysis & discussion",
        "Finalize & submit",
    ],
    Presentation: [
        "Define objectives",
        "Research & collect material",
        "Create slide outline",
        "Design slides",
        "Rehearse & refine",
        "Final run-through",
    ],
};

function App() {
    // Modal
    const [isOpen, setIsOpen] = useState(false);

    // Controls (replacing Alpine x-model)
    const [selectedType, setSelectedType] = useState<keyof typeof TASKS>("Essay");
    const [startDate, setStartDate] = useState<string>("");
    const [dueDate, setDueDate] = useState<string>("");
    const [hoursPerDay, setHoursPerDay] = useState<number>(2);

    // Output
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

    // Matches your `formatDate` helper (en-GB short month)
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

    return (
        <>
            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-uwaBlue text-white">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <a href="/" className="focus:outline-none" aria-label="UWA Home">
                            <img
                                src="//static.weboffice.uwa.edu.au/visualid/core-rebrand/img/uwacrest/uwacrest-white.svg"
                                alt="UWA Crest"
                                className="h-20 w-auto"
                            />
                        </a>
                    </div>
                </div>
            </header>

            {/* Grey Heading Bar */}
            <div className="bg-uwaGrey">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
                    <h1
                    className="text-2xl font-bold text-uwaBlue text-left font-uwa">
                        Academic Skills Centre Assignment Date Calculator
                    </h1>
                </div>
            </div>

            {/* Instructions Button + Modal */}
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-uwaBlue text-white px-4 py-2 rounded-xl shadow-soft font-semibold"
                >
                    Instructions
                </button>

                {/* Overlay */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        aria-hidden="true"
                        onClick={() => setIsOpen(false)}
                    />
                )}

                {/* Modal */}
                {isOpen && (
                    <div className="fixed inset-0 z-50 grid place-items-center">
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="inst-title"
                            className="bg-white rounded-xl shadow-soft max-w-lg w-full mx-4 p-6"
                        >
                            <h2 id="inst-title" className="text-xl font-bold mb-4 text-uwaBlue">
                                How to Use the Assignment Calculator
                            </h2>
                            <ul className="list-disc list-inside space-y-2 text-gray-800">
                                <li>
                                    <strong>Purpose:</strong> Plan your assignment by breaking the work into
                                    manageable steps.
                                </li>
                                <li>
                                    <strong>Assessment Type:</strong> Choose the variety of assignment (Essay,
                                    Coding Project, Lab Sheet, Presentation).
                                </li>
                                <li>
                                    <strong>Dates:</strong> Pick your start date and due date.
                                </li>
                                <li>
                                    <strong>Plan Settings:</strong> Set how many hours per day you’ll commit.
                                </li>
                                <li>
                                    Click <em>Generate Plan</em> to create your study timeline.
                                </li>
                            </ul>
                            <div className="mt-6 text-right">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="bg-uwaGold text-black px-4 py-2 rounded-xl font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6">
                <div className="grid lg:grid-cols-3 gap-4">
                {/* Assessment Type */}
                    <div className="bg-uwaGold text-gray-900 rounded-xl shadow-soft p-4">
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

                    {/* Dates */}
                    <div className="bg-uwaGold text-gray-900 rounded-xl shadow-soft p-4">
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

                    {/* Plan Settings */}
                    <div className="bg-uwaGold text-gray-900 rounded-xl shadow-soft p-4">
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
                        <button
                            onClick={generate}
                            className="mt-3 w-full rounded-xl bg-uwaBlue text-white font-semibold px-4 py-3"
                        >
                            Generate Plan
                        </button>
                    </div>
                </div>
            </section>

            {/* Study Plan */}
            <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6">
                <div className="bg-uwaGold rounded-xl shadow-soft p-4">
                <h2 className="text-xl font-bold">Study Plan</h2>
                    <ol className="mt-4 space-y-2">
                        {schedule.map((s, i) => (
                            <li
                                key={`${s.task}-${s.date}-${i}`}
                                className="bg-white/40 rounded-xl px-4 py-3 flex justify-between"
                            >
                                <span>{s.task}</span>
                                <span>{s.date}</span>
                            </li>
                        ))}
                        {schedule.length === 0 && (
                            <li className="bg-white/40 rounded-xl px-4 py-3 text-gray-700">
                                No plan yet. Choose dates and click <em>Generate Plan</em>.
                            </li>
                        )}
                    </ol>
                </div>
            </section>
        </>
    );
}

export default App;
