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
from app.models.utilities import Utilities
from app.models.recommender_allocation import RecommenderAllocations
from app.services.services import request_data

auth_bp = Blueprint("auth", __name__, url_prefix="/api")


@auth_bp.route("/auth", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    print(data)

    user = User.check_auth(username, password)

    if user:
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


@auth_bp.route("/recommender_data", methods=["GET"])
@jwt_required()
def user_data():
    complete_jwt = get_jwt()
    username, role = complete_jwt["sub"], complete_jwt["role"]
    print(username, role)

    # get all user data
    user = User.find_by_username(username)
    budget, max_budget, profile_name = (
        user["budget"],
        user["max_budget"],
        user["profile_name"],
    )

    # get utilities of username only from utilities collection
    utilities = Utilities.get_utilities_by_username(username)

    all_profiles = User.get_all_profiles()
    allocations = RecommenderAllocations.get_recommender_allocations_by_username(
        username, "own"
    )

    data = {
        "user": {
            "username": username,
            "role": role,
            "budget": budget,
            "max_budget": max_budget,
            "profile_name": profile_name,
        },
        "utilities": utilities,
        "all_profiles": all_profiles,
        "allocations": allocations,
    }

    return jsonify(data), 200
