from werkzeug.security import check_password_hash
from app.extensions import mongo


class Users:

    @staticmethod
    def find_by_username(username):
        user = mongo.db.users.find_one(
            {"username": username}, {"_id": 0, "password": 0}
        )
        return user

    @staticmethod
    def get_all_profiles():
        users = mongo.db.users.find({}, {"_id": 0, "password": 0})
        return users

    @staticmethod
    def get_filtered_profiles(limit_role="recommender"):
        users = mongo.db.users.find()

        limited_roles = ["recommender"]
        if limit_role == "funder":
            limited_roles.append("funder")
        elif limit_role == "sigma":
            limited_roles.append("funder")
            limited_roles.append("sigma")

        users = [
            {
                "username": user["username"],
                "profile_name": user["profile_name"],
                "role": user["role"],
                "budget": user["budget"] if user["role"] in limited_roles else None,
                "max_budget": (
                    user["max_budget"] if user["role"] in limited_roles else None
                ),
            }
            for user in users
        ]

        return users

    @staticmethod
    def check_auth(username, password):
        user = mongo.db.users.find_one({"username": username})
        if user and check_password_hash(user["password"], password):
            return {"username": user["username"], "role": user["role"]}

        return False

    @staticmethod
    def update_user_budget(username, budget):
        mongo.db.users.update_one(
            {"username": username},
            {"$set": {"budget": budget}},
        )
