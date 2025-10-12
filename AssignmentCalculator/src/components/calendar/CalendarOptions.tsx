import React, {useState} from "react";
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
import {createSemester, type Semester} from "./CalendarTypes.ts";
import clsx from "clsx";
import { pageSection, primaryPillButton } from "../../styles/styles.ts";

const sem_data: {id: number, name: string, semester: Semester}[]  = [
    {
        id: 1, name: "Semester 1",
        semester: createSemester(new Date("2025-02-24"), new Date("2025-05-23"))
    },
    {
        id: 2, name: "Semester 2",
        semester: createSemester(new Date("2025-07-21"), new Date("2025-10-17"))
    },
    {
        id: 3, name: "Trimester 1",
        semester: createSemester(new Date("2025-01-20"), new Date("2025-04-11"))
    },
    {
        id: 4, name: "Trimester 2",
        semester: createSemester(new Date("2025-04-28"), new Date("2025-07-18"))
    },
    {
        id: 5, name: "Trimester 3",
        semester: createSemester(new Date("2025-08-11"), new Date("2025-10-31"))
    }
]

interface CalendarOptionsModalProps { onClose: () => void;}
const CalendarOptionsModal: React.FC<CalendarOptionsModalProps> = ({ onClose }) => {

    // todo: bubble this data state to the top-level
    const [options, setOptions] = useState(sem_data[0]);

    return (
        <div className="space-y-5 p-5 sm:p-6">
            <DialogTitle className="text-lg font-semibold text-slate-900">Calendar settings</DialogTitle>
            <Field className="w-full rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-[0_24px_50px_-28px_rgba(15,23,42,0.32)]">
                <Label className="mb-2 block text-sm font-semibold text-slate-700">Active semester</Label>
                <div className="flex w-full flex-row items-center">
                    <Listbox value={options} onChange={setOptions}>
                        <div className="relative mt-1 w-full">
                            <ListboxButton
                                className="grid w-full cursor-default grid-cols-1 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 text-left text-slate-900 shadow-sm transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uwaBlue/60"
                            >
                                <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6 text-sm font-medium">
                                    {options.name}
                                    <span className="text-xs font-normal text-slate-500">{options.semester.detail ?? ""}</span>
                                </span>
                                <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 size-5 self-center justify-self-end text-slate-400" />
                            </ListboxButton>
                            <ListboxOptions className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-slate-200/80 bg-white py-2 text-base shadow-[0_26px_60px_-32px_rgba(15,23,42,0.45)] sm:text-sm">
                                {sem_data.map(s => (
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
            </Field>
            <div className="flex w-full justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className={clsx(
                        primaryPillButton,
                        "w-full px-5 py-2.5 text-sm shadow-[0_22px_45px_-25px_rgba(79,70,229,0.65)] hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-28px_rgba(67,56,202,0.75)] sm:w-auto"
                    )}
                >
                    Done
                </button>
            </div>
        </div>
    )
}

interface CalendarOptionsProps {isCalendarFormat:boolean;changeFormat: React.Dispatch<React.SetStateAction<boolean>>;}
const CalendarOptions: React.FC<CalendarOptionsProps> = ({isCalendarFormat, changeFormat}) => {

    const {open, close} = useModal();

    const openOptions = () => {
        open((id) => (
            <CalendarOptionsModal
                onClose={() => close(id)}
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
