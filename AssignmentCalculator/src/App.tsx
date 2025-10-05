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
    const [showNotification, setNotification] = useState<string|null>(null);

    // TODO: Errors should be validated differently
    const [errors, setErrors] = useState<Array<boolean>>([true, true, true]);
    const calRef = useRef<CalendarRef>(null);

    // Called whenever a new assignment is added.
    const onSubmitAssignment = async (submission: AssignmentCalendar) => {
        await calRef.current?.addAssignment(submission);
        setNotification(`Assignment was successfully added.`)
    }

    // Called whenever an existing assignment is updated.
    const onUpdateAssignment = async (oldAssignment: AssignmentCalendar, newAssignment: AssignmentCalendar) => {
        await calRef.current?.updateAssignment(oldAssignment,newAssignment);
        setNotification(`Assignment was successfully updated.`);
    }

    // Called whenever an existing assignment is deleted.
    const onDeleteAssignment = async (assignment: AssignmentCalendar) => {
        await calRef.current?.deleteAssignment(assignment);
        setNotification(`Assignment was successfully deleted.`);
    }

    // This returns the finalised webpage, including all key components
    return (
        <>
            {/* University Banner */}
            {/* Todo: rework notifications system so it uses a modal */}
            <UniversityBanner notification={showNotification} setNotification = {setNotification} successful={true}/>

            {/* Button which triggers the instructions modal*/}
            <InstructionsButton />

            {/* Button which triggers the assignment submission modal */}
            <SubmissionButton onSubmit={onSubmitAssignment}/>

            {/* Displays either the calendar or textual visualisation*/}
            <Calendar ref={calRef} onUpdate={onUpdateAssignment} onDelete={onDeleteAssignment}/>

            {/* TODO: All these modals need to be managed by one global modal manager. */}
            {/* <InstructionsModal isOpen={modals.instructions} onClose={() => closeModal('instructions')} /> */}
            {/* 0 is a placeholder! */}
            {/*<AssignmentModal assignment={assignments[0]} isOpen={modals.assignment} onClose={() => closeModal('assignment')}/>*/}
        </>
    );
}