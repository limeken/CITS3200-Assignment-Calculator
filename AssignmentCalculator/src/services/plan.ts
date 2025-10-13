// AssignmentCalculator/src/services/plan.ts
import { http, httpBlob, triggerDownload } from '../utils/http';

// ---- Types (align with backend JSON) ----
export type ISODate = string; // 'YYYY-MM-DD' or ISO 8601

export interface AssignmentInput {
  unit: string;
  title: string;
  type?: string;            // e.g. "report" | "lab" | "quiz"
  due_date: ISODate;        // keep snake_case to match backend (adjust if your backend expects camelCase)
  estimated_hours?: number; // optional for now
}

export interface Milestone {
  name: string;             // e.g., "Outline", "Draft", "Review"
  date: ISODate;
  hours?: number;
}

export interface PlanAssignment extends AssignmentInput {
  milestones?: Milestone[];
}

export interface Plan {
  plan_id: string;
  title: string;
  start_date?: ISODate | null;
  created_at?: string;
  updated_at?: string;
  assignments: PlanAssignment[];
}

export interface CreatePlanBody {
  title?: string;
  start_date?: ISODate;
  assignments?: AssignmentInput[];
}

// ---- Service functions ----

// Create a new plan
export async function createPlan(body: CreatePlanBody): Promise<Plan> {
  return await http<Plan>("/plan", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Fetch an existing plan
export async function getPlan(planId: string): Promise<Plan> {
  return await http<Plan>(`/plan/${encodeURIComponent(planId)}`, { method: "GET" });
}

// Update/replace a whole plan (if your backend supports PUT)
export async function updatePlan(planId: string, plan: Partial<Plan>): Promise<Plan> {
  return await http<Plan>(`/plan/${encodeURIComponent(planId)}`, {
    method: "PUT",
    body: JSON.stringify(plan),
  });
}

// Delete a plan (if supported)
export async function deletePlan(planId: string): Promise<void> {
  await http<void>(`/plan/${encodeURIComponent(planId)}`, { method: "DELETE" });
}

// Add a single assignment to a plan (matches typical REST in your repo)
export async function addAssignment(planId: string, assignment: AssignmentInput): Promise<Plan> {
  return await http<Plan>(`/plan/${encodeURIComponent(planId)}/assignments`, {
    method: "POST",
    body: JSON.stringify(assignment),
  });
}

// Generate milestones for all assignments in a plan
export async function generateMilestones(planId: string): Promise<Plan> {
  return await http<Plan>(`/plan/${encodeURIComponent(planId)}/generate`, {
    method: "GET",
  });
}

// Export ICS (downloads a file)
export async function exportIcs(planId: string, filename = `plan_${planId}.ics`): Promise<void> {
  const blob = await httpBlob(`/export/${encodeURIComponent(planId)}.ics`, { method: "GET" });
  triggerDownload(blob, filename);
}

// Export PDF (downloads a file)
export async function exportPdf(planId: string, filename = `plan_${planId}.pdf`): Promise<void> {
  const blob = await httpBlob(`/export/${encodeURIComponent(planId)}.pdf`, { method: "GET" });
  triggerDownload(blob, filename);
}

// ---- Convenience: end-to-end happy path ----
/**
 * Quickly create a plan, generate milestones, and return it.
 * Handy for wiring a single "Generate Plan" button in the UI.
 */
export async function createAndGenerate(body: CreatePlanBody): Promise<Plan> {
  const plan = await createPlan(body);
  return await generateMilestones(plan.plan_id);
}
