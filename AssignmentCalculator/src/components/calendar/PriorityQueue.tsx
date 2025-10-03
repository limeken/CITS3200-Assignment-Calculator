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
    const pickPriorityColour = (end:Date) => {
        const current = Date.now()
        if(current > end.getTime() - MED && current < end.getTime() - HIGH){
            return "bg-yellow-200"
        }
        else if(current > end.getTime() - HIGH){
            return "bg-red-200"
        }
        else{return "bg-green-200"}
    }

    return(
            <div className="w-4/5 h-50 px-5 bg-slate-300 rounded-xl flex flex-row gap-4 items-center overflow-x-auto">
                {sortedAssignments.map((assignment)=>
                    <div className="w-60 h-40 flex-shrink-0 rounded-xl bg-white overflow-hidden">
                        <div className={`h-10 w-full flex items-center justify-center font-bold ${pickPriorityColour(assignment.end)}`}>
                            {`Due in: ${differenceInDays(assignment.end, Date.now())} Days`}
                        </div>
                    </div>
                    )
                }
            </div>
    )
}

export default PriorityQueue;