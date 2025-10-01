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
        <Transition appear show={showNotification}
            enter="transition origin-top ease-out duration-300"
            enterFrom="scale-y-0 opacity-0"
            enterTo="scale-y-100 opacity-100"
            leave="transition origin-top ease-in duration-200 opacity-0"
            leaveFrom="scale-y-100"
            leaveTo="scale-y-0"
        >
            <div className={`fixed t-0 r-0 w-full h-10 text-white overflow-hidden flex items-center justify-center text-center ${successful?"bg-green-400":"bg-red-400"}`}>
                {/* Shows alternative messages and boxes based on the outcome of adding an assignment */}
                <span className="px-5">{successful?<CheckIcon className="w-7 h-7 text-white"/>:<ExclamationCircleIcon className="w-7 h-7 text-white"/>}</span>      
                <span className="font-semibold">{successful?" The assignment has successfuly been added.":"Something went wrong. Please try again."}</span>
            </div>
        </Transition>
    )
}
export default SubmissionBanner;