from app.extensions import mongo


class Utilities:
    def __init__(self, username, utility_name, fdv, ldt, conc):

        self.username = username
        self.utility_name = utility_name
        self.fdv = fdv
        self.ldt = ldt
        self.conc = conc

    def insert_utility(self):
        mongo.db.utilities.insert_one(
            {
                "username": self.username,
                "utility_name": self.utility_name,
                "fdv": self.fdv,
                "ldt": self.ldt,
                "conc": self.conc,
            }
        )

    @staticmethod
    def get_utilities_by_username(username):
        utilities = mongo.db.utilities.find({"username": username})
        return utilities
