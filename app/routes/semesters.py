from __future__ import annotations

from datetime import datetime
from flask import Blueprint, jsonify, request, abort

from app.services import semester_store

bp_semesters = Blueprint("semesters", __name__, url_prefix="/semesters")


def _parse_iso(date_str: str, field: str) -> str:
    try:
        datetime.fromisoformat(date_str)
    except ValueError:
        abort(400, description=f"{field} must be an ISO date (YYYY-MM-DD)")
    return date_str


@bp_semesters.get("")
def list_semesters():
    return jsonify(semester_store.list_semesters())


@bp_semesters.get("/<sid>")
def get_semester(sid: str):
    semester = semester_store.get_semester(sid.strip().lower())
    if not semester:
        abort(404, description="semester not found")
    return jsonify(semester)


@bp_semesters.post("")
def create_semester():
    body = request.get_json(silent=True) or {}

    name = (body.get("name") or "").strip()
    start_date = (body.get("start_date") or "").strip()
    end_date = (body.get("end_date") or "").strip()
    detail = (body.get("detail") or "").strip()

    if not name or not start_date or not end_date:
        abort(400, description="name, start_date, and end_date are required")

    _parse_iso(start_date, "start_date")
    _parse_iso(end_date, "end_date")

    if end_date < start_date:
        abort(400, description="end_date must be on or after start_date")

    payload = {
        "name": name,
        "start_date": start_date,
        "end_date": end_date,
    }
    if detail:
        payload["detail"] = detail

    try:
        saved = semester_store.save_semester(payload)
    except ValueError as exc:
        abort(400, description=str(exc))

    return jsonify(saved), 201


@bp_semesters.delete("/<sid>")
def delete_semester(sid: str):
    if not semester_store.delete_semester(sid.strip().lower()):
        abort(404, description="semester not found or already deleted")
    return "", 204
