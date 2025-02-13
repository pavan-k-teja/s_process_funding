from app.extensions import mongo


class Utilities:
    """
    collection format:
    {
        "username": "BO",
        "utility_name": "BehemothCorps",
        "fdv": 0.5,
        "ldt": 3000000,
        "conc": -0.54
    }
    """
    
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
    
    @staticmethod
    def get_all_utilities():
        utilities = mongo.db.utilities.find()
        return utilities

    @staticmethod
    def update_utilities(utilities):
        # utility with same username and utility_name will be updated
        for utility in utilities:
            mongo.db.utilities.update_one(
                {"username": utility["username"], "utility_name": utility["utility_name"]},
                {"$set": utility},
            )