import React, { useCallback, useEffect, useRef, useState } from "react";
import "./index.css";
import { DocumentTextIcon, BeakerIcon, CubeIcon } from "@heroicons/react/24/solid";

// Import website components
import UniversityBanner from "./components/UniversityBanner.tsx";
import InstructionsModal from "./components/InstructionsModal.tsx";
import ApplicationHeading from "./components/ApplicationHeading.tsx";
import StudyPlanInputFields from "./components/StudyPlanInputFields.tsx";
import AssignmentModal from "./components/AssignmentModal.tsx";
import Calendar, { type CalendarRef } from "./components/Calendar.tsx";
import {
  type Assignment,
  type AssignmentEvent,
  parseIcsCalendar,
  pickRandomColor,
  validateCalendar,
} from "./components/CalendarTypes.ts";
import SubmissionModal from "./components/SubmissionModal.tsx";

// ---- Types & constants ----
export interface AssignmentType {
  id: number;
  name: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tasks: Array<string>;
}
export type StateFunctions = {
  setSelectedType: (name: string) => void;
  setStartDate: (start: Date) => void;
  setEndDate: (end: Date) => void;
};

export const TASKS: Array<AssignmentType> = [
  {
    id: 1,
    name: "Essay",
    Icon: DocumentTextIcon,
    tasks: [
      "Understand the question",
      "Initial research & sources",
      "Draft outline",
      "Write body paragraphs",
      "Write intro & conclusion",
      "Edit & proofread",
    ],
  },
  {
    id: 2,
    name: "Labsheet",
    Icon: BeakerIcon,
    tasks: ["I dont know", "what this really entails", "Im sure it's something useful."],
  },
  {
    id: 3,
    name: "Project",
    Icon: CubeIcon,
    tasks: ["Sprint 1", "Sprint 2", "Sprint 3", "Secret final sprint"],
  },
];

const DEFAULT: Assignment = {
  name: "Essay",
  color: "red",
  start: null,
  end: null,
  events: new Array<AssignmentEvent>(),
};

// Map UI type → backend type
function mapUiTypeToBackend(ui: string): string {
  const s = ui.toLowerCase();
  if (s.includes("essay")) return "essay";
  if (s.includes("lab")) return "lab";
  if (s.includes("present")) return "presentation";
  if (s.includes("exam")) return "exam_prep";
  if (s.includes("report")) return "report";
  return "other";
}

// Convert backend milestone payload → CalendarTypes AssignmentEvent[]
function milestonesToEvents(milestones: Array<{ name: string; date: string }>): AssignmentEvent[] {
  return milestones.map((m) => {
    const d = new Date(`${m.date}T00:00:00`);
    const ev: any = {
      title: m.name,
      date: d,
      name: m.name,
      start: d,
    };
    return ev as AssignmentEvent;
  });
}

// ---- Main ----
export default function App() {
  const [validAssignment, setValidAssignment] = useState<Assignment>(DEFAULT);
  const [errors, setErrors] = useState<Array<boolean>>([true, true, true]);
  const calRef = useRef<CalendarRef>(null);

  // submission modal details
  const [assignmentName, setAssignmentName] = useState("");
  const [unitCode, setUnitCode] = useState("");

  type ModalKey = "instructions" | "assignment" | "submission";
  const [modals, setModals] = useState<Record<ModalKey, boolean>>({
    instructions: false,
    assignment: false,
    submission: false,
  });
  const openModal = (key: ModalKey) =>
    setModals({ instructions: false, assignment: false, submission: false, [key]: true });
  const closeModal = (key: ModalKey) => setModals((prev) => ({ ...prev, [key]: false }));

  const stateFunctions: StateFunctions = {
    setSelectedType: (name: string) => {
      setValidAssignment((prev) => ({ ...prev, name }));
      console.log(`set calendar name to: ${name}`);
    },
    setStartDate: (start: Date) => {
      setValidAssignment((prev) => ({ ...prev, start }));
      console.log(`set calendar start to: ${start}`);
    },
    setEndDate: (end: Date) => {
      setValidAssignment((prev) => ({ ...prev, end }));
      console.log(`set calendar end to: ${end}`);
    },
  };

  // ---- Backend integration state ----
  const [planId, setPlanId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

  // Create a plan once on load
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignments: [] }),
        });
        const data = await r.json();
        setPlanId(data.plan_id);
      } catch (e) {
        console.error("Failed to create plan", e);
      }
    })();
  }, []);

  // Helper: POST the current assignment to backend
  async function addCurrentAssignmentToBackend() {
    if (!planId) throw new Error("Plan not ready yet.");

    if (!validAssignment.start || !validAssignment.end) {
      throw new Error("Please select start and end dates first.");
    }

    const payload = {
      unit_code: (unitCode || "CITS3200").trim(),
      title: (assignmentName || validAssignment.name || "Assignment").trim(),
      type: mapUiTypeToBackend(validAssignment.name || "other"),
      start_date: validAssignment.start.toISOString().slice(0, 10),
      due_date:   validAssignment.end.toISOString().slice(0, 10),
    };

    const r = await fetch(`/api/plan/${planId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error("Backend rejected assignment");
    return r.json();
  }

  // Helper: fetch milestones and draw them
  function clearCalendar() {
    setCalendarKey((k) => k + 1);
  }

  async function regenerateFromBackendAndDraw() {
    if (!planId) throw new Error("Plan not ready yet.");

    const r = await fetch(`/api/plan/${planId}/generate`);
    if (!r.ok) throw new Error("Failed to generate milestones");
    const data = await r.json();

    clearCalendar();

    for (const a of data.assignments as Array<{
      id: string; unit_code: string; title: string; type: string;
      start_date: string; due_date: string;
      milestones?: Array<{ name: string; date: string }>;
    }>) {
      const events = milestonesToEvents(a.milestones || []);
      const calAssignment: Assignment = {
        name: a.title || "Assignment",
        unitCode: a.unit_code || "UNIT",
        color: pickRandomColor(),
        start: new Date(`${a.start_date}T00:00:00`),
        end:   new Date(`${a.due_date}T00:00:00`),
        events,
      };
      await calRef.current?.addAssignment(calAssignment);
    }
  }

  // Your existing “Generate” button behaviour (kept)
  const generateCalendar = useCallback(() => {
    const new_errors = validateCalendar(validAssignment);
    if (new_errors.some((ok) => !ok)) {
      setErrors(new_errors);
      return;
    }
    openModal("submission");
  }, [validAssignment]);

  // When the modal submits, run the full backend flow
  const handleModalSubmit = async () => {
    const name = assignmentName.trim();
    const unit = unitCode.trim();
    if (!name || !unit) return;

    const errs = validateCalendar(validAssignment);
    if (errs.some((ok) => !ok)) {
      setErrors(errs);
      return;
    }

    try {
      setBusy(true);

      // 1) Save assignment to backend
      await addCurrentAssignmentToBackend();

      // 2) Generate milestones and draw them
      await regenerateFromBackendAndDraw();

      // 3) Close modal & reset
      closeModal("submission");
      setAssignmentName("");
      setUnitCode("");
    } catch (e) {
      console.error(e);
      alert("Something went wrong talking to the backend. Check console.");
    } finally {
      setBusy(false);
    }
  };

  const handleImportCalendar = async () => {
    const parsedCal: Assignment = await parseIcsCalendar("/fake_calendar.ics");
    const next: Assignment = { ...parsedCal, name: "import", unitCode: "import", color: "orange" };
    setValidAssignment(next);
    await calRef.current?.addAssignment(next);
  };

  // ---- UI ----
  return (
    <>
      {/* University Banner */}
      <UniversityBanner />

      {/* Application Title Bar */}
      <ApplicationHeading />

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 mt-4 space-x-2">
        <button
          type="button"
          onClick={() => openModal("instructions")}
          className="inline-flex items-center rounded-md bg-uwaBlue px-3 py-2 text-white hover:bg-slate-700"
        >
          View instructions
        </button>
      </div>

      {/* Inputs */}
      <StudyPlanInputFields
        stateFunctions={stateFunctions}
        errors={errors}
        onImport={handleImportCalendar}
        onGenerate={generateCalendar}
        onShowAssignmentHelp={() => openModal("assignment")}
      />

      <section className={"mx-auto w-full max-w-6xl px-4 sm:px-6 mt-6"}>
        <div className="bg-slate-200 rounded-xl shadow-soft p-4">
          <Calendar ref={calRef} key={calendarKey} />
        </div>
      </section>

      {/* Modals */}
      <SubmissionModal
        isOpen={modals.submission}
        onClose={() => closeModal("submission")}
        assignmentName={assignmentName}
        setAssignmentName={setAssignmentName}
        unitCode={unitCode}
        setUnitCode={setUnitCode}
        onSubmit={handleModalSubmit}
        busy={busy}
      />
      <InstructionsModal isOpen={modals.instructions} onClose={() => closeModal("instructions")} />
      <AssignmentModal isOpen={modals.assignment} onClose={() => closeModal("assignment")} />
    </>
  );
}
