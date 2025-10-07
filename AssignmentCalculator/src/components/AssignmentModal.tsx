import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
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

// Dot displayed to show that there are additional resources avaialble
const NotificationDot: React.FC<{show: boolean}> = ({ show }) => !show ? null : (
        <>
            <span className="pointer-events-none absolute -right-1 -top-1 size-4 rounded-full bg-red-500 ring-1 ring-red-200 z-10" />
            <span className="pointer-events-none absolute -right-1 -top-1 size-4 rounded-full bg-red-400 animate-ping z-0" />
        </>
)

// Component representing the additional resource panel that comes out of the main modal
const AdditionalResources: React.FC<{open: boolean, onToggle: () => void, resources: string[]}> = ({ open, onToggle, resources }) => (
    <div className="pointer-events-auto absolute right-0 top-16 h-64 sm:h-72">
        <div className="relative size-full">
            {/* Slide-out panel sits UNDER the main panel */}
            <div
                className={`pointer-events-auto absolute right-0 top-0 z-[1] h-full w-60 translate-x-full rounded-br-md bg-slate-300 p-3 text-gray-900 shadow-xl transition-transform duration-300 ease-out sm:w-72 ${open ? '' : '!translate-x-0'}`}
                aria-hidden={!open}
            >
                <h2 className="py-2 text-center font-bold">Additional Resources</h2>
                <hr />
                <ul className="mt-2 flex list-disc flex-col gap-3 pl-4 text-xs">
                    {resources.map((r, i) => (
                        <li key={i}>{r}</li>
                    ))}
                </ul>
            </div>

            {/* Tab rides with panel and carries the dot; pinned to the modal's right edge */}
            <button
                className={`pointer-events-auto absolute left-0 top-0 z-20 flex h-16 w-10 items-center justify-center rounded-r-md bg-uwaBlue font-bold text-white shadow-sm shadow-black/30 transition-transform duration-300 ease-out hover:bg-slate-400 ${open ? 'translate-x-[15rem] sm:translate-x-[18rem]' : 'translate-x-0'}`}
                onClick={onToggle}
                type="button"
                aria-label="Toggle additional resources"
            >
                <NotificationDot show={resources.length > 0} />
                <span>?</span>
            </button>
        </div>
    </div>
);

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

    // State representing if resources menu should be shown or not
    const [resourcesOpen, setResourcesOpen] = useState<boolean>(false);

    // Reset to first page every resourcesOpen
    useEffect(() => {
        setPageNumber(0);
    }, []);

    // Renders the dots representing pages, makes the dot for the current page indetifiable
    function CreatePageDots({ dots }: { dots: number }) {
        return (
            <div className="pointer-events-none absolute bottom-3 left-1/2 flex h-5 w-1/2 -translate-x-1/2 transform justify-center gap-2">
                {Array.from({ length: dots }).map((_, index) => (
                    <div
                        key={index}
                        className={index === pagenumber ? 'size-4 rounded-full bg-slate-600' : 'size-3 rounded-full bg-black'}
                    />
                ))}
            </div>
        );
    }

    // Component that renders the details associated with a particular assignment step
    function CurrentPage() {
        return (
            <div className="w-full sm:basis-4/5">
                <h3 className="my-3 text-center text-lg font-semibold sm:my-5">{assignment.name}</h3>
                <div className="my-3 h-[60vh] overflow-y-auto rounded-xl bg-white p-4 shadow-md sm:my-5 sm:h-[70%]">
                    <h3 className="mb-4 text-base font-semibold sm:mb-5">
                        {currentStep.name}:
                    </h3>
                    {Array.isArray(currentStep?.instructions) && currentStep.instructions.length > 0 ? (
                      <ul className="flex list-disc flex-col gap-3 pl-4 text-sm">
                        {currentStep.instructions.map((instruction, i) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="pl-4 text-sm text-gray-700">No instructions for this step.</p>
                    )}
                </div>
            </div>
        );
    }

    // Combines the current step's information with navigation buttons to switch between pages
    function DisplayBody() {
        return (
            <div className="flex h-full w-full flex-wrap items-center justify-center gap-4 sm:flex-nowrap">
                {/* Left */}
                <button
                    className={
                        pagenumber === 0
                            ? 'invisible w-12 sm:basis-1/10'
                            : 'flex h-12 w-12 items-center justify-center self-center rounded-full bg-slate-200 transition duration-200 ease-in-out hover:scale-105 sm:basis-1/10 sm:bg-transparent sm:hover:scale-110'
                    }
                    onClick={() => setPageNumber((prev) => (prev === 0 ? prev : prev - 1))}
                    type="button"
                >
                    <ChevronLeftIcon className="h-6 w-6 sm:h-10 sm:w-10" />
                </button>

                <CurrentPage />

                {/* Right */}
                <button
                    className={
                        steps.length === 0 || pagenumber === steps.length - 1
                            ? 'invisible w-12 sm:basis-1/10'
                            : 'flex h-12 w-12 items-center justify-center self-center rounded-full bg-slate-200 transition duration-200 ease-in-out hover:scale-105 sm:basis-1/10 sm:bg-transparent sm:hover:scale-110'
                    }
                    onClick={() => setPageNumber((prev) => (steps.length === 0 || prev === steps.length - 1 ? prev : prev + 1))}
                    type="button"
                >
                    <ChevronRightIcon className="h-6 w-6 sm:h-10 sm:w-10" />
                </button>
            </div>
        );
    }

    /* Maxwell's Digression on Transitions and Dialogs and Scary looking bigwords
    * Sorry for butchering your code, this looks complex but it's quite simple:
    * 1. The modal is rendered as a Transition element. This is simply noting that we are conditonally rendering based on the value of 'show'.
    * 2. The "as=Fragment" means we are rendering multiple children elements inside our transition, you've seen this before when we wrap elements in tagless brackets: <></>
    * 3. Then, we render out a Dialog element which gives us easy handling of the page overlay logic (e.g. background blur, centering, etc.)
    * 4. We then wrap the interior with a TransitionChild, which allows us to seperately control the background animation as well as the dialog animation
    * 5. Inside, DialogPanel defines is the actual clickable area inside the dialog (clicking outside takes us out of the modal)
    * 6. The logic inside DialogPanel remains the same
    * Now with this handling, we can unify the modal handling logic on the top-level App.
    * */
    return (
        <Dialog.Panel className="relative z-40 h-[85vh] w-full max-w-3xl transform overflow-hidden rounded-xl bg-slate-200/20 p-0 text-left align-middle shadow-2xl sm:h-[75vh]">
            <div className="relative z-40 h-full rounded-xl bg-slate-200">
                {/* Header */}
                <div className="relative z-40 flex w-full flex-row items-center justify-center gap-2 rounded-t-xl bg-uwaBlue px-4 py-3 text-center shadow-sm shadow-black">
                    <Dialog.Title className="text-sm font-semibold text-white sm:text-base">
                        {title ?? `CITS3200 - ${assignment.name}`}
                    </Dialog.Title>
                </div>

                {/* Body */}
                <div className="relative z-[5] flex h-[calc(100%-4.5rem)] w-full flex-col items-center justify-center p-3 text-gray-900 sm:h-[85%] sm:flex-row sm:items-start">
                    <DisplayBody />
                    <CreatePageDots dots={steps.length} />
                </div>
            </div>
            {/* Resources rail pinned to modal right edge (under content) */}
            <AdditionalResources open={resourcesOpen} onToggle={() => setResourcesOpen(v => !v)} resources={currentStep?.resources ?? []}/>
        </Dialog.Panel>
    );
};

export default AssignmentModal;
