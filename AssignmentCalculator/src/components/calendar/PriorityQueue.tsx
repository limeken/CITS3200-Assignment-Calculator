import { useState, useEffect } from "react";
import type { AssignmentCalendar } from "./CalendarTypes";
import { differenceInDays } from "date-fns";

// DATES: Use these to control warnings for Assignments Due Dates (Days in brackets)
// Notes: MED "Yellow" (cautious) and HIGH "RED" (due very soon)
const MED = (14)* 24 * 60 * 60 * 1000;
const HIGH = (5)* 24 * 60 * 60 * 1000;

const PriorityQueue: React.FC<{newest:AssignmentCalendar|null}> = ({newest}) => {
    const [sortedAssignments,setSortedAssignments] = useState<AssignmentCalendar[]>([]);

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
    const pickPriority = (end:Date, intensity:number) => {
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
            <div className="w-4/5 h-60 p-5 bg-slate-300 rounded-xl flex flex-row gap-4 items-center overflow-x-auto">
                {sortedAssignments.map((assignment)=>{
                    const { base, days} = pickPriority(assignment.end, 300);
                    return (
                        <div className={`h-full w-70 flex flex-col flex-shrink-0 rounded-lg bg-white overflow-hidden shadow-lg transition duration-300 ease-in-out hover:scale-105`}>
                            <h1 className={`text-lg font-bold w-full h-1/4 flex justify-center items-center ${base}`}>{`Due in: ${days} Days`}</h1>
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