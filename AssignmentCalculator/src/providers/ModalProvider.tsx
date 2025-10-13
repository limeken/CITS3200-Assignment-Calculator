import React, {Fragment, useState, type ReactNode, createContext, useContext} from "react";
import {Dialog, DialogBackdrop, DialogPanel, Transition, TransitionChild} from "@headlessui/react";

type ModalNode = {
    id: string;
    node: ReactNode;
    isClosing?: boolean;
    onClose?: () => void;
};

type Ctx = {
    open: (render: (id: string) => ReactNode, onClose?: () => void) => string;
    close: (id: string) => void;
    closeAll: () => void;
}

const ModalCtx = createContext<Ctx | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => {
    const ctx = useContext(ModalCtx);
    if (!ctx) throw new Error("useModal must be used within a ModalProvider");
    return ctx
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [modals, setModals] = useState<ModalNode[]>([]);

    const open: Ctx["open"] = (render, onClose) => {
        const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
        const node = render(id);
        setModals(m => [...m, { id, node, onClose, isClosing: false }]);
        return id;
    }

    const close: Ctx["close"] = id => {
        setModals(m => m.map(x => x.id === id ? { ...x, isClosing: true } : x));
    };

    const closeAll = () =>setModals(m => m.map(x => ({ ...x, isClosing: true })));

    return (
        <ModalCtx.Provider value={{ open, close, closeAll}}>
            {children}

            {modals.map(({ id, node, isClosing }) => (
                <Transition key={id} appear show={!isClosing} as={Fragment} afterLeave={() => setModals(m => m.filter(x => x.id !== id))}>
                    <Dialog as="div" className="relative z-50" onClose={() => close(id)}>
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <DialogBackdrop className="fixed inset-0 bg-black/20" />
                        </TransitionChild>
                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-out duration-200"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-150"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <DialogPanel className="w-full max-w-xl rounded-3xl border border-white/60 bg-white/90 p-0 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
                                        {node}
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            ))}
        </ModalCtx.Provider>
    )
}
