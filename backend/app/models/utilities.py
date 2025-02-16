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

    @staticmethod
    def get_all_utilities():
        utilities = mongo.db.utilities.find()
        return utilities

    @staticmethod
    def update_utilities(username, utilities):
        for utility in utilities:
            if (
                utility.get("username")
                and utility.get("utility_name")
                and username == utility["username"]
            ):

                mongo.db.utilities.update_one(
                    {
                        "username": utility["username"],
                        "utility_name": utility["utility_name"],
                    },
                    {"$set": utility},
                )
            else:
                print("Invalid utility")
