from werkzeug.security import check_password_hash
from app.extensions import mongo


class User:

    @staticmethod
    def find_by_username(username):
        user = mongo.db.users.find_one({"username": username})
        # remove password from user dict
        user = {k: v for k, v in user.items() if k != "_id" or k != "password"}
        return user

    @staticmethod
    def get_all_profiles():
        users = mongo.db.users.find()

        users = [
            {
                "username": user["username"],
                "profile_name": user["profile_name"],
                "role": user["role"],
            }
            for user in users
        ]

        return users

    @staticmethod
    def check_auth(username, password):
        user = mongo.db.users.find_one({"username": username})
        if user and check_password_hash(user.password, password):
            return {k: v for k, v in user.items() if k != "_id" or k != "password"}
        
        return False
