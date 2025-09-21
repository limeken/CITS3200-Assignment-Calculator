from flask import Blueprint, request, jsonify, abort
import uuid
from datetime import datetime

bp = Blueprint("plan", __name__)

# very simple in-memory store for now
_PLANS = {}

def _new_id():
    return str(uuid.uuid4())

@bp.post("")
def create_plan():
    body = request.get_json(silent=True) or {}
    plan_id = _new_id()
    plan = {
        "plan_id": plan_id,
        "created_utc": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "assignments": body.get("assignments", []),
        "version": "v1",
    }
    _PLANS[plan_id] = plan
    return jsonify({"plan_id": plan_id}), 201

@bp.get("/<plan_id>")
def get_plan(plan_id):
    plan = _PLANS.get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    return jsonify(plan)

@bp.put("/<plan_id>")
def put_plan(plan_id):
    if plan_id not in _PLANS:
        abort(404, description="plan not found")
    body = request.get_json(silent=True) or {}
    # TODO: validate with pydantic in next step
    body["plan_id"] = plan_id
    body["version"] = "v1"
    _PLANS[plan_id] = body
    return jsonify(_PLANS[plan_id])

@bp.delete("/<plan_id>")
def delete_plan(plan_id):
    if _PLANS.pop(plan_id, None) is None:
        abort(404, description="plan not found")
    return "", 204

@bp.post("/<plan_id>/assignments")
def add_assignment(plan_id):
    plan = _PLANS.get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    body = request.get_json(silent=True) or {}
    body["id"] = body.get("id") or _new_id()
    plan["assignments"].append(body)
    return jsonify(body), 201
