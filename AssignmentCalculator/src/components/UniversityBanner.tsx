// UWA branded banner for university associated websites
export default function UniversityBanner(){
    return (
        <header className="sticky top-0 z-50 bg-uwaBlue text-white">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                    <a href="/" className="focus:outline-none" aria-label="UWA Home">
                        <img
                            src="//static.weboffice.uwa.edu.au/visualid/core-rebrand/img/uwacrest/uwacrest-white.svg"
                            alt="UWA Crest"
                            className="h-20 w-auto"
                        />
                    </a>
                </div>
            </div>
        </header>
        );
    }