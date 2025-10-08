from flask import Flask, jsonify, request, current_app
from werkzeug.exceptions import HTTPException
from datetime import timezone
from .routes.export import export_bp, init_metrics, register_metrics_hooks
from .routes.plan import bp as plan_bp
from .routes.health import bp as health_bp

def create_app():
    app = Flask(__name__)
    app.config.update(
        APP_VERSION="v1",
        JSON_SORT_KEYS=False,
    )

    # Shared in-memory store for all blueprints
    if "PLANS" not in app.config:
        app.config["PLANS"] = {}

    #  Metrics setup
    init_metrics(app)
    register_metrics_hooks(app)

    #  Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(plan_bp, url_prefix="/plan")
    app.register_blueprint(export_bp)

    #  Add no-store headers to all responses
    @app.after_request
    def add_headers(resp):
        resp.headers["Cache-Control"] = "no-store"
        return resp

    #  Handle HTTP errors (e.g., 404, 400)
    @app.errorhandler(HTTPException)
    def handle_http_exc(e: HTTPException):
        return jsonify({
            "error": e.name,
            "message": e.description
        }), e.code

    #  Handle uncaught exceptions
    @app.errorhandler(Exception)
    def handle_uncaught(e: Exception):
        return jsonify({
            "error": "Internal Server Error",
            "message": str(e)
        }), 500

    return app

#  Create the app instance
app = create_app()