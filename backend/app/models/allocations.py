from app.extensions import mongo


class Allocations:

    @staticmethod
    def get_recommender_allocations_by_username(recommender_name, allocation_type):
        return mongo.db.allocations.find(
            {"from_name": recommender_name, "allocation_type": allocation_type}
        )

    @staticmethod
    def get_all_allocations():
        return mongo.db.allocations.find()
