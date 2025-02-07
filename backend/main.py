from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.routes.auth import auth_bp
from app.extensions import db, jwt


def create_app():
    app = Flask(__name__)
    app.register_blueprint(auth_bp)
    CORS(app,  resources={r"/*": {"origins": "*"}})
    # CORS(app, resources={r"/*/*": {"origins": "*"}})

    app.config.from_object(Config)
    db.init_app(app)
    jwt.init_app(app)


    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
