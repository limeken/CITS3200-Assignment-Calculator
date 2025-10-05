import { useRef, useState } from "react";
import "./index.css";

// Import website components from components subfolder
import UniversityBanner from "./components/UniversityBanner.tsx";
import { InstructionsButton } from "./components/Instructions.tsx";
import { SubmissionButton } from "./components/Submission.tsx";
import Calendar, { type CalendarRef } from "./components/calendar/Calendar.tsx";
import { type AssignmentCalendar } from "./components/calendar/CalendarTypes.ts";

// Import the PlannerDemo component
import PlannerDemo from "./components/PlannerDemo.tsx";

// TODO: Not a necessary component of App.tsx and should be moved to submission typeas
export type StateFunctions = {
    setSelectedType: (type: string) => void,
    setName: (name: string) => void,
    setCode: (code: string) => void,
    setStartDate: (start: Date) => void,
    setEndDate: (end: Date) => void,
};

// Main application component
export default function App() {
    // TODO: This also needs to be a modal, kind of.
    const [showNotification, setNotification] = useState<boolean>(false);

    // TODO: Errors should be validated differently
    const [errors, setErrors] = useState<Array<boolean>>([true, true, true]);
    const calRef = useRef<CalendarRef>(null);

    /* when we add the assignment, trigger a few things */
    const onSubmitAssignment = async (submission: AssignmentCalendar) => {
        setNotification(true);
        await calRef.current?.addAssignment(submission);
    };

    // This returns the finalised webpage, including all key components
    return (
        <>
            {/* University Banner */}
            {/* Todo: rework notifications system so it uses a modal */}
            <UniversityBanner showNotification={showNotification} setNotification={setNotification} successful={true} />

            {/* Button which triggers the instructions modal */}
            <InstructionsButton />

            {/* Button which triggers the assignment submission modal */}
            {/* <SubmissionButton onSubmit={(submission) => onSubmitAssignment(submission)} />*/}
            <SubmissionButton onSubmit={(submission) => onSubmitAssignment(submission)} onImport={() => {}}/>

            {/* Displays either the calendar or textual visualisation */}
            <Calendar ref={calRef} />

            {/* === TEMP: backend integration test === */}
            <div className="mt-6 border-t border-gray-300 pt-4">
                <h2 className="text-lg font-semibold mb-2">Planner API Demo</h2>
                <PlannerDemo />
            </div>

            {/* TODO: All these modals need to be managed by one global modal manager. */}
            {/* <InstructionsModal isOpen={modals.instructions} onClose={() => closeModal('instructions')} /> */}
            {/* 0 is a placeholder! */}
            {/* <AssignmentModal assignment={assignments[0]} isOpen={modals.assignment} onClose={() => closeModal('assignment')} /> */}
        </>
    );
}