from flask import Blueprint, request, jsonify, abort, current_app
import uuid
from datetime import datetime, timezone

bp = Blueprint("plan", __name__)

def _store():
    # one shared in-memory dict across blueprints
    return current_app.config.setdefault("PLANS", {})

def _new_id():
    return str(uuid.uuid4())

@bp.post("")                     # POST /plan
def create_plan():
    body = request.get_json(silent=True) or {}
    plan_id = _new_id()
    plan = {
        "plan_id": plan_id,
        "created_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "assignments": body.get("assignments", []),
        "version": "v1",
    }
    _store()[plan_id] = plan
    return jsonify({"plan_id": plan_id}), 201

@bp.get("")                      # GET /plan  (handy for debugging)
def list_plans():
    return jsonify({"plans": list(_store().keys())})

@bp.get("/<plan_id>")            # GET /plan/<plan_id>
def get_plan(plan_id):
    plan = _store().get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    return jsonify(plan)

@bp.put("/<plan_id>")            # PUT /plan/<plan_id>
def put_plan(plan_id):
    store = _store()
    if plan_id not in store:
        abort(404, description="plan not found")
    body = request.get_json(silent=True) or {}
    # (You can add pydantic validation here later)
    updated = {
        "plan_id": plan_id,
        "created_utc": store[plan_id].get("created_utc"),
        "assignments": body.get("assignments", []),
        "version": "v1",
    }
    store[plan_id] = updated
    return jsonify(updated)

@bp.delete("/<plan_id>")         # DELETE /plan/<plan_id>
def delete_plan(plan_id):
    store = _store()
    if store.pop(plan_id, None) is None:
        abort(404, description="plan not found")
    return "", 204

@bp.post("/<plan_id>/assignments")                 # POST /plan/<plan_id>/assignments
def add_assignment(plan_id):
    store = _store()
    plan = store.get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    body = request.get_json(silent=True) or {}
    body["id"] = body.get("id") or _new_id()
    plan["assignments"].append(body)
    return jsonify(body), 201

@bp.get("/<plan_id>/generate")   # GET /plan/<plan_id>/generate
def generate_plan(plan_id):
    store = _store()
    plan = store.get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    from app.services.generator import generate_milestones_for_plan
    updated = generate_milestones_for_plan(plan)
    store[plan_id] = updated
    return jsonify(updated), 200
