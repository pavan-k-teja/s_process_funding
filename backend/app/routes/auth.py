from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt,
    # current_user,
    # get_jwt_identity,
)
from datetime import timedelta
from app.models.user import User
from app.extensions import db
from app.services.services import request_data

auth_bp = Blueprint("auth", __name__, url_prefix="/api")


@auth_bp.route("/auth", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    print(data)

    user = User.find_by_username(username, db)

    if user and user.check_password(password):
        expires_delta = timedelta(days=30)
        access_token = create_access_token(
            identity=user.username,
            additional_claims={"role": user.role},
            expires_delta=expires_delta,
        )
        return jsonify(access_token=access_token), 200

    return jsonify({"msg": "Invalid username or password"}), 401


# one route to check if jwt is valid
@auth_bp.route("/check_jwt", methods=["GET"])
@jwt_required()
def check_jwt():
    print("Hi")
    return jsonify({"msg": "Valid JWT"}), 200


@auth_bp.route("/self_data", methods=["GET"])
@jwt_required()
def user_data():
    complete_jwt = get_jwt()
    return jsonify(request_data(complete_jwt["sub"], role=complete_jwt["role"])), 200
