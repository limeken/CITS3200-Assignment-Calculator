import type { Assignment } from '../components/calendar/CalendarTypes';
import type { AssignmentTypeDetail } from '../types/assignmentTypes';
import { getAssignmentIcon } from './assignmentTypeIcons';

const describeEffort = (percent: number): string | null => {
  if (!Number.isFinite(percent) || percent <= 0) {
    return null;
  }
  return `Allocate about ${percent}% of your total effort to this milestone.`;
};

export const buildAssignmentFromDetail = (
  detail: AssignmentTypeDetail,
): Assignment => {
  const count = detail.milestones.length || 1;
  const fallbackPercentage = Math.round(100 / count);
  const icon = getAssignmentIcon(detail.icon ?? null);
  return {
    id: detail.id,
    name: detail.title || detail.id,
    icon,
    events: detail.milestones.map((milestone) => {
      const rawEffort = Number.isFinite(milestone.effort_percent)
        ? Number(milestone.effort_percent)
        : 0;
      const percentage = rawEffort > 0 ? rawEffort : fallbackPercentage;
      const instructions = [
        describeEffort(percentage),
        ...(milestone.description ? [milestone.description] : []),
      ].filter((line): line is string => Boolean(line));
      return {
        name: milestone.name,
        percentage,
        instructions,
        resources: milestone.resources ?? undefined,
      };
    }),
  };
};
