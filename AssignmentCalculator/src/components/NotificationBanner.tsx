import React, {useEffect} from 'react';
import { Transition } from '@headlessui/react';
import { ExclamationCircleIcon, CheckIcon } from '@heroicons/react/24/solid';

// Defines its visible state, stored in main, along with a variable representing if an assignment was successfully added
export interface SubmissionResult{
    showNotification:boolean;
    setNotification: (state:boolean) => void;
    successful?:boolean;
};

// Takes a boolean representing the result of submission and generates a banner based on the outcome
const SubmissionBanner: React.FC<SubmissionResult> = ({showNotification, setNotification, successful=true}) => {

    useEffect(() => {
        if(!showNotification) return;
        const id = setTimeout(() => setNotification(false), 3000);
        return () => clearTimeout(id);
    }, [showNotification, setNotification])

    return (
        <Transition
            appear
            show={showNotification}
            enter="transition ease-out duration-300"
            enterFrom="-translate-y-4 opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transition ease-in duration-200"
            leaveFrom="translate-y-0 opacity-100"
            leaveTo="-translate-y-2 opacity-0"
        >
            <div
                className={`pointer-events-none fixed left-1/2 top-6 z-[60] flex w-[min(100%-2rem,28rem)] -translate-x-1/2 items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-[0_25px_45px_-20px_rgba(15,23,42,0.4)] backdrop-blur ${successful ? "border-emerald-200/70 bg-emerald-50/90 text-emerald-900" : "border-rose-200/70 bg-rose-50/90 text-rose-900"}`}
            >
                <span>
                    {successful ? (
                        <CheckIcon className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" />
                    ) : (
                        <ExclamationCircleIcon className="h-5 w-5 text-rose-500 sm:h-6 sm:w-6" />
                    )}
                </span>
                <span className="text-center">
                    {successful
                        ? "Assignment added to your planner."
                        : "Something went wrong. Please try again."}
                </span>
            </div>
        </Transition>
    )
}
export default SubmissionBanner;
