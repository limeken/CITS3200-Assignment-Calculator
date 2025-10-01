import {ArrowDownTrayIcon, PlusIcon} from "@heroicons/react/24/solid";
import clsx from "clsx";

interface NewAssignmentButton {
    onImport: () => Promise<void> | void,
    modalOpenKey: () => void;
}

// Returns the buttons responsible for creating new assignments, and importing previously saved ones
const NewAssignmentButton: React.FC<NewAssignmentButton> = ({onImport, modalOpenKey}) => {
    const buttonStyle = "text-white bg-uwaBlue border-uwaBlue border-2 w-full h-full mt-3 rounded-xl font-semibold px-4 py-3 flex flex-row gap-2 items-center justify-start transition-all duration-170 ease-out hover:bg-white hover:text-uwaBlue";
    
    const floatingButtonStyle = "fixed bottom-6 w-14 h-14 rounded-full bg-uwaBlue text-white shadow-lg flex items-center justify-center transition-all duration-170 ease-out hover:scale-110 hover:shadow-xl z-50";
    
    return (
        <>
            {/* Desktop Layout - Horizontal buttons at top */}
            <section className="hidden lg:flex flex-row justify-center items-center gap-5 w-1/2 mx-auto">
                {/* New Assignment Button */}
                <button
                    onClick={modalOpenKey}
                    className={clsx(buttonStyle, "xl:col-span-2")}
                >
                    <PlusIcon className="h-5 w-5"/>
                    Create New Assignment
                </button>
                {/* Import Button */}
                <button
                    onClick={onImport}
                    className={clsx(buttonStyle)}
                >
                    <ArrowDownTrayIcon className="h-5 w-5"/>
                    Import
                </button>
            </section>

            {/* Mobile Layout - Circular floating buttons at bottom corners */}
            <div className="lg:hidden">
                {/* Create New Assignment - Bottom Left */}
                <button
                    onClick={modalOpenKey}
                    className={clsx(floatingButtonStyle, "left-6")}
                    aria-label="Create New Assignment"
                >
                    <PlusIcon className="h-6 w-6"/>
                </button>
                
                {/* Import - Bottom Right */}
                <button
                    onClick={onImport}
                    className={clsx(floatingButtonStyle, "right-6")}
                    aria-label="Import"
                >
                    <ArrowDownTrayIcon className="h-6 w-6"/>
                </button>
            </div>
        </>
    );
}

export default NewAssignmentButton;