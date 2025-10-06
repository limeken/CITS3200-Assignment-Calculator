from flask import Blueprint, request, jsonify, abort, current_app
import uuid
from datetime import datetime, timezone
from app.services.generator import generate_milestones_for_plan

bp = Blueprint("plan", __name__, url_prefix="/plan")

def _store():
    return current_app.config.setdefault("PLANS", {})

def _new_id():
    from uuid import uuid4
    return str(uuid4())

@bp.post("")  # POST /plan
def create_plan():
    body = request.get_json(silent=True) or {}
    title = body.get("title") or "Study Plan"
    start_date = body.get("start_date")  # optional
    assignments = body.get("assignments") or []

    if not isinstance(assignments, list):
        abort(400, description="assignments must be a list")
    for i, a in enumerate(assignments):
        if not isinstance(a, dict):
            abort(400, description=f"assignments[{i}] must be an object")
        for key in ("unit", "title", "due_date"):
            if not a.get(key):
                abort(400, description=f"assignments[{i}].{key} is required")

    plan_id = _new_id()
    now = datetime.now(timezone.utc).isoformat()
    plan = {
        "plan_id": plan_id,
        "title": title,
        "start_date": start_date,
        "created_at": now,
        "updated_at": now,
        "assignments": assignments,
    }
    _store()[plan_id] = plan
    return jsonify(plan), 201

@bp.get("")  # GET /plan
def list_plans():
    return jsonify({"plans": list(_store().keys())})

@bp.get("/<plan_id>")
def get_plan(plan_id):
    plan = _store().get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    return jsonify(plan)

@bp.put("/<plan_id>")  # PUT /plan/<plan_id>
def put_plan(plan_id):
    store = _store()
    if plan_id not in store:
        abort(404, description="plan not found")
    body = request.get_json(silent=True) or {}
    updated = {
        "plan_id": plan_id,
        "created_utc": store[plan_id].get("created_utc"),
        "assignments": body.get("assignments", []),
        "version": "v1",
    }
    store[plan_id] = updated
    return jsonify(updated)

@bp.delete("/<plan_id>")  # DELETE /plan/<plan_id>
def delete_plan(plan_id):
    store = _store()
    if store.pop(plan_id, None) is None:
        abort(404, description="plan not found")
    return "", 204

@bp.post("/<plan_id>/assignments")  # POST /plan/<plan_id>/assignments
def add_assignment(plan_id):
    store = _store()
    plan = store.get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    body = request.get_json(silent=True) or {}
    body["id"] = body.get("id") or _new_id()
    plan["assignments"].append(body)
    return jsonify(body), 201

@bp.patch("/<plan_id>/assignments/<aid>")  # PATCH /plan/<plan_id>/assignments/<aid>
def edit_assignment(plan_id, aid):
    plan = _store().get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    body = request.get_json(silent=True) or {}
    for a in plan["assignments"]:
        if a.get("id") == aid:
            a.update({k: v for k, v in body.items() if k in {
                "unit", "title", "type", "due_date", "estimated_hours"}})
            plan["updated_at"] = datetime.now(timezone.utc).isoformat()
            return jsonify(plan)
    abort(404, description="assignment not found")

@bp.delete("/<plan_id>/assignments/<aid>")  # DELETE /plan/<plan_id>/assignments/<aid>
def delete_assignment(plan_id, aid):
    plan = _store().get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    before = len(plan["assignments"])
    plan["assignments"] = [a for a in plan["assignments"] if a.get("id") != aid]
    if len(plan["assignments"]) == before:
        abort(404, description="assignment not found")
    plan["updated_at"] = datetime.now(timezone.utc).isoformat()
    return "", 204

@bp.get("/<plan_id>/assignments")  # GET /plan/<plan_id>/assignments
def list_assignments(plan_id):
    plan = _store().get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    q = request.args
    from_d, to_d = q.get("from"), q.get("to")
    unit, a_type = q.get("unit"), q.get("type")

    def ok(a):
        if unit and a.get("unit") != unit: return False
        if a_type and (a.get("type") or "").lower() != a_type.lower(): return False
        if from_d and a.get("due_date") < from_d: return False
        if to_d and a.get("due_date") > to_d: return False
        return True

    return jsonify([a for a in plan["assignments"] if ok(a)])

@bp.get("/<plan_id>.json")  # GET /plan/<plan_id>.json
def export_json(plan_id):
    plan = _store().get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    return jsonify(plan)

@bp.post("/import")  # POST /plan/import
def import_plan():
    payload = request.get_json(silent=True) or {}
    if "plan" not in payload:
        abort(400, description="missing plan")
    plan = payload["plan"]
    plan["plan_id"] = _new_id()
    _store()[plan["plan_id"]] = plan
    return jsonify(plan), 201

@bp.get("/<plan_id>/generate")  # GET /plan/<plan_id>/generate
def generate(plan_id: str):
    store = _store()
    plan = store.get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    try:
        generate_milestones_for_plan(plan)
        current_app.config["METRICS"]["generated"] += 1
        plan["updated_at"] = datetime.now(timezone.utc).isoformat()
    except ValueError as e:
        abort(400, description=str(e))
    return jsonify(plan)
