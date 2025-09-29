from flask import Flask
from datetime import timezone

def create_app():
    app = Flask(__name__)
    app.config.update(
        APP_VERSION="v1",
        JSON_SORT_KEYS=False,
    )

    # Blueprints
    from .routes.health import bp as health_bp
    from .routes.plan import bp as plan_bp
    app.register_blueprint(health_bp)
    app.register_blueprint(plan_bp, url_prefix="/plan")

    @app.after_request
    def add_headers(resp):
        # basic cache busting for API responses
        resp.headers["Cache-Control"] = "no-store"
        return resp

    return app
