from flask import Blueprint, current_app, jsonify

bp = Blueprint("health", __name__)

@bp.get("/healthz")
def healthz():
    return jsonify({"status": "ok", "version": current_app.config.get("APP_VERSION", "v0")})
