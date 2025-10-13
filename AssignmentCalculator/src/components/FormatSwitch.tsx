import React from "react";
import { CalendarIcon, DocumentTextIcon } from "@heroicons/react/24/solid";
interface CurrentFormat{
    isCalendarFormat:boolean;
    changeFormat: React.Dispatch<React.SetStateAction<boolean>>;
}
const FormatSwitch: React.FC<CurrentFormat> = ({isCalendarFormat, changeFormat}) => {
    return (
        <div className="shadow-xl bg-uwaBlue/50 text-center rounded-xl text-white font-bold flex flex-row mx-auto w-4/5 lg:h-10 sm:h-24 my-10 relative overflow-hidden">
            <div className={`z-1 absolute top-0 h-full w-1/2 bg-uwaBlue transition-transform duration-300 ${isCalendarFormat?"translate-x-0":"translate-x-full"}`}></div>
            <button type="button" 
                className={`z-5 flex justify-center items-center gap-2 w-1/2 bg-transparent`} 
                onClick={()=> changeFormat((prev)=>(!prev))}>
                <CalendarIcon className="w-5 h-5"/>
                <span className="font-bold">Calendar</span>
            </button>
            <button type="button" 
                className={`z-5 flex h-justify-center items-center gap-2 w-1/2 bg-transparent`}
                onClick={()=> changeFormat((prev)=>(!prev))}>
                <DocumentTextIcon className="w-5 h-5"/>
                <span className="font-bold">Textual Display</span>
            </button>
        </div>
    );
}
export default FormatSwitch;