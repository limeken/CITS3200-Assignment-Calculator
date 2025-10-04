import { useState, useEffect } from "react";
import type { AssignmentCalendar } from "./CalendarTypes";
import { differenceInDays } from "date-fns";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { useModal } from "../../providers/ModalProvider";

import Submission from "../Submission";
// DATES: Use these to control warnings for Assignments Due Dates (Days in brackets)
// Notes: MED "Yellow" (cautious) and HIGH "RED" (due very soon)
const MED = (14)* 24 * 60 * 60 * 1000;
const HIGH = (5)* 24 * 60 * 60 * 1000;

const PriorityQueue: React.FC<{newest:AssignmentCalendar|null, onSubmit: (submission: AssignmentCalendar, isNew:boolean, oldSubmission: AssignmentCalendar) => void}> = ({newest,onSubmit}) => {
    // Keeps track of the currently sorted list of assignments
    const [sortedAssignments,setSortedAssignments] = useState<AssignmentCalendar[]>([]);

    // Used to delete stale assignments
    const deleteAssignment = (assignment:AssignmentCalendar) => { setSortedAssignments((prev) =>{return [...prev].filter(a => a !== assignment);})}

    // Reopen modified submission modal for editing
    const {open, close} = useModal();
    const openResubmission = (selected:AssignmentCalendar) => {
        open((id) => (
            <Submission 
                submission={selected} 
                isNew={false}
                errors={[false, false, false] }
                onSubmit={async (s,b,o) => {
                    deleteAssignment(selected);
                    onSubmit(s,b,o);
                    close(id);
                }}
                onClose={() => close(id)}
            />
        ))
    };

    // Insertion Sort Implementation to sort each new assignment
    const insertionSort = (list:AssignmentCalendar[], addition:AssignmentCalendar|null) => {
        if(addition === null){return list;}

        if(list.length === 0){
            return [addition];
        }

        const final = [...list, addition]
        
        let index = final.length-1;
        while(index > 0){
            if(differenceInDays(final[index].end, Date.now()) < differenceInDays(final[index-1].end, Date.now())){
                const current = final[index];
                final[index] = final[index-1];
                final[index-1] = current;
                index--;
                continue;
            }
            break
        }
        return final;
    }

    // Adds the newest assignment in sorted order, when a new assignment is created
    useEffect(() => {setSortedAssignments(insertionSort(sortedAssignments, newest))}, [newest])

    // Picks colour based on distance from due date
    const pickPriority = (end:Date) => {
        const current = Date.now()
        if(current > end.getTime() - MED && current < end.getTime() - HIGH){
            return {base:"bg-yellow-200", days:differenceInDays(end, Date.now())};
        }
        else if(current > end.getTime() - HIGH){
            return {base:"bg-red-200", days:differenceInDays(end, Date.now())};
        }
        else{return {base:"bg-green-200", days:differenceInDays(end, Date.now())}}
    }

    return(
            <div className={`w-4/5 bg-slate-300 rounded-xl transition-all duration-300 ease-in-out overflow-hidden flex flex-row gap-4
                ${sortedAssignments.length===0?"scale-x-0 opacity-0 overflow-hidden":"scale-x-100 p-4 opacity-100 overflow-x-auto"}`}>
                    {sortedAssignments.map((assignment)=>{
                        const { base, days} = pickPriority(assignment.end);
                        return (
                            <div className={`h-9/10 w-70 flex flex-col flex-shrink-0 rounded-lg bg-white overflow-hidden shadow-lg transition duration-300 ease-in-out hover:scale-105 relative`}>
                                <h1 className={`text-lg font-bold w-full h-1/4 flex justify-center items-center relative ${base}`}>
                                    <span>{`Due in: ${days} Days`}</span>
                                    <PencilSquareIcon className="w-5 h-5 text-white absolute right-5 top-1/2 -translate-y-1/2 hover:text-blue-300 transition-transform duration-300 hover:scale-120"
                                    onClick={()=>openResubmission(assignment)}
                                    />
                                </h1>
                                <p className="p-2 border-b border-slate-200 text-sm"><span className="font-semibold">Unit: </span>{assignment.unitCode}</p>
                                <p className="p-2 border-b border-slate-200 text-sm"><span className="font-semibold">Assignment: </span>{assignment.name}</p>
                                <p className="p-2 border-b border-slate-200 text-sm"><span className="font-semibold">Type: </span>{assignment.assignmentType}</p>
                                <p className="p-2 text-sm"><span className="font-semibold">Due Date: </span>{assignment.end.toISOString().substring(0, 10).replaceAll("-","/")}</p>
                            </div>
                            )
                            }
                        )
                    }
            </div>
        )
}

export default PriorityQueue;