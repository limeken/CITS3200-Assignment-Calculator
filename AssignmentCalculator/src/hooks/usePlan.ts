import { useState } from "react";
import type { CreatePlanBody, Plan } from "../services/plan";
import { createPlan, generateMilestones, exportIcs, exportPdf } from "../services/plan";

export function usePlan() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createAndGenerate(body: CreatePlanBody) {
    setLoading(true); setError(null);
    try {
      const p = await createPlan(body);
      const g = await generateMilestones(p.plan_id);
      setPlan(g);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadIcs() {
    if (!plan) return;
    await exportIcs(plan.plan_id);
  }

  async function downloadPdf() {
    if (!plan) return;
    await exportPdf(plan.plan_id);
  }

  return { plan, loading, error, createAndGenerate, downloadIcs, downloadPdf };
}
