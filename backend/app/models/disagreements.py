from app.extensions import mongo
from bson.json_util import dumps, loads


class Disagreements:

    @staticmethod
    def get_all_disagreements():
        disagreements = mongo.db.disagreements.find()
        simple_disagreements = {}
        for disagreement in disagreements:
            for key, value in disagreement.items():
                if key != "_id":
                    simple_disagreements[key] = loads(dumps(value))

        return simple_disagreements
