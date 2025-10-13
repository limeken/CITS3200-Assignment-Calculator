export type SemesterDTO = {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    detail?: string;
};

export type SemesterInput = {
    name: string;
    start_date: string;
    end_date: string;
    detail?: string;
};
