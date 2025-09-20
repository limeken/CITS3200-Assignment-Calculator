from flask import Flask, render_template_string

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>UWA Assignment Planner</title>
  <script src=\"https://cdn.tailwindcss.com\"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['\\"Source Sans Pro\\"', 'Arial', 'sans-serif'],
            uwa: ['\\"UWA Regular\\"', 'UWA', 'Georgia', 'serif']
          },
          colors: {
            uwaBlue: '#27348B',
            uwaGold: '#E2B600',
            uwaGrey: '#ececec'
          },
          borderRadius: {
            'xl': '0.75rem'
          },
          boxShadow: {
            'soft': '0 8px 30px rgba(0,0,0,0.08)'
          }
        },
        formatDate(dateStr){
          if(!dateStr) return '';
          const d = new Date(dateStr);
          return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      }
    }
  </script>
  <link href=\"https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap\" rel=\"stylesheet\">
  <script defer src=\"https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js\"></script>
</head>
<body class=\"min-h-screen bg-gray-50 text-gray-900 font-sans\" x-data=\"plannerApp()\" x-init=\"init()\">

  <!-- Top Bar -->
  <header class=\"bg-uwaBlue text-white\">
    <div class=\"max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between\">
      <div class=\"flex items-center\">
        <button type=\"button\" class=\"focus:outline-none\">
          <img src=\"//static.weboffice.uwa.edu.au/visualid/core-rebrand/img/uwacrest/uwacrest-white.svg\" alt=\"UWA Crest\" class=\"h-20 w-auto\">
        </button>
      </div>
      <div class=\"flex items-center gap-4\">
        <button class=\"p-2 rounded-full hover:bg-white/10\" aria-label=\"Menu\">
          <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\" class=\"w-7 h-7\"><path d=\"M4 6.75A.75.75 0 014.75 6h14.5a.75.75 0 010 1.5H4.75A.75.75 0 014 6.75zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H4.75A.75.75 0 014 12zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H4.75a.75.75 0 01-.75-.75z\"/></svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Grey Heading Bar -->
  <div class=\"bg-uwaGrey\">
    <div class=\"max-w-6xl mx-auto px-4 sm:px-6 py-6\">
      <h1 class=\"text-2xl font-bold text-uwaBlue text-left font-uwa\">Academic Skills Centre Assignment Date Calculator</h1>
    </div>
  </div>

  <!-- Instructions Button + Modal (wired up) -->
  <div class="max-w-6xl mx-auto px-4 sm:px-6 mt-4" x-data="{ open: false }">
    <button @click="open = true" class="bg-uwaBlue text-white px-4 py-2 rounded-xl shadow-soft font-semibold">Instructions</button>

    <!-- Overlay -->
    <div x-show="open" x-transition.opacity class="fixed inset-0 bg-black/50 z-40" @click="open = false" aria-hidden="true"></div>

    <!-- Modal -->
    <div x-show="open" x-transition class="fixed inset-0 z-50 grid place-items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="inst-title"
           class="bg-white rounded-xl shadow-soft max-w-lg w-full mx-4 p-6">
        <h2 id="inst-title" class="text-xl font-bold mb-4 text-uwaBlue">How to Use the Assignment Calculator</h2>
        <ul class="list-disc list-inside space-y-2 text-gray-800">
          <li><strong>Purpose:</strong> Plan your assignment by breaking the work into manageable steps.</li>
          <li><strong>Assessment Type:</strong> Choose the variety of assignment (Essay, Coding Project, Lab Sheet, Presentation).</li>
          <li><strong>Dates:</strong> Pick your start date and due date.</li>
          <li><strong>Plan Settings:</strong> Set how many hours per day you’ll commit.</li>
          <li>Click <em>Generate Plan</em> to create your study timeline.</li>
        </ul>
        <div class="mt-6 text-right">
          <button @click="open = false" class="bg-uwaGold text-black px-4 py-2 rounded-xl font-semibold">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Controls -->
  <section class=\"max-w-6xl mx-auto px-4 sm:px-6 mt-6\">
    <div class=\"grid lg:grid-cols-3 gap-4\">
    <!-- Assessment Type -->
      <div class=\"bg-uwaGold text-gray-900 rounded-xl shadow-soft p-4\">
        <h2 class=\"text-lg font-semibold mb-3\">Assessment Type</h2>
        <select x-model=\"selectedType\" class=\"w-full rounded-xl px-4 py-3 bg-white/20\">
          <option>Essay</option>
          <option>Coding Project</option>
          <option>Lab Sheet</option>
          <option>Presentation</option>
        </select>
      </div>

      <!-- Dates -->
      <div class=\"bg-uwaGold text-gray-900 rounded-xl shadow-soft p-4\">
        <h2 class=\"text-lg font-semibold mb-3\">Dates</h2>
        <div class=\"grid sm:grid-cols-2 gap-3\">
          <label class=\"block\">
            <span class=\"text-sm font-medium\">Start date</span>
            <input type=\"date\" x-model=\"startDate\" class=\"mt-1 w-full rounded-xl bg-white/20 px-3 py-2\">
          </label>
          <label class=\"block\">
            <span class=\"text-sm font-medium\">Due date</span>
            <input type=\"date\" x-model=\"dueDate\" class=\"mt-1 w-full rounded-xl bg-white/20 px-3 py-2\">
          </label>
        </div>
      </div>

      <!-- Plan Settings -->
      <div class=\"bg-uwaGold text-gray-900 rounded-xl shadow-soft p-4\">
        <h2 class=\"text-lg font-semibold mb-3\">Plan Settings</h2>
        <label class=\"block\">
          <span class=\"text-sm font-medium\">Effort per day (hrs)</span>
          <input type=\"number\" x-model=\"hoursPerDay\" step=\"0.5\" min=\"0.5\" class=\"mt-1 w-full rounded-xl bg-white/20 px-3 py-2\">
        </label>
        <button @click=\"generate()\" class=\"mt-3 w-full rounded-xl bg-uwaBlue text-white font-semibold px-4 py-3\">Generate Plan</button>
      </div>
    </div>
  </section>

  <!-- Study Plan -->
  <section class=\"max-w-6xl mx-auto px-4 sm:px-6 mt-6\">
    <div class=\"bg-uwaGold rounded-xl shadow-soft p-4\">
      <h2 class=\"text-xl font-bold\">Study Plan</h2>
      <ol class=\"mt-4 space-y-2\">
        <template x-for=\"s in schedule\">
          <li class=\"bg-white/40 rounded-xl px-4 py-3 flex justify-between\">
            <span x-text=\"s.task\"></span>
            <span x-text=\"s.date\"></span>
          </li>
        </template>
      </ol>
    </div>
  </section>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(TEMPLATE)

# --- API ADD-ON: paste this below your existing index() and above the __main__ block ---
from flask import request, jsonify, abort
import uuid
from datetime import datetime, date, timedelta
from pydantic import BaseModel, Field, ValidationError, field_validator
import re

APP_VERSION = "v1"

# In-memory store (ephemeral)
_PLANS: dict[str, dict] = {}

ALLOWED_TYPES = {"essay", "report", "lab", "presentation", "exam_prep", "other"}
UNIT_RE = re.compile(r"^[A-Z]{4}\d{4}$")

class MilestoneModel(BaseModel):
    name: str
    date: str  # ISO date (YYYY-MM-DD)

    @field_validator("date")
    @classmethod
    def valid_iso_date(cls, v):
        date.fromisoformat(v)  # raises if bad
        return v

class AssignmentModel(BaseModel):
    id: str | None = None
    unit_code: str = Field(...)
    title: str = Field(..., min_length=1)
    type: str = Field(...)
    start_date: str
    due_date: str
    milestones: list[MilestoneModel] | None = None

    @field_validator("unit_code")
    @classmethod
    def unit_fmt(cls, v):
        if not UNIT_RE.match(v):
            raise ValueError("unit_code must match ^[A-Z]{4}\\d{4}$ (e.g., CITS3200)")
        return v

    @field_validator("type")
    @classmethod
    def type_allowed(cls, v):
        if v not in ALLOWED_TYPES:
            raise ValueError(f"type must be one of {sorted(ALLOWED_TYPES)}")
        return v

    @field_validator("start_date", "due_date")
    @classmethod
    def iso_date(cls, v):
        date.fromisoformat(v)
        return v

    @field_validator("due_date")
    @classmethod
    def start_before_due(cls, v, info):
        try:
            sd = date.fromisoformat(info.data["start_date"])
            dd = date.fromisoformat(v)
            if not (sd < dd):
                raise ValueError("start_date must be before due_date")
        except KeyError:
            pass
        return v

class PlanModel(BaseModel):
    plan_id: str
    created_utc: str
    assignments: list[AssignmentModel] = []
    version: str = APP_VERSION

def _new_id() -> str:
    return str(uuid.uuid4())

@app.get("/healthz")
def healthz():
    return jsonify({"status": "ok", "version": APP_VERSION})

@app.post("/plan")
def create_plan():
    body = request.get_json(silent=True) or {}
    raw_assignments = body.get("assignments", [])
    # validate assignments
    try:
        assignments = [AssignmentModel(**a).model_dump() for a in raw_assignments]
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 422
    pid = _new_id()
    plan = PlanModel(
        plan_id=pid,
        created_utc=datetime.utcnow().isoformat(timespec="seconds") + "Z",
        assignments=assignments,
    ).model_dump()
    _PLANS[pid] = plan
    return jsonify({"plan_id": pid}), 201

@app.get("/plan/<plan_id>")
def get_plan(plan_id: str):
    plan = _PLANS.get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    return jsonify(plan)

@app.post("/plan/<plan_id>/assignments")
def add_assignment(plan_id: str):
    plan = _PLANS.get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    payload = request.get_json(silent=True) or {}
    if "id" not in payload or not payload["id"]:
        payload["id"] = _new_id()
    try:
        a = AssignmentModel(**payload).model_dump()
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 422
    plan["assignments"].append(a)
    return jsonify(a), 201

# --- very simple milestone generator (first pass) ---
TYPE_TEMPLATES = {
    "essay":        ["Research", "Outline", "Draft", "Revise", "Finalise"],
    "report":       ["Gather", "Analyse", "Draft", "Edit", "Finalise"],
    "lab":          ["Prep", "Experiment", "Analyse", "Writeup"],
    "presentation": ["Plan", "Draft", "Slides", "Rehearse", "Finalise"],
    "exam_prep":    ["Plan", "Study", "Practice", "Review"],
    "other":        ["Start", "Midpoint", "Finalise"],
}

def distribute_dates(start: date, due: date, n: int) -> list[date]:
    # even spread across [start, due-1], keep finalise <= 1 day before due
    span = max((due - start).days - 1, n)  # avoid zero/negative spans
    return [start + timedelta(days=round(i * span / (n))) for i in range(1, n + 1)]

def generate_for_assignment(a: dict) -> dict:
    start = date.fromisoformat(a["start_date"])
    due = date.fromisoformat(a["due_date"])
    names = TYPE_TEMPLATES.get(a["type"], TYPE_TEMPLATES["other"])
    dates = distribute_dates(start, due, len(names))
    # ensure last milestone not after due-1
    if dates:
        dates[-1] = min(dates[-1], due - timedelta(days=1))
    milestones = [{"name": n, "date": d.isoformat()} for n, d in zip(names, dates)]
    out = dict(a)
    out["milestones"] = milestones
    return out

@app.get("/plan/<plan_id>/generate")
def generate(plan_id: str):
    plan = _PLANS.get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    assignments = plan.get("assignments", [])
    # naive stagger: shift milestones for later items by +1 day if collision
    occupied = set()
    generated = []
    for idx, a in enumerate(assignments):
        g = generate_for_assignment(a)
        for m in g["milestones"]:
            d = date.fromisoformat(m["date"])
            while d.isoformat() in occupied:
                d += timedelta(days=1)
            m["date"] = d.isoformat()
            occupied.add(m["date"])
        generated.append(g)
    plan["assignments"] = generated
    return jsonify({"plan_id": plan_id, "assignments": generated, "version": APP_VERSION})
# --- end API ADD-ON ---

# ====== PLAN: UPDATE (PUT) & DELETE (DELETE) ======

@app.put("/plan/<plan_id>")
def update_plan(plan_id: str):
    """Replace the entire plan payload (assignments validated)."""
    if plan_id not in _PLANS:
        abort(404, description="plan not found")

    payload = request.get_json(silent=True) or {}
    raw_assignments = payload.get("assignments", [])

    # Validate assignments
    try:
        assignments = [AssignmentModel(**a).model_dump() for a in raw_assignments]
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 422

    # Keep metadata but replace assignments
    plan = _PLANS[plan_id]
    plan["assignments"] = assignments
    # keep plan_id/created_utc/version unchanged
    _PLANS[plan_id] = plan
    return jsonify(plan), 200


@app.delete("/plan/<plan_id>")
def delete_plan(plan_id: str):
    if _PLANS.pop(plan_id, None) is None:
        abort(404, description="plan not found")
    return "", 204


# ====== ASSIGNMENT: UPDATE (PUT) & DELETE (DELETE) ======

def _get_plan_or_404(plan_id: str) -> dict:
    plan = _PLANS.get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    return plan

def _find_assignment_index(plan: dict, assignment_id: str) -> int:
    for i, a in enumerate(plan.get("assignments", [])):
        if a.get("id") == assignment_id:
            return i
    return -1

@app.put("/plan/<plan_id>/assignments/<assignment_id>")
def update_assignment(plan_id: str, assignment_id: str):
    plan = _get_plan_or_404(plan_id)
    idx = _find_assignment_index(plan, assignment_id)
    if idx == -1:
        abort(404, description="assignment not found")

    incoming = request.get_json(silent=True) or {}
    incoming["id"] = assignment_id  # id is path-trusted

    # Validate merged assignment (allow partial fields)
    # Start with existing, overlay incoming
    merged = dict(plan["assignments"][idx])
    merged.update(incoming)
    try:
        validated = AssignmentModel(**merged).model_dump()
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 422

    plan["assignments"][idx] = validated
    return jsonify(validated), 200


@app.delete("/plan/<plan_id>/assignments/<assignment_id>")
def delete_assignment(plan_id: str, assignment_id: str):
    plan = _get_plan_or_404(plan_id)
    idx = _find_assignment_index(plan, assignment_id)
    if idx == -1:
        abort(404, description="assignment not found")

    del plan["assignments"][idx]
    return "", 204


if __name__ == '__main__':
    app.run(debug=True)

