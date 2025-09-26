import React, { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import type { Assignment } from './calendar/CalendarTypes.ts';

export interface AssignmentModalProps {
    isOpen: boolean;
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
    <div className="absolute right-0 top-16 h-72 z-[1] pointer-events-auto">
        <div className="relative size-full">
            {/* Slide-out panel sits UNDER the main panel */}
            <div
                className={`absolute right-0 top-0 z-[1] h-full w-72 translate-x-full rounded-br-md bg-slate-300 p-3 text-gray-900 shadow-xl transition-transform duration-300 ease-out pointer-events-auto ${open ? '' : '!translate-x-0'}`}
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
                className={`absolute z-20 left-0 top-0 z-[3] flex h-20 w-10 items-center justify-center rounded-r-md bg-uwaBlue hover:bg-slate-400 font-bold text-white shadow-sm shadow-black/30 transition-transform duration-300 ease-out pointer-events-auto ${open ? 'translate-x-[18rem]' : 'translate-x-0'}`}
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
    isOpen,
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
        if (isOpen) setPageNumber(0);
    }, [isOpen]);

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
            <div className="basis-4/5">
                <h3 className="my-5 text-center">{assignment.name}</h3>
                <div className="my-5 h-[70%] overflow-y-auto rounded-xl bg-white p-4 shadow-md">
                    <h3 className="mb-5 font-semibold">
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
            <div className="flex h-4/5 w-full flex-row justify-center">
                {/* Left */}
                <button
                    className={
                        pagenumber === 0
                            ? 'invisible basis-1/10'
                            : 'basis-1/10 self-center transition duration-200 ease-in-out hover:scale-110'
                    }
                    onClick={() => setPageNumber((prev) => (prev === 0 ? prev : prev - 1))}
                    type="button"
                >
                    <ChevronLeftIcon className="h-10 w-10" />
                </button>

                <CurrentPage />

                {/* Right */}
                <button
                    className={
                        steps.length === 0 || pagenumber === steps.length - 1
                            ? 'invisible basis-1/10'
                            : 'basis-1/10 self-center transition duration-200 ease-in-out hover:scale-110'
                    }
                    onClick={() => setPageNumber((prev) => (steps.length === 0 || prev === steps.length - 1 ? prev : prev + 1))}
                    type="button"
                >
                    <ChevronRightIcon className="h-10 w-10" />
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
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Specifies the animation for the modal background */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto z-10">
                    <div className="flex min-h-full items-center justify-center p-4 z-10">
                        {/* Specifies the animation for the modal itself */}
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            {/* Specifies the modal as the clickable area, allowing for the modal to close when clicked off */}
                            <Dialog.Panel className="relative z-40 h-[75vh] w-[33vw] transform rounded-xl bg-slate-200/20 p-0 text-left align-middle shadow-2xl">
                                <div className="relative z-40 bg-slate-200 rounded-xl h-full">
                                    {/* Header */}
                                    <div className="relative z-40 flex h-[10%] w-full flex-row items-center justify-center rounded-t-xl bg-uwaBlue py-2 shadow-sm shadow-black">
                                        <Dialog.Title className="text-white">
                                            {title ?? `CITS3200 - ${assignment.name}`}
                                        </Dialog.Title>
                                    </div>

                                    {/* Body */}
                                    <div className="relative z-[5] flex h-[85%] w-full flex-row items-start justify-center p-3 text-gray-900">
                                        <DisplayBody />
                                        <CreatePageDots dots={steps.length} />
                                    </div>
                                </div>
                                {/* Resources rail pinned to modal right edge (under content) */}
                                <AdditionalResources open={resourcesOpen} onToggle={() => setResourcesOpen(v => !v)} resources={currentStep?.resources ?? []}/>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AssignmentModal;