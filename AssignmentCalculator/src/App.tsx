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
    const [showNotification, setNotification] = useState<boolean>(false);

    const calRef = useRef<CalendarRef>(null);

    /* when we add the assignment, trigger a few things */
    const onSubmitAssignment = async (submission: AssignmentCalendar) => {
        setNotification(true)
        await calRef.current?.addAssignment(submission);
    }

    // This returns the finalised webpage, including all key components
    return (
        <>
            {/* University Banner */}
            {/* Todo: rework notifications system so it uses a modal */}
            <UniversityBanner showNotification={showNotification} setNotification = {setNotification} successful={true}/>

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
