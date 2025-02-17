from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt,
)
from app.models.users import Users
from datetime import timedelta
from app.utils.utils import (
    get_recommender_data,
    get_funder_data,
    get_sigma_data,
    update_data,
)
from json import loads
import threading

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

@auth_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"msg": "Healthy"}), 200


@auth_bp.route("/auth", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = Users.check_auth(username, password)

    if user:
        expires_delta = timedelta(days=30)
        access_token = create_access_token(
            identity=user["username"],
            additional_claims={"role": user["role"]},
            expires_delta=expires_delta,
        )
        return jsonify(access_token=access_token), 200

    return jsonify({"msg": "Invalid username or password"}), 401


@auth_bp.route("/check_jwt", methods=["GET"])
@jwt_required()
def check_jwt():
    return jsonify({"msg": "Valid JWT"}), 200


@auth_bp.route("/get_data", methods=["GET"])
@jwt_required()
def get_user_data():
    complete_jwt = get_jwt()
    username, role = complete_jwt["sub"], complete_jwt["role"]

    data = {}
    if role == "recommender":
        data = get_recommender_data(username)
    elif role == "funder":
        data = get_funder_data(username)
    elif role == "sigma":
        data = get_sigma_data(username)
    else:
        return jsonify({"msg": "Invalid role"}), 401

    return jsonify(data), 200


def update_user_data(username, utility_data, budget):
    update_data(username, utility_data, budget)


@auth_bp.route("/save_data", methods=["POST"])
@jwt_required()
def save_user_data():
    complete_jwt = get_jwt()
    username, role = complete_jwt["sub"], complete_jwt["role"]
    data = request.get_json()

    utility_data = data["utilities"]
    budget = data["budget"]

    thread = threading.Thread(
        target=update_user_data, args=(username, utility_data, budget)
    )
    thread.start()

    return jsonify({"msg": "Data is being processed"}), 202
