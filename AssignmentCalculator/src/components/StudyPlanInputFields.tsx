import { TASKS } from "../App.tsx";
import generate from "../App.tsx";
// States for each input field
import type {States,StateFunctions} from "../App.tsx";
import {ArrowDownTrayIcon, PlusIcon} from "@heroicons/react/24/solid";
import React from "react";
import clsx from "clsx";

// Declare types for the arguments provided to component
interface props{
    states:States,
    stateFunctions:StateFunctions
}

// Component Wrapping all input fields
export default function StudyPlanInputFields({states,stateFunctions}:props){
    // Component that displays input for assignment type
    function AssessmentTypeInput(){
        return  (
                    <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4">
                        <h2 className="text-lg font-semibold mb-3">Assessment Type</h2>
                        {/*Input for assessment type is linked to its state, its handler linked to the state function*/}
                        <select
                            value={states.selectedType}
                            onChange={(e) => stateFunctions.setSelectedType(e.target.value as keyof typeof TASKS)}
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
    function AssessmentDateInput(){
        return  (
                    <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4">
                        <h2 className="text-lg font-semibold mb-3">Dates</h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <label className="block">
                                <span className="text-sm font-medium">Start date</span>
                                {/*Input for start date is linked to its state, its handler linked to the state function*/}
                                <input
                                    type="date"
                                    value={states.startDate}
                                    onChange={(e) => stateFunctions.setStartDate(e.target.value)}
                                    className="mt-1 w-full rounded-xl bg-white/20 px-3 py-2"
                                />
                            </label>
                            <label className="block">
                                <span className="text-sm font-medium">Due date</span>
                                {/*Input for end date is linked to its state, its handler linked to the state function*/}
                                <input
                                    type="date"
                                    value={states.dueDate}
                                    onChange={(e) => stateFunctions.setDueDate(e.target.value)}
                                    className="mt-1 w-full rounded-xl bg-white/20 px-3 py-2"
                                />
                            </label>
                        </div>
                    </div>
                )  
            ;}

    // Component for entering number of hours dedicated to assignment (currently considered redundant)
    function AssessmentHoursInput(){
        return  (
                    <div className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4">
                        <h2 className="text-lg font-semibold mb-3">Plan Settings</h2>
                        <label className="block">
                            <span className="text-sm font-medium">Effort per day (hrs)</span>
                            <input
                                type="number"
                                step={0.5}
                                min={0.5}
                                value={Number.isFinite(states.hoursPerDay) ? states.hoursPerDay : 0}
                                onChange={(e) => stateFunctions.setHoursPerDay(Number(e.target.value) || 0)}
                                className="mt-1 w-full rounded-xl bg-white/20 px-3 py-2"
                            />
                        </label>
                    </div>
                )
            ;}

    function SubmitButtons() {
        const buttonStyle = "text-white bg-uwaBlue border-uwaBlue border-2 w-full h-full mt-3 rounded-xl font-semibold px-4 py-3 flex flex-row gap-2 items-center justify-start transition-all duration-170 ease-out hover:bg-white hover:text-uwaBlue";
        return (
            <>
                <button
                    onClick={generate} /* TODO: generator callback */
                    className={clsx(buttonStyle, "xl:col-span-2")}
                >
                    <PlusIcon className="h-5 w-5"/>
                    Generate Plan
                </button>
                <button
                    onClick={() => console.log('clicked import')} /* TODO: import callback */
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
                        <AssessmentTypeInput/>
                        {/* Dates */}
                        <AssessmentDateInput/>
                        {/* Plan Settings */}
                        <AssessmentHoursInput/>
                        {/* Buttons */}
                        <SubmitButtons />
                    </div>
                </section>
            );
}
    