import React from 'react';
import { Dialog } from '@headlessui/react';
import {useModal} from "./ModalProvider.tsx";

export interface ModalBaseProps {
    onClose: () => void;
}

export const InstructionsButton = () => {

    const { open, close } = useModal();

    const openInstructions= () => {
        open(id =>
            ( <Instructions onClose={() => {close(id)}} />)
        )
    }

    return (
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-4">
            <button
                type="button"
                onClick={() => openInstructions()}
                className="inline-flex items-center rounded-md bg-uwaBlue px-3 py-2 text-white hover:bg-slate-700"
            >
                View instructions
            </button>
        </div>
    )
}

export const Instructions: React.FC<ModalBaseProps> = ({ onClose }) => {

    return (
        <>
            <Dialog.Title className="text-lg font-semibold">
                How to use the Assignment Calculator
            </Dialog.Title>

            <div className="mt-3 space-y-3 text-sm text-slate-700">
                <p>1. Select the assignment type then set start and end dates.</p>
                <p>2. Click Generate to create tasks across the calendar.</p>
                <p>3. Review tasks then submit.</p>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md bg-slate-900 px-3 py-2 text-white"
                >
                    Close
                </button>
            </div>
        </>
    );
};

export default InstructionsButton;