import { parseISO, format } from "date-fns";

import {type Assignment, type AssignmentCalendar, mapEvents, createAssignmentCalendar, importCalendar} from "./calendar/CalendarTypes.ts"
import { assignments } from "./testdata.ts";

import React, {useEffect, useMemo, useRef, useState} from "react";
import clsx from "clsx";

import { CheckIcon, ChevronUpDownIcon, DocumentArrowDownIcon } from "@heroicons/react/20/solid";

import {Input, Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, DialogTitle,} from "@headlessui/react";
import {ArrowDownTrayIcon, PlusIcon} from "@heroicons/react/24/solid";
import {useModal} from "../providers/ModalProvider.tsx";

interface SubmissionProps {
    submission: AssignmentCalendar;
    onSubmit:  (submission: AssignmentCalendar) => Promise<void>;
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

interface SubmissionButtonProps { onSubmit: (s: AssignmentCalendar) => void, onImport: (s: AssignmentCalendar ) => void }
export const SubmissionButton: React.FC<SubmissionButtonProps> = ({ onSubmit, onImport }) => {

    const {open, close} = useModal();

    const openSubmission = () => {
        open((id) => (
            <Submission submission={ createAssignmentCalendar()} errors={[false, false, false] }
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
    return (
        <section className="flex flex-row justify-center items-center gap-5 w-1/2 mx-auto">
            {/* New Assignment Button */}
            <button
                onClick={() => openSubmission()}
                className={clsx(buttonStyle, "xl:col-span-2")}
            >
                <PlusIcon className="h-5 w-5"/>
                Create New Assignment
            </button>

            {/* Import Button */}
            <button
                onClick={() => openImport()}
                className={clsx(buttonStyle)}
            >
                <ArrowDownTrayIcon className="h-5 w-5"/>
                Import
            </button>
        </section>
    )
}

/** This component is now "content-only".
 * The modal is provided by the global ModalProvider host.
 * Keep markup minimal.
 */
const Submission: React.FC<SubmissionProps> = ({submission, onSubmit, onClose, errors}) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [assignmentName, setAssignmentName] = useState("");
    const [unitCode, setUnitCode] = useState("");
    const [pending, setPending] = useState(false);

    const items = useMemo<Assignment[]>(() => Object.values(assignments), []);
    const [selected, setSelected] = useState<Assignment>(
        items.find(i => i.name === "Essay") ?? items[0]
    );

    const datesValid = !!startDate && !!endDate && startDate <= endDate;
    const canSubmit = assignmentName.trim().length > 0 && unitCode.trim().length > 0 && datesValid;

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
            <Field className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-full">
                <Label className="block text-sm font-semibold text-gray-900 mb-2">Assessment type</Label>
                <div className="flex w-full flex-row items-center align-center">
                    <Listbox value={selected} onChange={onChange}>
                        <div className="relative mt-1 ml-2 w-full">
                            <ListboxButton
                                id="assessment-type"
                                className="grid w-full cursor-default grid-cols-1 rounded-md bg-white px-3 py-2 text-left text-gray-900 ring-1 ring-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500"
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

    const AssessmentDateInput: React.FC<{ error: boolean[] }> = ({ error }) => {
        const err_start = useError(error[0]);
        const err_end = useError(error[1]);
        const base = "mt-1 w-full rounded-xl px-3 py-2 duration-500 ease-out";
        const alert = "bg-red-200 animate-pulse";
        return (
            <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-full">
                <h2 className="text-lg font-semibold mb-3">Dates</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Field>
                        <Label className="text-sm font-medium" htmlFor="start">Start date</Label>
                        <Input
                            id="start"
                            type="date"
                            value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                            onChange={e => handleStartDate(e.target.value)}
                            className={clsx(base, err_start ? alert : "bg-white")}
                        />
                    </Field>
                    <Field>
                        <Label className="text-sm font-medium" htmlFor="end">Due date</Label>
                        <Input
                            id="end"
                            type="date"
                            value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                            onChange={e => handleEndDate(e.target.value)}
                            className={clsx(base, err_end ? alert : "bg-white")}
                        />
                    </Field>
                </div>
            </div>
        );
    };

    function buildSubmission(): AssignmentCalendar {
        if (!startDate || !endDate) throw new Error("invalid dates");
        return {
            ...submission,
            start: startDate,
            end: endDate,
            name: assignmentName.trim(),
            unitCode: unitCode.trim(),
            events: mapEvents(selected, startDate, endDate)
        };
    }

    async function onCreate() {
        if (!canSubmit || pending) return;
        setPending(true);
        try {
            await onSubmit(buildSubmission());
            onClose();
        } finally {
            setPending(false);
        }
    }

    return (
        <div className="bg-white p-5 flex flex-col justify-center">
            <DialogTitle className="h3 text-base font-semibold text-gray-900 w-full mb-2"> Create New Assignment </DialogTitle>
            <form className="my-3 text-left w-full flex flex-col gap-2 items-center justify-center">
                <section className="gap-4 flex flex-col items-center justify-center w-4/5">
                    <AssessmentTypeInput />
                    <AssessmentDateInput error={[errors[1], errors[2]]} />
                    <NameField setAssignmentName={setAssignmentName} assignmentName={assignmentName} />
                    <UnitField setUnitCode={setUnitCode} unitCode={unitCode} />
                </section>
                <div className="mt-4 flex items-center justify-end gap-2 w-full">
                    <button type="button" className="inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onCreate}
                        disabled={!canSubmit || pending}
                        className={clsx(
                            "inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto",
                            !canSubmit || pending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
                        )}
                    >
                        {pending ? "Creating..." : "Create"}
                    </button>
                </div>
            </form>
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