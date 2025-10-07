import { parseISO, format } from "date-fns";

import {type Assignment, type AssignmentCalendar, mapEvents, createAssignmentCalendar, importCalendar} from "./calendar/CalendarTypes.ts"
import { assignmentTypes } from "./testdata.ts";

import React, {useEffect, useMemo, useRef, useState} from "react";
import clsx from "clsx";

import { CheckIcon, ChevronUpDownIcon, DocumentArrowDownIcon } from "@heroicons/react/20/solid";

import {
    Input,
    Field,
    Label,
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions
} from "@headlessui/react";
import {ArrowDownTrayIcon, PlusIcon} from "@heroicons/react/24/solid";
import {useModal} from "../providers/ModalProvider.tsx";
import {useNotification} from "../providers/NotificationProvider.tsx";

interface SubmissionProps {
    submission: AssignmentCalendar;
    isNew: boolean;
    onSubmit?:  (submission: AssignmentCalendar) => Promise<void>;
    onUpdate?:  (oldAssignment: AssignmentCalendar, newAssignment: AssignmentCalendar) => Promise<void>;
    onDelete?:  (assignment: AssignmentCalendar) => Promise<void>;
    onClose: () => void;
    errors: Array<boolean>;
}

// Input Field for the name of an assignment

interface NameFieldProps { setAssignmentName: (arg: string) => void; assignmentName: string };
const NameField: React.FC<NameFieldProps> = ({setAssignmentName, assignmentName,}) => {
    return (
        <Field className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-full">
            <Label className="block text-sm font-medium font-semibold">Assignment name</Label>
            <Input
                type="text"
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g. Literature Review"
            />
        </Field>
    );
};

// Input Field for the unit code of an assignment
interface UnitFieldProps { setUnitCode: (arg: string) => void; unitCode: string };
const UnitField: React.FC<UnitFieldProps> = ({setUnitCode,unitCode}) => {
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

// Component used to create a new assignment object
interface SubmissionButtonProps { onSubmit: (s: AssignmentCalendar) => Promise<void> | void }
export const SubmissionButton: React.FC<SubmissionButtonProps> = ({ onSubmit }) => {
    const {open, close} = useModal();

    const openSubmission = () => {
        open((id) => (
            <Submission
                submission={ createAssignmentCalendar()}
                isNew={true}
                errors={[false, false, false] }
                onSubmit={async (s) => {
                    await onSubmit(s);
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
                await onSubmit(ac);
                close(id);
            }} accept="/"/>
        ))
    }

    const buttonStyle = "inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-uwaBlue bg-uwaBlue px-4 py-3 font-semibold text-white transition-all duration-200 ease-out hover:bg-white hover:text-uwaBlue";
    return (
        <section className="mx-auto mt-4 flex w-full max-w-4xl flex-col gap-3 sm:flex-row">
            {/* New Assignment Button */}
            <button
                onClick={openSubmission}
                className={clsx(buttonStyle, "sm:flex-1")}
            >
                <PlusIcon className="h-5 w-5"/>
                Create New Assignment
            </button>

            {/* Import Button */}
            <button
                onClick={openImport}
                className={clsx(buttonStyle, "sm:flex-1")}
            >
                <ArrowDownTrayIcon className="h-5 w-5"/>
                Import
            </button>
        </section>
    )
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
                "w-full flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto",
                !canSubmit || pending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
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
                "w-full flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto",
                !canSubmit || pending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
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
                "bg-red-400 w-full flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto",
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
const Submission: React.FC<SubmissionProps> = ({
    submission,
    isNew,
    onSubmit,
    onUpdate,
    onDelete,
    onClose,
    errors,
}) => {
    const [startDate, setStartDate] = useState<Date | null>(submission.start ?? null);
    const [endDate, setEndDate] = useState<Date | null>(submission.end ?? null);
    const [assignmentName, setAssignmentName] = useState(submission.name ?? "");
    const [unitCode, setUnitCode] = useState(submission.unitCode ?? "");
    const [pending, setPending] = useState(false);
    const items = useMemo<Assignment[]>(() => Object.values(assignmentTypes), []);
    const [selected, setSelected] = useState<Assignment>(
        items.find(i => i.name === submission.assignmentType) ?? items[0]
    );
    const { notify } = useNotification();

    useEffect(() => {
        setStartDate(submission.start ?? null);
        setEndDate(submission.end ?? null);
        setAssignmentName(submission.name ?? "");
        setUnitCode(submission.unitCode ?? "");
        setSelected(items.find(i => i.name === submission.assignmentType) ?? items[0]);
    }, [submission, items]);

    const datesValid = !!startDate && !!endDate && startDate <= endDate;
    const canSubmit = assignmentName.trim().length > 0 && unitCode.trim().length > 0 && datesValid;

    const handleStartDate = (date: string) => setStartDate(parseISO(date));
    const handleEndDate = (date: string) => setEndDate(parseISO(date));

    const useError = (trigger: boolean, ms = 400) => {
        const [flashing, setFlashing] = useState(false);
        useEffect(() => {
            if (!trigger) return;
            setFlashing(true);
            const timeout = window.setTimeout(() => setFlashing(false), ms);
            return () => window.clearTimeout(timeout);
        }, [trigger, ms]);
        return flashing;
    };

    const AssessmentTypeInput: React.FC = () => (
        <Field className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-full">
            <Label className="block text-sm font-semibold text-gray-900 mb-2">Assessment type</Label>
            <div className="flex w-full flex-row items-center">
                <Listbox value={selected} onChange={setSelected}>
                    <div className="relative mt-1 ml-2 w-full">
                        <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white px-3 py-2 text-left text-gray-900 ring-1 ring-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500">
                            <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                                <selected.icon className="size-5 shrink-0 text-blue-600" />
                                <span className="block truncate">{selected.name}</span>
                            </span>
                            <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-400" />
                        </ListboxButton>
                        <ListboxOptions className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-black/5 shadow-lg sm:text-sm">
                            {items.map(option => (
                                <ListboxOption
                                    key={option.id}
                                    value={option}
                                    className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-focus:bg-blue-100 data-focus:outline-hidden"
                                >
                                    <div className="flex items-center">
                                        <option.icon className="size-5 shrink-0 text-blue-600" />
                                        <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">{option.name}</span>
                                    </div>
                                    <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-blue-600 group-data-selected:flex">
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

    const AssessmentDateInput: React.FC<{ error: boolean[] }> = ({ error }) => {
        const errStart = useError(error[0]);
        const errEnd = useError(error[1]);
        const base = "mt-1 w-full rounded-xl px-3 py-2 duration-500 ease-out";
        const alert = "bg-red-200 animate-pulse";
        return (
            <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-full">
                <h2 className="text-lg font-semibold mb-3">Dates</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field>
                        <Label className="text-sm font-medium" htmlFor="start">Start date</Label>
                        <Input
                            id="start"
                            type="date"
                            value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                            onChange={event => handleStartDate(event.target.value)}
                            className={clsx(base, errStart ? alert : "bg-white")}
                        />
                    </Field>
                    <Field>
                        <Label className="text-sm font-medium" htmlFor="end">Due date</Label>
                        <Input
                            id="end"
                            type="date"
                            value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                            onChange={event => handleEndDate(event.target.value)}
                            className={clsx(base, errEnd ? alert : "bg-white")}
                        />
                    </Field>
                </div>
            </div>
        );
    };

    const buildSubmission = (): AssignmentCalendar => {
        if (!startDate || !endDate) throw new Error("invalid dates");
        return {
            ...submission,
            start: startDate,
            end: endDate,
            name: assignmentName.trim(),
            unitCode: unitCode.trim(),
            assignmentType: selected.name,
            events: mapEvents(selected, startDate, endDate),
        };
    };

    const onCreateAsync = async () => {
        if (!onSubmit || !canSubmit || pending) return;
        setPending(true);
        const next = buildSubmission();
        try {
            await onSubmit(next);
            notify(`${next.name ?? "Assignment"} created.`, { success: true });
            onClose();
        } finally {
            setPending(false);
        }
    };

    const onUpdateAsync = async (oldAssignment: AssignmentCalendar) => {
        if (!onUpdate || !canSubmit || pending) return;
        setPending(true);
        const next = buildSubmission();
        try {
            await onUpdate(oldAssignment, next);
            notify(`${next.name ?? "Assignment"} updated.`, { success: true });
            onClose();
        } finally {
            setPending(false);
        }
    };

    const onDeleteAsync = async (assignment: AssignmentCalendar) => {
        if (!onDelete || pending) return;
        setPending(true);
        try {
            await onDelete(assignment);
            notify(`${assignment.name ?? "Assignment"} deleted.`, { success: false });
            onClose();
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="bg-white p-5 flex justify-center items-center">
            <div className="size-full p-4 rounded-xl flex flex-col gap-2 justify-center items-center border-3 border-slate-300 relative">
                <h1 className="text-center font-bold text-lg text-gray-900 w-full mb-2">
                    {isNew ? "Create New Assignment:" : "Edit Assignment:"}
                </h1>
                <form className="my-3 text-left w-full flex flex-col gap-2 items-center justify-center">
                    <section className="gap-4 flex flex-col items-center justify-center w-4/5">
                        <AssessmentTypeInput />
                        <AssessmentDateInput error={[errors[1], errors[2]]} />
                        <NameField setAssignmentName={setAssignmentName} assignmentName={assignmentName} />
                        <UnitField setUnitCode={setUnitCode} unitCode={unitCode} />
                    </section>
                    <div className="flex flex-row justify-center items-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                            disabled={pending}
                        >
                            Cancel
                        </button>
                        {isNew ? (
                            <CreationButton pending={pending} canSubmit={canSubmit} onCreate={onCreateAsync} />
                        ) : (
                            <>
                                <DeleteButton pending={pending} onDelete={() => onDeleteAsync(submission)} />
                                <UpdateButton pending={pending} canSubmit={canSubmit} onUpdate={() => onUpdateAsync(submission)} />
                            </>
                        )}
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
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={clsx(
                "group flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center text-sm font-medium transition",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
                isDragging
                    ? "border-uwaBlue/70 bg-uwaBlue/10 text-uwaBlue"
                    : "border-slate-300/80 bg-white/85 text-slate-500 hover:border-uwaBlue/50 hover:bg-white/95 hover:text-uwaBlue"
            )}
        >
            <DocumentArrowDownIcon className="h-14 w-14 text-current opacity-80 transition duration-200 group-hover:scale-105"/>
            <p>
                Drag &amp; drop file here, or
                <span className="ml-1 font-semibold text-slate-700 group-hover:text-uwaBlue">click to select</span>
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
