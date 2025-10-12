import React, {createContext, useContext, useEffect, useRef, useState, type ReactNode} from "react";
import {Transition} from "@headlessui/react";
import { CheckIcon, ExclamationCircleIcon} from "@heroicons/react/24/solid";

type NotificationNode = {
    id: string;
    content: ReactNode;
    isClosing: boolean;
    success: boolean;
};

type NotifyOptions = {
    duration?: number;
    success?: boolean;
};

type NotificationContext = {
    notify: (content: ReactNode, options?: NotifyOptions) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
};

const NotificationCtx = createContext<NotificationContext | null>(null);

const DEFAULT_DURATION = 4000;

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
    const ctx = useContext(NotificationCtx);
    if (!ctx) throw new Error("useNotification must be used within a NotificationProvider");
    return ctx;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationNode[]>([]);
    const timers = useRef<Record<string, number>>({});

    useEffect(() => () => {
        Object.values(timers.current).forEach(timeoutId => window.clearTimeout(timeoutId));
        timers.current = {};
    }, []);

    const finalize = (id: string) => {
        setNotifications(existing => existing.filter(notification => notification.id !== id));
        if (timers.current[id]) {
            window.clearTimeout(timers.current[id]);
            delete timers.current[id];
        }
    };

    const dismiss: NotificationContext["dismiss"] = id => {
        if (timers.current[id]) {
            window.clearTimeout(timers.current[id]);
            delete timers.current[id];
        }
        setNotifications(existing => existing.map(notification => (
            notification.id === id ? { ...notification, isClosing: true } : notification
        )));
    };

    const dismissAll: NotificationContext["dismissAll"] = () => {
        Object.values(timers.current).forEach(timeoutId => window.clearTimeout(timeoutId));
        timers.current = {};
        setNotifications(existing => existing.map(notification => ({ ...notification, isClosing: true })));
    };

    const notify: NotificationContext["notify"] = (content, options) => {
        const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
        const duration = Math.max(0, options?.duration ?? DEFAULT_DURATION);
        const success = options?.success ?? true;

        setNotifications(existing => [...existing, { id, content, isClosing: false, success }]);

        timers.current[id] = window.setTimeout(() => dismiss(id), duration);

        return id;
    };

    return (
        <NotificationCtx.Provider value={{ notify, dismiss, dismissAll }}>
            {children}
            <div className="pointer-events-none fixed right-4 top-4 z-50 flex max-w-full flex-col gap-3">
                {notifications.map(({ id, content, isClosing, success }) => (
                    <Transition
                        key={id}
                        appear
                        show={!isClosing}
                        as={React.Fragment}
                        enter="transform ease-out duration-200"
                        enterFrom="opacity-0 translate-y-2"
                        enterTo="opacity-100 translate-y-0"
                        leave="transform ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-2"
                        afterLeave={() => finalize(id)}
                    >
                        <div
                            className={`pointer-events-auto w-72 rounded-lg p-4 text-sm shadow-lg ring-1 flex items-center justify-left gap-2 ${success
                                ? "bg-green-100 text-green-900 ring-green-500/20"
                                : "bg-red-100 text-red-900 ring-red-500/20"}`}
                        >
                            {success?<CheckIcon className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" />:<ExclamationCircleIcon className="h-5 w-5 text-rose-500 sm:h-6 sm:w-6" />}
                            <span>{content}</span>
                        </div>
                    </Transition>
                ))}
            </div>
        </NotificationCtx.Provider>
    );
};
