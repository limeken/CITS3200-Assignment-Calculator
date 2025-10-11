from flask import Blueprint, request, jsonify, abort, current_app
from uuid import uuid4
from datetime import datetime, timezone
from app.services.generator import generate_milestones_for_plan

bp = Blueprint("plan", __name__, url_prefix="/plan")
bp.strict_slashes = False  # 👈 Accept /generate and /generate/

def _store():
    return current_app.config.setdefault("PLANS", {})

def _new_id():
    return str(uuid4())

@bp.route("/", methods=["POST"])
def create_plan():
    store = _store()
    data = request.get_json(force=True)
    title = str(data.get("title", "")).strip()
    start_date = str(data.get("start_date", "")).strip()
    assignments = data.get("assignments", [])

    if not title or not start_date or not isinstance(assignments, list):
        abort(400, description="Missing title, start_date, or assignments list")

    norm = []
    for i, a in enumerate(assignments):
        due = (a.get("due_date") or a.get("dueDate") or "").strip()
        if len(due) >= 10:
            due = due[:10]
        if not due:
            abort(400, description=f"assignments[{i}].due_date is required")

        norm.append({
            "id": a.get("id") or _new_id(),
            "unit": str(a["unit"]).strip(),
            "title": str(a["title"]).strip(),
            "type": (a.get("type") or "report").strip().lower(),
            "estimated_hours": float(a.get("estimated_hours") or 0),
            "start_date": start_date,
            "due_date": due,
            "dueDate": due,
        })

    plan_id = _new_id()
    store[plan_id] = {
        "plan_id": plan_id,
        "title": title,
        "start_date": start_date,
        "assignments": norm,
    }

    return jsonify(store[plan_id]), 201

@bp.route("/<plan_id>/generate", methods=["GET", "POST"])
@bp.route("/<plan_id>/generate/", methods=["GET", "POST"])  # 👈 Handles trailing slash
def generate(plan_id: str):
    store = _store()
    plan = store.get(plan_id)
    if not plan:
        abort(404, description="plan not found")

    print("DEBUG generate input:", {
        "ids": [a.get("id") for a in plan["assignments"]],
        "keys": [list(a.keys()) for a in plan["assignments"]]
    })

    try:
        generate_milestones_for_plan(plan)
        current_app.config.setdefault("METRICS", {
            "routes": {}, "exports": {"pdf": 0, "ics": 0}, "generated": 0
        })
        current_app.config["METRICS"]["generated"] += 1
        plan["updated_at"] = datetime.now(timezone.utc).isoformat()
    except ValueError as e:
        abort(400, description=str(e))

    return jsonify(plan)