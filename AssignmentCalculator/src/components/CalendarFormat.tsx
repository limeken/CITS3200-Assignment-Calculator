import React from "react";
import Calendar from "./Calendar";
import type {CalendarRef} from "./Calendar";
import { Transition } from '@headlessui/react';
interface prop{
    calRef:React.RefObject<CalendarRef | null>;
    isCalendarFormat:boolean;
}
const CalendarFormat: React.FC<prop> = ({calRef, isCalendarFormat}) => {
    return (
        <Transition appear show={isCalendarFormat}
        enter="ease-out duration-200"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
        >
            <section className={"mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6"}>
                <div className="bg-slate-200 rounded-xl shadow-soft p-4">
                    <Calendar ref={calRef}/>
                </div>
            </section>
        </Transition>
    );
}
export default CalendarFormat;