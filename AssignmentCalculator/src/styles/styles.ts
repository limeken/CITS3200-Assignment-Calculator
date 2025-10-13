import clsx from "clsx";

/**
 * Centralises frequently reused Tailwind utility clusters so they can be edited in one spot.
 * Compose these exports with component-specific spacing using `clsx` or template literals.
 */

export const pageSection = "mx-auto w-full max-w-6xl px-4 sm:px-6";

const pillButtonBase = "inline-flex items-center justify-center rounded-lg font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export const primaryPillButton = clsx(
    pillButtonBase,
    "bg-blue-700 text-white",
    "shadow-[0_24px_55px_-28px_rgba(79,70,229,0.7)]",
    "hover:shadow-[0_32px_65px_-32px_rgba(67,56,202,0.75)]",
    "focus-visible:outline-purple-500"
);

export const secondaryPillButton = clsx(
    pillButtonBase,
    "border border-slate-200/70 bg-white/85 text-slate-700",
    "shadow-[0_18px_45px_-30px_rgba(15,23,42,0.5)]",
    "hover:border-slate-300 hover:text-blue-500 hover:shadow-[0_24px_55px_-32px_rgba(79,70,229,0.45)]",
    "focus-visible:outline-slate-400"
);

export const floatingActionButtonBase = "flex items-center justify-center rounded-full bg-blue-800 text-white shadow-lg transition-all duration-170 ease-out hover:scale-110 hover:shadow-xl";
export const floatingActionButtonFrame = "fixed bottom-6 h-14 w-14 z-50";
