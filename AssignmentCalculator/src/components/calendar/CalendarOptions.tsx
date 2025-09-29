import React from "react";
import {CalendarIcon, Cog6ToothIcon, DocumentTextIcon,} from "@heroicons/react/24/solid";
import {Button, Fieldset, Field, Label, Legend, Select} from "@headlessui/react";
import {useModal} from "../../providers/ModalProvider.tsx";
import clsx from "clsx";


interface CalendarOptionsModalProps { onClose: () => void;}
const CalendarOptionsModal: React.FC<CalendarOptionsModalProps> = ({ onClose }) => (
    <div className="w-full max-w-lg px-4">
        <Fieldset className="space-y-6 rounded-xl bg-white p-6">
            <Legend className="text-base/7 font-semibold text-black">Settings</Legend>
            <Field className="bg-slate-200 rounded-lg p-3">
                <Label className="text-sm/6 font-medium text-black bg-slate-200">Semester</Label>
                <div className={"relative"}>
                    <Select className={clsx(
                        'mt-3 block w-full appearance-none rounded-lg border-none bg-slate-100 inset-shadow-sm inset-shadow-indigo-100 px-3 py-1.5 text-sm/6 text-black',
                        'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-black/25',
                    )}>
                        <option>Semester 1</option>
                        <option>Semester 2</option>
                        <option>Trimester</option>
                    </Select>
                </div>
            </Field>
        </Fieldset>
    </div>
)

interface CalendarOptionsProps {isCalendarFormat:boolean;changeFormat: React.Dispatch<React.SetStateAction<boolean>>;}
const CalendarOptions: React.FC<CalendarOptionsProps> = ({isCalendarFormat, changeFormat}) => {

    const {open, close} = useModal();

    const openSubmission = () => {
        open((id) => (
            <CalendarOptionsModal
                onClose={() => close(id)}
            />
        ))
    };

    return (
        <div className="flex flex-row w-full h-10 my-10">
            <div className="text-center text-white font-bold flex flex-row mx-auto w-4/5 relative">
                <Button onClick={openSubmission}
                    className="flex rounded-xl inset-ring-0 bg-uwaBlue aspect-square items-center justify-center mr-6 transition-all ease-out hover:bg-white hover:text-uwaBlue hover:inset-ring-2 hover:inset-ring-uwaBlue"
                >
                    <Cog6ToothIcon className="w-6 h-6"/>
                </Button>
                <div className="flex flex-row relative w-full bg-slate-400 shadow-xl rounded-xl overflow-hidden">
                    <div className={`z-1 absolute top-0 h-full w-1/2 bg-uwaBlue transition-transform duration-300 ${isCalendarFormat?"translate-x-0":"translate-x-full"}`}></div>
                    <button type="button"
                        className={`z-5 flex justify-center items-center gap-2 w-1/2 bg-transparent`}
                        onClick={()=> changeFormat((prev)=>(!prev))}>
                        <CalendarIcon className="w-5 h-5"/>
                        <span className="font-bold">Calendar</span>
                    </button>
                    <button type="button"
                        className={`z-5 flex justify-center items-center gap-2 w-1/2 bg-transparent`}
                        onClick={()=> changeFormat((prev)=>(!prev))}>
                        <DocumentTextIcon className="w-5 h-5"/>
                        <span className="font-bold">Textual Display</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
export default CalendarOptions;