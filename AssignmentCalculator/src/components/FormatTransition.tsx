import React, {type ReactNode, Fragment} from "react";
import {Transition} from "@headlessui/react";

const FormatTransition: React.FC<{show: boolean; children: ReactNode}> = ({ show, children }) => {
    return(
        <Transition appear show={show}
                    as="div"
                    unmount={false}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
        >
            {children}
        </Transition>
    )
}
export default FormatTransition;