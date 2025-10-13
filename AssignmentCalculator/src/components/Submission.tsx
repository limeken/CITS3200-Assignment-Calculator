import { parseISO, format } from "date-fns";

import {type Assignment, type AssignmentCalendar, mapEvents, createAssignmentCalendar, importCalendar} from "./calendar/CalendarTypes.ts"
import { assignmentTypes } from "./testdata.ts";

import React, {useEffect, useMemo, useRef, useState} from "react";
import clsx from "clsx";

import { CheckIcon, ChevronUpDownIcon, DocumentArrowDownIcon } from "@heroicons/react/20/solid";

import {Input, Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions} from "@headlessui/react";
import {ExclamationTriangleIcon, PencilSquareIcon} from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon, PlusIcon } from "@heroicons/react/24/outline";
import {useModal} from "../providers/ModalProvider.tsx";
import {useNotification} from "../providers/NotificationProvider.tsx";

interface SubmissionProps {
    submission: AssignmentCalendar;
    isNew: boolean;
    onSubmit?:  (submission: AssignmentCalendar) => Promise<void>;
    onUpdate?:  (oldAssignment: AssignmentCalendar, newAssignment: AssignmentCalendar) => Promise<void>;
    onDelete?:  (assignment: AssignmentCalendar) => Promise<void>;
    onClose: () => void;
    assignments: Record<string, AssignmentCalendar[]>;
}

const ErrorField: React.FC<{message:string, visible:boolean}> = ({message, visible}) => {
    return (
        <div
        className={`
            text-white rounded-lg flex flex-row gap-2 items-center justify-left px-4 py-1.5
            transition-opacity duration-300 border-1 border-red-400 my-2
            ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        >
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400"/>
            <span className="text-red-400 font-semibold text-sm">{message}</span>
        </div>
    )
}
// Input Field for the name of an assignment
interface NameFieldProps { setAssignmentName: (arg: string) => void; assignmentName: string };
const NameField: React.FC<NameFieldProps> = ({setAssignmentName, assignmentName,}) => {
    return (
        <Field className="px-4 text-gray-900 rounded-xl w-full">
            <Label className="block text-md font-medium font-semibold">Assignment Name:</Label>
            <Input
                type="text"
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
                className="
                            mt-1 block w-full
                            rounded-md border border-gray-300 bg-white
                            px-3 py-2 text-sm text-gray-900
                            transition-all duration-200 ease-in-out
                            appearance-none
                            focus:outline-none focus-visible:outline-none
                            data-[focus]:ring-2 data-[focus]:ring-blue-500
                            data-[focus]:border-blue-500 data-[focus]:shadow-md
                            focus:bg-white autofill:bg-white
                        "
                placeholder="e.g. Literature Review"
            />
        </Field>
    );
};

// Input Field for the unit code of an assignment
interface UnitFieldProps { setUnitCode: (arg: string) => void; unitCode: string };
const UnitField: React.FC<UnitFieldProps> = ({setUnitCode,unitCode}) => {
    return (
        <Field className="text-gray-900 px-4 w-full">
            <Label className="block text-md font-medium font-semibold">
                Unit Code:
            </Label>
            <Input
                type="text"
                value={unitCode}
                onChange={(e) => {setUnitCode(e.target.value)}}
                className="
                            mt-1 block w-full
                            rounded-md border border-gray-300 bg-white
                            px-3 py-2 text-sm text-gray-900
                            transition-all duration-200 ease-in-out
                            appearance-none
                            focus:outline-none focus-visible:outline-none
                            data-[focus]:ring-2 data-[focus]:ring-blue-500
                            data-[focus]:border-blue-500 data-[focus]:shadow-md
                            focus:bg-white autofill:bg-white
                        "
                placeholder="e.g. CITS3200"
            />
        </Field>
    )
}

// Component used to create a new assignment object
interface SubmissionButtonProps { onSubmit: (s: AssignmentCalendar) => void, assignments:Record<string, AssignmentCalendar[]>}
export const SubmissionButton: React.FC<SubmissionButtonProps> = ({ onSubmit, assignments}) => {
    const {open, close} = useModal();
    const openSubmission = () => {
        open((id) => (
            <Submission 
                submission={ createAssignmentCalendar()} 
                isNew={true}
                assignments={assignments}
                onSubmit={async (s) => {
                    onSubmit(s);
                    close(id);
                }}
                onClose={() => close(id)}
            />
        ))
    };

    const openImport = () => {
        open((id: string) => (
            <FileInput onFiles={async (f: File) => {
                const ac = await importCalendar(f);
                onSubmit(ac);
                close(id);
            }} accept="/"/>
        ))
    }

    const buttonStyle = "text-white bg-uwaBlue border-uwaBlue border-2 w-full h-full mt-3 rounded-xl font-semibold px-4 py-3 flex flex-row gap-2 items-center justify-start transition-all duration-170 ease-out hover:bg-white hover:text-uwaBlue";
    
    const floatingButtonStyle = "fixed bottom-6 w-14 h-14 rounded-full bg-uwaBlue text-white shadow-lg flex items-center justify-center transition-all duration-170 ease-out hover:scale-110 hover:shadow-xl z-50";
    
    return (
        <>
            {/* Desktop Layout - Horizontal buttons at top */}
            <section className="hidden lg:flex flex-row justify-center items-center gap-5 w-1/2 mx-auto">
                {/* New Assignment Button */}
                <button
                    onClick={() => openSubmission()}
                    className={clsx(buttonStyle, "xl:col-span-2")}
                >
                    <PlusIcon className="h-5 w-5" strokeWidth={2.5}/>
                    Create New Assignment
                </button>

                {/* Import Button */}
                <button
                    onClick={() => openImport()}
                    className={clsx(buttonStyle)}
                >
                    <ArrowDownTrayIcon className="h-5 w-5" strokeWidth={2}/>
                    Import
                </button>
            </section>

            {/* Mobile Layout - Circular floating buttons at bottom corners */}
            <div className="lg:hidden">
                {/* Create New Assignment - Bottom Left */}
                <button
                    onClick={() => openSubmission()}
                    className={clsx(floatingButtonStyle, "left-6")}
                    aria-label="Create New Assignment"
                >
                    <PlusIcon className="h-6 w-6" strokeWidth={2.5}/>
                </button>
                
                {/* Import - Bottom Right */}
                <button
                    onClick={() => openImport()}
                    className={clsx(floatingButtonStyle, "right-6")}
                    aria-label="Import"
                >
                    <ArrowDownTrayIcon className="h-6 w-6" strokeWidth={2}/>
                </button>
            </div>
        </>
    );
}
// FUNCTIONALITY BUTTONS
// Used to add completely new assignments
const CreationButton: React.FC<{pending:boolean, canSubmit:boolean, onCreate:()=>void, }> = ({pending, canSubmit, onCreate}) => {
    return (
            <button
                type="button"
                onClick={onCreate}
                disabled={!canSubmit || pending}
                className={clsx(
                "w-full flex justify-center rounded-md px-6 py-4 text-base font-semibold text-white shadow-lg sm:ml-3 sm:w-auto",
                "transition-all duration-150 ease-out",
                !canSubmit || pending 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-500 hover:scale-95 hover:brightness-110 cursor-pointer"
                )}
                >
                {pending ? "Creating..." : "Create"}
            </button>
    )
}

// Used to update existing assignments
const UpdateButton: React.FC<{canSubmit:boolean, pending:boolean, onUpdate:()=>void }> = ({canSubmit, pending, onUpdate}) => {
    return (
            <button
                type="button"
                onClick={onUpdate}
                disabled={!canSubmit || pending}
                className={clsx(
                "w-full flex justify-center rounded-md px-6 py-4 text-base font-semibold text-white shadow-lg sm:ml-3 sm:w-auto",
                "transition-all duration-150 ease-out",
                !canSubmit || pending 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-500 hover:scale-95 hover:brightness-110 cursor-pointer"
                )}
                >
                {pending ? "Updating..." : "Update"}
            </button>
    )
}

// Used to delete the selected assignment
const DeleteButton: React.FC<{pending:boolean, onDelete:()=>void}> = ({pending, onDelete}) => {
    return (
            <button
                type="button"
                onClick={onDelete}
                className={clsx(
                "bg-red-400 w-full flex justify-center rounded-md px-6 py-4 text-base font-semibold text-white shadow-lg sm:ml-3 sm:w-auto",
                "transition-all duration-150 ease-out cursor-pointer hover:bg-red-500 hover:scale-95 hover:brightness-110"
                )}
                >
                {pending ? "Deleting..." : "Delete"}
            </button>
    )
}
/** This component is now "content-only".
 * The modal is provided by the global ModalProvider host.
 * Keep markup minimal.
 */
const Submission: React.FC<SubmissionProps> = ({submission, assignments, isNew, onSubmit, onClose, onUpdate, onDelete}) => {
    // Identifiers for error messages
    const DATE = 0;
    const CODENAME = 1;

    // Used to keep track of input errors
    const [errors, setErrors] = useState<(string | null)[]>([null,null]);

    // Get the current date
    const currentDate = useMemo(() => new Date(), []);

    const [startDate, setStartDate] = useState<Date | null>(submission.start ?? null);
    const [endDate, setEndDate] = useState<Date | null>(submission.end ?? null);
    const [assignmentName, setAssignmentName] = useState(submission.name ?? "");
    const [unitCode, setUnitCode] = useState(submission.unitCode ?? "");
    const [pending, setPending] = useState(false);
    const { notify } = useNotification();

    // UNPACK ASSIGNMENT CONTEXT - UPDATE
    // If the asisgnment is being edited, unpack its old variables into states
    const items = useMemo<Assignment[]>(() => Object.values(assignmentTypes), []);
    const [selected, setSelected] = useState<Assignment>(
        items.find(i => i.name === (submission.assignmentType ?? "")) ?? items[0]
    );

    useEffect(() => {
        setStartDate(submission.start ?? null);
        setEndDate(submission.end ?? null);
        setAssignmentName(submission.name ?? "");
        setUnitCode(submission.unitCode ?? "");
        setSelected(items.find(i => i.name === (submission.assignmentType ?? "")) ?? items[0]);
    }, [isNew, submission, items]);

    // Helper used to update individual field errors
    const addErrorMessage = (message:string|null, index:number) => {setErrors((prev)=>{
                    const errors = [...prev]
                    errors[index] = message
                    return errors})
                }
    
    // Zeros time comparisons to allow day-based comparison (without hours)
    function stripTime(date: Date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // DATA VALIDATION:
    const [canSubmit, setSubmit] = useState<boolean>(false);
    // Need to check if fields are valid
    useEffect(() => {
        if (
            startDate === (submission.start ?? null) &&
            endDate === (submission.end ?? null) &&
            unitCode === (submission.unitCode ?? "") &&
            assignmentName === (submission.name ?? "")
        ) return;
        
        // Current date, without time
        const current = stripTime(currentDate);

        let datesValid = false;
        let uniqueID = false;

        // DATE VALIDATION
        if(!!startDate && !!endDate){
            // Input dates, without time
            const start = stripTime(startDate);
            const end = stripTime(endDate);
            if(start < current || end < current){addErrorMessage("Dates must be upcoming.", DATE);}
            else if(end < start){addErrorMessage("Invalid Date Ordering.", DATE)}
            else{
                addErrorMessage(null,DATE)
                datesValid = true}
        }

        // ASSIGNMENT VALIDATION
        // Different validation for editing and adding
        if(isNew){
            if(unitCode in assignments && assignments[unitCode].find(assignment => assignment.name === assignmentName)){
                addErrorMessage("Unit & Assignment must be unique.", CODENAME);
            }
            else{
                addErrorMessage(null,CODENAME)
                uniqueID = true
            }
        }
        // Can have the same assignment & name IFF its the current one being edited
        else{
            // Bypass unique if we are editing the assignment currently
            const isSame = submission.unitCode === unitCode && submission.name === assignmentName;
            if(!isSame && (unitCode in assignments && assignments[unitCode].find(assignment => assignment.name === assignmentName))){
                addErrorMessage("Unit & Assignment must be unique.", CODENAME);
            }
            else{
                addErrorMessage(null,CODENAME)
                uniqueID = true
            }
        }

        setSubmit(datesValid && uniqueID)
        },[startDate,endDate,unitCode,assignmentName]);
    // const canSubmit = assignmentName.trim().length > 0 && unitCode.trim().length > 0 && datesValid;

    function handleStartDate(date: string) {
        const next = parseISO(date);
        setStartDate(next);
    }
    function handleEndDate(date: string) {
        const next = parseISO(date);
        setEndDate(next);
    }

    function useError(trigger: boolean, ms = 400) {
        const [flashing, setFlashing] = useState(false);
        useEffect(() => {
            if (trigger) {
                setFlashing(true);
                const t = setTimeout(() => setFlashing(false), ms);
                return () => clearTimeout(t);
            }
        }, [trigger, ms]);
        return flashing;
    }

    const AssessmentTypeInput: React.FC = () => {
        const onChange = (it: Assignment) => setSelected(it);
        return (
            <Field className="text-gray-900 px-4 w-full">
                <Label className="block text-md font-semibold text-gray-900 mb-2">Assessment Type:</Label>
                <div className="flex w-full flex-row items-center align-center">
                    <Listbox value={selected} onChange={onChange}>
                        <div className="relative mt-1 ml-2 w-full">
                            <ListboxButton
                                id="assessment-type"
                                className={`grid w-full cursor-default grid-cols-1 rounded-md bg-white px-3 py-2 text-left text-gray-900 ring-1 ring-gray-300 
                                    transition-all duration-200 ease-in-out data-[open]:ring-2 data-[open]:ring-blue-500 data-[open]:shadow-md`}
                            >
                                <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                                  <selected.icon className="size-5 shrink-0 text-blue-600" />
                                  <span className="block truncate">{selected.name}</span>
                                </span>
                                <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-400" />
                            </ListboxButton>
                            <ListboxOptions className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-black/5 shadow-lg sm:text-sm">
                                {items.map(it => (
                                    <ListboxOption
                                        key={it.id}
                                        value={it}
                                        className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-blue-100 data-focus:outline-hidden"
                                    >
                                        <div className="flex items-center">
                                            <it.icon className="size-5 shrink-0 text-blue-600" />
                                            <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">{it.name}</span>
                                        </div>
                                        <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-blue-600 group-data-selected:flex group-data-focus:text-blue-700">
                                            <CheckIcon aria-hidden="true" className="size-5" />
                                        </span>
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </div>
                    </Listbox>
                </div>
            </Field>
        );
    };

    const AssessmentDateInput: React.FC<{ error: boolean }> = ({ error }) => {
        const currentError = useError(error);
        const base = `
                        mt-1 w-full rounded-md 
                        border border-gray-300 bg-white
                        text-left text-gray-900 text-sm
                        px-3 py-2.5 
                        ring-1 ring-transparent
                        focus:outline-none focus-visible:outline-none
                        data-[focus]:ring-2 data-[focus]:ring-blue-500 data-[focus]:shadow-md
                        data-[focus]:border-blue-500
                        appearance-none
                        transition-all duration-200 ease-in-out
                    `;
        const alert = "bg-red-200 animate-pulse";
        return (
            <div className={`text-gray-900 px-4 w-full`}>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Field>
                        <Label className="font-semibold text-md font-medium" htmlFor="start">Start date:</Label>
                        <Input
                            id="start"
                            type="date"
                            value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                            onChange={e => handleStartDate(e.target.value)}
                            className={clsx(base, currentError ? alert : "bg-white")}
                        />
                    </Field>
                    <Field>
                        <Label className="font-semibold text-md font-medium" htmlFor="end">Due date:</Label>
                        <Input
                            id="end"
                            type="date"
                            value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                            onChange={e => handleEndDate(e.target.value)}
                            className={clsx(base, currentError ? alert : "bg-white")}
                        />
                    </Field>
                </div>
            </div>
        );
    };

    // Called on submission to pack state variables into the newly created assignment before being sent off
    function buildSubmission(): AssignmentCalendar {
        if (!startDate || !endDate) throw new Error("invalid dates");
        return {
            ...submission,
            start: startDate,
            end: endDate,
            name: assignmentName.trim(),
            unitCode: unitCode.trim(),
            assignmentType:selected.name,
            events: mapEvents(selected, startDate, endDate)
        };
    }

    // ASYNC FUNCTIONS
    // Attempts to add assignment to the website asyncronously
    async function onCreateAsync() {
        if (!canSubmit || pending) return;
        setPending(true);
        const next = buildSubmission();
        try {
            await onSubmit!(next);
            notify(`${next.name ?? "Assignment"} created.`, { success: true });
            onClose();
        } finally {
            setPending(false);
        }
    }

    // Attempts to update an existing assignment asyncronously
    async function onUpdateAsync(oldAssignment:AssignmentCalendar, newAssignment:AssignmentCalendar) {
        if (!canSubmit || pending) return;
        setPending(true);
        try {
            await onUpdate!(oldAssignment, newAssignment);
            notify(`${newAssignment.name ?? "Assignment"} updated.`, { success: true });
            onClose();
        } finally {
            setPending(false);
        }
    }

    // Attempts to delet an existing assignment asyncronously
    async function onDeleteAsync(assignment:AssignmentCalendar) {
        setPending(true);
        try {
            await onDelete!(assignment);
            notify(`${assignment.name ?? "Assignment"} deleted.`, { success: false });
            onClose();
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="p-2 flex justify-center items-center">
            <div className="size-full p-6 rounded-xl flex flex-col gap-2 justify-center items-center border-2 border-slate-300 relative">
                <h1 className="flex flex-row gap-2 justify-center items-center font-bold text-lg text-gray-900 w-full mb-2"> 
                    <PencilSquareIcon className="w-6 h-6"/>
                    <span>{isNew?"Create New Assignment:":"Edit Assignment:"}</span>
                </h1>
                <form className="my-3 text-left w-full flex flex-col gap-2 items-center justify-center">
                    <section className="bg-white rounded-xl shadow-soft flex flex-col gap-6 w-4/5 p-5">
                        <AssessmentTypeInput />
                        <hr className="border-slate-200 w-full"/>
                        <div>
                            <AssessmentDateInput error={errors[DATE] !== null} />
                            <div className="px-4">
                                <ErrorField message={errors[DATE] ?? ""} visible={!!errors[DATE]} />
                            </div>
                        </div>
                        <hr className="border-slate-200 w-full"/>
                        <NameField setAssignmentName={setAssignmentName} assignmentName={assignmentName} />
                        <UnitField setUnitCode={setUnitCode} unitCode={unitCode} />
                        <div className="px-4 -mt-6">
                            <ErrorField message={errors[CODENAME] ?? ""} visible={!!errors[CODENAME]} />
                        </div>          
                    </section>
                    {/* Render different buttons for creation & edit pages */}
                    <div className="flex flex-row justify-center items-center gap-4">
                        {isNew?
                            <CreationButton pending={pending} canSubmit={canSubmit} onCreate={onCreateAsync}/>:
                            <>
                            <DeleteButton pending={pending} onDelete={()=>onDeleteAsync(submission)}/>
                            <UpdateButton pending={pending} canSubmit={canSubmit} onUpdate={()=>onUpdateAsync(submission,buildSubmission())}/>
                            </>
                        }
                    </div>
                </form>
            </div>
        </div>
    );
};

interface FileInputProps { onFiles: (f: File) => void | Promise<void>; accept?: string; }
const FileInput: React.FC<FileInputProps> = ({ onFiles, accept }) => {

    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setDragging] = useState(false)

    const handleDrop = async ( e: React.DragEvent ) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false)
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        await onFiles(file);
        e.dataTransfer.clearData()
    };

    const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await onFiles(file);
        e.target.value = "";
    };

    return (
        <div onClick={() => inputRef.current?.click()}
             onDragOver={(e) => {
                 e.preventDefault();
                 setDragging(true);
             }}
             onDragLeave={() => setDragging(false)}
             onDrop={handleDrop}
             className={clsx(
                 "flex w-full aspect-square cursor-pointer flex-col items-center justify-center rounded-lg transition-colors",
                 "inset-shadow-sm inset-shadow-indigo-100",
                 isDragging
                     ? "inset-shadow-blue-500 bg-blue-100"
                     : "inset-shadow-slate-300 bg-gray-200 hover:border-blue-400 hover:bg-gray-50") }
        >
            <DocumentArrowDownIcon className="h-18 text-gray-500"/>
            <p className={"text-sm text-gray-500"}> Drag & drop file here, or
                <span className="font-semibold"> click to select</span>
            </p>
            <Input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleFiles}
                className="hidden"
            />
        </div>
    )
}

export default Submission;