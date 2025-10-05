// AssignmentCalculator/src/services/plan.ts

// ---- Config ----
const API_BASE = import.meta.env.VITE_API_BASE ?? "/api"; // your proxy rewrites '/api' → backend root

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

export interface Assignment extends AssignmentInput {
  milestones?: Milestone[];
}

export interface Plan {
  plan_id: string;
  title: string;
  start_date?: ISODate | null;
  created_at?: string;
  updated_at?: string;
  assignments: Assignment[];
}

export interface CreatePlanBody {
  title?: string;
  start_date?: ISODate;
  assignments?: AssignmentInput[];
}

// ---- Helpers ----
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.error || data?.message || JSON.stringify(data);
    } catch {
      detail = await res.text();
    }
    throw new Error(`HTTP ${res.status} ${res.statusText}${detail ? `: ${detail}` : ""}`);
  }

  // Some endpoints return files; caller should use httpBlob for those
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

async function httpBlob(path: string, init?: RequestInit): Promise<Blob> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? `: ${txt}` : ""}`);
  }
  return await res.blob();
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
