import React from "react";
import clsx from "clsx";

/* TODO: Arbitrary Box Props type */
type BoxProps = React.HTMLAttributes<HTMLDivElement> & {
    /** Tailwind bg-* (or any classes) to color this box; default is white */
    colorClass?: string;
};

/* TODO: Arbitrary Row typ  e */
type Row = {
    /** Unique id for the row */
    id: string;
    /** Boxes for this row, left→right; omit colorClass for default white */
    boxes: BoxProps[];
};

/* TODO: Arbitrary AssignmentCalendar props type*/
type AssignmentCalendarProps = {
    /** Rows of boxes; each row is independent */
    rows: Row[];
    /** Width class for each box (keep aspect square). Default w-16 */
    boxSizeClass?: string;
    /** Gap between boxes (Tailwind gap-*). Default gap-2 */
    gapClass?: string;
    /** Render “Week N” heading     every 7 columns */
    weekLabelPrefix?: string;
};



const DayBox: React.FC<
    BoxProps & { boxSizeClass: string }
> = ({ colorClass, className, boxSizeClass, ...rest }) => {
    return (
        <div
            className={clsx(
                // sizing
                "aspect-square rounded-md border",
                boxSizeClass,
                // default visual
                "bg-white border-gray-300",
                // allow override color
                colorClass,
                // hover animation
                "transition-transform duration-150 ease-out hover:scale-95",
                className
            )}
            {...rest}
        />
    );
};

const AssignmentCalendar: React.FC<AssignmentCalendarProps> = ({
                                                                          rows,
                                                                          boxSizeClass = "w-16",
                                                                          gapClass = "gap-2",
                                                                          weekLabelPrefix = "Week",
                                                                      }) => {
    const maxCols = Math.max(0, ...rows.map((r) => r.boxes.length));
    const numWeeks = Math.ceil(maxCols / 7);

    // Convert w-16 into a concrete pixel width for the grid template columns.
    // Tailwind w-16 = 4rem; fall back to 4rem if a custom class is used.
    const boxRem =
        boxSizeClass === "w-16"
            ? "4rem"
            : boxSizeClass.startsWith("w-[" )
                ? boxSizeClass.slice(3, -1)
                : "4rem";

    const gridStyle: React.CSSProperties = {
        gridTemplateColumns: `repeat(${maxCols}, ${boxRem})`,
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-max space-y-3">
                {/* Week headings row */}
                {maxCols > 0 && (
                    <div
                        className={clsx("grid", gapClass)}
                        style={gridStyle}
                        aria-hidden
                    >
                        {Array.from({ length: numWeeks }).map((_, i) => (
                            <div
                                key={`wk-${i}`}
                                className={clsx(
                                    "h-10 rounded-md border text-sm font-medium",
                                    "flex items-center justify-center",
                                    "bg-gray-100 text-gray-700 border-gray-300"
                                )}
                                style={{ gridColumn: `span ${Math.min(7, maxCols - i * 7)} / span ${Math.min(7, maxCols - i * 7)}` }}
                            >
                                {weekLabelPrefix} {i + 1}
                            </div>
                        ))}
                    </div>
                )}

                {/* Rows */}
                {rows.map((row) => (
                    <div
                        key={row.id}
                        className={clsx("grid", gapClass)}
                        style={gridStyle}
                    >
                        {Array.from({ length: maxCols }).map((_, colIdx) => {
                            const box = row.boxes[colIdx];
                            return (
                                <DayBox
                                    key={`${row.id}-${colIdx}`}
                                    boxSizeClass={boxSizeClass}
                                    // Default white; allow per-box override via colorClass/className
                                    colorClass={box?.colorClass}
                                    className={box?.className}
                                    {...(box ?? {})}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AssignmentCalendar;