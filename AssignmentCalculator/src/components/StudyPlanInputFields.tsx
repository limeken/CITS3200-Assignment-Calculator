import { TASKS } from "../App.tsx";
import { parseISO, format } from "date-fns";

// States for each input field
import type { StateFunctions } from "../App.tsx";
import { ArrowDownTrayIcon, PlusIcon } from "@heroicons/react/24/solid";
import React, {useEffect, useRef, useState} from "react";
import clsx from "clsx";

// Declare types for the arguments provided to component
interface InputFieldProps {
    stateFunctions: StateFunctions,
    errors: Array<boolean>,
    onGenerate: () => Promise<void> | void,
    onImport: () => Promise<void> | void,
}

// Component Wrapping all input fields
const StudyPlanInputFields: React.FC<InputFieldProps> = ({ stateFunctions, errors, onGenerate, onImport})=> {

    /* Per-value assignment state is in this component now - Max */
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

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

    // Component that displays input for assignment type
    const AssessmentTypeInput: React.FC<{error: boolean}> = ( {error}) =>{
        return  (
            <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4">
                <h2 className="text-lg font-semibold mb-3">Assessment Type</h2>
                {/*Input for assessment type is linked to its state, its handler linked to the state function*/}
                <select
                    value={"Essay"}
                    onChange={(e) => stateFunctions.setSelectedType(e.target.value)}
                    className="w-full rounded-xl px-4 py-3 bg-white/20"
                >
                    {/*Creates the input field that lists available assignments*/}
                    {Object.keys(TASKS).map((k) => (
                        <option key={k} value={k}>
                            {k}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

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