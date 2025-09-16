import React, {useCallback, useRef, useState} from "react";
import "./index.css";
import {DocumentTextIcon, BeakerIcon, CubeIcon } from "@heroicons/react/24/solid";

// Import webiste components from components subfolder
import UniversityBanner from "./components/UniversityBanner.tsx"
import InstructionsModal from "./components/InstructionsModal.tsx"
import ApplicationHeading from "./components/ApplicationHeading.tsx"
import StudyPlanInputFields from "./components/StudyPlanInputFields.tsx"
import AssignmentModal from "./components/AssignmentModal.tsx";
import Calendar, {type CalendarRef} from "./components/Calendar.tsx";
import {
    type Assignment, type AssignmentEvent, parseIcsCalendar,
    pickRandomColor,
    validateCalendar
} from "./components/CalendarTypes.ts";
import SubmissionModal from "./components/SubmissionModal.tsx";

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
    name: "Essay", color: "red", start: null, end: null, events: new Array<AssignmentEvent>
}


// Main application component
export default function App() {

    const [validAssignment, setValidAssignment] = useState<Assignment>(DEFAULT);
    const [errors, setErrors] = useState<Array<boolean>>([true, true, true]);
    const calRef = useRef<CalendarRef>(null);

    // submission modal details (TODO: move this into the submission modal element)
    const [assignmentName, setAssignmentName] = useState("");
    const [unitCode, setUnitCode] = useState("");

    // block-scoped type ModalKey determines which modal is available. Modal open/close behaviour is handled by close/openmodal.
    type ModalKey = 'instructions' | 'assignment' | 'submission';
    const [modals, setModals] = useState<Record<ModalKey, boolean>>({
        instructions: false,
        assignment: false,
        submission: false,
    });
    const openModal = (key: ModalKey) => setModals({ instructions: false, assignment: false, submission: false, [key]: true });
    const closeModal = (key: ModalKey) => setModals((prev) => ({...prev, [key]: false}))

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
        openModal('submission');
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

        closeModal('submission');
        setAssignmentName("");
        setUnitCode("");
    }

    const handleImportCalendar = async () => {
        const parsedCal: Assignment = await parseIcsCalendar('/fake_calendar.ics');
        const next: Assignment = {
            ...parsedCal,
            name: "import",
            unitCode: "import",
            color: "orange",
        }
        setValidAssignment(next)
        console.log(next)
        await calRef.current?.addAssignment(next);
    }

    // This returns the finalised webpage, including all key components
    return (
        <>
            {/* University Banner */}
            <UniversityBanner/>

            {/* Application Title Bar */}
            <ApplicationHeading/>

            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-4">
                <button
                    type="button"
                    onClick={() => openModal('instructions')}
                    className="inline-flex items-center rounded-md bg-uwaBlue px-3 py-2 text-white hover:bg-slate-700"
                >
                    View instructions
                </button>
            </div>

            {/* Section for Input Fields */}
            {/* TODO: We can define a parent component that dictates styling of children */}
            {/* Difficult to modularise, but all the elements in this component share a parent. */}
            <StudyPlanInputFields stateFunctions={stateFunctions} errors={errors}
                                  onImport={handleImportCalendar} onGenerate={generateCalendar}
                                  onShowAssignmentHelp={() => openModal('assignment')}
            />

            <section className={"mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6"}>
                <div className="bg-slate-200 rounded-xl shadow-soft p-4">
                    <Calendar ref={calRef}/>
                </div>
            </section>

            {/* Modal Stuff */}
            <SubmissionModal isOpen={modals.submission} onClose={() => closeModal('submission')}
                    assignmentName={assignmentName} setAssignmentName={setAssignmentName}
                    unitCode={unitCode} setUnitCode={setUnitCode}
                    onSubmit={handleModalSubmit}
            />
            {/* User Instructions Button & Page*/}
            <InstructionsModal isOpen={modals.instructions} onClose={() => closeModal('instructions')} />
            <AssignmentModal isOpen={modals.assignment} onClose={() => closeModal('assignment')}/>
        </>
    );
}
