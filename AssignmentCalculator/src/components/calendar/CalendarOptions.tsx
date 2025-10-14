import React, {useMemo, useState, useEffect} from "react";
import {CalendarIcon, Cog6ToothIcon, DocumentTextIcon,} from "@heroicons/react/24/solid";
import {
    Button,
    Field,
    Label,
    DialogTitle,
    Listbox,
    ListboxButton,
    ListboxOption, ListboxOptions
} from "@headlessui/react";
import {useModal} from "../../providers/ModalProvider.tsx";
import {ChevronUpDownIcon} from "@heroicons/react/20/solid";
import clsx from "clsx";
import { pageSection, primaryPillButton } from "../../styles/styles.ts";
import { useSemesters } from "../../providers/semesterHooks.ts";
import {
    buildSemesterOptions,
    findSemesterOption,
    type SemesterOption,
} from "./semesterOptions.ts";

interface CalendarOptionsModalProps {
    onClose: () => void;
    onSubmit: (option: SemesterOption) => void;
    options: SemesterOption[];
    selected: SemesterOption | null;
    isLoading: boolean;
    hasError: boolean;
    usingFallback: boolean;
}

const CalendarOptionsModal: React.FC<CalendarOptionsModalProps> = ({
    onClose,
    onSubmit,
    options,
    selected,
    isLoading,
    hasError,
    usingFallback,
}) => {
    const [localSelection, setLocalSelection] = useState<SemesterOption | null>(selected ?? (options[0] ?? null));

    useEffect(() => {
        const next = selected ?? (options[0] ?? null);
        setLocalSelection(next);
    }, [selected, options]);

    const handleSubmit = () => {
        if (localSelection) {
            onSubmit(localSelection);
        } else {
            onClose();
        }
    };

    return (
        <div className="space-y-5 p-5 sm:p-6">
            <DialogTitle className="text-lg font-semibold text-slate-900">
                Calendar settings
                {(hasError || (usingFallback && !isLoading)) && (
                    <span className="ml-2 text-xs text-orange-500">(using offline data)</span>
                )}
            </DialogTitle>
            <Field className="w-full rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_24px_50px_-28px_rgba(15,23,42,0.32)]">
                <Label className="mb-2 block text-sm font-semibold text-slate-700">Active semester</Label>
                {isLoading ? (
                    <div className="text-sm text-slate-500">Loading semesters...</div>
                ) : (
                    <div className="flex w-full flex-row items-center">
                        <Listbox value={localSelection} onChange={setLocalSelection}>
                            <div className="relative mt-1 w-full">
                                <ListboxButton
                                    className="grid w-full cursor-default grid-cols-1 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 text-left text-slate-900 shadow-sm transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uwaBlue/60"
                                >
                                    <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6 text-sm font-medium">
                                        {localSelection?.name || 'Select a semester'}
                                        <span className="text-xs font-normal text-slate-500">{localSelection?.semester.detail ?? ""}</span>
                                    </span>
                                    <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 size-5 self-center justify-self-end text-slate-400" />
                                </ListboxButton>
                                <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200/80 bg-white py-2 text-base shadow-[0_26px_60px_-32px_rgba(15,23,42,0.45)] sm:text-sm">
                                    {options.map(s => (
                                        <ListboxOption
                                            key={s.id}
                                            value={s}
                                            className="group relative cursor-pointer select-none px-4 py-2 text-slate-700 transition data-focus:bg-slate-100/80 data-focus:outline-none group-data-selected:bg-uwaBlue/5 group-data-selected:text-uwaBlue"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="block truncate font-medium">{s.name}</span>
                                                <span className="text-xs text-slate-400">{s.semester.detail ?? ""}</span>
                                            </div>
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </div>
                        </Listbox>
                    </div>
                )}
            </Field>
            <div className="flex w-full justify-end">
                <button
                    type="button"
                    onClick={handleSubmit}
                    className={clsx(
                        primaryPillButton,
                        "w-full px-5 py-2.5 text-sm shadow-[0_22px_45px_-25px_rgba(79,70,229,0.65)] hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-28px_rgba(67,56,202,0.75)] sm:w-auto"
                    )}
                    disabled={!localSelection}
                >
                    Done
                </button>
            </div>
        </div>
    )
}

interface CalendarOptionsProps {
    isCalendarFormat: boolean;
    changeFormat: React.Dispatch<React.SetStateAction<boolean>>;
    activeSemester: SemesterOption;
    onSemesterChange: (option: SemesterOption) => void;
}

const CalendarOptions: React.FC<CalendarOptionsProps> = ({
    isCalendarFormat,
    changeFormat,
    activeSemester,
    onSemesterChange,
}) => {

    const { data: backendSemesters, isLoading, error } = useSemesters();
    const {open, close} = useModal();

    const semesterOptions = useMemo(
        () => buildSemesterOptions(backendSemesters),
        [backendSemesters],
    );

    const usingFallback = semesterOptions.every((option) => option.source === 'fallback');

    const selectedOption = findSemesterOption(semesterOptions, activeSemester.id);

    const openOptions = () => {
        open((id) => (
            <CalendarOptionsModal
                onClose={() => close(id)}
                onSubmit={(option) => {
                    onSemesterChange(option);
                    close(id);
                }}
                options={semesterOptions}
                selected={selectedOption ?? (semesterOptions[0] ?? null)}
                isLoading={isLoading}
                hasError={Boolean(error)}
                usingFallback={usingFallback}
            />
        ))
    };

    const switchIndicator = clsx(
        "absolute inset-y-1 left-1 w-[calc(50%-0.5rem)] rounded-xl bg-gradient-to-r from-uwaBlue via-indigo-500 to-purple-500 shadow-[0_16px_35px_-20px_rgba(79,70,229,0.6)] transition-transform duration-300 ease-out",
        isCalendarFormat ? "translate-x-0" : "translate-x-full"
    );

    return (
        <div className={clsx(pageSection, "my-6")}>
            <div className="surface-card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <Button
                        onClick={openOptions}
                        className="inline-flex lg:h-12 sm:h-8 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-white/90 px-5 text-sm font-semibold text-slate-700 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-uwaBlue hover:shadow-[0_24px_55px_-30px_rgba(67,56,202,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uwaBlue sm:w-auto"
                    >
                        <Cog6ToothIcon className="h-6 w-6" />
                        <span className="hidden sm:inline">Calendar settings</span>
                    </Button>
                    <p className="text-center text-xs font-medium text-slate-500 sm:text-left">
                        <span className="text-slate-700">Semester:</span> {activeSemester.name}
                        {activeSemester.semester.detail ? ` · ${activeSemester.semester.detail}` : ''}
                    </p>
                </div>
                <div className="relative flex h-20 sm:h-16 lg:h-12 w-full flex-1 min-w-[16rem] overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-inner shadow-white/[0.35]">
                    <span className={switchIndicator} />
                    <button
                        type="button"
                        className={clsx(
                            "relative z-10 flex w-1/2 items-center justify-center gap-2 text-sm font-semibold transition-colors",
                            isCalendarFormat ? "text-white" : "text-slate-600"
                        )}
                        onClick={() => changeFormat(true)}
                    >
                        <CalendarIcon className="h-5 w-5" />
                        <span>Calendar</span>
                    </button>
                    <button
                        type="button"
                        className={clsx(
                            "relative z-10 flex w-1/2 items-center justify-center gap-2 text-sm font-semibold transition-colors",
                            !isCalendarFormat ? "text-white" : "text-slate-600"
                        )}
                        onClick={() => changeFormat(false)}
                    >
                        <DocumentTextIcon className="h-5 w-5" />
                        <span>Text view</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
export default CalendarOptions;
