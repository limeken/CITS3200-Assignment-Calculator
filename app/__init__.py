from flask import Flask
from datetime import timezone

def create_app():
    app = Flask(__name__)
    app.config.update(
        APP_VERSION="v1",
        JSON_SORT_KEYS=False,
    )

    # Shared in-memory store for all blueprints
    if "PLANS" not in app.config:
        app.config["PLANS"] = {}  # dict[plan_id] = plan dict

    # Blueprints
    from .routes.health import bp as health_bp
    from .routes.plan import bp as plan_bp
    from .routes.export import export_bp  # <-- Add this import

    app.register_blueprint(health_bp)
    app.register_blueprint(plan_bp, url_prefix="/plan")
    app.register_blueprint(export_bp)  # <-- Register export blueprint


    @app.after_request
    def add_headers(resp):
        # basic cache busting for API responses
        resp.headers["Cache-Control"] = "no-store"
        return resp

    return app

app = create_app()