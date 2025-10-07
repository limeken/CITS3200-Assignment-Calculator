import { useRef, useState} from "react";
import "./index.css";

// Import website components from components subfolder
import UniversityBanner from "./components/UniversityBanner.tsx"
import { InstructionsButton } from "./components/Instructions.tsx"
import { SubmissionButton } from "./components/Submission.tsx";

import Calendar, {type CalendarRef} from "./components/calendar/Calendar.tsx";
import { type AssignmentCalendar} from "./components/calendar/CalendarTypes.ts";


// TODO: Not a necessary component of App.tsx and should be moved to submission typeas
export type StateFunctions = {
    setSelectedType: (type: string) => void,
    setName: (name: string) => void,
    setCode: (code: string) => void,
    setStartDate: (start: Date) => void,
    setEndDate: (end: Date) => void,
}

// Main application component
export default function App() {
    
    // TODO: This also needs to be a modal, kind of.
    // TODO: Errors should be validated differently
    const [errors, setErrors] = useState<Array<boolean>>([true, true, true]);
    const calRef = useRef<CalendarRef>(null);

    // Called whenever a new assignment is added.
    const onSubmitAssignment = async (submission: AssignmentCalendar) => {
        await calRef.current?.addAssignment(submission);
    }

    // This returns the finalised webpage, including all key components
    return (
        <>
            {/* University Banner */}
            <UniversityBanner/>

            <main className="flex flex-col gap-4 sm:gap-6">
                {/* Button which triggers the instructions modal*/}
                <InstructionsButton />

                {/* Button which triggers the assignment submission modal */}
                <SubmissionButton onSubmit={(submission) => onSubmitAssignment(submission)}
                                  onImport={(submission) => onSubmitAssignment(submission)} />

                {/* Displays either the calendar or textual visualisation */}
                <Calendar ref={calRef} />
            </main>


            {/* TODO: All these modals need to be managed by one global modal manager. */}
            {/* <InstructionsModal isOpen={modals.instructions} onClose={() => closeModal('instructions')} /> */}
            {/* 0 is a placeholder! */}
            {/*<AssignmentModal assignment={assignments[0]} isOpen={modals.assignment} onClose={() => closeModal('assignment')}/>*/}
        </>
    );
}