from werkzeug.security import check_password_hash

class User:
    def __init__(self, username, password_hash, role):
        self.username = username
        self.password_hash = password_hash
        self.role = role

    @staticmethod
    def find_by_username(username, mongo):
        user = mongo.db.users.find_one({"username": username})
        if user:
            return User(user['username'], user['password'], user['role'])  
        return None

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
