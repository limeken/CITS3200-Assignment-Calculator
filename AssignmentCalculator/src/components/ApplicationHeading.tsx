// Component for displaying the application title banner
export default function ApplicationHeading(){
    return (<div className="sticky bg-uwaGrey">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
                    <h1
                        className="text-2xl font-bold text-uwaBlue text-left font-uwa">
                        Academic Skills Centre Assignment Date Calculator
                    </h1>
                </div>
            </div>
        );
    }