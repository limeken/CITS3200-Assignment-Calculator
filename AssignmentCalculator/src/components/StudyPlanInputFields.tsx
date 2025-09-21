import { parseISO, format } from "date-fns";
import {Field, Label, Listbox, ListboxButton, ListboxOption, ListboxOptions,} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

// TODO: Test data
// import some silly data
import type { Assignment } from "./CalendarTypes.ts"
import { assignments } from "./testdata.ts";

// States for each input field
import type { StateFunctions } from "../App.tsx";
import {ArrowDownTrayIcon, PlusIcon} from "@heroicons/react/24/solid";
import React, {useEffect, useMemo, useState} from "react";
import clsx from "clsx";
import {QuestionMarkCircleIcon} from "@heroicons/react/24/outline";

// Declare types for the arguments provided to component
interface InputFieldProps {
    stateFunctions: StateFunctions,
    errors: Array<boolean>,
    onGenerate: () => Promise<void> | void,
    onImport: () => Promise<void> | void,

    // temp function for assignment help layout
    onShowAssignmentHelp: () => void,
}

// TODO: Keep the state of the current selected calendar in component memory
// Component Wrapping all input fields
const StudyPlanInputFields: React.FC<InputFieldProps> = ({ stateFunctions, errors, onGenerate, onImport, onShowAssignmentHelp})=> {

    /* Per-value assignment state is in this component now - Max */
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    // Build the items from TASKS
    const items = useMemo<Assignment[]>(() => Object.values(assignments), []);
    const [selected, setSelected] = useState<Assignment>(
        items.find(i => i.name === "Essay") ?? items[0]
    );

    /* TODO: date validation for start and end */
    /* validate using string from ISO conversion */
    function handleStartDate(date: string) {
        console.log(`validating date: ${date}`);
        const next = parseISO(date);
        setStartDate(next);
        stateFunctions.setStartDate(next);
    }
    function handleEndDate(date: string){
        console.log(`validating date: ${date}`);
        const next = parseISO(date);
        setEndDate(next);
        stateFunctions.setEndDate(next);
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
            stateFunctions.setSelectedType(it.name)
        };

        return (
            <Field className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4">
                <Label className="block text-sm font-semibold text-gray-900 mb-2">Assessment type</Label>

                <div className={"flex w-full flex-row items-center align-center"}>
                    <button
                        type="button"
                        onClick={onShowAssignmentHelp}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onShowAssignmentHelp(); }
                        }}
                        aria-label="Show assignment help"
                        title="Show assignment help"
                        className="inline-flex items-center justify-center"
                    >
                        <QuestionMarkCircleIcon className="h-6 w-6 cursor-pointer text-slate-500 hover:text-slate-800" />
                    </button>
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
                    <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4">
                        <h2 className="text-lg font-semibold mb-3">Dates</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium">Start date</span>
                                {/*Input for start date is linked to its state, its handler linked to the state function*/}
                                <input
                                    type="date"
                                    value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                                    onChange={(e) => handleStartDate(e.target.value)}
                                    className={clsx(base, err_start ? alert: "bg-white/20")}
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium">Due date</span>
                                {/*Input for end date is linked to its state, its handler linked to the state function*/}
                                <input
                                    type="date"
                                    value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                                    onChange={(e) => handleEndDate(e.target.value)}
                                    className={clsx(base, err_end ? alert : "bg-white/20")}
                                />
                            </label>
                        </div>
                    </div>
                )
            ;}

    // Component for entering number of hours dedicated to assignment (currently considered redundant)
    const AssessmentHoursInput: React.FC<{error: boolean}> = ({ error } ) => {

        return  (
                    <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4">
                        <h2 className="text-lg font-semibold mb-3">Plan Settings</h2>
                        <label className="block">
                            <span className="text-sm font-medium">Effort per day (hrs)</span>
                            <input
                                type="number"
                                step={0.5}
                                min={0.5}
                                value={2}
                                onChange={(e) => console.log(`this is unimplemented: value ${e.target.value}`)}
                                className="mt-1 w-full rounded-xl bg-white/20 px-3 py-2"
                            />
                        </label>
                        {error && null}
                    </div>
                )
            ;}

    const SubmitButtons = () => {
        const buttonStyle = "text-white bg-uwaBlue border-uwaBlue border-2 w-full h-full mt-3 rounded-xl font-semibold px-4 py-3 flex flex-row gap-2 items-center justify-start transition-all duration-170 ease-out hover:bg-white hover:text-uwaBlue";
        return (
            <>
                <button
                    onClick={onGenerate} /* TODO: generator callback */
                    className={clsx(buttonStyle, "xl:col-span-2")}
                >
                    <PlusIcon className="h-5 w-5"/>
                    Generate Plan
                </button>
                <button
                    onClick={onImport} /* TODO: import callback */
                    className={clsx(buttonStyle)}
                >
                    <ArrowDownTrayIcon className="h-5 w-5"/>
                    Import
                </button>
            </>
        );
    }

    return (
                <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6">
                    <div className="grid lg:grid-cols-3 gap-4">
                        {/* Assessment Type */}
                        <AssessmentTypeInput error={errors[0]}/>
                        {/* Dates */}
                        <AssessmentDateInput error={[errors[1], errors[2]]}/>
                        {/* Plan Settings */}
                        <AssessmentHoursInput error={false}/>
                        {/* Buttons */}
                        <SubmitButtons />
                    </div>
                </section>
            );
}

export default StudyPlanInputFields;