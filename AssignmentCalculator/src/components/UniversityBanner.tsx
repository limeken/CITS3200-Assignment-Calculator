import SubmissionBanner from "./SubmissionBanner.tsx"
import type { SubmissionResult } from "./SubmissionBanner";

// UWA branded banner for university associated websites
export default function UniversityBanner({showNotification, setNotification, successful}: SubmissionResult) {
    return (
        <header className="fixed inset-x-0 top-0 z-50">
            <div className="border-b border-white/20 bg-gradient-to-r from-uwaBlue to-blue-600 text-white shadow-[0_32px_80px_-32px_rgba(79,70,229,0.8)]">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row sm:gap-6 sm:px-6 sm:py-4">
                    <a href="/" className="flex items-center justify-center rounded-full bg-white/10 px-4 py-2 backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" aria-label="UWA Home">
                        <img
                            src="http://static.weboffice.uwa.edu.au/visualid/core-rebrand/img/uwacrest/uwacrest-white.svg"
                            alt="UWA Crest"
                            className="h-14 w-auto sm:h-16"
                        />
                    </a>
                    <p className="text-center text-sm font-medium tracking-wide text-white/80 sm:hidden">
                        Academic Skills Centre
                    </p>
                </div>
            </div>
            <div className="bg-white/85 backdrop-blur border-b border-slate-200/70">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <h1 className="text-center text-2xl font-bold text-slate-900 sm:text-left sm:text-3xl">
                        Academic Skills Centre Assignment Date Calculator
                    </h1>
                </div>
            </div>
            <SubmissionBanner showNotification={showNotification} setNotification={setNotification} successful={successful} />
        </header>
    );
}
