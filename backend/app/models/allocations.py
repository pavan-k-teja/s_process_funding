from app.extensions import mongo

class Allocations:
    """
    collection format:
    {
        "from_name": "XO",
        "to_name": "BehemothCorps",
        "allocation_type": "budget",
        "allocation": 0
    }
    """
    
    
    @staticmethod
    def get_recommender_allocations_by_username(username, budget_type):
        return mongo.db.allocations.find_one({"username": username, "budget_type": budget_type})


    @staticmethod
    def get_all_allocations():
        return mongo.db.allocations.find()