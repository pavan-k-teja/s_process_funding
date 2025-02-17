from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.routes.auth import auth_bp
from app.extensions import mongo, jwt


def create_app():
    app = Flask(__name__)
    app.register_blueprint(auth_bp)
    
    @app.route('/')
    def health_check():
        return jsonify({"message": "Server is running"}), 200
    
    CORS(app, resources={r"/*": {"origins": "*"}})

    app.config.from_object(Config)
    mongo.init_app(app)
    jwt.init_app(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
