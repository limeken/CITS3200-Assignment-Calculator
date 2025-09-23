const TextualFormat: React.FC<{show:boolean}> = ({show}) => {
    return(
        <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6 ${show?"":"hidden"}`}>
            <div className="bg-slate-200 rounded-xl shadow-soft p-4">
            </div>
        </div>
    )
}
export default TextualFormat;