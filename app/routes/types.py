from flask import Blueprint, request, jsonify, abort
from app.services import type_store

bp_types = Blueprint("types", __name__, url_prefix="/types")

@bp_types.get("")
def list_all():
    out = []
    for t in type_store.list_types().values():
        out.append({
            "id": t["id"],
            "title": t.get("title") or t["id"].title(),
            "milestone_count": len(t.get("milestones") or [])
        })
    return jsonify(out)

@bp_types.get("/<tid>")
def get_one(tid: str):
    t = type_store.get_type(tid)
    if not t:
        abort(404, description="type not found")
    return jsonify(t)

@bp_types.post("")
def create_type():
    body = request.get_json(silent=True) or {}
    if not body.get("milestones"):
        abort(400, description="milestones array is required")
    saved = type_store.save_type(body)
    return jsonify(saved), 201

@bp_types.put("/<tid>")
def update_type(tid: str):
    body = request.get_json(silent=True) or {}
    body["id"] = tid
    if not body.get("milestones"):
        abort(400, description="milestones array is required")
    saved = type_store.save_type(body)
    return jsonify(saved)

@bp_types.delete("/<tid>")
def delete_type(tid: str):
    ok = type_store.delete_type(tid)
    if not ok:
        abort(404, description="type not found or already deleted")
    return "", 204
