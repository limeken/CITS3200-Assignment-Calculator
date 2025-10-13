from flask import Blueprint, request, jsonify, abort
from typing import Any, Dict, List

from app.services import type_store

ALLOWED_ICONS = {
    "DocumentTextIcon",
    "AcademicCapIcon",
    "PresentationChartLineIcon",
    "BeakerIcon",
    "BookOpenIcon",
    "UserGroupIcon",
}
DEFAULT_ICON = "DocumentTextIcon"

bp_types = Blueprint("types", __name__, url_prefix="/types")


def _validate_payload(data: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(data, dict):
        abort(400, description="Request body must be a JSON object")

    cleaned: Dict[str, Any] = {}
    raw_id = data.get("id")
    if raw_id is not None and not isinstance(raw_id, str):
        abort(400, description="id must be a string if provided")
    if raw_id:
        cleaned["id"] = raw_id

    title = data.get("title")
    if not isinstance(title, str) or not title.strip():
        abort(400, description="title is required and must be a non-empty string")
    cleaned["title"] = title.strip()

    icon = data.get("icon")
    if icon is None:
        cleaned["icon"] = DEFAULT_ICON
    else:
        if not isinstance(icon, str):
            abort(400, description="icon must be a string if provided")
        icon_name = icon.strip()
        if icon_name not in ALLOWED_ICONS:
            abort(400, description="icon must be one of the supported Heroicons")
        cleaned["icon"] = icon_name

    description = data.get("description")
    if description is not None:
        if not isinstance(description, str):
            abort(400, description="description must be a string if provided")
        cleaned["description"] = description

    milestones = data.get("milestones")
    if not isinstance(milestones, list) or len(milestones) == 0:
        abort(400, description="milestones must be a non-empty array")

    normalised: List[Dict[str, Any]] = []
    for idx, milestone in enumerate(milestones):
        if not isinstance(milestone, dict):
            abort(400, description=f"milestones[{idx}] must be an object")
        name = milestone.get("name")
        if not isinstance(name, str) or not name.strip():
            abort(400, description=f"milestones[{idx}].name must be a non-empty string")
        effort = milestone.get("effort_percent")
        if not isinstance(effort, (int, float)):
            abort(400, description=f"milestones[{idx}].effort_percent must be a number")
        effort_int = int(effort)
        if effort_int < 0 or effort_int > 100:
            abort(400, description=f"milestones[{idx}].effort_percent must be between 0 and 100")
        normalised_item: Dict[str, Any] = {
            "name": name.strip(),
            "effort_percent": effort_int,
        }
        desc = milestone.get("description")
        if desc is not None:
            if not isinstance(desc, str):
                abort(400, description=f"milestones[{idx}].description must be a string")
            desc_clean = desc.strip()
            if desc_clean:
                normalised_item["description"] = desc_clean
        resources = milestone.get("resources")
        if resources is not None:
            if not isinstance(resources, list) or not all(isinstance(r, str) for r in resources):
                abort(400, description=f"milestones[{idx}].resources must be an array of strings")
            normalised_item["resources"] = resources
        normalised.append(normalised_item)

    cleaned["milestones"] = normalised
    return cleaned


@bp_types.get("")
def list_all():
    out = []
    for t in type_store.list_types().values():
        out.append({
            "id": t["id"],
            "title": t.get("title") or t["id"].title(),
            "milestone_count": len(t.get("milestones") or []),
        })
    return jsonify(out), 200


@bp_types.get("/metadata")
def metadata():
    meta = type_store.get_metadata()
    return jsonify({"generated_at": meta.get("generated_at")}), 200


@bp_types.get("/<tid>")
def get_one(tid: str):
    t = type_store.get_type(tid)
    if not t:
        abort(404, description="type not found")
    return jsonify(t), 200


@bp_types.post("")
def create_type():
    body = request.get_json(silent=True)
    payload = _validate_payload(body or {})
    saved = type_store.save_type(payload)
    return jsonify(saved), 201


@bp_types.put("/<tid>")
def update_type(tid: str):
    if not type_store.get_type(tid):
        abort(404, description="type not found")
    body = request.get_json(silent=True)
    payload = _validate_payload(body or {})
    payload["id"] = tid
    saved = type_store.save_type(payload)
    return jsonify(saved), 200


@bp_types.delete("/<tid>")
def delete_type(tid: str):
    ok = type_store.delete_type(tid)
    if not ok:
        abort(404, description="type not found or already deleted")
    return "", 204
