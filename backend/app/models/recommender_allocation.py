from app.extensions import mongo

class RecommenderAllocations:
    """
    {
        "username" : string,
        "budget" : float,
        "budget_type" : Enum("own", "sigma"),
        "org_allocations : {
            Record<string, float> // key is org name, value is allocation
        }
    }
    """
    
    
    @staticmethod
    def get_recommender_allocations_by_username(username, budget_type):
        allocations = mongo.db.recommender_allocations.find_one({"username": username, "budget_type": budget_type})
        
        return allocations.get("org_allocations", {})