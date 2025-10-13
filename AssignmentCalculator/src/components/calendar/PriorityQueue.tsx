import { useState, useEffect, useMemo } from "react";
import type { AssignmentCalendar } from "./CalendarTypes";
import { differenceInDays } from "date-fns";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { useModal } from "../../providers/ModalProvider";
import { useAssignmentTypeLibrary } from "../../providers/assignmentTypeHooks.ts";

import Submission from "../Submission";
// DATES: Use these to control warnings for Assignments Due Dates (Days in brackets)
// Notes: MED "Yellow" (cautious) and HIGH "RED" (due very soon)
const MED = (14)* 24 * 60 * 60 * 1000;
const HIGH = (5)* 24 * 60 * 60 * 1000;

const PriorityQueue: React.FC<{newest:AssignmentCalendar|null, onUpdate: (oldAssignment: AssignmentCalendar, newAssignment: AssignmentCalendar) => void, onDelete: (assignment:AssignmentCalendar) => void, assignments: Record<string, AssignmentCalendar[]>}> =
({newest, onUpdate, onDelete, assignments}) => {
    // Keeps track of the currently sorted list of assignments
    const [sortedAssignments,setSortedAssignments] = useState<AssignmentCalendar[]>([]);

    // Used to delete stale assignments once main assignment list is updated
    const deleteAssignment = (assignment:AssignmentCalendar) => { setSortedAssignments((prev) =>{return [...prev].filter(a => a !== assignment);})}

    // Reopen modified submission modal for editing
    const {open, close} = useModal();
    const { data: library } = useAssignmentTypeLibrary();
    const assignmentLabels = useMemo<Record<string, string>>(() => {
        const map: Record<string, string> = {};
        (library?.assignments ?? []).forEach((assignment) => {
            map[assignment.id] = assignment.name;
            map[assignment.name] = assignment.name;
            map[assignment.name.toLowerCase()] = assignment.name;
        });
        return map;
    }, [library]);
    const openResubmission = (selected:AssignmentCalendar) => {
        open((id) => (
            <Submission
                submission={selected}
                isNew={false}
                assignments={assignments}
                onUpdate={async (o,n) => {
                    {/* This wipes assignment memory from priority queue */}
                    deleteAssignment(selected);
                    onUpdate(o,n);
                    close(id);
                }}
                onDelete={async (a) => {
                    deleteAssignment(selected);
                    onDelete(a);
                    close(id);
                }}
                onClose={() => close(id)}
            />
        ))
    };

    // Insertion Sort Implementation to sort each new assignment
    // TODO: dude why did we write our own insertion sort lol
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
    useEffect(() => {
        if (!newest) return;
        setSortedAssignments(prev => insertionSort(prev, newest));
    }, [newest]);

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
            <div className={`w-4/5 bg-slate-200 rounded-xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col gap-2
                ${sortedAssignments.length===0?"scale-x-0 opacity-0 overflow-hidden":"scale-x-100 p-4 opacity-100 overflow-x-auto"}`}>
                    <hr className="border-slate-400"/>
                    <div className="flex flex-row gap-4 my-2">
                        {sortedAssignments.map((assignment)=>{
                            const { base, days} = pickPriority(assignment.end);
                            const typeKey = assignment.assignmentType ?? "";
                            const typeLabel = assignmentLabels[typeKey.toLowerCase()] ?? assignmentLabels[typeKey] ?? assignment.assignmentType;
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
                                    <p className="p-2 border-b border-slate-200 text-sm"><span className="font-semibold">Type: </span>{typeLabel}</p>
                                    <p className="p-2 text-sm"><span className="font-semibold">Due Date: </span>{assignment.end.toISOString().substring(0, 10).replaceAll("-","/")}</p>
                                </div>
                                )
                                }
                            )
                        }
                    </div>
                    <hr className="border-slate-400"/>
            </div>
        )
}

export default PriorityQueue;
