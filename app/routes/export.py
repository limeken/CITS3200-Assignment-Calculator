# app/routes/export.py
from flask import Blueprint, current_app, abort, send_file, jsonify, request
from app.services.pdf import build_plan_pdf
from app.services.ics import build_plan_ics

# Blueprint with URL prefix for cleaner routing
export_bp = Blueprint("export", __name__, url_prefix="/export")

def _store():
    """Access the shared in-memory plan store."""
    return current_app.config.setdefault("PLANS", {})

def init_metrics(app):
    app.config["METRICS"] = {
        "routes": {},
        "exports": {"pdf": 0, "ics": 0},
        "generated": 0
    }

@export_bp.get("/<plan_id>.pdf")
def export_pdf(plan_id: str):
    plan = _store().get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    pdf_bytes = build_plan_pdf(plan)

    # Increment PDF export count
    current_app.config["METRICS"]["exports"]["pdf"] += 1

    return send_file(
        pdf_bytes,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"plan_{plan_id}.pdf",
    )

@export_bp.get("/<plan_id>.ics")
def export_ics(plan_id: str):
    plan = _store().get(plan_id)
    if not plan:
        abort(404, description="plan not found")
    ics_bytes = build_plan_ics(plan)

    # Increment ICS export count
    current_app.config["METRICS"]["exports"]["ics"] += 1

    return send_file(
        ics_bytes,
        mimetype="text/calendar",
        as_attachment=True,
        download_name=f"plan_{plan_id}.ics",
    )

@export_bp.get("/metrics")
def metrics():
    return jsonify(current_app.config["METRICS"])

# Global route counter (should be in app/__init__.py)
def register_metrics_hooks(app):
    @app.before_request
    def _count():
        m = current_app.config["METRICS"]["routes"]
        m[request.path] = m.get(request.path, 0) + 1
