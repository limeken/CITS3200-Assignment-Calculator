# app/routes/export.py
from flask import Blueprint, current_app, abort, send_file
from app.services.pdf import build_plan_pdf

export_bp = Blueprint("export", __name__)

def _get_store():
    """
    Access the in-memory plans store.
    Prefer current_app.config['PLANS'] if you set it up in app/__init__.py.
    Otherwise, fall back to importing from the plan routes module.
    """
    store = current_app.config.get("PLANS")
    if store is not None:
        return store
    # Fallback: import _PLANS from routes.plan (works if that module defines it)
    from app.routes.plan import _PLANS  # type: ignore
    return _PLANS

@export_bp.get("/export/<plan_id>.pdf")
def export_pdf(plan_id: str):
    store = current_app.config.setdefault("PLANS", {})  # shared in-memory store
    plan = store.get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    pdf_bytes = build_plan_pdf(plan)
    return send_file(
        pdf_bytes,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"plan_{plan_id}.pdf",
    )
