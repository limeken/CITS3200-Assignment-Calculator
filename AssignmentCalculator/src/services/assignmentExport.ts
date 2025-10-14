import { http, httpBlob, triggerDownload } from '../utils/http';
import type { AssignmentCalendar } from '../components/calendar/CalendarTypes';

export async function exportAssignmentPdf(
  assignment: AssignmentCalendar,
  filename?: string,
): Promise<void> {
  const today = new Date();
  const startDate = assignment.start instanceof Date && !Number.isNaN(assignment.start.getTime())
    ? assignment.start
    : today;
  const endDate = assignment.end instanceof Date && !Number.isNaN(assignment.end.getTime())
    ? assignment.end
    : startDate;

  const planTitle = `${assignment.unitCode ?? 'Assignment'} - ${assignment.name ?? 'Plan'}`.trim();
  const planBody = {
    title: planTitle || 'Assignment Plan',
    start_date: startDate.toISOString().slice(0, 10),
    assignments: [
      {
        unit: assignment.unitCode ?? 'Unit',
        title: assignment.name ?? 'Assignment',
        type: assignment.assignmentType ?? 'report',
        estimated_hours: 0,
        due_date: endDate.toISOString().slice(0, 10),
      },
    ],
  };

  const plan = await http<{ plan_id: string } & Record<string, unknown>>('/plan', {
    method: 'POST',
    body: JSON.stringify(planBody),
  });

  const planId = String(plan.plan_id ?? '').trim();
  if (!planId) {
    throw new Error('Failed to create plan for export');
  }

  try {
    await http(`/plan/${encodeURIComponent(planId)}/generate`, { method: 'GET' });
  } catch (err) {
    console.warn('Plan generation failed, continuing without generated milestones', err);
  }

  const blob = await httpBlob(`/export/${encodeURIComponent(planId)}.pdf`, { method: 'GET' });

  const defaultName = `${assignment.unitCode ?? 'assignment'}-${assignment.name ?? 'plan'}`
    .replace(/[^a-z0-9._-]+/gi, '_')
    .slice(0, 80);

  triggerDownload(blob, filename ?? `${defaultName || 'assignment'}.pdf`);
}
