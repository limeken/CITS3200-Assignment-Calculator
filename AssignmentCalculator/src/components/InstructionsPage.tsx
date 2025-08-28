import {useState} from 'react'
// Component for displaying the user website manual
export default function InstructionsPage(){
    // Denotes if the pop-up is currently showing or not
    const [isOpen, setIsOpen] = useState(false);
    return  (
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-4">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-uwaBlue text-white px-4 py-2 rounded-xl shadow-soft font-semibold"
                    >
                        Instructions
                    </button>

                    {/* Overlay */}
                    {isOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            aria-hidden="true"
                            onClick={() => setIsOpen(false)}
                        />
                    )}

                    {/* Modal */}
                    {isOpen && (
                        <div className="fixed inset-0 z-50 grid place-items-center">
                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="inst-title"
                                className="bg-white rounded-xl shadow-soft max-w-lg w-full mx-4 p-6"
                            >
                                <h2 id="inst-title" className="text-xl font-bold mb-4 text-uwaBlue">
                                    How to Use the Assignment Calculator
                                </h2>
                                <ul className="list-disc list-inside space-y-2 text-gray-800">
                                    <li>
                                        <strong>Purpose:</strong> Plan your assignment by breaking the work into
                                        manageable steps.
                                    </li>
                                    <li>
                                        <strong>Assessment Type:</strong> Choose the variety of assignment (Essay,
                                        Coding Project, Lab Sheet, Presentation).
                                    </li>
                                    <li>
                                        <strong>Dates:</strong> Pick your start date and due date.
                                    </li>
                                    <li>
                                        <strong>Plan Settings:</strong> Set how many hours per day you’ll commit.
                                    </li>
                                    <li>
                                        Click <em>Generate Plan</em> to create your study timeline.
                                    </li>
                                </ul>
                                <div className="mt-6 text-right">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="bg-uwaGrey text-black px-4 py-2 rounded-xl font-semibold"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )
        ;}