import React from "react";
import type { AssignmentCalendar } from "./CalendarTypes.ts";

const TextCalendar: React.FC<{show:boolean; assignments:Record<string, AssignmentCalendar[]>}> = ({show, assignments}) => {
    return(
        <section className={`flex flex-col gap-5 justify-center mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6 ${show?"":"hidden"}`}>
            <div className="bg-slate-200 rounded-xl shadow-soft p-4 h-15">

            </div>
            <div className="bg-slate-200 rounded-xl shadow-soft p-4">
            </div>
        </section>
    )
}
export default TextCalendar;