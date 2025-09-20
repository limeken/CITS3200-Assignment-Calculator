import React from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { PaperClipIcon } from "@heroicons/react/24/outline";

interface SubmissionModalProps {
    isOpen: boolean;
    assignmentName: string;
    unitCode: string;
    setAssignmentName: (v: string) => void;
    setUnitCode: (v: string) => void;
    onSubmit: () => Promise<void> | void;
    onClose: () => void;
    busy?: boolean; // <-- added
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({
    isOpen,
    assignmentName,
    unitCode,
    setAssignmentName,
    setUnitCode,
    onSubmit,
    onClose,
    busy = false, // <-- default
}) => {
    const canSubmit =
        !busy &&
        assignmentName.trim().length > 0 &&
        unitCode.trim().length > 0;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/50"
            />

            <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95 dark:bg-gray-800 dark:outline dark:-outline-offset-1 dark:outline-white/10"
                    >
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-gray-800">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10 dark:bg-blue-500/10">
                                    <PaperClipIcon
                                        aria-hidden="true"
                                        className="size-6 text-blue-600 dark:text-blue-400"
                                    />
                                </div>
                                <div className="mt-3 text-left sm:mt-0 sm:ml-4 w-full">
                                    <DialogTitle
                                        as="h3"
                                        className="text-base font-semibold text-gray-900 dark:text-white"
                                    >
                                        New assignment details
                                    </DialogTitle>

                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Assignment name
                                            </label>
                                            <input
                                                type="text"
                                                value={assignmentName}
                                                onChange={(e) => setAssignmentName(e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                                placeholder="e.g. Literature Review"
                                                disabled={busy}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Unit code
                                            </label>
                                            <input
                                                type="text"
                                                value={unitCode}
                                                onChange={(e) => setUnitCode(e.target.value)}
                                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                                placeholder="e.g. CITS3200"
                                                disabled={busy}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-700/25">
                            <button
                                type="button"
                                onClick={onSubmit}
                                disabled={!canSubmit}
                                className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-xs sm:ml-3 sm:w-auto ${
                                    canSubmit
                                        ? "bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                                        : "bg-gray-400 cursor-not-allowed dark:bg-white/20"
                                }`}
                            >
                                {busy ? "Submitting..." : "Create assignment"}
                            </button>
                            <button
                                type="button"
                                data-autofocus
                                onClick={onClose}
                                disabled={busy}
                                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                            >
                                Cancel
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default SubmissionModal;