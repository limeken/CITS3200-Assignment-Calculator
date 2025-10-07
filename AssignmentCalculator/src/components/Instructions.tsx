import React from 'react';
import { Dialog } from '@headlessui/react';
import clsx from "clsx";
import {useModal} from "../providers/ModalProvider.tsx";
import { pageSection, primaryPillButton, secondaryPillButton } from "../styles/tailwindStyles.ts";

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
        <div className={clsx(pageSection, "sm:mt-6")}>
            <button
                type="button"
                onClick={() => openInstructions()}
                className={clsx(
                    secondaryPillButton,
                    "gap-2 px-5 py-2.5 text-sm shadow-[0_18px_45px_-25px_rgba(15,23,42,0.55)] border-slate-200/60 bg-white/80 hover:text-slate-900 hover:shadow-[0_22px_55px_-30px_rgba(79,70,229,0.45)] focus-visible:outline-uwaBlue sm:text-base"
                )}
            >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-uwaBlue/15 text-xs font-bold uppercase tracking-wide text-uwaBlue">i</span>
                View instructions
            </button>
        </div>
    )
}

export const Instructions: React.FC<ModalBaseProps> = ({ onClose }) => {

    return (
        <div className="space-y-5 p-5 text-slate-600 sm:p-6">
            <Dialog.Title className="text-xl font-semibold text-slate-900">
                How to use the Assignment Calculator
            </Dialog.Title>

            <div className="space-y-3 text-sm leading-relaxed">
                <p><span className="font-semibold text-slate-900">1.</span> Select the assignment type, then set your start and due dates.</p>
                <p><span className="font-semibold text-slate-900">2.</span> Choose generate to create evenly spaced milestones across the semester.</p>
                <p><span className="font-semibold text-slate-900">3.</span> Review, adjust, and submit to pin the plan to your calendar.</p>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className={clsx(
                        primaryPillButton,
                        "px-4 py-2 text-sm shadow-[0_18px_45px_-25px_rgba(79,70,229,0.65)] hover:shadow-[0_24px_55px_-28px_rgba(67,56,202,0.75)]"
                    )}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default InstructionsButton;
