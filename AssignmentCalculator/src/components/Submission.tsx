import { parseISO, format } from "date-fns";

import {type Assignment, type AssignmentCalendar, mapEvents, createAssignmentCalendar, importCalendar} from "./calendar/CalendarTypes.ts"
import { assignmentTypes } from "./testdata.ts";

import React, {useEffect, useMemo, useRef, useState} from "react";
import clsx from "clsx";

import { CheckIcon, ChevronUpDownIcon, DocumentArrowDownIcon } from "@heroicons/react/20/solid";

import {Input, Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, DialogTitle,} from "@headlessui/react";
import {ArrowDownTrayIcon, PlusIcon} from "@heroicons/react/24/solid";
import {useModal} from "../providers/ModalProvider.tsx";
import { pageSection, primaryPillButton, secondaryPillButton } from "../styles/tailwindStyles.ts";

interface SubmissionProps {
    submission: AssignmentCalendar;
    onSubmit:  (submission: AssignmentCalendar) => Promise<void>;
    onClose: () => void;
    errors: Array<boolean>;
}

// Input Field for the name of an assignment

interface NameFieldProps { setAssignmentName: (arg: string) => void; assignmentName: string };
const fieldContainer = "w-full rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-slate-900 shadow-[0_24px_45px_-32px_rgba(15,23,42,0.28)]";

const NameField: React.FC<NameFieldProps> = ({setAssignmentName, assignmentName,}) => {
    return (
        <Field className={fieldContainer}>
            <Label className="block text-sm font-semibold text-slate-700">Assignment name</Label>
            <Input
                type="text"
                value={assignmentName}
                onChange={(e) => setAssignmentName(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-uwaBlue focus:ring-2 focus:ring-uwaBlue/25"
                placeholder="e.g. Literature Review"
                autoComplete="off"
            />
        </Field>
    );
};

// Input Field for the unit code of an assignment
interface UnitFieldProps { setUnitCode: (arg: string) => void; unitCode: string };
const UnitField: React.FC<UnitFieldProps> = ({setUnitCode,unitCode}) => {
    return (
        <Field className={fieldContainer}>
            <Label className="block text-sm font-semibold text-slate-700">
                Unit code
            </Label>
            <Input
                type="text"
                value={unitCode}
                onChange={(e) => {setUnitCode(e.target.value)}}
                className="mt-2 block w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 shadow-inner focus:border-uwaBlue focus:ring-2 focus:ring-uwaBlue/25"
                placeholder="e.g. CITS3200"
                autoComplete="off"
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
                onImport(ac);
                close(id);
            }} accept="/"/>
        ))
    }

    return (
        <section className={clsx(pageSection, "mt-6")}>
            <div className="surface-card flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-1 text-left">
                    <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Plan your next assignment</h2>
                    <p className="text-sm font-medium text-[color:var(--color-text-muted)] sm:text-base">Create a tailored study timeline or import an existing plan in seconds.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                        onClick={() => openSubmission()}
                        className={clsx(
                            primaryPillButton,
                            "group w-full gap-2 px-6 py-3 text-base shadow-[0_24px_45px_-20px_rgba(79,70,229,0.7)] duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-28px_rgba(67,56,202,0.85)] sm:min-w-[14rem]"
                        )}
                    >
                        <PlusIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                        Create new assignment
                    </button>
                    <button
                        onClick={() => openImport()}
                        className={clsx(
                            secondaryPillButton,
                            "group w-full gap-2 px-6 py-3 text-base duration-200 sm:w-auto sm:min-w-[8rem]"
                        )}
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 transition-transform duration-200 group-hover:translate-y-[1px]" />
                        Import
                    </button>
                </div>
            </div>
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

    const items = useMemo<Assignment[]>(() => Object.values(assignmentTypes), []);
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
            <Field className={fieldContainer}>
                <Label className="mb-2 block text-sm font-semibold text-slate-700">Assessment type</Label>
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                    <Listbox value={selected} onChange={onChange}>
                        <div className="relative mt-1 w-full sm:ml-2">
                            <ListboxButton
                                id="assessment-type"
                                className="grid w-full cursor-default grid-cols-1 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 text-left text-slate-900 shadow-sm transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uwaBlue/50"
                            >
                                <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6 text-sm font-medium">
                                  <selected.icon className="size-5 shrink-0 text-uwaBlue" />
                                  <span className="block truncate">{selected.name}</span>
                                </span>
                                <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 size-5 self-center justify-self-end text-slate-400" />
                            </ListboxButton>
                            <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200/80 bg-white py-2 text-base shadow-[0_26px_60px_-32px_rgba(15,23,42,0.45)] sm:text-sm">
                                {items.map(it => (
                                    <ListboxOption
                                        key={it.id}
                                        value={it}
                                        className="group relative cursor-pointer select-none px-4 py-2 text-slate-700 transition data-focus:bg-slate-100/80 data-focus:outline-none"
                                    >
                                        <div className="flex items-center gap-3">
                                            <it.icon className="size-5 shrink-0 text-uwaBlue" />
                                            <span className="block truncate font-medium group-data-selected:text-uwaBlue">{it.name}</span>
                                        </div>
                                        <span className="absolute inset-y-0 right-4 hidden items-center text-uwaBlue group-data-selected:flex">
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
        const base = "mt-2 w-full rounded-lg border border-slate-200/70 bg-white/95 px-3 py-2 text-sm text-slate-900 transition duration-500 ease-out focus:border-uwaBlue focus:outline-none focus:ring-2 focus:ring-uwaBlue/25";
        const alert = "border-rose-300 bg-rose-50 text-rose-700 animate-pulse";
        return (
            <div className={fieldContainer}>
                <h2 className="mb-3 text-base font-semibold text-slate-900 sm:text-lg">Dates</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field>
                        <Label className="text-sm font-medium text-slate-700" htmlFor="start">Start date</Label>
                        <Input
                            id="start"
                            type="date"
                            value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                            onChange={e => handleStartDate(e.target.value)}
                            className={clsx(base, err_start ? alert : "bg-white/95")}
                        />
                    </Field>
                    <Field>
                        <Label className="text-sm font-medium text-slate-700" htmlFor="end">Due date</Label>
                        <Input
                            id="end"
                            type="date"
                            value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                            onChange={e => handleEndDate(e.target.value)}
                            className={clsx(base, err_end ? alert : "bg-white/95")}
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
            assignmentType:selected.name,
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
        <div className="flex flex-col justify-center rounded-3xl bg-white/95 p-5 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.45)] sm:p-7 md:p-9">
            <DialogTitle className="mb-3 w-full text-left text-xl font-semibold text-slate-900 sm:text-2xl">Create new assignment</DialogTitle>
            <form className="my-3 flex w-full flex-col items-center justify-center gap-4 text-left">
                <section className="flex w-full flex-col items-center justify-center gap-4 sm:w-[85%] sm:max-w-2xl">
                    <AssessmentTypeInput />
                    <AssessmentDateInput error={[errors[1], errors[2]]} />
                    <NameField setAssignmentName={setAssignmentName} assignmentName={assignmentName} />
                    <UnitField setUnitCode={setUnitCode} unitCode={unitCode} />
                </section>
                <div className="mt-6 flex w-full flex-col-reverse items-stretch gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-full border border-slate-200/70 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:-translate-y-[1px] hover:border-slate-300 hover:text-slate-900 sm:w-auto"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onCreate}
                        disabled={!canSubmit || pending}
                        className={clsx(
                            "inline-flex w-full justify-center rounded-full px-5 py-2.5 text-sm font-semibold sm:ml-3 sm:w-auto",
                            !canSubmit || pending
                                ? "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none"
                                : primaryPillButton
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
