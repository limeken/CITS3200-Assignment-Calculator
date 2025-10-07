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
import {CheckIcon, ChevronUpDownIcon} from "@heroicons/react/20/solid";
import {createSemester, type Semester} from "./CalendarTypes.ts";

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
        <div>
            <DialogTitle className="h3 text-base font-semibold text-gray-900 w-full mb-2"> Calendar Settings </DialogTitle>
            <Field className="bg-slate-200 text-gray-900 rounded-xl shadow-soft p-4 w-full">
                <Label className="block text-sm font-semibold text-gray-900 mb-2">Assessment type</Label>
                <div className="flex w-full flex-row items-center align-center">
                    <Listbox value={options} onChange={setOptions}>
                        <div className="relative mt-1 ml-2 w-full">
                            <ListboxButton
                                className="grid w-full cursor-default grid-cols-1 rounded-md bg-white px-3 py-2 text-left text-gray-900 ring-1 ring-gray-300 focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                                <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                                    {options.name} ({options.semester.detail ? options.semester.detail : ""})
                                </span>
                                <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-400" />
                            </ListboxButton>
                            <ListboxOptions className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base ring-1 ring-black/5 shadow-lg sm:text-sm">
                                {sem_data.map(s => (
                                    <ListboxOption
                                        key={s.id}
                                        value={s}
                                        className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-blue-100 data-focus:outline-hidden"
                                    >
                                        <div className="flex items-center">
                                            <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">{s.name}</span>
                                        </div>
                                        <span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-blue-600 group-data-selected:flex group-data-focus:text-blue-700">
                      <CheckIcon aria-hidden="true" className="size-5" />
                    </span>
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </div>
                    </Listbox>
                </div>
            </Field>
        </div>
    )
}

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
        <div className="flex flex-row w-full h-10 mt-6">
            <div className="text-center text-white font-bold flex flex-row mx-auto w-4/5 relative">
                <Button onClick={openSubmission}
                    className="flex rounded-xl inset-ring-0 bg-uwaBlue h-full aspect-square items-center justify-center mr-6 transition-all ease-out hover:bg-white hover:text-uwaBlue hover:inset-ring-2 hover:inset-ring-uwaBlue"
                >
                    <Cog6ToothIcon className="w-6 h-6"/>
                </Button>
                <div className="flex flex-row relative w-full bg-slate-400 shadow-xl rounded-xl overflow-hidden">
                    <div className={`z-1 absolute top-0 h-full w-1/2 bg-uwaBlue rounded-xl transition-transform duration-300 ${isCalendarFormat?"translate-x-0":"translate-x-full"}`}></div>
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