import "./index.css";

// Import website components from components subfolder
import UniversityBanner from "./components/UniversityBanner.tsx"
import { InstructionsButton } from "./components/Instructions.tsx"

import Calendar from "./components/calendar/Calendar.tsx";

// Main application component
export default function App() {
    // This returns the finalised webpage, including all key components
    return (
        <>
            {/* University Banner */}
            <UniversityBanner/>

            <main className="flex flex-col gap-4 sm:gap-6">
                {/* Button which triggers the instructions modal*/}
                <InstructionsButton />

                {/* Displays either the calendar or textual visualisation */}
                <Calendar/>
            </main>
        </>
    );
}
