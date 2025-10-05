import { useState } from "react";
import { createPlan, generateMilestones, exportIcs, exportPdf } from "../services/plan";

export default function PlannerDemo() {
  const [planId, setPlanId] = useState<string | null>(null);
  const [log, setLog] = useState<string>("");

  async function handleGenerate() {
    setLog("Creating plan...");
    const plan = await createPlan({
      title: "Sprint 3 Plan",
      start_date: new Date().toISOString().slice(0, 10),
      assignments: [
        { unit: "CITS3200", title: "Sprint 3 Report", type: "report", due_date: "2025-10-20", estimated_hours: 10 },
        { unit: "CITS3007", title: "Secure Coding Quiz", type: "quiz", due_date: "2025-10-18", estimated_hours: 6 },
      ],
    });
    setPlanId(plan.plan_id);

    setLog(`Plan created: ${plan.plan_id}\nGenerating milestones...`);
    const withMilestones = await generateMilestones(plan.plan_id);
    setLog(`Milestones generated for ${withMilestones.assignments.length} assignments.`);
  }

  return (
    <div className="p-4 space-y-3">
      <button
        onClick={handleGenerate}
        className="px-4 py-2 rounded bg-black text-white hover:opacity-90"
      >
        Generate Plan
      </button>

      {planId && (
        <div className="flex gap-2">
          <button
            onClick={() => exportIcs(planId)}
            className="px-3 py-2 rounded border"
          >
            Download .ics
          </button>
          <button
            onClick={() => exportPdf(planId)}
            className="px-3 py-2 rounded border"
          >
            Download .pdf
          </button>
        </div>
      )}

      <pre className="bg-gray-100 p-3 text-sm whitespace-pre-wrap">{log}</pre>
    </div>
  );
}
