import { useState } from "react";
import { createPlan, generateMilestones, exportPdf, exportIcs } from "../services/plan";

export default function DevExportTest() {
  const [planId, setPlanId] = useState<string | null>(null);
  const [log, setLog] = useState<string>("");

  async function createSamplePlan() {
    try {
      setLog("Creating sample plan…");
      const plan = await createPlan({
        title: "Dev Sample Plan",
        start_date: new Date().toISOString().slice(0, 10),
        assignments: [
          { unit: "CITS3200", title: "Sprint 3 Report", type: "report", due_date: "2025-10-20", estimated_hours: 10 },
          { unit: "CITS3007", title: "Secure Coding Quiz", type: "quiz", due_date: "2025-10-18", estimated_hours: 6 },
        ],
      });
      setPlanId(plan.plan_id);
      setLog(`Plan created: ${plan.plan_id}. Generating milestones…`);
      await generateMilestones(plan.plan_id);
      setLog("Milestones generated. Ready to export.");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setLog(`Error: ${e.message}`);
      } else {
        setLog(`Error: ${String(e)}`);
      }
    }
  }

  async function handlePdf() {
    if (!planId) {
      setLog("No plan yet. Click 'Create sample plan' first.");
      return;
    }
    await exportPdf(planId);
  }

  async function handleIcs() {
    if (!planId) {
      setLog("No plan yet. Click 'Create sample plan' first.");
      return;
    }
    await exportIcs(planId);
  }

  return (
    <div
      style={{ position: "fixed", right: 12, bottom: 12, zIndex: 9999 }}
      className="shadow-lg rounded-xl border bg-white p-3 space-y-2 max-w-sm"
    >
      <div className="font-semibold">Dev Export Test</div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={createSamplePlan} className="px-3 py-1 rounded bg-black text-white">
          Create sample plan
        </button>
        <button onClick={handlePdf} className="px-3 py-1 rounded border">
          Download PDF
        </button>
        <button onClick={handleIcs} className="px-3 py-1 rounded border">
          Download ICS
        </button>
      </div>
      <pre className="text-xs whitespace-pre-wrap">{log}</pre>
      {planId && <div className="text-xs text-gray-600">planId: {planId}</div>}
    </div>
  );
}
