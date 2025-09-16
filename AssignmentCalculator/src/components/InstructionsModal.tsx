import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export interface ModalBaseProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InstructionsModal: React.FC<ModalBaseProps> = ({ isOpen, onClose }) => {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
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

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform rounded-xl bg-white p-6 text-left align-middle shadow-xl">
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
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default InstructionsModal;