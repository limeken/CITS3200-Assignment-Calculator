import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import type { Assignment } from './calendar/CalendarTypes.ts';

export interface AssignmentModalProps {
    onClose: () => void;
    title?: string;
    assignment: Assignment;
}

/* Maxwell's Notes on Hoisting
* So if these are declared in the main component, they have a new type every render.
* This means it's treated as a new element and remounted, so any internal state controls are reset
* any parent-state changes (e.g. changing step) recreates them, so it wont stay open
* now they have a stable function identity and can preserve a state
* */

// Final exported modal component, fully put together from smaller components
export const AssignmentModal: React.FC<AssignmentModalProps> = ({
    assignment,
    onClose,
    title,
}) => {

    const steps = assignment.events;

    // Represents the current step page for the given assignment
    const [pagenumber, setPageNumber] = useState<number>(0);
    const currentStep = steps[pagenumber];

    // Reset to first page
    useEffect(() => {
        setPageNumber(0);
    }, []);

    // Renders the dots representing pages, makes the dot for the current page indetifiable
    function CreatePageDots({ dots }: { dots: number }) {
        return (
            <div className="pointer-events-none absolute bottom-3 left-1/2 flex h-5 w-1/2 -translate-x-1/2 transform justify-center gap-2 items-center">
                {Array.from({ length: dots }).map((_, index) => (
                    <div
                        key={index}
                        className={index === pagenumber 
                            ? 'size-4 rounded-full bg-black' 
                            : 'size-4 rounded-full bg-black opacity-40'
                        }
                    />
                ))}
            </div>
        );
    }

    // Component that renders the details associated with a particular assignment step
    function CurrentPage() {
        return (
            <div className="h-full w-full basis-5/6">
                <div className="my-3 h-full rounded-xl shadow-md sm:my-5 bg-white overflow-hidden">
                    <div className="h-full overflow-y-auto p-4">
                        <h3 className="mb-4 text-base font-semibold sm:mb-5">
                            {currentStep.name}:
                        </h3>
                        {Array.isArray(currentStep?.instructions) && currentStep.instructions.length > 0 ? (
                        <>
                        <ul className="flex list-disc flex-col gap-3 pl-4 text-sm">
                            {currentStep.instructions.map((instruction, i) => (
                            <li key={i}>{instruction}</li>
                            ))}
                        </ul>
                        {currentStep.resources?
                        <>
                        <hr className="my-5"/>
                            <div>
                                <h3 className="mb-4 text-base font-semibold">Additional Resources:</h3>
                                <ul className="flex list-disc flex-col gap-3 pl-4 text-sm">
                                    {currentStep.resources.map((resource, i) => (
                                    <li key={i}>{resource}</li>
                                    ))}
                                </ul>
                            </div>
                        </>
                        :null}
                        </>
                        ) : (
                        <p className="pl-4 text-sm text-gray-700">No instructions for this step.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Combines the current step's information with navigation buttons to switch between pages
    function DisplayBody() {
        return (
            <div className="flex h-4/5 w-full flex-wrap items-center justify-center gap-2 sm:flex-nowrap">
            {/* Left Arrow */}
            <button
                className={`
                flex h-12 w-12 items-center justify-center self-center rounded-full
                transition duration-200 ease-in-out sm:basis-1/10
                ${pagenumber === 0
                    ? 'opacity-0 pointer-events-none'
                    : 'bg-slate-200 hover:scale-105 sm:bg-transparent sm:hover:scale-110'}
                `}
                onClick={() =>
                setPageNumber((prev) => (prev === 0 ? prev : prev - 1))
                }
                type="button"
            >
                <ChevronLeftIcon className="h-6 w-6 sm:h-20 sm:w-20" />
            </button>

            {/* Center Page */}
            <CurrentPage />

            {/* Right Arrow */}
            <button
                className={`
                flex h-12 w-12 items-center justify-center self-center rounded-full
                transition duration-200 ease-in-out sm:basis-1/10
                ${pagenumber === steps.length - 1
                    ? 'opacity-0 pointer-events-none'
                    : 'bg-slate-200 hover:scale-105 sm:bg-transparent sm:hover:scale-110'}
                `}
                onClick={() =>
                setPageNumber((prev) =>
                    prev === steps.length - 1 ? prev : prev + 1
                )
                }
                type="button"
            >
                <ChevronRightIcon className="h-6 w-6 sm:h-20 sm:w-20" />
            </button>
            </div>
        );
        }


    return (
            <div className="p-2 relative h-[80vh] rounded-xl bg-slate-200">
                <div className="h-full w-full p-6 rounded-xl flex flex-col justify-center items-center border-2 border-slate-300 relative">
                    <h1 className="font-bold text-3xl">{assignment.name}</h1>
                    <div className="relative flex flex-1 w-full flex-col justify-stretch items-stretch p-3 text-gray-900 sm:h-[85%] sm:flex-row sm:items-start">
                        <DisplayBody />
                        <CreatePageDots dots={steps.length} />
                    </div>
                </div>
            </div>
    );
};

export default AssignmentModal;
