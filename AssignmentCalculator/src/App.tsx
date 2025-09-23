import React, {useCallback, useRef, useState} from "react";
import "./index.css";

// Import webiste components from components subfolder
import UniversityBanner from "./components/UniversityBanner.tsx"
import InstructionsModal from "./components/InstructionsModal.tsx"
import NewAssignmentButton from "./components/NewAssignmentButton.tsx"
import AssignmentModal from "./components/AssignmentModal.tsx";
import FormatSwitch from "./components/FormatSwitch.tsx";
import Calendar, {type CalendarRef} from "./components/Calendar.tsx";

// The two different display formats you can toggle between
import CalendarFormat from "./components/CalendarFormat.tsx";
import TextualFormat from "./components/TextualFormat.tsx";

import {
    type Assignment,
    type AssignmentCalendar, type AssignmentEvent, parseIcsCalendar,
    pickRandomColor,
    validateCalendar
} from "./components/CalendarTypes.ts";
import SubmissionModal from "./components/SubmissionModal.tsx";
import FormatTransition from "./components/FormatTransition.tsx";

export type StateFunctions = {
    setSelectedType: (type: string) => void,
    setName: (name: string) => void,
    setCode: (code: string) => void,
    setStartDate: (start: Date) => void,
    setEndDate: (end: Date) => void,
}

const createAssignmentCalendar = () => {
    const newCalendar:AssignmentCalendar = {name: "", color: pickRandomColor(), start: null, end: null, events: new Array<AssignmentEvent>, assignmentType: "Essay"};
    return newCalendar;
}


// Main application component
export default function App() {
    
    // Used to toggle between formats
    const [isCalendarFormat, changeFormat] = useState<boolean>(true);

    // Used to show the outcome of adding an assessment via a banner
    const [showNotification, setNotification] = useState<boolean>(false);

    const [errors, setErrors] = useState<Array<boolean>>([true, true, true]);
    const calRef = useRef<CalendarRef>(null);


    // block-scoped type ModalKey determines which modal is available. Modal open/close behaviour is handled by close/openmodal.
    type ModalKey = 'instructions' | 'assignment' | 'submission';
    const [modals, setModals] = useState<Record<ModalKey, boolean>>({
        instructions: false,
        assignment: false,
        submission: false,
    });
    const openModal = (key: ModalKey) => setModals(prev => {return {...prev, [key]:true}});
    const closeModal = (key: ModalKey) => setModals(prev => {return {...prev, [key]: false}});

    // Called whenever a valid assignment is submitted
    const handleModalSubmit = async (submission:AssignmentCalendar) => {
        // Add final validation here...
        setNotification(true)
        await calRef.current?.addAssignment(submission);
        closeModal('submission');
    }

    // Needs reworking
    /*
    const handleImportCalendar = async () => {
        const parsedCal: AssignmentCalendar = await parseIcsCalendar('/fake_calendar.ics');
        const next: AssignmentCalendar = {
            ...parsedCal,
            name: "import",
            unitCode: "import",
            color: "orange",
        }
        setValidAssignment(next)
        console.log(next)
        await calRef.current?.addAssignment(next);
    } 
    */


    // This returns the finalised webpage, including all key components
    return (
        <>
            {/* University Banner */}
            <UniversityBanner showNotification={showNotification} setNotification = {setNotification} successful={true}/>

            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-4">
                <button
                    type="button"
                    onClick={() => openModal('instructions')}
                    className="inline-flex items-center rounded-md bg-uwaBlue px-3 py-2 text-white hover:bg-slate-700"
                >
                    View instructions
                </button>
            </div>
            {/* Needs working import!!*/}
            <NewAssignmentButton onImport={/*handleImportCalendar*/ ()=>{}} modalOpenKey={() => openModal('submission')}/>
            {/* Toggle to switch between calendar and textual formats */}
            <FormatSwitch isCalendarFormat={isCalendarFormat} changeFormat={changeFormat}/>

            {/* The two different assignment visualisation types*/}
            <div className={"mx-auto w-4/5"}>
                <FormatTransition show={isCalendarFormat}>
                    <Calendar ref={calRef} />
                </FormatTransition>
                <FormatTransition show={!isCalendarFormat}>
                    <TextualFormat />
                </FormatTransition>
            </div>

            {/* Modal Stuff */}
            <SubmissionModal isOpen={modals.submission} 
                            onClose={() => closeModal('submission')}
                            onSubmit={handleModalSubmit}
                            submission={createAssignmentCalendar()}
                            errors={errors}
            />
            
            {/* User Instructions Button & Page*/}
            <InstructionsModal isOpen={modals.instructions} onClose={() => closeModal('instructions')} />
            {/* 0 is a placeholder! */}
            {/*<AssignmentModal assignment={assignments[0]} isOpen={modals.assignment} onClose={() => closeModal('assignment')}/>*/}
        </>
    );
}
