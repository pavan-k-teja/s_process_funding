from app.extensions import mongo

class RecommenderAllocations:
    """
    {
        "username" : string,
        "budget" : float,
        "budget_type" : Enum("own", "sigma"),
        "org_allocation : {
            Record<string, float> // key is org name, value is allocation
        }
    }
    """
    
    
    @staticmethod
    def get_recommender_allocations_by_username(username, budget_type):
        allocations = mongo.db.recommender_allocations.find_one({"username": username, "budget_type": budget_type})
        # I want as an array of objects
        # {
        #     "name": string,
        #     "allocation": float
        # }
        
        allocation_arr = []
        for key, value in allocations.get("org_allocation", {}).items():
            allocation_arr.append({"name": key, "allocation": value})
        
        return allocation_arr