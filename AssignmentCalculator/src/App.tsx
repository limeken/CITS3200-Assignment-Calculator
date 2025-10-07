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

            <main className="flex flex-col gap-4 sm:gap-6">
                {/* Button which triggers the instructions modal*/}
                <InstructionsButton />

                {/* Button which triggers the assignment submission modal */}
                <SubmissionButton onSubmit={onSubmitAssignment} />

                {/* Displays either the calendar or textual visualisation */}
                <Calendar ref={calRef} />
            </main>
        </>
    );
}
