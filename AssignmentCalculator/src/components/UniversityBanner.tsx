import SubmissionBanner from "./SubmissionBanner.tsx"
import type { SubmissionResult } from "./SubmissionBanner";

// UWA branded banner for university associated websites
export default function UniversityBanner({showNotification,setNotification,successful}:SubmissionResult){
    return (
        <header className="fixed w-full h-40 top-0 right-0 z-50 bg-uwaBlue text-white">
            <div className="h-3/5 mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <a href="/" className="focus:outline-none" aria-label="UWA Home">
                        <img
                            src="http://static.weboffice.uwa.edu.au/visualid/core-rebrand/img/uwacrest/uwacrest-white.svg"
                            alt="UWA Crest"
                            className="h-20 w-auto"
                        />
                    </a>
                </div>
            </div>
            <div className="flex items-center justify-between w-full h-2/5 bg-uwaGrey">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
                    <h1
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-uwaBlue text-left font-uwa">
                        Academic Skills Centre Assignment Date Calculator
                    </h1>
                </div>
            </div>
            <SubmissionBanner showNotification={showNotification} setNotification={setNotification} successful={successful}/>
        </header>
    );
}