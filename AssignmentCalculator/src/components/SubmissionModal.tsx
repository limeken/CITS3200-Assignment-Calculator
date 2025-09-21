import { parseISO, format } from "date-fns";

import type { Assignment, AssignmentCalendar } from "./CalendarTypes.ts"
import { assignments } from "./testdata.ts";

import React, {useEffect, useMemo, useState} from "react";
import clsx from "clsx";

import {QuestionMarkCircleIcon} from "@heroicons/react/24/outline";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

import {Dialog, DialogBackdrop, DialogPanel, DialogTitle} from "@headlessui/react";
import {Input, Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions,} from "@headlessui/react";

interface SubmissionModalProps {
    submission: AssignmentCalendar;
    isOpen: boolean;
    onSubmit:  (submission: AssignmentCalendar) => Promise<void>;
    onClose: () => void;
    errors: Array<boolean>;
}

// Input Field for the name of an assignment
const NameField: React.FC<{setAssignmentName: (arg:string)=>void; assignmentName:string}> = ({setAssignmentName,assignmentName}) => {
    return (
            <Field className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-full">
                <Label className="block text-sm font-medium font-semibold">
                    Assignment name
                </Label>
                <Input
                    type="text"
                    value={assignmentName}
                    onChange={(e) => setAssignmentName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g. Literature Review"
                />
            </Field>
    )
}

// Input Field for the unit code of an assignment
const UnitField: React.FC<{setUnitCode: (arg:string)=>void; unitCode:string;}> = ({setUnitCode,unitCode}) => {
    return (
        <Field className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-full">
            <Label className="block text-sm font-medium font-semibold">
                Unit code
            </Label>
            <Input
                type="text"
                value={unitCode}
                onChange={(e) => {setUnitCode(e.target.value)}}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g. CITS3200"
            />
        </Field>
    )
}
/*
*   TODO:
*    - PROPER BRAND COLORING
*    - COLOR GENERATION PICKED FROM A PALETTE
* */
const SubmissionModal: React.FC<SubmissionModalProps> = ({
                                                            submission,
                                                             isOpen,
                                                             onSubmit,
                                                             onClose, 
                                                             errors
                                                         }) => {

    // States for each data field
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const [assignmentName, setAssignmentName] = useState("");
    const [unitCode, setUnitCode] = useState("");
    
    // Build the items from TASKS
    const items = useMemo<Assignment[]>(() => Object.values(assignments), []);
    const [selected, setSelected] = useState<Assignment>(
        items.find(i => i.name === "Essay") ?? items[0]
    );

    const canSubmit = assignmentName.trim().length > 0 && unitCode.trim().length > 0;

    /* TODO: date validation for start and end */
    /* validate using string from ISO conversion */
    function handleStartDate(date: string) {
        console.log(`validating date: ${date}`);
        const next = parseISO(date);
        setStartDate(next);
    }

    function handleEndDate(date: string){
        console.log(`validating date: ${date}`);
        const next = parseISO(date);
        setEndDate(next);
    }

    /* a little polish on the inputs to show when they're invalid */
    function useError(trigger: boolean, ms = 400) {
        const [flashing, setFlashing] = useState(false);

        useEffect(() => {
            if(trigger) {
                setFlashing(true);
                const t = setTimeout(() => setFlashing(false), ms);
                return () => clearTimeout(t);
            }
        }, [trigger, ms])

        return flashing;
    }

    // Component that displays input for assessment type
    const AssessmentTypeInput: React.FC<{ error: boolean}> = ({ error }) => {

        const onChange = (it: Assignment) => {
            setSelected(it);
        };

        return (
            <Field className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-full">
                <Label className="block text-sm font-semibold text-gray-900 mb-2">Assessment type</Label>

                <div className="flex w-full flex-row items-center align-center">
                    <Listbox value={selected} onChange={onChange}>
                        <div className="relative mt-1 ml-2 w-full">
                            <ListboxButton id="assessment-type"
                                           className="grid w-full cursor-default grid-cols-1 rounded-md bg-white px-3 py-2 text-left text-gray-900 ring-1 ring-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500">
                                <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                                    <selected.icon className="size-5 shrink-0 text-blue-600"/>
                                    <span className="block truncate">{selected.name}</span>
                                </span>
                                <ChevronUpDownIcon aria-hidden="true"
                                                   className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-400"/>
                            </ListboxButton>

                            <ListboxOptions
                                className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-black/5 shadow-lg sm:text-sm">
                                {items.map((it) => (
                                    <ListboxOption key={it.id} value={it}
                                                   className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-blue-100 data-focus:outline-hidden">
                                        <div className="flex items-center">
                                            <it.icon className="size-5 shrink-0 text-blue-600"/>
                                            <span
                                                className="ml-3 block truncate font-normal group-data-selected:font-semibold">
                                                {it.name}
                                            </span>
                                        </div>
                                        <span
                                            className="absolute inset-y-0 right-0 hidden items-center pr-4 text-blue-600 group-data-selected:flex group-data-focus:text-blue-700">
                                            <CheckIcon aria-hidden="true" className="size-5"/>
                                        </span>
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </div>
                    </Listbox>
                    {error && null}
                </div>
            </Field>
        );
    };

    // Component that displays the inputs for start & end dates, for a given assignment
    const AssessmentDateInput: React.FC<{error: Array<boolean>}> = ( {error}) =>{
        const err_start = useError(!error[0])
        const err_end = useError(!error[1])

        const base = "mt-1 w-full rounded-xl px-3 py-2 duration-500 ease-out";
        const alert = "bg-red-200 animate-pulse";
        return  (
                    <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-full">
                        <h2 className="text-lg font-semibold mb-3">Dates</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {/* Start Date Input */}
                            <Field>
                                <Label className="text-sm font-medium">Start date</Label>
                                {/*Input for start date is linked to its state, its handler linked to the state function*/}
                                <Input
                                    type="date"
                                    value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                                    onChange={(e) => handleStartDate(e.target.value)}
                                    className={clsx(base, err_start ? alert: "bg-white")}
                                />
                            </Field>

                            {/* End Date Input */}
                            <Field>
                                <Label className="text-sm font-medium">Due date</Label>
                                {/*Input for end date is linked to its state, its handler linked to the state function*/}
                                <Input
                                    type="date"
                                    value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                                    onChange={(e) => handleEndDate(e.target.value)}
                                    className={clsx(base, err_end ? alert : "bg-white")}
                                />
                            </Field>
                        </div>
                    </div>
                )
            ;}

    // Saves the data entered into the modal into the assignment calendar object
    const SaveSubmission = () => {
        submission.assignmentType = selected.name;
        submission.start = startDate;
        submission.end = endDate;
        submission.name = assignmentName.trim();
        submission.unitCode = unitCode.trim();
    };

    // Button for submitting a finished assignment
    const SubmissionButton: React.FC = () => {
        return (
            <button
                type="button"
                onClick={()=>{SaveSubmission(); onSubmit(submission);}}
                disabled={!canSubmit}
                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto ${
                    canSubmit
                        ? "bg-blue-600 hover:bg-blue-500"
                        : "bg-gray-400 cursor-not-allowed"
                    }
                `}
            >
            Create
            </button>
        )
    }
    return ( 
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/50"
            />

            <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95 dark:bg-gray-800 dark:outline dark:-outline-offset-1 dark:outline-white/10"
                    >
                        <div className="bg-white p-5 flex flex-col justify-center">
                            {/* Modal Head */}
                            <div className="h3 text-base font-semibold text-gray-900 w-full">
                                <DialogTitle>
                                    Create New Assignment:
                                </DialogTitle>
                            </div>
                            <form className="my-5 text-left w-full flex flex-col gap-2 items-center justify-center">
                                {/* Modal Body */}
                                <section className="gap-4 flex flex-col items-center justify-center w-4/5">
                                    <AssessmentTypeInput error={errors[0]}/>
                                    <AssessmentDateInput error={[errors[1], errors[2]]}/>
                                    <NameField setAssignmentName={setAssignmentName} assignmentName={assignmentName}/>
                                    <UnitField setUnitCode={setUnitCode} unitCode={unitCode}/>
                                </section>

                                {/* Submission Button */}
                                <SubmissionButton/>
                            </form>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default SubmissionModal;