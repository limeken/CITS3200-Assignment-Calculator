import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import "./index.css";
import {testRows} from "./components/testdata.ts";
import {DocumentTextIcon, ClipboardDocumentListIcon, PresentationChartBarIcon, AcademicCapIcon, BeakerIcon, CubeIcon, QuestionMarkCircleIcon, RectangleStackIcon,} from "@heroicons/react/24/solid";

// Import webiste components from components subfolder
import AssignmentCalendar from "./components/AssignmentCalendar.tsx";
import UniversityBanner from "./components/UniversityBanner.tsx"
import InstructionsPage from "./components/InstructionsPage.tsx"
import ApplicationHeading from "./components/ApplicationHeading.tsx"
import StudyPlanInputFields from "./components/StudyPlanInputFields.tsx"
import AssignmentPopUp from "./components/AssignmentPopUp.tsx";
import Calendar, {type CalendarRef} from "./components/Calendar.tsx";
import {
    type Assignment,
    calendarColors,
    parseIcsCalendar,
    pickRandomColor,
    validateCalendar
} from "./components/CalendarTypes.ts";
import {PlusIcon} from "@heroicons/react/24/solid";
import SubmissionModal from "./components/SubmissionModal.tsx";

// Each assignment to be added to the assignment planner
type ScheduleItem = { task: string; date: string };

// Object type that stores compatible assignment types
export interface AssignmentType {
    id: number;
    name: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    tasks: Array<string>;
}

export type StateFunctions = {
    setSelectedType: (name: string) => void,
    setStartDate: (start: Date) => void,
    setEndDate: (end: Date) => void,
}

// Store assignment breakdowns here
export const TASKS: Array<AssignmentType> = [
    {
        id: 1,
        name: "Essay",
        Icon: DocumentTextIcon,
        tasks: ["Understand the question", "Initial research & sources", "Draft outline", "Write body paragraphs", "Write intro & conclusion", "Edit & proofread"]
    },
    {
        id: 2,
        name: "Labsheet",
        Icon: BeakerIcon,
        tasks: ["I dont know", "what this really entails", "Im sure it's something useful."]
    },
    {
        id: 3,
        name: "Project",
        Icon: CubeIcon,
        tasks: ["Sprint 1", "Sprint 2", "Sprint 3", "Secret final sprint"]
    }
];

/* a default (empty) assignment to fill the state with. Useful for instancing additional objects */
const DEFAULT: Assignment = {
    name: "Essay", start: null, end: null, events: new Array<[]>
}


// Main application component
export default function App() {

    const [validAssignment, setValidAssignment] = useState<Assignment>(DEFAULT);
    const [errors, setErrors] = useState<Array<boolean>>([true, true, true]);
    const calRef = useRef<CalendarRef>(null);

    // modal object details
    const [showModal, setShowModal] = useState(false)
    const [assignmentName, setAssignmentName] = useState("");
    const [unitCode, setUnitCode] = useState("");

    // Object that stores all state functions
    const stateFunctions: StateFunctions = {
        setSelectedType: (name: string) => {
            setValidAssignment(prev => ({...prev, name: name }));
            console.log(`set calendar name to: ${name}`);
        },
        setStartDate: (start: Date) => {
            setValidAssignment(prev => ({...prev, start: start }))
            console.log(`set calendar start to: ${start}`);
        },
        setEndDate: (end: Date) => {
            setValidAssignment(prev => ({...prev, end: end }))
            console.log(`set calendar end to: ${end}`);
        },
        //setHoursPerDay:setHoursPerDay,
    };


    const generateCalendar = useCallback(() => {

        /* TODO: better validation (i.e. check for more than "not null") for each of these */
        /* simple validation check, realistically it should happen in the CalendarTypes.ts file */

        // validation function exists in CalendarTypes.ts
        const new_errors = validateCalendar(validAssignment);
        if( new_errors.some(ok => !ok)) {
            setErrors(new_errors);
            return;
        }
        setShowModal(true);
    }, [validAssignment]);

    const handleModalSubmit = async () => {
        const name = assignmentName.trim()
        const unit = unitCode.trim()
        if (!name || !unit) return; //extra guarding

        const next: Assignment = {
            ...validAssignment,
            name,
            unitCode: unit,
            color: pickRandomColor(),
        };

        setValidAssignment(next);
        await calRef.current?.addAssignment(next);
        console.log(next)

        setShowModal(false);
        setAssignmentName("");
        setUnitCode("");
    }

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

            {/* TODO: We can define a parent component that dictates styling of children */}
            {/* Difficult to modularise, but all the elements in this component share a parent. */}
            <StudyPlanInputFields stateFunctions={stateFunctions} errors={errors} onImport={generateCalendar} onGenerate={generateCalendar}/>

            <section className={"mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6"}>
                <div className="bg-slate-200 rounded-xl shadow-soft p-4">
                    <Calendar ref={calRef}/>
                </div>
            </section>
            {/* Modal */}
            <SubmissionModal isOpen={showModal}
                    assignmentName={assignmentName} setAssignmentName={setAssignmentName}
                    unitCode={unitCode} setUnitCode={setUnitCode}
                    onSubmit={handleModalSubmit} onClose={() => setShowModal(false)}
            />
            <AssignmentPopUp />
        </>
    );
}
