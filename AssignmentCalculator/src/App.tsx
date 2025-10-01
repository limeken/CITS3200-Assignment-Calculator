import React, {useCallback, useRef, useState} from "react";
import "./index.css";

// Import webiste components from components subfolder
import UniversityBanner from "./components/UniversityBanner.tsx"
import InstructionsModal from "./components/InstructionsModal.tsx"
import NewAssignmentButton from "./components/NewAssignmentButton.tsx"
import AssignmentModal from "./components/AssignmentModal.tsx";
import FormatSwitch from "./components/FormatSwitch.tsx";
import Calendar, {type CalendarRef} from "./components/Calendar.tsx";

import {
    type Assignment,
    type AssignmentCalendar, type AssignmentEvent, parseIcsCalendar,
    pickRandomColor,
    validateCalendar
} from "./components/CalendarTypes.ts";
import SubmissionModal from "./components/SubmissionModal.tsx";

export type StateFunctions = {
    setSelectedType: (type: string) => void,
    setName: (name: string) => void,
    setCode: (code: string) => void,
    setStartDate: (start: Date) => void,
    setEndDate: (end: Date) => void,
}

const createAssignmentCalendar = () => {
    const newCalendar:AssignmentCalendar = {name: "", color: "", start: null, end: null, events: new Array<AssignmentEvent>, assignmentType: "Essay"};
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

            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6 relative">
                {/* Left: instructions icon */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                    <button
                    type="button"
                    onClick={() => openModal('instructions')}
                    aria-label="Instructions"
                    title="Instructions"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full
                                bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800
                                focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 shadow"
                    >
                    <span className="text-lg font-bold leading-none">?</span>
                    <span className="sr-only">Open instructions</span>
                    </button>
                </div>

                {/* Middle: create/import (stay centered) */}
                <div className="flex justify-center">
                    <NewAssignmentButton
                    onImport={/*handleImportCalendar*/ ()=>{}}
                    modalOpenKey={() => openModal('submission')}
                    />
                </div>
                </div>
            {/* Needs working import!!*/}

            {/* Toggle to switch between calendar and textual formats */}
            <FormatSwitch isCalendarFormat={isCalendarFormat} changeFormat={changeFormat}/>

            {/* Displays either the calendar or textual visualisation*/}
            <Calendar ref={calRef} show={isCalendarFormat}/>


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
