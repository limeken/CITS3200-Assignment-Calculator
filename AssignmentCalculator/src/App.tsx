import { useRef } from "react";
import "./index.css";

// Import website components from components subfolder
import UniversityBanner from "./components/UniversityBanner.tsx"
import { InstructionsButton } from "./components/Instructions.tsx"
import { SubmissionButton } from "./components/Submission.tsx";

import Calendar, {type CalendarRef} from "./components/calendar/Calendar.tsx";
import { type AssignmentCalendar} from "./components/calendar/CalendarTypes.ts";
// Main application component
export default function App() {
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

            {/* Button which triggers the instructions modal*/}
            <InstructionsButton />

            {/* Button which triggers the assignment submission modal */}
            <SubmissionButton onSubmit={onSubmitAssignment}/>

            {/* Displays either the calendar or textual visualisation*/}
            <Calendar ref={calRef} />

            {/* TODO: All these modals need to be managed by one global modal manager. */}
            {/* <InstructionsModal isOpen={modals.instructions} onClose={() => closeModal('instructions')} /> */}
            {/* 0 is a placeholder! */}
            {/*<AssignmentModal assignment={assignments[0]} isOpen={modals.assignment} onClose={() => closeModal('assignment')}/>*/}
        </>
    );
}
