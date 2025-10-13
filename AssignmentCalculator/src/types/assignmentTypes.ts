export type AssignmentMilestone = {
    name: string;
    effort_percent: number;
    description?: string | null;
    resources?: string[] | null;
};

export type AssignmentTypeSummary = {
    id: string;
    title: string;
    milestone_count: number;
};

export type AssignmentTypeDetail = {
    id: string;
    title: string;
    milestones: AssignmentMilestone[];
    description?: string | null;
    icon?: string | null;
};

export type AssignmentTypeInput = {
    id?: string;
    title: string;
    milestones: AssignmentMilestone[];
    description?: string | null;
    icon?: string | null;
};
