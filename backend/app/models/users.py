from werkzeug.security import check_password_hash
from app.extensions import mongo


class Users:
    """
    collection format:
    {
        "username": "XO",
        "password": "scrypt:32768:8:1$OjGUz...",
        "profile_name": "XO",
        "role": "recommender",
        "budget": 10750000,
        "max_budget": 10750000
    },


    """

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
                # now only add budget and max_budget if role is recommender
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
        print(user, user["password"], password)
        if user and check_password_hash(user["password"], password):
            return {"username": user["username"], "role": user["role"]}

        return False
